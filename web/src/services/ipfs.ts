import "server-only";
import { PinataSDK } from "pinata";
import { serverEnv } from "@/config/env.server";

export class IpfsService {
  private pinata = new PinataSDK({
    pinataJwt: serverEnv.PINATA_JWT,
    pinataGateway: serverEnv.PINATA_GATEWAY,
  });

  /**
   * Uploads certificate metadata to public IPFS
   */
  async uploadMetadata(data: any) {
    const upload = await this.pinata.upload.public.json(data);
    return {
      cid: upload.cid,
      url: `https://${serverEnv.PINATA_GATEWAY}/ipfs/${upload.cid}`,
    };
  }
}

export const ipfsService = new IpfsService();
