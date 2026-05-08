"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "@solana/wallet-adapter-react";
import { solanaClient } from "@/services/solana";
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

export function useRevokeCertificate() {
  const { publicKey, signTransaction, connected } = useWallet();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ pda, cid }: { pda: string; cid: string }) => {
      if (!publicKey || !connected) throw new Error("Wallet not connected");
      if (!signTransaction) throw new Error("Wallet does not support transaction signing");

      const issuerAddress = address(publicKey.toBase58());

      toast.info("Preparing revocation transaction...");

      // 1. Build the transaction
      const { value: latestBlockhash } = await solanaClient.rpc.getLatestBlockhash().send();
      const instruction = solanaClient.getRevokeInstruction(issuerAddress, address(pda), cid);

      const transactionMessage = pipe(
        createTransactionMessage({ version: 0 }),
        (m) => setTransactionMessageFeePayer(issuerAddress, m),
        (m) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, m),
        (m) => appendTransactionMessageInstruction(instruction, m)
      );

      const transaction = compileTransaction(transactionMessage);
      const serializedTransaction = getTransactionEncoder().encode(transaction);
      
      toast.info("Please sign the revocation in your wallet...");

      // 2. Sign using the wallet adapter
      const { VersionedTransaction } = await import("@solana/web3.js");
      const versionedTx = VersionedTransaction.deserialize(new Uint8Array(serializedTransaction));
      const signedTx = await signTransaction(versionedTx);

      // 3. Send the signed transaction via RPC
      const encodedTx = Buffer.from(signedTx.serialize()).toString('base64') as Base64EncodedWireTransaction;
      const txSignature = await solanaClient.rpc
        .sendTransaction(encodedTx, { encoding: 'base64' })
        .send();

      console.log("Revocation sent:", txSignature);
      
      return { signature: txSignature };
    },
    onSuccess: () => {
      toast.success("Certificate revoked successfully.");
      queryClient.invalidateQueries({ queryKey: ["certificates"] });
    },
    onError: (error: any) => {
      console.error("Revocation failed:", error);
      toast.error(`Revocation failed: ${error.message}`);
    }
  });
}
