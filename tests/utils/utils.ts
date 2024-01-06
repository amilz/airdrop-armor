import { Connection, PublicKey } from "@solana/web3.js";
/**
 * Generates a Program Derived Address (PDA) for the Armor account.
 *
 * This function takes a wallet's public key and generates a PDA using the "armor" seed
 * and the provided wallet public key. The PDA is specific to the wallet and the
 * program ID of this smart contract.
 *
 * @param {PublicKey} wallet The public key of the wallet for which the Armor PDA is being generated.
 * @returns {PublicKey} The generated Program Derived Address for the Armor account.
 *
 * Usage Example:
 * const walletPublicKey = new PublicKey("...");
 * const armorPda = generateArmorPda(walletPublicKey, program.programId);
 * console.log("Armor PDA:", armorPda.toString());
 */

function generateArmorPda(wallet: PublicKey, programId: PublicKey): PublicKey {
    const [armorPda] = PublicKey.findProgramAddressSync(
        [Buffer.from("armor"), wallet.toBuffer()],
        programId
    );
    return armorPda;
}

/**
 * Airdrops SOL to an array of public keys.
 * @param {PublicKey[]} pubkeys Array of PublicKey objects to receive the airdrop.
 * @param {Connection} connection Solana connection object.
 * @param {number} amount Amount of lamports to airdrop to each pubkey.
 * @returns {Promise<void>} A promise that resolves when all airdrops are confirmed.
 * 
 * Usage Example:
 * const wallet1 = Keypair.generate();
 * const wallet2 = Keypair.generate();
 * const wallet3 = Keypair.generate();
 * const wallets = [wallet1.publicKey, wallet2.publicKey, wallet3.publicKey];
 * await airdropToMultiple(wallets, connection, LAMPORTS_PER_SOL);
 */
async function airdropToMultiple(
    pubkeys: PublicKey[],
    connection: Connection,
    amount: number
): Promise<void> {
    try {
        const airdropPromises = pubkeys.map((pubkey) =>
            connection.requestAirdrop(pubkey, amount)
        );
        const airdropTxns = await Promise.all(airdropPromises);
        const confirmationPromises = airdropTxns.map((txn) =>
            connection.confirmTransaction(txn, "processed")
        );
        await Promise.all(confirmationPromises);
    } catch (error) {
        return Promise.reject(error);
    }
}

export { generateArmorPda, airdropToMultiple };