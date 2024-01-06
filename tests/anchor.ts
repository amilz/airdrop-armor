import assert from "assert";
import * as web3 from "@solana/web3.js";
import type { AirdropArmor } from "../target/types/airdrop_armor";
import * as anchor from "@coral-xyz/anchor";
describe("Airdrop Armor Program", async () => {
  // Configure the client to use the local cluster
  anchor.setProvider(anchor.AnchorProvider.local());

  const program = await anchor.workspace.AirdropArmor as anchor.Program<AirdropArmor>;

  let armoredWalletKp: web3.Keypair,
    ogClaimWallet: web3.Keypair,
    claimWalletKp: web3.Keypair,
    unauthorizedKp: web3.Keypair,
    armorPda: web3.PublicKey;

  before(async () => {
    armoredWalletKp = new web3.Keypair();
    ogClaimWallet = new web3.Keypair();
    claimWalletKp = new web3.Keypair();
    unauthorizedKp = new web3.Keypair();
    armorPda = generateArmorPda(armoredWalletKp.publicKey, program.programId);

    await airdropToMultiple(
      [
        armoredWalletKp.publicKey,
        ogClaimWallet.publicKey,
        claimWalletKp.publicKey,
        unauthorizedKp.publicKey,
      ],
      program.provider.connection,
      web3.LAMPORTS_PER_SOL
    );
  });

  it("Creates Armor", async () => {
    try {
      const txHash = await program.methods
        .createArmor()
        .accounts({
          armorPda,
          claimWallet: ogClaimWallet.publicKey,
          signer: armoredWalletKp.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([armoredWalletKp])
        .rpc();

      await program.provider.connection.confirmTransaction(txHash);

      const armorAccount = await program.account.armor.fetch(armorPda);

      assert.equal(
        armorAccount.armoredWallet.toString(),
        armoredWalletKp.publicKey.toString()
      );
      assert.equal(
        armorAccount.claimWallet.toString(),
        ogClaimWallet.publicKey.toString()
      );
      assert.equal(armorAccount.verified, false);
    } catch (error) {
      assert.fail(`Error in transaction: ${error}`);
    }
  });

 it("Changes Armor Claim Wallet", async () => {
    try {
      const txHash = await program.methods
        .updateClaimWallet()
        .accounts({
          armorPda,
          newClaimWallet: claimWalletKp.publicKey,
          armoredWallet: armoredWalletKp.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([armoredWalletKp])
        .rpc();

      await program.provider.connection.confirmTransaction(txHash);

      const armorAccount = await program.account.armor.fetch(armorPda);

      assert.equal(
        armorAccount.armoredWallet.toString(),
        armoredWalletKp.publicKey.toString()
      );
      assert.equal(
        armorAccount.claimWallet.toString(),
        claimWalletKp.publicKey.toString()
      );
      assert.equal(armorAccount.verified, false);
    } catch (error) {
      assert.fail(`Error in transaction: ${error}`);
    }
  });


  it("Denies unauthorized user from Verifying Armor", async () => {
    let didThrow = false;
    try {
      // Attempt to verify the armor with unauthorized wallet
      const txHash = await program.methods
        .verifyArmor()
        .accounts({
          armorPda,
          claimWallet: unauthorizedKp.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([unauthorizedKp])
        .rpc();
      await program.provider.connection.confirmTransaction(txHash);
      assert.fail("Unauthorized wallet should not be able to verify armor");
    } catch (error) {
      didThrow = true;
    } finally {
      assert(didThrow, "Transaction should have thrown an error but didn't.");
    }
  });
  it("Denies unauthorized user from Verifying Armor for Uninitiated PDA", async () => {
    let didThrow = false;
    const uninitatedPda = generateArmorPda(unauthorizedKp.publicKey, program.programId);
    try {
      // Attempt to verify the armor with unauthorized wallet
      const txHash = await program.methods
        .verifyArmor()
        .accounts({
          armorPda: uninitatedPda,
          claimWallet: unauthorizedKp.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([unauthorizedKp])
        .rpc();
      await program.provider.connection.confirmTransaction(txHash);
      assert.fail("Unauthorized wallet should not be able to verify armor");
    } catch (error) {
      didThrow = true;
    } finally {
      assert(didThrow, "Transaction should have thrown an error but didn't.");
    }
  });
  it("Verifies Armor (authorized user)", async () => {
    const txHash = await program.methods
      .verifyArmor()
      .accounts({
        armorPda,
        claimWallet: claimWalletKp.publicKey,
        systemProgram: web3.SystemProgram.programId,
      })
      .signers([claimWalletKp])
      .rpc();

    // Confirm transaction
    await program.provider.connection.confirmTransaction(txHash);

    // Fetch the updated armor account
    const armorAccount = await program.account.armor.fetch(armorPda);

    // Check the verified status
    assert.equal(armorAccount.verified, true);
  });
    it("Denies unauthorized user from Changing Claim Wallet", async () => {
    let didThrow = false;
    try {
      // Attempt to verify the armor with unauthorized wallet
      const txHash = await program.methods
        .updateClaimWallet()
        .accounts({
          armorPda,
          newClaimWallet: unauthorizedKp.publicKey,
          armoredWallet: armoredWalletKp.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([unauthorizedKp])
        .rpc();
      await program.provider.connection.confirmTransaction(txHash);
      assert.fail("Unauthorized wallet should not be able to change claim wallet");
    } catch (error) {
      didThrow = true;
    } finally {
      assert(didThrow, "Transaction should have thrown an error but didn't.");
    }
  });
  it("Denies unauthorized user from Destroying Armor", async () => {
    let didThrow = false;
    try {
      // Send transaction to destroy the armor account
      const txHash = await program.methods
        .destroyArmor()
        .accounts({
          armorPda,
          claimWallet: unauthorizedKp.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([unauthorizedKp])
        .rpc();
      await program.provider.connection.confirmTransaction(txHash);
      assert.fail("Unauthorized wallet should not be able to verify armor");
    } catch (error) {
      didThrow = true;
    } finally {
      assert(didThrow, "Transaction should have thrown an error but didn't.");
    }
  });
  it("Destroys Armor (authorized user)", async () => {
    try {
      // Send transaction to destroy the armor account
      const txHash = await program.methods
        .destroyArmor()
        .accounts({
          armorPda,
          claimWallet: claimWalletKp.publicKey,
          systemProgram: web3.SystemProgram.programId,
        })
        .signers([claimWalletKp])
        .rpc();
      await program.provider.connection.confirmTransaction(txHash);

      try {
        await program.account.armor.fetch(armorPda);
        assert.fail("Armor account still exists after destruction");
      } catch (error) {
        // Expected error since the account should be closed
        assert.ok(error);
      }
    } catch (error) {
      assert.fail(`Error in transaction: ${error}`);
    }
  });
});

// ***** HELPER FUNCTIONS *****

/**
 * Generates a Program Derived Address (PDA) for the Armor account.
 *
 * This function takes a wallet's public key and generates a PDA using the "armor" seed
 * and the provided wallet public key. The PDA is specific to the wallet and the
 * program ID of this smart contract.
 *
 * @param {web3.PublicKey} wallet The public key of the wallet for which the Armor PDA is being generated.
 * @returns {web3.PublicKey} The generated Program Derived Address for the Armor account.
 *
 * Usage Example:
 * const walletPublicKey = new web3.PublicKey("...");
 * const armorPda = generateArmorPda(walletPublicKey, program.programId);
 * console.log("Armor PDA:", armorPda.toString());
 */
function generateArmorPda(wallet: web3.PublicKey, programId: web3. PublicKey): web3.PublicKey {
  const [armorPda] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from("armor"), wallet.toBuffer()],
    programId
  );
  return armorPda;
}

/**
 * Airdrops SOL to an array of public keys.
 * @param {web3.PublicKey[]} pubkeys Array of PublicKey objects to receive the airdrop.
 * @param {web3.Connection} connection Solana connection object.
 * @param {number} amount Amount of lamports to airdrop to each pubkey.
 * @returns {Promise<void>} A promise that resolves when all airdrops are confirmed.
 */
async function airdropToMultiple(
  pubkeys: web3.PublicKey[],
  connection: web3.Connection,
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
// https://github.com/metaDAOproject/anchor-test