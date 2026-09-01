# <img src="logo.svg" height="36" alt=""> PonsScan

Independent analytics & safety dashboard for the [pons](https://ponsfamily.com) **V2** launchpad on **Robinhood Chain** — a single self-contained HTML file that reads the chain directly from your browser. No backend, no API keys, no wallet connection.

**🔴 Live: [ponsscan.xyz](https://ponsscan.xyz)** · 🎓 [Graduation alerts on Telegram](https://t.me/ponsscan) · 𝕏 [@Argostroloji](https://x.com/Argostroloji)

![PonsScan screenshot](screenshot.png)

## Features

- **🔍 Token Inspector (rug-check)** — paste any address *or search by name*: creator + their serial-launch history, real (non-pool) holder count, market state, graduation status and a transparent 0–100 safety score — plus an embedded live chart for graduated tokens. Works for **creator wallets** too (their launches, graduation rate, serial-deployer check). Deep-linkable via `?token=0x…`.
- **🎓 Live Graduations board** — every token whose bonding curve just completed, with logo, price, 24h change, liquidity, volume and market cap; sortable by Newest / Top 24h / Liquidity; refreshed every 60s straight from the factory's graduation events.
- **⭐ Watchlist** — star any token into a DexScreener-style sidebar (saved in your browser). Pre-graduation tokens show their live curve progress bar; optional browser notifications on graduation or ±50% moves.
- **👤 Creator scorecards** — every graduated token carries its creator's 24h record (launches + graduations); serial deployers are flagged in red. One click opens the full creator profile.
- **📊 Exact launch metrics** — every V2 `TokenLaunched` event from the last 24h counted from chain logs (no sampling), hourly rate chart, live launch feed with serial-deployer badges.
- **🎯 Graduation radar** — the newest ETH-quoted launches ranked by ETH accumulated on their bonding curve vs their own graduation threshold, with 🔥 buy-velocity badges.
- **📈 Ecosystem health strip** — graduation rate, median time-to-graduation and total ETH collected by graduating curves over 24h. Data published nowhere else.
- **🔥 PONS burn tracker** — live total burned by the buyback-and-burn engine, including the last 24h.

## How it works

Everything runs client-side against public endpoints:

- **Robinhood Chain RPC** — `TokenLaunched` + graduation event logs, curve balances, burn address, token metadata (rate-limit-aware: global request queue, batching, backoff)
- **DexScreener API** — prices, volumes, liquidity, logos, name search *(market data is only trusted for pools with real liquidity — curve-phase "pools" carry phantom prices and are shown as curve progress instead)*
- **Blockscout API** — token holder lists

## Safety score

Rule-based and fully transparent: base 50 · single-launch creator +20, repeat −5, serial (≥5 in window) −25 · actively traded +10, quiet +5, no live pool yet −10 · ≥3 real holders +15, 1–2 +5, zero holders despite >$1K volume −30 (wash-trading signal) · graduated +10. Clamped to 5–95. A **heuristic screen, not a contract audit**.

## PonsScanBot

The companion Telegram bot ([t.me/ponsscan](https://t.me/ponsscan)) watches the V2 factory's graduation events 24/7 and announces every graduation the moment it happens on-chain — with time-to-graduation, serial-creator warnings and a one-tap PonsScan rug-check link.

## Disclaimer

Independent community project — not affiliated with pons or Robinhood. Graduation ≠ safe. Nothing here is financial advice.
