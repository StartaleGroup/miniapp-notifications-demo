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

#### Mini App Lifecycle: `ready()` vs `addMiniApp()`
- **`ready()`** – Mandatory, called immediately on app load. Hides the splash screen and displays your content. Must be invoked ASAP to avoid showing users an infinite loading screen.
- **`addMiniApp()`** – Optional, prompts users to add (bookmark) the mini app to their client. Enables quick navigation back and allows the app to send notifications. Can be called multiple times strategically (e.g., after user onboarding or when encouraging notification enablement).

*Note:* The "Add to Client" button in this demo is for testing purposes only. In production, real miniapps won't need this button since users add miniapps directly from StartaleApp before opening them.

### Ethereum Wallet
- **Connect/Disconnect** – Manage StartaleApp wallet connection
- **Display Address & Chain ID** – Shows current wallet and chain (Soneium)
- **Sign Message** – Sign arbitrary messages with `useSignMessage()`
- **Send Transaction** – Send ETH transactions with transaction receipt tracking
- **Sign Typed Data** – Sign EIP-712 typed data with `useSignTypedData()`

## Notifications

### Current Implementation
The app uses **direct Farcaster notification tokens** for sending push notifications:
- Tokens are obtained from the SDK when a user adds the mini app
- Tokens are stored in-memory (with `globalThis` persistence during hot reload)
- Notifications are sent by posting the token to Farcaster's notification service

### Why Direct Farcaster Tokens (Not Neynar)
The direct Farcaster notification approach is the right choice for StartaleApp because:
- StartaleApp users are identified by **wallet address only** — they are not necessarily Farcaster users
- Neynar requires a Farcaster ID (FID), which doesn't exist for StartaleApp-only users
- The notification token obtained from the SDK works for any user with a wallet, regardless of Farcaster registration
- No address-to-FID mapping possible for non-Farcaster users

(Neynar would only be suitable if you were building for Farcaster's Warpcast client, where users have FIDs.)

## Wallet

This app uses the StartaleApp wallet connector (`startaleConnector()` from `@startale/app-sdk`) on the Soneium chain. The Farcaster miniapp SDK handles the protocol layer.
