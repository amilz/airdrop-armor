use anchor_lang::error_code;
use anchor_lang::prelude::*;

declare_id!("HB9VSa3UcG7v37Wttrq5wgt8LVYh4hp7tP3DTpXkYq5J");

const ARMOR_SEED: [u8; 5] = *b"armor";
const PROGRAM_CONFIG_SEED: [u8; 14] = *b"program_config";

#[program]
mod airdrop_armor {
    use super::*;
    pub fn initialize(ctx: Context<InitializeProgram>) -> Result<()> {
        let program_config = &mut ctx.accounts.program_config;
        let program_config_bump = ctx.bumps.program_config;
        program_config.initialize(program_config_bump);
        Ok(())
    }
    pub fn create_armor(ctx: Context<CreateArmor>) -> Result<()> {
        let armor = &mut ctx.accounts.armor_pda;
        let armored_wallet = &ctx.accounts.signer.key();
        let claim_wallet = &ctx.accounts.claim_wallet.key();
        let armor_bump = ctx.bumps.armor_pda;

        armor.initialize(armored_wallet, claim_wallet, armor_bump);

        Ok(())
    }
    pub fn verify_armor(ctx: Context<VerifyArmor>) -> Result<()> {
        let armor = &mut ctx.accounts.armor_pda;
        armor.verify();
        Ok(())
    }
    pub fn update_claim_wallet(ctx: Context<UpdateClaimWallet>) -> Result<()> {
        let armor = &mut ctx.accounts.armor_pda;
        let new_claim_wallet = &ctx.accounts.new_claim_wallet.key();

        armor.update_claim_wallet(new_claim_wallet);
        Ok(())
    }

    pub fn destroy_armor(_ctc: Context<DestroyArmor>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeProgram<'info> {
    #[account(
        init, 
        payer = signer,
        space = 200,
        seeds = [
            PROGRAM_CONFIG_SEED.as_ref()
        ],
        bump
    )]
    pub program_config: Account<'info, ProgramConfig>,
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct CreateArmor<'info> {
    #[account(
        init, 
        payer = signer, 
        space = Armor::calculate_account_space(),
        seeds = [
            ARMOR_SEED.as_ref(),
            signer.key().as_ref()
        ], 
        bump
    )]
    pub armor_pda: Account<'info, Armor>,
    pub claim_wallet: SystemAccount<'info>,
    // Signer will be the Armor wallet
    #[account(mut)]
    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyArmor<'info> {
    #[account(
        mut, 
        has_one = claim_wallet @ ArmorError::Unauthorized,
        // TODO I don't think seeds/bump necessary. has_one is sufficient
        seeds = [
            ARMOR_SEED.as_ref(),
            armor_pda.armored_wallet.key().as_ref()
        ], 
        bump = armor_pda.bump
    )]
    pub armor_pda: Account<'info, Armor>,
    #[account(mut)]
    pub claim_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateClaimWallet<'info> {
    #[account(mut, has_one = armored_wallet)]
    pub armor_pda: Account<'info, Armor>,
    #[account(mut)]
    pub armored_wallet: Signer<'info>,
    pub new_claim_wallet: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DestroyArmor<'info> {
    #[account(
        mut,
        has_one = claim_wallet @ ArmorError::Unauthorized,
        close = claim_wallet, 
        // TODO I don't think seeds/bump necessary. has_one is sufficient
        seeds = [
            ARMOR_SEED.as_ref(),
            armor_pda.armored_wallet.key().as_ref()
        ], 
        bump = armor_pda.bump    
    )]
    pub armor_pda: Account<'info, Armor>,
    #[account(mut)]
    pub claim_wallet: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct ProgramConfig {
    bump: u8,
}

impl ProgramConfig {
    pub fn initialize(&mut self, bump: u8) {
        self.bump = bump;
    }
}

#[account]
pub struct Armor {
    armored_wallet: Pubkey,
    claim_wallet: Pubkey,
    verified: bool,
    bump: u8,
}

impl Armor {
    pub fn calculate_account_space() -> usize {
        8  + // discriminator
        32 + // armored_wallet
        32 + // claim_wallet
        1  + // verified
        1 // bump
    }
    pub fn initialize(&mut self, armored_wallet: &Pubkey, claim_wallet: &Pubkey, bump: u8) {
        self.armored_wallet = *armored_wallet;
        self.claim_wallet = *claim_wallet;
        self.verified = false;
        self.bump = bump;
    }
    pub fn verify(&mut self) {
        self.verified = true;
    }
    pub fn update_claim_wallet(&mut self, new_claim_wallet: &Pubkey) {
        self.claim_wallet = *new_claim_wallet;
        self.verified = false;
    }
}

#[error_code]
pub enum ArmorError {
    #[msg("Claim Wallet does not match armor.claim_wallet")]
    Unauthorized,
}
