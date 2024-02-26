/**SYNX ESCROW DEPOSIT

    When a user deposits, a PDA should be created with
    - the “SYNX” string
    - the user’s pubkey as seeds.

This inherently means a user can only open one escrow account at a time.
The instruction should initialize an account at this PDA and send the amount of SOL that the user wants to lock up to it.
The user will need to be a signer.

*/

use crate::state::*;
use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    system_instruction::transfer,
    program::invoke
};


/** SynX Deposit Handler

    - Initializes the state of the escrow_state account and transfers the SOL.
    - Expects the user to pass in the amount of SOL they want to lock up in escrow and the price to unlock it at.
    - Stores these values in the escrow_state account
    - Executes transfer

    ~ This program will be locking up native SOL. Because of this, we don’t need to use token accounts or the Solana token program.
    ~ system_program transfers the lamports the user wants to lock up in escrow and invoke the transfer instruction.

 */
pub fn deposit_handler(ctx: Context<Deposit>, escrow_amount: u64, unlock_price: f64) -> Result<()> {
    msg!("Depositing funds in escrow...");

    let escrow_state = &mut ctx.accounts.escrow_account;
    escrow_state.unlock_price = unlock_price;
    escrow_state.escrow_amount = escrow_amount.clone();

    let transfer_ix = transfer(
        &ctx.accounts.user.key(),
        &escrow_state.key(),
        escrow_amount
    );

    invoke(
        &transfer_ix,
        &[
            ctx.accounts.user.to_account_info(),
            ctx.accounts.escrow_account.to_account_info(),
            ctx.accounts.system_program.to_account_info()
        ]
    )?;

    msg!("Transfer complete. Escrow will unlock SOL at {}", &ctx.accounts.escrow_account.unlock_price);

    Ok(())
}


/**
A few considerations for the Deposit Instruction Context:

    - Because we'll be transferring SOL from the User account to the escrow_state account,
    they both need to be mutable.

    - We know the escrow_account is supposed to be a PDA derived with the “SYNX” string and the user’s pubkey.
    We can use Anchor account constraints to guarantee that the address passed in actually meets that requirement.

    - We also know that we have to initialize an account at this PDA to store some state for the program.
     We use the init constraint here.
*/
#[derive(Accounts)]
pub struct Deposit<'info> {
    // user account
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(
    init,
    seeds = [ESCROW_SEED, user.key().as_ref()],
    bump,
    payer = user,
    space = std::mem::size_of::<EscrowState>() + 8
    )]
    pub escrow_account: Account<'info, EscrowState>,
    // system program
    pub system_program: Program<'info, System>,
}
