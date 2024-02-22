# Backdrop Build SynX v0

This is the first proof of concept for the Land Tokenization (SynX) project. Our goal is to reduce entry barriers for
profitable investments and to generate wealth in a decentralized manner, creating opportunities and value that are now
eaten by market inefficiencies.

MVP: A platform that allows Real World Asset (RWAs) owners to 'tokenize' assets and creates
a secure, fast, decentralized marketplace.

## Solana Programs

* Write custom programs in the ```/programs``` directory. Init with ```anchor init <name>```
    * Run ```anchor build``` and ```anchor deploy``` to delpoy to the configured environment
    * You can check your current env using ```solana config get```

## Tests:

* This is the most efficient way to interact with solana programs.
    * TDD, TDD, TDD

* ```anchor test``` -> check solana-test-validator status:
    - it needs to be on for delpoyment
    - it needs to be off for tests to run (anchor test) or run in a different port
* Make sure the following environment variables are available.
  -- export ANCHOR_PROVIDER_URL=http://127.0.0.1:8899
  -- export ANCHOR_WALLET=~/.config/solana/id.json

## UI

## Versions

[cargo] edition = "2021"

cargo --version
cargo 1.76.0 (c84b36747 2024-01-18)

rustc --version
rustc 1.76.0 (07dca489a 2024-02-04)

anchor --version
anchor-cli 0.29.0

solana --version
solana-cli 1.17.23 (src:17eb75ab; feat:3580551090, client:SolanaLabs)

sonala-test-validator
iri369@iri369 synx % solana-install --version
solana-install 1.17.23 (src:17eb75ab; feat:3580551090, client:SolanaLabs)

(been conflicting in the past):

name = "solana-program"
version = "1.17.17"

name = "ahash"
version = "0.8.5"

https://stackoverflow.com/questions/71842787/next-js-typescript-error-you-do-not-have-the-required-packages-installed