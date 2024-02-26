/// entry point to our program, but the logic for each instruction will be contained in their own separate file
// It  defines the API endpoints that all transactions must go through.


use anchor_lang::prelude::*;
use instructions::deposit::*;
use instructions::withdraw::*;
use state::*;

pub mod instructions;
pub mod state;
pub mod errors;

declare_id!("7fTKPCxy8EMRft33nPVFWxbGK8qn6wDSWXJjoY3jpMo1");

// ----------- ACCOUNTS ----------

#[program]
pub mod synx_escrow {
    use super::*;

    pub fn deposit(ctx: Context<Deposit>, escrow_amt: u64, unlock_price: u64) -> Result<()> {
        deposit_handler(ctx, escrow_amt, unlock_price as f64)
    }

    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        withdraw_handler(ctx)
    }



}

#[error_code]
pub enum SynxEscrowError {
    #[msg("The provided pool master is not authorized to perform this action.")]
    UnauthorizedPoolMaster,

    #[msg("Pool is not currently accepting investments.")]
    PoolNotAcceptingInvestments,

    #[msg("Investment amount is out of the allowed range.")]
    InvestmentAmountOutOfRange,

    #[msg("The investor is not whitelisted for investment in this pool.")]
    InvestorNotWhitelisted,

    #[msg("The pool is only accepting investments from whitelisted investors.")]
    PoolAcceptingOnlyWhitelistedInvestors,
}
