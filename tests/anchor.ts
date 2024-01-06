import assert from "assert";
import type { AirdropArmor } from "../target/types/airdrop_armor";
import * as anchor from "@coral-xyz/anchor";
import { airdropToMultiple, generateArmorPda } from "./utils/utils";
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram } from "@solana/web3.js";

describe("Airdrop Armor Program", () => {
  anchor.setProvider(anchor.AnchorProvider.local());
  const program = anchor.workspace.AirdropArmor as anchor.Program<AirdropArmor>;

  let armoredWalletKp: Keypair,
    ogClaimWallet: Keypair,
    claimWalletKp: Keypair,
    unauthorizedKp: Keypair,
    armorPda: PublicKey;

  before(async () => {
    armoredWalletKp = new Keypair();
    ogClaimWallet = new Keypair();
    claimWalletKp = new Keypair();
    unauthorizedKp = new Keypair();
    armorPda = generateArmorPda(armoredWalletKp.publicKey, program.programId);

    await airdropToMultiple(
      [
        armoredWalletKp.publicKey,
        ogClaimWallet.publicKey,
        claimWalletKp.publicKey,
        unauthorizedKp.publicKey,
      ],
      program.provider.connection,
      LAMPORTS_PER_SOL
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
          systemProgram: SystemProgram.programId,
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
          systemProgram: SystemProgram.programId,
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
      const txHash = await program.methods
        .verifyArmor()
        .accounts({
          armorPda,
          claimWallet: unauthorizedKp.publicKey,
          systemProgram: SystemProgram.programId,
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
      const txHash = await program.methods
        .verifyArmor()
        .accounts({
          armorPda: uninitatedPda,
          claimWallet: unauthorizedKp.publicKey,
          systemProgram: SystemProgram.programId,
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
        systemProgram: SystemProgram.programId,
      })
      .signers([claimWalletKp])
      .rpc();

    await program.provider.connection.confirmTransaction(txHash);

    const armorAccount = await program.account.armor.fetch(armorPda);

    assert.equal(armorAccount.verified, true);
  });
  it("Denies unauthorized user from Changing Claim Wallet", async () => {
    let didThrow = false;
    try {
      const txHash = await program.methods
        .updateClaimWallet()
        .accounts({
          armorPda,
          newClaimWallet: unauthorizedKp.publicKey,
          armoredWallet: armoredWalletKp.publicKey,
          systemProgram: SystemProgram.programId,
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
      const txHash = await program.methods
        .destroyArmor()
        .accounts({
          armorPda,
          claimWallet: unauthorizedKp.publicKey,
          systemProgram: SystemProgram.programId,
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
      const txHash = await program.methods
        .destroyArmor()
        .accounts({
          armorPda,
          claimWallet: claimWalletKp.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([claimWalletKp])
        .rpc();
      await program.provider.connection.confirmTransaction(txHash);

      try {
        await program.account.armor.fetch(armorPda);
        assert.fail("Armor account still exists after destruction");
      } catch (error) {
        assert.ok(error);
      }
    } catch (error) {
      assert.fail(`Error in transaction: ${error}`);
    }
  });
});