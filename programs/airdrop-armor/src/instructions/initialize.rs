use anchor_lang::prelude::*;

use crate::state::ProgramConfig;
use crate::constants::PROGRAM_CONFIG_SEED;

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

pub fn initialize(ctx: Context<InitializeProgram>) -> Result<()> {
    let program_config = &mut ctx.accounts.program_config;
    let program_config_bump = ctx.bumps.program_config;
    program_config.initialize(program_config_bump);
    Ok(())
}