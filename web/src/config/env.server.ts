import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  PINATA_JWT: z.string().min(1, "PINATA_JWT is required"),
  PINATA_GATEWAY: z.string().min(1, "PINATA_GATEWAY is required"),
  PINATA_API_KEY: z.string().min(1, "PINATA_API_KEY is required"),
  PINATA_API_SECRET: z.string().min(1, "PINATA_API_SECRET is required"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  ENCRYPTION_KEY: z.string().length(64, "ENCRYPTION_KEY must be a 64-character hex string"),
});

const parsed = serverEnvSchema.safeParse({
  PINATA_JWT: process.env.PINATA_JWT,
  PINATA_GATEWAY: process.env.PINATA_GATEWAY,
  PINATA_API_KEY: process.env.PINATA_API_KEY,
  PINATA_API_SECRET: process.env.PINATA_API_SECRET,
  MONGODB_URI: process.env.MONGODB_URI,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
});

if (!parsed.success) {
  console.error("❌ Invalid Server Environment Variables:", parsed.error.format());
  throw new Error("Invalid server environment variables");
}

export const serverEnv = parsed.data;
