
use anchor_lang::prelude::*;

#[account]
pub struct ProgramConfig {
    bump: u8,
}

impl ProgramConfig {
    pub fn initialize(&mut self, bump: u8) {
        self.bump = bump;
    }
}