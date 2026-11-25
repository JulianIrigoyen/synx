# SynX v0

SynX is a Solana program and a small web app for investment pools. A pool master creates a pool, whitelists investors, and moves the pool through states. The code is a proof of concept from February 2024, written for the Backdrop Build v3 program.

## Stack

- Solana program in Rust with Anchor 0.29 (`programs/synx`)
- Tests in TypeScript with mocha and chai (`tests/synx.ts`)
- Frontend in Next.js 12 and React 18 with the Solana wallet adapter (`app`)

## How it works

The program holds two account types, both program derived addresses (PDAs).

- `Pool`: seeds `"POOL"` and the treasury key. It stores the pool master, the treasury, a state flag, and the minimum and maximum investment.
- `WhitelistEntry`: seeds `"WHITELIST"`, the pool key, and the investor key.

The program has four instructions.

| Instruction | What it does |
|---|---|
| `create_pool` | Creates a `Pool` PDA. The pool master pays the rent. The treasury must sign. |
| `whitelist_investor` | Creates a `WhitelistEntry`. Only the pool master can call it. |
| `transition_pool_state` | Sets the state flag. Only the pool master can call it. |
| `invest_in_pool` | Checks the pool state and the whitelist entry, then logs the amount. |

Pool states are bit flags: `NOT_STARTED`, `WHITELISTED_ONLY`, `OPEN`, `CLOSED`, `EXECUTED`.

## Known gaps

- `invest_in_pool` does not move funds. The transfer is a stub.
- The minimum and maximum investment are stored but not checked.
- `invest_in_pool` always requires a whitelist account, also in the `OPEN` state.
- The UI only has a "Create Investment Pool" button and a balance display.
- The program id is hardcoded in `Anchor.toml` and in the UI.

## Run it

You need Rust 1.76, Solana CLI 1.17.23, Anchor CLI 0.29.0, Node, and yarn.

Test the program:

```
export ANCHOR_PROVIDER_URL=http://127.0.0.1:8899
export ANCHOR_WALLET=~/.config/solana/id.json
yarn install
anchor test
```

Stop any running `solana-test-validator` first. `anchor test` starts its own.

Run the UI:

```
anchor build && anchor deploy
mkdir -p app/public/idl && cp target/idl/synx.json app/public/idl/
cd app && yarn install && yarn dev
```

Set `wallet` in `Anchor.toml` to your own keypair path first.

## Status

Proof of concept, February 2024. Nine commits from 21 to 26 February 2024. Not audited. Do not use it with real funds.

## Version notes

If the build breaks, check these pins: `solana-program` 1.17.17 and `ahash` 0.8.5 caused conflicts in the past.
