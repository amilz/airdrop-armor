use anchor_lang::prelude::*;
use instructions::*;

pub mod errors;
pub mod instructions;
pub mod state;
pub mod constants;

declare_id!("HB9VSa3UcG7v37Wttrq5wgt8LVYh4hp7tP3DTpXkYq5J");

#[program]
mod airdrop_armor {
    use super::*;
    pub fn initialize(ctx: Context<InitializeProgram>) -> Result<()> {
        instructions::initialize::initialize(ctx)
    }
    pub fn create_armor(ctx: Context<CreateArmor>) -> Result<()> {
        instructions::create_armor::create_armor(ctx)
    }
    pub fn update_claim_wallet(ctx: Context<UpdateClaimWallet>) -> Result<()> {
        instructions::update_claim_wallet::update_claim_wallet(ctx)
    }
    pub fn verify_armor(ctx: Context<VerifyArmor>) -> Result<()> {
        instructions::verify_armor::verify_armor(ctx)
    }
    pub fn destroy_armor(ctx: Context<DestroyArmor>) -> Result<()> {
        instructions::destroy_armor::destroy_armor(ctx)
    }
}