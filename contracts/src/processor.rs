use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    pubkey::Pubkey,
    program_error::ProgramError,
    msg,
    clock::Clock,
    sysvar::{Sysvar, rent::Rent},
    program::invoke_signed,
    system_instruction,
};
use borsh::{BorshDeserialize, BorshSerialize};
use crate::state::{Certificate, CertificateStatus};
use crate::instruction::CertificateInstruction;

pub struct Processor;

impl Processor {
    pub fn process(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        instruction_data: &[u8],
    ) -> ProgramResult {
        let instruction = CertificateInstruction::try_from_slice(instruction_data)
            .map_err(|_| ProgramError::InvalidInstructionData)?;

        match instruction {
            CertificateInstruction::IssueCertificate { cid } => {
                msg!("Instruction: IssueCertificate");
                Self::process_issue_certificate(program_id, accounts, cid)
            }
            CertificateInstruction::RevokeCertificate { cid } => {
                msg!("Instruction: RevokeCertificate");
                Self::process_revoke_certificate(program_id, accounts, cid)
            }
        }
    }

    fn process_issue_certificate(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        cid: String,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let issuer = next_account_info(account_info_iter)?;
        let certificate_account = next_account_info(account_info_iter)?;
        let system_program = next_account_info(account_info_iter)?;

        // 1. Signer Validation
        if !issuer.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        // 2. PDA Verification
        let (expected_pda, bump) = Pubkey::find_program_address(
            &[b"certificate", issuer.key.as_ref(), cid.as_bytes()],
            program_id,
        );
        if expected_pda != *certificate_account.key {
            msg!("Error: Invalid certificate PDA");
            return Err(ProgramError::InvalidSeeds);
        }

        // 3. Create account if it doesn't exist
        let is_new_account = if certificate_account.owner != program_id {
            let rent = Rent::get()?;
            let space = Certificate::SIZE;
            let lamports = rent.minimum_balance(space);

            invoke_signed(
                &system_instruction::create_account(
                    issuer.key,
                    certificate_account.key,
                    lamports,
                    space as u64,
                    program_id,
                ),
                &[
                    issuer.clone(),
                    certificate_account.clone(),
                    system_program.clone(),
                ],
                &[&[b"certificate", issuer.key.as_ref(), cid.as_bytes(), &[bump]]],
            )?;
            msg!("Certificate account created via CPI");
            true
        } else {
            false
        };

        let mut certificate_data = if is_new_account {
            // New account - initialize with empty state
            Certificate {
                issuer: *issuer.key,
                cid: cid.clone(),
                timestamp: 0,
                status: CertificateStatus::Active,
            }
        } else {
            // Existing account - deserialize
            Certificate::try_from_slice(&certificate_account.data.borrow())
                .map_err(|_| ProgramError::InvalidAccountData)?
        };

        // 4. Re-initialization Check
        if !is_new_account && certificate_data.timestamp != 0 {
            return Err(ProgramError::AccountAlreadyInitialized);
        }

        let clock = Clock::get()?;
        
        certificate_data.issuer = *issuer.key;
        certificate_data.cid = cid;
        certificate_data.timestamp = clock.unix_timestamp;
        certificate_data.status = CertificateStatus::Active;

        certificate_data.serialize(&mut &mut certificate_account.data.borrow_mut()[..])?;
        
        msg!("Certificate issued successfully");
        Ok(())
    }

    fn process_revoke_certificate(
        program_id: &Pubkey,
        accounts: &[AccountInfo],
        cid: String,
    ) -> ProgramResult {
        let account_info_iter = &mut accounts.iter();
        let issuer = next_account_info(account_info_iter)?;
        let certificate_account = next_account_info(account_info_iter)?;

        // 1. Signer Validation
        if !issuer.is_signer {
            return Err(ProgramError::MissingRequiredSignature);
        }

        // 2. Ownership Check
        if certificate_account.owner != program_id {
            return Err(ProgramError::IncorrectProgramId);
        }

        // 3. PDA Verification (ensure this account belongs to this issuer/cid)
        let (expected_pda, _bump) = Pubkey::find_program_address(
            &[b"certificate", issuer.key.as_ref(), cid.as_bytes()],
            program_id,
        );
        if expected_pda != *certificate_account.key {
            return Err(ProgramError::InvalidSeeds);
        }

        let mut certificate_data = Certificate::try_from_slice(&certificate_account.data.borrow())
            .map_err(|_| ProgramError::InvalidAccountData)?;

        // 4. Authorization Check
        if certificate_data.issuer != *issuer.key {
            msg!("Error: Only the original issuer can revoke this certificate");
            return Err(ProgramError::InvalidAccountOwner);
        }

        certificate_data.status = CertificateStatus::Revoked;
        certificate_data.serialize(&mut &mut certificate_account.data.borrow_mut()[..])?;

        msg!("Certificate revoked successfully");
        Ok(())
    }
}
