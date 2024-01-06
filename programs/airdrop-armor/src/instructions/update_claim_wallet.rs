use anchor_lang::prelude::*;

use crate::state::Armor;

#[derive(Accounts)]
pub struct UpdateClaimWallet<'info> {
    #[account(mut, has_one = armored_wallet)]
    pub armor_pda: Account<'info, Armor>,
    #[account(mut)]
    pub armored_wallet: Signer<'info>,
    pub new_claim_wallet: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

pub fn update_claim_wallet(ctx: Context<UpdateClaimWallet>) -> Result<()> {
    let armor = &mut ctx.accounts.armor_pda;
    let new_claim_wallet = &ctx.accounts.new_claim_wallet.key();

    armor.update_claim_wallet(new_claim_wallet);
    Ok(())
}