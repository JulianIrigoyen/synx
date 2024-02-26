/**SYNX ESCROW WITHDRAW

    The withdraw instruction requires the same 3 accounts as the deposit
    plus the  plus the SOL_USDC Switchboard feed account
        (or whatever account is in charge of freeing the escrow)
 */
use crate::state::*;
use crate::errors::EscrowErrorCode;
use std::str::FromStr;
use anchor_lang::prelude::*;
use switchboard_v2::AggregatorAccountData;
use anchor_lang::solana_program::clock::Clock;


/** SynX Withdraw Handler

   - Checks if the feed is stale.
    - Fetches the current price of SOL stored in the feed_aggregator account. Lastly, we want to
     - Checks that the current price is above the escrow unlock_price.
        * If it is, then we transfer the SOL from the escrow account back to the user and close the account.
        * If it isn’t, then the instruction should finish and return an error.

 */

pub fn withdraw_handler(ctx: Context<Withdraw>) -> Result<()> {
    let feed = &ctx.accounts.feed_aggregator.load()?;
    let escrow_state = &ctx.accounts.escrow_account;

    // get result
    let val: f64 = feed.get_result()?.try_into()?;

    // check whether the feed has been updated in the last 300 seconds
    feed.check_staleness(Clock::get().unwrap().unix_timestamp, 300)
        .map_err(|_| error!(EscrowErrorCode::StaleFeed))?;

    msg!("Current feed result is {}!", val);
    msg!("Unlock price is {}", escrow_state.unlock_price);

    if val < escrow_state.unlock_price as f64 {
        return Err(EscrowErrorCode::SolPriceAboveUnlockPrice.into())
    }

    // 'Transfer: `from` must not carry data'
    **escrow_state.to_account_info().try_borrow_mut_lamports()? = escrow_state
        .to_account_info()
        .lamports()
        .checked_sub(escrow_state.escrow_amount)
        .ok_or(ProgramError::InvalidArgument)?;

    **ctx.accounts.user.to_account_info().try_borrow_mut_lamports()? = ctx.accounts.user
        .to_account_info()
        .lamports()
        .checked_add(escrow_state.escrow_amount)
        .ok_or(ProgramError::InvalidArgument)?;

    Ok(())
}

/**
A few considerations for the Withraw Instruction Context:

    - We’re using the close constraint because once the transaction completes, we want to close the escrow_account.
    The SOL used as rent in the account will be transferred to the user account.

    - We also use the address constraints to verify that the feed account passed in is actually the usdc_sol feed
    and not some other feed (we have the SOL_USDC_FEED address hard coded).

    - The AggregatorAccountData struct that we deserialize comes from the Switchboard rust crate.
    It verifies that the given account is owned by the switchboard program and allows us to easily look at its values.
    You’ll notice it’s wrapped in a AccountLoader. This is because the feed is actually a fairly large account and it needs to be zero copied.
 */

#[derive(Accounts)]
pub struct Withdraw<'info> {
    // user account
    #[account(mut)]
    pub user: Signer<'info>,
    // escrow account
    #[account(
    mut,
    seeds = [ESCROW_SEED, user.key().as_ref()],
    bump,
    close = user
    )]
    pub escrow_account: Account<'info, EscrowState>,
    // Switchboard SOL feed aggregator
    #[account(
    address = Pubkey::from_str(SOL_USDC_FEED).unwrap()
    )]
    pub feed_aggregator: AccountLoader<'info, AggregatorAccountData>,
    pub system_program: Program<'info, System>,
}