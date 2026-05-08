use borsh::{BorshDeserialize, BorshSerialize};

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub enum CertificateInstruction {
    /* Issue a new certificate
        Accounts expected:
            0. `[signer]` The issuer (payer)
            1. `[writable]` The certificate account (PDA)
            2. `[]` The system program
    */
    IssueCertificate {
        cid: String,
    },

    /* Revoke an existing certificate
        Accounts expected:
            0. `[signer]` The issuer (must match the original issuer)
            1. `[writable]` The certificate account (PDA)
    */
    RevokeCertificate {
        cid: String,
    },
}
