/**
    Defines the data account for this program: EscrowState.
        Our data account will store two pieces of info:

    * unlock_price - The price of SOL in USD at which point you can withdraw; you can hard-code it to whatever you want (e.g. $21.53)
    * escrow_amount - Keeps track of how many lamports are stored in the escrow account

*/
use anchor_lang::prelude::*;use anchor_lang::prelude::*;

pub const ESCROW_SEED: &[u8] = b"SYNX";
pub const SOL_USDC_FEED: &str = "GvDMxPzN1sCj7L26YDK2HnMRXEQmQ2aemov8YBtPS7vR";

#[account]
pub struct EscrowState {
    pub unlock_price: f64,
    pub escrow_amount: u64,
}

#[error_code]
#[derive(Eq, PartialEq)]
pub enum EscrowErrorCode {
    #[msg("Not a valid Switchboard account")]
    InvalidSwitchboardAccount,
    #[msg("Switchboard feed has not been updated in 5 minutes")]
    StaleFeed,
    #[msg("Switchboard feed exceeded provided confidence interval")]
    ConfidenceIntervalExceeded,
    #[msg("Current SOL price is not above Escrow unlock price.")]
    SolPriceAboveUnlockPrice,
}