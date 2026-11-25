# Pyth, SynX's Oracle

Integrating Pyth price feeds into SynX involved several best practices to ensure that data is handled safe and effectively. Below are the key points we considered:

## Price Feed Account IDs

- Each Pyth price feed is **stored in a Solana account**, identified by a unique Solana account key.
- Price feed IDs differ across **mainnet, testnet, and devnet**. Check the [Pyth website](https://pyth.network) for the correct IDs for your environment.
- SynX **stores the feed ID** and ensures the correct Solana account is passed to any instruction requiring current price data.

## Fixed-Point Numeric Representation

- Pyth uses **fixed-point numbers** to represent prices and confidence intervals. Understand the exponent used to interpret these values correctly.
- **Example**: If Pyth reports a price with an exponent of -5, multiply the raw number by `10^(-5)` to get the actual value.

## Price Availability and Staleness

- Pyth might not always provide a current price, e.g., outside market trading hours or during a network outage.
- The SDK's **staleness checks** helps avoid using outdated prices. The SDKs typically provide sane defaults for these checks but allow customization to fit our use case.

## Market Hours

- Pyth follows **traditional market hours** for each asset class. SynX is aware of these hours to understand when price updates are expected.

## Latency

- Account for the **inherent latency difference** between on-chain oracles like Pyth and off-chain sources. SynX assumes adversaries may see price changes before the protocol does.
- We avoid situations requiring Pyth price updates to race against transactions from potentially adversarial users.

## Confidence Intervals

- Pyth provides both a **price and a confidence interval**, indicating the range within which the real price likely falls.
- We use the **confidence interval** to protect against unusual market conditions by adjusting the protocol's behavior based on the width of the confidence interval.
