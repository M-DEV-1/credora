"use client";

import { useQuery } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { solanaClient } from "@/services/solana";
import { address, type Base58EncodedBytes } from "@solana/kit";
import { CertificateMetadata } from "../types";
import { CertificateData } from "@/services/solana/codecs";

export interface CertificateWithMetadata {
  pubkey: string;
  onChainData: CertificateData;
  metadata?: CertificateMetadata;
}

export function useCertificates() {
  const { publicKey, signMessage, connected } = useWallet();

  const walletAddress = publicKey?.toBase58();

  return useQuery({
    queryKey: ["certificates", walletAddress],
    queryFn: async (): Promise<CertificateWithMetadata[]> => {
      if (!walletAddress) return [];
      
      const allAccounts = await solanaClient.rpc.getProgramAccounts(
        solanaClient.programId,
        {
          filters: [
            {
              memcmp: {
                offset: 0n, // issuer is the first field in the struct
                bytes: walletAddress as Base58EncodedBytes,
                encoding: 'base58',
              },
            },
          ],
        }
      ).send();

      // For the dashboard, we want to see PII (emails).
      // We generate one signature to prove ownership for this session.
      let signatureBase64 = "";
      if (signMessage) {
        try {
          // We sign a generic message for the whole list
          const msg = new TextEncoder().encode("Authenticate to view certificate PII");
          const sig = await signMessage(msg);
          signatureBase64 = Buffer.from(sig).toString('base64');
        } catch (e) {
          console.warn("User declined signature, PII will be hidden");
        }
      }

      const results = await Promise.all(
        allAccounts.map(async (acc) => {
          const onChainData = await solanaClient.getCertificate(acc.pubkey);
          if (!onChainData) return null;

          try {
            // The on-chain `cid` field is a certId (hashed).
            const certId = onChainData.cid;
            
            // Fetch private data with signature if available
            const privateResponse = await fetch(`/api/certificates/${certId}`, {
              headers: signatureBase64 ? {
                "x-signature": signatureBase64,
                "x-public-key": walletAddress,
              } : {}
            });
            const privateData = privateResponse.ok ? await privateResponse.json() : {};

            // If MongoDB returned an ipfsCid, use it for IPFS fetch
            let publicMeta = {};
            const realCid = privateData.ipfsCid || certId;
            try {
              const ipfsUrl = `/api/ipfs?cid=${realCid}`;
              const metaResponse = await fetch(ipfsUrl);
              if (metaResponse.ok) {
                publicMeta = await metaResponse.json();
              }
            } catch {
              // IPFS fetch failed
            }

            return { 
              pubkey: acc.pubkey, 
              onChainData, 
              metadata: { ...publicMeta, ...privateData } 
            } as CertificateWithMetadata;
          } catch (e) {
            console.error(`Failed to fetch data for ${onChainData.cid}`, e);
            return { pubkey: acc.pubkey, onChainData } as CertificateWithMetadata;
          }
        })
      );

      return results.filter((r): r is CertificateWithMetadata => r !== null);
    },
    enabled: connected && !!walletAddress,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
