# Pledged 777 — Ritual Testnet Genesis Registry

A permanent on-chain registry for 777 wallets on [Ritual Testnet](https://ritualfoundation.org). Each wallet connects, uploads an image, writes a message — and the relayer submits it to the blockchain. Your wallet address, image, and message live on Ritual Testnet forever.

**Live:** [pledged777.vercel.app](https://pledged777.vercel.app)

---

## What it does

- 777 permanent slots on Ritual Testnet (Chain ID: 1979)
- Users connect their wallet, upload an image, and write a message (max 77 chars)
- A relayer wallet pays gas and writes the pledge on-chain via `pledge(wallet, imageUri, message)`
- Every participant's wallet address is permanently stored in the smart contract
- No test tokens required from the user — the relayer covers all gas

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Custom CSS (monospace terminal aesthetic) |
| Web3 client | Viem 2 |
| Wallet | EIP-1193 (MetaMask / any injected provider) |
| Smart contract | Solidity 0.8.24, Foundry |
| Chain | Ritual Testnet (Chain ID: 1979) |
| Hosting | Vercel |

---

## Architecture

### Gasless Relayer Pattern

Users never send transactions directly. Instead:

1. User connects wallet (read-only)
2. User signs an off-chain message with `personal_sign`
3. Frontend sends `{ address, signature, imageUri, message }` to `/api/pledge`
4. API verifies the signature with viem's `verifyMessage()`
5. API uses the relayer private key to call `pledge()` on-chain
6. Transaction confirmed → user's wallet is permanently in the contract

This means users need zero test tokens. The relayer wallet holds the RITUAL needed for gas.

### Image Storage

Images are stored as base64 data URIs directly on-chain inside the contract's storage.

- Client-side: image is center-cropped and resized to **48×48px JPEG** (quality 0.55) using the Canvas API
- Maximum encoded size: **1,500 characters** (~1.1KB raw) — enforced both in the API and the contract
- Gas cost per pledge: ~800K–1.2M gas at 1 gwei ≈ **0.001 RITUAL per tx**
- 777 pledges total ≈ **~0.8 RITUAL** in gas

### Smart Contract: `Pledged777.sol`

Deployed at: `0xFE7b56d7b5ae2e95B9c2821338A7a5ea614C50ef`

```solidity
struct Pledge {
    address wallet;
    string imageUri;   // base64 data URI, max 1500 chars
    string message;    // max 77 chars
    uint64 pledgedAt;
    uint16 rank;
}
```

Key functions:
- `pledge(address, imageUri, message)` — `onlyOwner` (called by relayer)
- `getPledge(rank)` — view single pledge by rank
- `getPledges(startRank, limit)` — paginated view
- `totalPledged()` — total count
- `hasPledged(address)` — per-wallet check
- `transferOwnership(newOwner)` — transfer relayer rights

Constraints enforced on-chain:
- Max 777 pledges
- One pledge per wallet
- Message max 77 bytes
- Image max 1500 bytes
- Custom errors (gas-efficient): `AlreadyPledged`, `WallFull`, `MessageTooLong`, `ImageTooLarge`

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page — pledge console + live pledge count + recent pledges |
| `/genesis` | Full genesis list — all pledged wallets with image, message, date |
| `/chain` | Ritual Testnet status — live block number, gas price, MetaMask setup guide |

---

## API Routes

### `POST /api/pledge`

Validates signature and submits the pledge on-chain.

**Body:**
```json
{
  "address": "0x...",
  "signature": "0x...",
  "imageUri": "data:image/jpeg;base64,...",
  "message": "Your message"
}
```

**Response (success):**
```json
{
  "txHash": "0x...",
  "explorerUrl": "https://explorer.ritualfoundation.org/tx/0x..."
}
```

### `GET /api/chain`

Returns live Ritual Testnet stats via JSON-RPC.

**Response:**
```json
{
  "blockNumber": 10971077,
  "gasPriceGwei": "1.0000",
  "chainId": 1979
}
```

---

## Local Development

```bash
# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Fill in RELAYER_PRIVATE_KEY and RITUAL_RPC_URL

# Run dev server
npm run dev
```

**Environment variables:**
```
RELAYER_PRIVATE_KEY=0x...   # Wallet that pays gas for relayed pledges
RITUAL_RPC_URL=https://rpc.ritualfoundation.org
```

---

## Contract Deployment

```bash
# Requires Foundry
forge build

RELAYER_PRIVATE_KEY=0x... forge script script/DeployPledged777.s.sol:DeployPledged777 \
  --rpc-url https://rpc.ritualfoundation.org \
  --broadcast
```

---

## Ritual Testnet

| | |
|---|---|
| Chain ID | 1979 |
| RPC | https://rpc.ritualfoundation.org |
| Explorer | https://explorer.ritualfoundation.org |
| Faucet | https://faucet.ritualfoundation.org |
| Docs | https://docs.ritualfoundation.org |
