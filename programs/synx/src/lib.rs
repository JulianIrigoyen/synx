use anchor_lang::prelude::*;
use anchor_lang::system_program::{Transfer, transfer};
use anchor_lang::solana_program::log::sol_log_compute_units;

declare_id!("GiWGrEfwScYrTXoTECQR2HbRyCwn5Vu6K1tTbCSXm4x2");

// ----------- ACCOUNTS ----------

#[account]
pub struct Pool {
    pub pool_master: Pubkey,
    pub treasury: Pubkey,
    pub state_flags: u8,
    pub pool_config: PoolConfig,
    pub bump: u8, // Store the bump for the pool PDA

}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct PoolConfig {
    pub max_investment: u64,
    pub min_investment: u64,
}


#[account]
pub struct WhitelistEntry {
    pub investor: Pubkey, // The participant's public key.
    pub pool: Pubkey, // The associated pool's public key.
    pub bump: u8, // Store the bump for the whitelist entry PDA
}


// ----------- POOL STATES ----------
const NOT_STARTED: u8 = 0;
const WHITELISTED_ONLY: u8 = 1 << 0;
const OPEN: u8 = 1 << 1;
const CLOSED: u8 = 1 << 2;
const EXECUTED: u8 = 1 << 3;

// ----------- TRANSACTIONS ----------

/**
    - seeds used to generate the PDA for the pool account include a static byte string (b"POOL") and the public key of the treasury account. This combination ensures that each pool account associated with a unique treasury account will have a distinct PDA. The PDA mechanism is used for creating secure, program-controlled addresses that can enforce custom permissions and logic defined in the smart contract.
    - bump seed is a nonce that Solana runtime provides to ensure the uniqueness and validity of the generated PDA. It's part of the seeds array to ensure that the address is unique and can be derived deterministically in future transactions.
    - payer specifies that the pool_master account will pay for the creation and storage of the new pool account. This involves covering the rent-exempt reserve necessary to make the account permanent on the Solana blockchain.
    - space defines how much space (in bytes) to allocate for the pool account. It is calculated based on the size of the Pool struct plus an additional 8 bytes for the account's metadata. This ensures there's enough space to store all necessary data.

    ! The signer account is intended to manage or hold assets for the pool. By using its public key as part of the seeds for generating the pool account's PDA, it's intricately linked to the pool, providing a way to enforce specific behaviors or permissions regarding how the pool interacts with its treasury.
    ! system_program referes to the Solana System Program, which is responsible for fundamental blockchain operations like creating accounts. It's included in the transaction to facilitate the creation of the pool account.
 */


 /// Create investment pool
#[derive(Accounts)]
pub struct CreatePool<'info> {
    #[account(
    init,
    seeds = [b"POOL", treasury.key().as_ref()],
    bump,
    payer = pool_master,
    space = std::mem::size_of::< Pool > () + 8
    )]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub pool_master: Signer<'info>,
    /// CHECK: Need to know they own the treasury
    pub treasury: Signer<'info>,
    pub system_program: Program<'info, System>,
}


// Function to create pool with configuration
pub fn run_create_pool(ctx: Context<CreatePool>, max_investment: u64, min_investment: u64, bump: u8) -> Result<()> {
    msg!("Creating invesetment pool!");
    let pool = &mut ctx.accounts.pool;
    pool.pool_master = *ctx.accounts.pool_master.key;
    pool.treasury = *ctx.accounts.treasury.key;
    pool.state_flags = NOT_STARTED;
    pool.pool_config = PoolConfig { max_investment, min_investment };
    pool.bump = bump; // Save the bump 
    Ok(())
}

/// Whitelist Investor
#[derive(Accounts)]
pub struct WhitelistInvestor<'info> {
    #[account(
        mut,
        has_one = pool_master,
        seeds = [b"POOL", pool.treasury.key().as_ref()],
        bump = pool.bump
    )]
    pub pool: Account<'info, Pool>,
    #[account(mut)]
    pub pool_master: Signer<'info>,
    #[account(
        init,
        seeds = [b"WHITELIST", pool.key().as_ref(), investor.key().as_ref()],
        bump,
        payer = pool_master,
        space = 8 + std::mem::size_of::<WhitelistEntry>()
    )]
    pub whitelist_entry: Account<'info, WhitelistEntry>,
    /// CHECK: This is safe because we're only using the investor's pubkey for PDA derivation.
    pub investor: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
}

impl<'info> WhitelistInvestor<'info> {
    fn whitelist(&self) -> Result<()> {
        require!(self.pool_master.key() == self.pool.pool_master, SynxError::UnauthorizedPoolMaster);
        Ok(())
    }
}


pub fn run_whitelist_investor(ctx: Context<WhitelistInvestor>, investor: Pubkey, bump: u8) -> Result<()> {
     msg!("Whitelisting {}", investor);
     // Perform the authorization check by calling the whitelist method
     ctx.accounts.whitelist()?;
     let whitelist_entry = &mut ctx.accounts.whitelist_entry;
     whitelist_entry.investor = *ctx.accounts.investor.key;
     whitelist_entry.pool = ctx.accounts.pool.key();
     whitelist_entry.bump = bump; // Save the bump
     sol_log_compute_units();
     Ok(())
}


/// Pool instructions

#[derive(Accounts)]
pub struct TransitionPoolState<'info> {
    #[account(mut, has_one = pool_master)]
    pub pool: Account<'info, Pool>,
    pub pool_master: Signer<'info>,
}
pub fn run_transition_pool_state(ctx: Context<TransitionPoolState>, new_state: u8) -> Result<()> {
    let pool = &mut ctx.accounts.pool;
    // Ensure only the pool master can execute this instruction
    require_keys_eq!(pool.pool_master, ctx.accounts.pool_master.key(), SynxError::UnauthorizedPoolMaster);

    // Update the state_flags to the new state
    pool.state_flags = new_state;

    msg!("Pool state transitioned to {}", new_state);
    Ok(())
}


#[derive(Accounts)]
pub struct InvestInPool<'info> {
    #[account(mut)]
    pub pool: Account<'info, Pool>,
    /// CHECK: The treasury account is only used to receive and send funds as part of investment transactions. It's safe because we ensure the transaction is signed by the investor, verifying ownership.
    pub treasury: AccountInfo<'info>,
    /// CHECK: The investor account is used to sign transactions, ensuring that the investor has authorized the investment. It's considered safe as the actual transfer logic is handled by the Solana runtime and the system program, not directly manipulated.
    #[account(mut)]
    pub investor: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[program]
pub mod synx {
    use super::*;

    pub fn create_pool(ctx: Context<CreatePool>, max_investment: u64, min_investment: u64, bump: u8) -> Result<()> {
        run_create_pool(ctx, max_investment, min_investment, bump)?;
        sol_log_compute_units();
        Ok(())
    }

    pub fn transition_pool_state(ctx: Context<TransitionPoolState>, new_state: u8) -> Result<()> {
        run_transition_pool_state(ctx,new_state)?;
        sol_log_compute_units();
        Ok(())
    }

    pub fn whitelist_investor(ctx: Context<WhitelistInvestor>, investor: Pubkey, bump: u8) -> Result<()> {
        run_whitelist_investor(ctx, investor, bump)?;
        sol_log_compute_units();
        Ok(())
    }
}


#[error_code]
pub enum SynxError {
    #[msg("The provided pool master is not authorized to perform this action.")]
    UnauthorizedPoolMaster,
}