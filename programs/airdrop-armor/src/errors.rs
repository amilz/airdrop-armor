use anchor_lang::error_code;

#[error_code]
pub enum ArmorError {
    #[msg("Claim Wallet does not match armor.claim_wallet")]
    Unauthorized,
}