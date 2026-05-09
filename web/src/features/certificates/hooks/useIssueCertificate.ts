"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallets } from "@wallet-standard/react";
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
  getTransactionEncoder
} from "@solana/kit";

export function useIssueCertificate() {
  const wallets = useWallets();
  const queryClient = useQueryClient();
  const router = useRouter();

  const connectedWallet = wallets.find(w => w.accounts.length > 0);
  const activeAccount = connectedWallet?.accounts[0];

  return useMutation({
    mutationFn: async (metadata: CertificateMetadata) => {
      if (!activeAccount || !connectedWallet) throw new Error("Wallet not connected");
      const issuerAddress = address(activeAccount.address);

      toast.info("Signing request with your wallet...");

      // 1. Prepare data for signing
      const message = JSON.stringify(metadata);
      const messageBytes = new TextEncoder().encode(message);

      // 2. Sign using Wallet Standard
      const signFeature = (connectedWallet as any).features['solana:signMessage'];
      if (!signFeature) throw new Error("Wallet does not support message signing");

      const [{ signature }] = await signFeature.signMessage({
        account: activeAccount,
        message: messageBytes,
      });

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
        const errorMessage = errorData.error || errorData.details || "IPFS upload failed";
        throw new Error(`HTTP_${ipfsResponse.status}: ${errorMessage}`);
      }
      
      const { cid, certId } = await ipfsResponse.json();

      toast.info("Preparing Solana transaction...");

      // 4. Derive PDA
      const pda = await solanaClient.getCertificateAddress(issuerAddress, certId);

      // 5. Build the transaction
      const { value: latestBlockhash } = await solanaClient.rpc.getLatestBlockhash().send();
      const instruction = solanaClient.getIssueInstruction(issuerAddress, pda, certId);

      const transactionMessage = pipe(
        createTransactionMessage({ version: 0 }),
        (m) => setTransactionMessageFeePayer(issuerAddress, m),
        (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
        (m) => appendTransactionMessageInstruction(instruction, m)
      );

      // 6. Sign and Send using Wallet Standard
      const feature = (connectedWallet as any).features['solana:signAndSendTransaction'];
      if (!feature) throw new Error("Wallet does not support signAndSendTransaction");

      const transaction = compileTransaction(transactionMessage);
      const serializedTransaction = getTransactionEncoder().encode(transaction);
      
      toast.info("Please sign the transaction in your wallet...");

      const [{ signature: txSignature }] = await feature.signAndSendTransaction({
        account: activeAccount,
        chain: 'solana:devnet', 
        transaction: serializedTransaction,
      });

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
