import { NextRequest, NextResponse } from "next/server";
import { connection } from "next/server";
import { ipfsService } from "@/services/ipfs";
import { certificateMetadataSchema } from "@/features/certificates/types";
import dbConnect from "@/lib/mongoose";
import { RateLimit, CertificateData } from "@/lib/models";
import { encryptionService } from "@/lib/encryption";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { createHash } from "crypto";

/**
 * Hashes an IPFS CID to a deterministic ≤32-byte string
 * suitable for use as a Solana PDA seed.
 * Uses first 16 bytes of SHA-256 → 32 hex chars = 32 bytes UTF-8.
 */
function hashCidForPda(cid: string): string {
  return createHash("sha256").update(cid).digest("hex").slice(0, 32);
}

export async function POST(req: NextRequest) {
  try {
    await connection();

    const body = await req.json();
    const { metadata, signature, publicKey } = body;

    // ── 1. Auth: Require signature + publicKey ──────────────────────
    if (!signature || !publicKey) {
      return NextResponse.json({ error: "Missing signature or public key" }, { status: 401 });
    }

    try {
      const messageBytes = new TextEncoder().encode(JSON.stringify(metadata));
      const signatureBytes = Buffer.from(signature, 'base64');
      const publicKeyBytes = bs58.decode(publicKey);

      const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } catch (e) {
      return NextResponse.json({ error: `Signature verification failed: ${e}` }, { status: 401 });
    }

    // ── 2. MongoDB: Rate limiting (graceful — skip if DB is down) ───
    let dbAvailable = false;
    try {
      await dbConnect();
      dbAvailable = true;
    } catch (dbError) {
      console.warn("MongoDB unavailable, skipping rate limit & PII storage:", (dbError as Error).message);
    }

    if (dbAvailable) {
      try {
        const walletAddress = publicKey;
        const rateLimit = await RateLimit.findOne({ walletAddress });

        if (rateLimit) {
          if (rateLimit.count >= 2) {
            return NextResponse.json(
              { error: "Demo limit reached. Maximum 2 requests per 100 hours." },
              { status: 429 }
            );
          }
          rateLimit.count += 1;
          await rateLimit.save();
        } else {
          await RateLimit.create({
            walletAddress,
            count: 1,
            expireAt: new Date(Date.now() + 100 * 60 * 60 * 1000), // 100 hours
          });
        }
      } catch (rateLimitError) {
        console.warn("Rate limit check failed, proceeding:", (rateLimitError as Error).message);
      }
    }

    // ── 3. Validation ───────────────────────────────────────────────
    const validation = certificateMetadataSchema.safeParse(metadata);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid metadata structure", details: validation.error.format() },
        { status: 400 }
      );
    }

    const fullData = validation.data;

    // Split PII and Public Data
    const publicMetadata = {
      name: fullData.name,
      recipientName: fullData.recipientName, // Moved to public
      description: fullData.description,
      issueDate: fullData.issueDate,
      expiryDate: fullData.expiryDate,
      attributes: fullData.attributes,
    };

    const privateMetadata = {
      recipientEmail: fullData.recipientEmail,
    };

    // ── 4. IPFS: Upload public metadata (critical — must succeed) ──
    const { cid, url } = await ipfsService.uploadMetadata(publicMetadata);

    // ── 5. Hash CID for on-chain PDA seed (≤32 bytes) ──────────────
    const certId = hashCidForPda(cid);

    // ── 6. MongoDB: Store encrypted PII + CID mapping (graceful) ───
    if (dbAvailable) {
      try {
        const encrypted = encryptionService.encrypt(JSON.stringify(privateMetadata));
        await CertificateData.create({
          cid,       // Real IPFS CID (for lookups)
          certId,    // Hashed ID (used on-chain)
          encryptedPayload: encrypted.content,
          iv: encrypted.iv,
          authTag: encrypted.authTag,
        });
      } catch (piiError) {
        console.warn("PII storage failed (certificate still valid on-chain):", (piiError as Error).message);
      }
    }

    return NextResponse.json({ cid, certId, url, dbAvailable });
  } catch (error: any) {
    console.error("IPFS Upload Error:", error);
    return NextResponse.json(
      { error: "Failed to process request", details: error?.message || String(error) },
      { status: 500 }
    );
  }
}
