import { 
  createSolanaRpc, 
  address, 
  type Address,
  getProgramDerivedAddress,
  getUtf8Encoder,
  getAddressEncoder,
} from "@solana/kit";
import { publicEnv } from "@/config/env.public";
import { 
  certificateAccountCodec, 
  certificateInstructionCodec, 
  type CertificateData 
} from "./codecs";

/**
 * SolanaClient
 * High-level abstraction for interacting with the Credora program
 */
export class SolanaClient {
  public rpc = createSolanaRpc(publicEnv.NEXT_PUBLIC_SOLANA_RPC_URL);

  /**
   * Lazy-getter for Program ID to prevent build-time crashes 
   * if the environment variable is invalid.
   */
  public get programId(): Address {
    try {
      return address(publicEnv.NEXT_PUBLIC_PROGRAM_ID);
    } catch (e) {
      console.warn("Invalid or missing NEXT_PUBLIC_PROGRAM_ID");
      // Return a dummy address during build/prerender to prevent total failure
      return address("11111111111111111111111111111111111111111111");
    }
  }

  /**
   * Derives the PDA for a certificate.
   * Uses legacy @solana/web3.js because the on-chain program passes
   * cid.as_bytes() directly as a seed, which can exceed @solana/kit's
   * 32-byte per-seed limit.
   */
  async getCertificateAddress(issuer: Address, cid: string): Promise<Address> {
    const { PublicKey } = await import("@solana/web3.js");

    const programPubkey = new PublicKey(this.programId);
    const issuerPubkey = new PublicKey(issuer);

    const [pda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("certificate"),
        issuerPubkey.toBuffer(),
        Buffer.from(cid),
      ],
      programPubkey
    );

    return address(pda.toBase58());
  }

  /**
   * Fetches and decodes a certificate account
   */
  async getCertificate(addressStr: string): Promise<CertificateData | null> {
    const addr = address(addressStr);
    const { value: account } = await this.rpc.getAccountInfo(addr).send();
    
    if (!account || !account.data) return null;

    try {
      return certificateAccountCodec.decode(account.data as any);
    } catch (e) {
      console.error("Failed to decode certificate:", e);
      return null;
    }
  }

  /**
   * Builds an Issue Certificate instruction
   */
  getIssueInstruction(issuer: Address, pda: Address, cid: string) {
    const data = certificateInstructionCodec.encode({
      __kind: 'IssueCertificate',
      cid,
    });

    return {
      programAddress: this.programId,
      accounts: [
        { address: issuer, role: 3 /* WritableSigner */ },
        { address: pda, role: 1 /* Writable */ },
        { address: address("11111111111111111111111111111111"), role: 0 /* Readonly */ }, // System
      ],
      data,
    };
  }

  /**
   * Builds a Revoke Certificate instruction
   */
  getRevokeInstruction(issuer: Address, pda: Address, cid: string) {
    const data = certificateInstructionCodec.encode({
      __kind: 'RevokeCertificate',
      cid,
    });

    return {
      programAddress: this.programId,
      accounts: [
        { address: issuer, role: 3 /* WritableSigner */ },
        { address: pda, role: 1 /* Writable */ },
      ],
      data,
    };
  }
}

export const solanaClient = new SolanaClient();
