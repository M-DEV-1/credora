import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SOLANA_RPC_URL: z.string().url("Valid Solana RPC URL is required"),
  NEXT_PUBLIC_SOLANA_NETWORK: z.enum(["mainnet-beta", "testnet", "devnet"]).default("devnet"),
  NEXT_PUBLIC_PROGRAM_ID: z.string().min(1, "Solana Program ID is required"),
});

const parsed = publicEnvSchema.safeParse({
  NEXT_PUBLIC_SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL,
  NEXT_PUBLIC_SOLANA_NETWORK: process.env.NEXT_PUBLIC_SOLANA_NETWORK,
  NEXT_PUBLIC_PROGRAM_ID: process.env.NEXT_PUBLIC_PROGRAM_ID,
});

if (!parsed.success) {
  console.error("❌ Invalid Public Environment Variables:", z.treeifyError(parsed.error));
  throw new Error("Invalid public environment variables");
}

export const publicEnv = parsed.data;
