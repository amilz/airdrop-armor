use anchor_lang::prelude::*;

use crate::state::Armor;
use crate::constants::ARMOR_SEED;

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

pub fn create_armor(ctx: Context<CreateArmor>) -> Result<()> {
    let armor = &mut ctx.accounts.armor_pda;
    let armored_wallet = &ctx.accounts.signer.key();
    let claim_wallet = &ctx.accounts.claim_wallet.key();
    let armor_bump = ctx.bumps.armor_pda;

    armor.initialize(armored_wallet, claim_wallet, armor_bump);

    Ok(())
}