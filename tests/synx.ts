import * as anchor from "@coral-xyz/anchor";
import { Program, BN } from "@coral-xyz/anchor";
import { Synx } from "../target/types/synx";
import { assert } from "chai";
// const { Connection, Keypair } = require("@solana/web3.js");

describe("synx", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.Synx as Program<Synx>;

  const wallet = anchor.workspace.Synx.provider.wallet
    .payer as anchor.web3.Keypair;
  const poolMaster = wallet;
  const treasury = anchor.web3.Keypair.generate();
  console.log(wallet.publicKey);

  // it("Is initialized.", async () => {
  //   const tx = await program.methods.initialize().rpc();
  //   console.log("Your transaction signature", tx);
  // });

  it("Creates an investment pool", async () => {
    // Find the PDA for the pool
    const [poolKey, poolBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("POOL"), treasury.publicKey.toBuffer()],
      program.programId
    );

    // Create the pool
    await program.methods
      .createPool(
        new anchor.BN(10000), // max_investment
        new anchor.BN(1000), // min_investment
        poolBump // Pass the bump seed for the pool PDA
      )
      .accounts({
        pool: poolKey,
        poolMaster: poolMaster.publicKey,
        treasury: treasury.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([treasury])
      .rpc();

    // Fetch the pool account to verify creation
    const createdPool = await program.account.pool.fetch(poolKey);
    console.log(createdPool);
    assert.equal(
      createdPool.poolMaster.toString(),
      poolMaster.publicKey.toString()
    );
    assert.equal(
      createdPool.treasury.toString(),
      treasury.publicKey.toString()
    );
  });

  it("Whitelists an investor for a particular pool", async () => {
    const investor = anchor.web3.Keypair.generate();

    // Assuming the pool PDA was already found or created in a previous test
    const [poolKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("POOL"), treasury.publicKey.toBuffer()],
      program.programId
    );

    // Find the PDA for the whitelist entry
    const [whitelistEntryKey, whitelistEntryBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("WHITELIST"),
          poolKey.toBuffer(),
          investor.publicKey.toBuffer(),
        ],
        program.programId
      );

    // Whitelist the investor
    await program.methods
      .whitelistInvestor(investor.publicKey, whitelistEntryBump)
      .accounts({
        pool: poolKey,
        poolMaster: poolMaster.publicKey,
        whitelistEntry: whitelistEntryKey,
        investor: investor.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([poolMaster]) // Assuming poolMaster can sign transactions
      .rpc();

    // Fetch the whitelist entry to verify
    const fetchedWhitelistEntry = await program.account.whitelistEntry.fetch(
      whitelistEntryKey
    );
    console.log(fetchedWhitelistEntry);
    assert.equal(
      fetchedWhitelistEntry.investor.toString(),
      investor.publicKey.toString()
    );
    assert.equal(fetchedWhitelistEntry.pool.toString(), poolKey.toString());
  });

  it("Transitions pool state by the pool master", async () => {
    const [poolKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("POOL"), treasury.publicKey.toBuffer()],
      program.programId
    );

    // Define the new state you want to transition to
    const newState = 1; // OPEN

    // Transition the pool state
    await program.methods
      .transitionPoolState(newState)
      .accounts({
        pool: poolKey,
        poolMaster: poolMaster.publicKey,
      })
      .signers([poolMaster]) // Assuming poolMaster can sign transactions
      .rpc();

    // Fetch the pool account to verify state transition
    const updatedPool = await program.account.pool.fetch(poolKey);
    console.log(updatedPool);
    assert.equal(
      updatedPool.stateFlags,
      1,
      "Pool state should be WHITELISTED_ONLY"
    );
  });

  it("Rejects a whitelisted investor during CLOSED state", async () => {
    // Find the PDA for the pool
    const [poolKey, poolBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("POOL"), treasury.publicKey.toBuffer()],
      program.programId
    );
  
    // Create the pool
    await program.methods
      .createPool(new anchor.BN(10000), new anchor.BN(1000), poolBump)
      .accounts({
        pool: poolKey,
        poolMaster: poolMaster.publicKey,
        treasury: treasury.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([treasury])
      .rpc();
  
    // Transition the pool to CLOSED state
    await program.methods
      .transitionPoolState(2) // Make sure CLOSED is defined correctly
      .accounts({
        pool: poolKey,
        poolMaster: poolMaster.publicKey,
      })
      .signers([poolMaster])
      .rpc();
  
    // Whitelist an investor
    const investor = anchor.web3.Keypair.generate();
    const [whitelistEntryKey, whitelistEntryBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("WHITELIST"), poolKey.toBuffer(), investor.publicKey.toBuffer()],
      program.programId
    );
  
    // Whitelist the investor for the pool
    await program.methods
      .whitelistInvestor(investor.publicKey, whitelistEntryBump)
      .accounts({
        pool: poolKey,
        poolMaster: poolMaster.publicKey,
        whitelistEntry: whitelistEntryKey,
        investor: investor.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([poolMaster])
      .rpc();
  
    // Attempt to invest as the whitelisted investor
    try {
      await program.methods
        .investInPool(new anchor.BN(500))
        .accounts({
          pool: poolKey,
          treasury: treasury.publicKey,
          investor: investor.publicKey,
          whitelistEntry: whitelistEntryKey, // Include this if necessary for the logic
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .signers([investor])
        .rpc();
  
      assert.fail("Investment should not be allowed in CLOSED state.");
    } catch (error) {
      // Expected failure, assert based on specific error if possible
      assert.include(error.message, "The operation was rejected.", "Investment rejected as expected.");
    }
  });


  it("Allows only whitelisted investors during WHITELISTED_ONLY state", async () => {
    const [poolKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("POOL"), treasury.publicKey.toBuffer()],
      program.programId
    );
    // Assuming poolKey, poolMaster, and treasury are already defined in your test suite.
    const investor = anchor.web3.Keypair.generate();
    const nonWhitelistedInvestor = anchor.web3.Keypair.generate();
    const investmentAmount = new anchor.BN(500); // Define as per pool's config

    // Whitelist the investor
    const [whitelistEntryKey, whitelistEntryBump] =
      await anchor.web3.PublicKey.findProgramAddress(
        [
          Buffer.from("WHITELIST"),
          poolKey.toBuffer(),
          investor.publicKey.toBuffer(),
        ],
        program.programId
      );

    await program.methods
      .whitelistInvestor(investor.publicKey, whitelistEntryBump)
      .accounts({
        pool: poolKey,
        poolMaster: poolMaster.publicKey,
        whitelistEntry: whitelistEntryKey,
        investor: investor.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([poolMaster])
      .rpc();

    // Transition the pool to WHITELISTED_ONLY state
    await program.methods
      .transitionPoolState(2)
      .accounts({
        pool: poolKey,
        poolMaster: poolMaster.publicKey,
      })
      .signers([poolMaster])
      .rpc();


    // Try to invest as a whitelisted investor
    await program.methods
      .investInPool(investmentAmount)
      .accounts({
        pool: poolKey,
        treasury: treasury.publicKey,
        investor: investor.publicKey,
        whitelistEntry: whitelistEntryKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([investor])
      .rpc();

      console.log("Whitelisted investor invested successfully")

    // Try to invest as a non-whitelisted investor and expect it to fail
    // console.log("The following key is NOT ALLOWED")
    // console.log(nonWhitelistedInvestor.publicKey)
    // try {
    //   await program.methods
    //     .investInPool(investmentAmount)
    //     .accounts({
    //       pool: poolKey,
    //       treasury: treasury.publicKey,
    //       investor: nonWhitelistedInvestor.publicKey,
    //       // Do not include whitelistEntry here for non-whitelisted investor
    //       systemProgram: anchor.web3.SystemProgram.programId,
    //     })
    //     .signers([nonWhitelistedInvestor])
    //     .rpc();
    //   assert.fail(
    //     "Non-whitelisted investor should not be able to invest during WHITELISTED_ONLY state"
    //   );
    // } catch (error) {
    //   assert.include(
    //     error.message,
    //     "The operation was rejected.",
    //     "Expected investment rejection for non-whitelisted investor"
    //   );
    // }
  });


});

// it("Rejects an investment below minimum amount", async () => {
//   // Add your test here.

//   console.log("Your transaction signature", tx);
// });

// it("Rejects an investment above max amount", async () => {
//   // Add your test here.

//   console.log("Your transaction signature", tx);
// });

// it("Rejects non whitelisted investors during WHITELIST_ONLY state", async () => {
//   // Add your test here.

//   console.log("Your transaction signature", tx);
// });

// it("Accepts investments from whitelisted investors during WHITELIST_ONLY state", async () => {
//   // Add your test here.

//   console.log("Your transaction signature", tx);
// });

// it("Accepts investments from investors during OPEN stage", async () => {
//   // Add your test here.

//   console.log("Your transaction signature", tx);
// });
