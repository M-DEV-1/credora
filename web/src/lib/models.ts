import { Schema, model, models } from "mongoose";

const CertificateDataSchema = new Schema({
  cid: { type: String, required: true, index: true },
  certId: { type: String, required: true, unique: true, index: true }, // Hashed ID for on-chain PDA (≤32 bytes)
  encryptedPayload: { type: String, required: true },
  iv: { type: String, required: true },
  authTag: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const RateLimitSchema = new Schema({
  walletAddress: { type: String, required: true, index: true },
  count: { type: Number, default: 1 },
  expireAt: { type: Date, required: true },
});

// TTL Index: Delete documents automatically when expireAt is reached
RateLimitSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

export const CertificateData = models.CertificateData || model("CertificateData", CertificateDataSchema);
export const RateLimit = models.RateLimit || model("RateLimit", RateLimitSchema);
