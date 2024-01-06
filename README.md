# Airdrop Armor 
*Proof of Concept for Discussion*

**Airdrop Armor** is a simple solution designed to enhance the security and convenience of claiming airdrops on Solana. With the increasing popularity of airdrops as a means to distribute tokens, the risk associated with connecting a primary wallet with many assets to unknown or untrusted sites also grows. 

Airdrop Armor addresses this risk by providing a safe and user-friendly way to manage and claim airdrops. Airdrop Armor allows users to create a secondary "claim wallet" associated with primary wallets that airdroppers can use as an alternate claim wallet. This approach allows users to claim airdrops without exposing their primary wallet to unknown sites.

## Key Features

- **Wallet Protection:** Securely connect your main wallet to a trusted site once and protect it from exposure to unknown airdrop claim sites.
- **Claim Wallet:** Specify a secondary "claim wallet" (a hot wallet) for managing and receiving airdrop claims.
- **Verification Process:** Verify ownership of both your protected wallet and claim wallet to ensure user's are in control.
- **Open Source Pairs:** Our approach encourages airdroppers to send tokens to verified claim wallets when available, enhancing security and trust in the airdrop process.

## How It Works

1. **User Connects their Primary Wallet:** Securely connect your main wallet to Airdrop Armor's platform.
2. **Set Up Claim Wallet:** Specify a claim wallet where you will receive airdrops.
3. **Verification:** Complete a verification transaction to prove ownership of both wallets.
4. **Ready for Airdrops:** Airdroppers can now see your verified claim wallet and use it for airdrops, ensuring that your main wallet remains secure.

## Getting Started

- Clone the repository
- Install dependencies `yarn`
- Build prorgram `anchor build`
- Run Tests Locally `anchor test`

## Contribution

We are currently looking for feedback RE: feasibility/viability of this approach. If you have any thoughts or suggestions, please submit an issue or shoot me a DM.
