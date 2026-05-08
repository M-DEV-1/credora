use borsh::{BorshDeserialize, BorshSerialize};
use solana_program::pubkey::Pubkey;

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone, PartialEq)]
pub enum CertificateStatus {
    Active,
    Revoked,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Clone)]
pub struct Certificate {
    pub issuer: Pubkey,
    pub cid: String,
    pub timestamp: i64,
    pub status: CertificateStatus,
}

impl Certificate {
    /// Total size of the certificate account data.
    /// Pubkey(32) + String(4 + max 64) + Timestamp(8) + Status(1) + Padding = 128
    pub const SIZE: usize = 32 + (4 + 64) + 8 + 1 + 19; 
}
