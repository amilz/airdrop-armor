use anchor_lang::prelude::*;

use crate::errors::ArmorError;
use crate::state::Armor;
use crate::constants::ARMOR_SEED;

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

pub fn verify_armor(ctx: Context<VerifyArmor>) -> Result<()> {
    let armor = &mut ctx.accounts.armor_pda;
    armor.verify();
    Ok(())
}