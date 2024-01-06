use anchor_lang::prelude::*;

#[account]
pub struct Armor {
    pub armored_wallet: Pubkey,
    pub claim_wallet: Pubkey,
    verified: bool,
    pub bump: u8,
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