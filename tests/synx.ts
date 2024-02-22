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
        new anchor.BN(1000),  // min_investment
        poolBump              // Pass the bump seed for the pool PDA
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
    assert.equal(createdPool.poolMaster.toString(), poolMaster.publicKey.toString());
    assert.equal(createdPool.treasury.toString(), treasury.publicKey.toString());
  });

  it("Whitelists an investor for a particular pool", async () => {
    const investor = anchor.web3.Keypair.generate();

    // Assuming the pool PDA was already found or created in a previous test
    const [poolKey] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("POOL"), treasury.publicKey.toBuffer()],
      program.programId
    );

    // Find the PDA for the whitelist entry
    const [whitelistEntryKey, whitelistEntryBump] = await anchor.web3.PublicKey.findProgramAddress(
      [Buffer.from("WHITELIST"), poolKey.toBuffer(), investor.publicKey.toBuffer()],
      program.programId
    );

    // Whitelist the investor
    await program.methods
      .whitelistInvestor(
        investor.publicKey,
        whitelistEntryBump

      )
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
    const fetchedWhitelistEntry = await program.account.whitelistEntry.fetch(whitelistEntryKey);
    console.log(fetchedWhitelistEntry);
    assert.equal(fetchedWhitelistEntry.investor.toString(), investor.publicKey.toString());
    assert.equal(fetchedWhitelistEntry.pool.toString(), poolKey.toString());
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