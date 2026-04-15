# StartaleApp Demo Mini App

A demo mini app for StartaleApp, built on the Farcaster Mini App protocol. Showcases wallet integration, context data, notifications, and Ethereum interactions.

## Getting Started

This is a [NextJS](https://nextjs.org/) + TypeScript + React app.

To install dependencies:

```bash
$ pnpm install
```

To run the app:

```bash
$ pnpm dev
```

## Tech Stack

- **Next.js 15** (App Router) + TypeScript + React 19
- **Wagmi/Viem** with `@startale/app-sdk` connector (Soneium chain)
- **@farcaster/miniapp-sdk** for mini app protocol features
- **Tailwind CSS** for styling
- **TanStack Query** for data fetching
- **Upstash Redis** for notification storage

## Features

### Context Display
- **Username** – User's Farcaster username
- **Avatar** – User's profile picture
- **Star Points** – StartaleApp-specific loyalty points
- **EOA Wallets** – User's Ethereum wallet address(es)

### Mini App Actions
- **Open Link** – Demonstrates `sdk.actions.openUrl()`
- **Close Mini App** – Closes the mini app with `sdk.actions.close()`
- **Last Event** – Shows the most recent SDK event (add/remove/notification events)

### Client Integration & Notifications
- **Add to Client** – Install mini app via `sdk.actions.addMiniApp()`
- **Send Notification** – Trigger push notifications to the user
- **Notification Status** – Displays whether notifications are enabled

### Ethereum Wallet
- **Connect/Disconnect** – Manage StartaleApp wallet connection
- **Display Address & Chain ID** – Shows current wallet and chain (Soneium)
- **Sign Message** – Sign arbitrary messages with `useSignMessage()`
- **Send Transaction** – Send ETH transactions with transaction receipt tracking
- **Sign Typed Data** – Sign EIP-712 typed data with `useSignTypedData()`

## Wallet

This app uses the StartaleApp wallet connector (`startaleConnector()` from `@startale/app-sdk`) on the Soneium chain. The Farcaster miniapp SDK handles the protocol layer.
