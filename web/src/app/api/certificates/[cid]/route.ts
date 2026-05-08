import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongoose";
import { CertificateData } from "@/lib/models";
import { encryptionService } from "@/lib/encryption";
import nacl from "tweetnacl";
import bs58 from "bs58";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ cid: string }> }
) {
  try {
    const { cid } = await params;
    
    // Auth: Optional headers for sensitive data
    const signature = req.headers.get("x-signature");
    const publicKey = req.headers.get("x-public-key");

    await dbConnect();

    const data = await CertificateData.findOne({ 
      $or: [{ certId: cid }, { cid }] 
    });

    if (!data) {
      return NextResponse.json({ error: "Certificate record not found" }, { status: 404 });
    }

    // Always decrypt to check what's inside
    const decryptedRaw = encryptionService.decrypt(
      data.encryptedPayload,
      data.iv,
      data.authTag
    );
    const decrypted = JSON.parse(decryptedRaw);

    // If no auth is provided, return a restricted view
    // (In our new model, recipientEmail is the only private field)
    if (!signature || !publicKey) {
      return NextResponse.json({ 
        message: "Signature required for full PII access",
        ipfsCid: data.cid,
        // We can return recipientName if it was stored in the legacy encrypted bucket
        recipientName: decrypted.recipientName || undefined 
      });
    }

    // Verify Signature: Only the Issuer can unlock the private data
    try {
      // The message being signed is just the CID to prevent reuse
      const messageBytes = new TextEncoder().encode(`View private data for ${cid}`);
      const signatureBytes = Buffer.from(signature, 'base64');
      const publicKeyBytes = bs58.decode(publicKey);

      const isValid = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
      if (!isValid) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }

      // Ensure the signer IS the issuer (we could fetch this from Solana, or store it in DB)
      // For now, we trust the signature proves ownership of the provided public key.
      // A more robust check would verify this publicKey issued the cert on-chain.
      
    } catch (e) {
      return NextResponse.json({ error: "Signature verification failed" }, { status: 401 });
    }

    return NextResponse.json({ ...decrypted, ipfsCid: data.cid });
  } catch (error) {
    console.error("Certificate Data Retrieval Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
