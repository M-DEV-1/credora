import { 
  address, 
  getAddressCodec,
  getStructCodec, 
  getUtf8Codec, 
  getI64Codec, 
  getEnumCodec, 
  getDiscriminatedUnionCodec,
  addCodecSizePrefix,
  getU32Codec,
  type Address,
  type Codec
} from "@solana/kit";

export enum CertificateStatus {
  Active,
  Revoked,
}

export interface CertificateData {
  issuer: Address;
  cid: string;
  timestamp: bigint;
  status: CertificateStatus;
}

const certificateStatusCodec = getEnumCodec(CertificateStatus);

export const certificateAccountCodec = getStructCodec([
  ['issuer', getAddressCodec()],
  ['cid', addCodecSizePrefix(getUtf8Codec(), getU32Codec())],
  ['timestamp', getI64Codec()],
  ['status', certificateStatusCodec],
]);

export type CertificateInstruction = 
  | { __kind: 'IssueCertificate'; cid: string }
  | { __kind: 'RevokeCertificate'; cid: string };

export const certificateInstructionCodec: Codec<CertificateInstruction> = getDiscriminatedUnionCodec([
  [
    'IssueCertificate', 
    getStructCodec([
      ['cid', addCodecSizePrefix(getUtf8Codec(), getU32Codec())]
    ])
  ],
  [
    'RevokeCertificate', 
    getStructCodec([
      ['cid', addCodecSizePrefix(getUtf8Codec(), getU32Codec())]
    ])
  ],
]);
