"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { solanaClient } from "@/services/solana";
import { CertificateMetadata } from "../types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  pipe, 
  createTransactionMessage, 
  setTransactionMessageFeePayer, 
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstruction,
  address,
  compileTransaction,
  getTransactionEncoder,
  type Base64EncodedWireTransaction
} from "@solana/kit";

export function useIssueCertificate() {
  const { publicKey, signMessage, signTransaction, connected } = useWallet();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (metadata: CertificateMetadata) => {
      if (!publicKey || !connected) throw new Error("Wallet not connected");
      if (!signMessage) throw new Error("Wallet does not support message signing");

      const issuerAddress = address(publicKey.toBase58());

      toast.info("Signing request with your wallet...");

      // 1. Prepare data for signing
      const metadataJson = JSON.stringify(metadata);
      const messageBytes = new TextEncoder().encode(metadataJson);

      // 2. Sign using the wallet adapter
      const signature = await signMessage(messageBytes);

      toast.info("Uploading metadata to IPFS...");
      
      // 3. Send to API for Verification, Rate Limiting, and Upload
      const ipfsResponse = await fetch("/api/ipfs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metadata,
          signature: Buffer.from(signature).toString('base64'),
          publicKey: issuerAddress,
        }),
      });
      
      if (!ipfsResponse.ok) {
        const errorData = await ipfsResponse.json();
        throw new Error(errorData.details || errorData.error || "IPFS upload failed");
      }
      
      const { cid, certId } = await ipfsResponse.json();

      toast.info("Preparing Solana transaction...");

      // 4. Derive PDA using certId (hashed CID, ≤32 bytes for PDA seed)
      const pda = await solanaClient.getCertificateAddress(issuerAddress, certId);

      // 5. Build the transaction (certId is what goes on-chain)
      const { value: latestBlockhash } = await solanaClient.rpc.getLatestBlockhash().send();
      const instruction = solanaClient.getIssueInstruction(issuerAddress, pda, certId);

      const transactionMessage = pipe(
        createTransactionMessage({ version: 0 }),
        (m) => setTransactionMessageFeePayer(issuerAddress, m),
        (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
        (m) => appendTransactionMessageInstruction(instruction, m)
      );

      const transaction = compileTransaction(transactionMessage);
      const serializedTransaction = getTransactionEncoder().encode(transaction);

      toast.info("Please sign the transaction in your wallet...");

      // 6. Sign and send using the wallet adapter
      if (!signTransaction) throw new Error("Wallet does not support transaction signing");

      const { VersionedTransaction } = await import("@solana/web3.js");
      const versionedTx = VersionedTransaction.deserialize(new Uint8Array(serializedTransaction));
      const signedTx = await signTransaction(versionedTx);

      // Send the signed transaction via RPC
      const encodedTx = Buffer.from(signedTx.serialize()).toString('base64') as Base64EncodedWireTransaction;
      const txSignature = await solanaClient.rpc
        .sendTransaction(encodedTx, { encoding: 'base64' })
        .send();

      console.log("Transaction sent:", txSignature);
      
      return { cid, certId, pda, signature: Buffer.from(signature).toString('base64') };
    },
    onSuccess: () => {
      toast.success("Certificate issued successfully!");
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
      router.push("/dashboard");
    },
    onError: (error: any) => {
      console.error("Issuance failed:", error);
      
      // Handle Rate Limit specifically
      if (error.message?.includes("429") || error.message?.toLowerCase().includes("limit reached")) {
        toast.error("Rate Limit Reached", {
          description: "Demo limit: 2 requests per 100 hours. Please try again later.",
        });
        return;
      }

      // Handle Simulation Failures with Logs
      const logs = error.context?.logs || error.logs;
      if (logs && Array.isArray(logs)) {
        if (logs.some(l => l.includes("AccountAlreadyInitialized"))) {
          toast.error("Duplicate Certificate", {
            description: "A certificate with this identifier already exists.",
          });
          return;
        }
      }

      toast.error("Issuance Failed", {
        description: error.message || "Please check your wallet and connection.",
      });
    }
  });
}
