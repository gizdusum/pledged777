# Pledged 777 — Ritual Testnet Genesis Registry

<p align="center">
  <img src="public/logo.png" alt="PLEDGED 777" width="200" />
</p>

A permanent on-chain registry for 777 wallets on [Ritual Testnet](https://ritualfoundation.org). Each wallet connects, uploads an image, writes a message — and the relayer submits it to the blockchain. Your wallet address, image, and message live on Ritual Testnet forever as an ERC-721 NFT.

**Live:** [pledged777.vercel.app](https://pledged777.vercel.app)

---

## What it does

- 777 permanent slots on Ritual Testnet (Chain ID: 1979)
- Users connect their wallet, upload an image, and write a message (max 77 chars)
- A relayer wallet pays gas and writes the pledge on-chain via `pledge(wallet, imageUri, message)`
- Every participant receives an **ERC-721 NFT** (token ID = their rank) minted to their wallet address
- The NFT's `tokenURI` is fully on-chain — base64-encoded JSON with embedded image and message
- No test tokens required from the user — the relayer covers all gas

---

## On-chain Registration

When a user pledges, the contract calls `_mint(wallet, rank)`, emitting an ERC-721 `Transfer(address(0) → userWallet, tokenId)` event on Ritual Testnet. This means:

- The pledge is permanently tied to the user's wallet address at the contract level
- Any explorer or indexer that reads ERC-721 Transfer events can show the user as the token holder
- `ownerOf(rank)` always returns the pledging wallet
- The NFT metadata (`tokenURI`) contains the user's image and message, fully on-chain, no IPFS dependency

**Transaction example:**
```
Pledged #001 — 0x608dc1f4faf4463ace503b71682aab881ead94d7d3b982de9436ae7ece225753
ownerOf(1)  → 0x1ed766577c8D2A68A848E555a0F2614C395Eec51
tokenURI(1) → data:application/json;base64,...
```

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 16 (App Router), React 19, TypeScript |
| Styling | Custom CSS (monospace terminal aesthetic) |
| Web3 client | Viem 2 |
| Wallet | EIP-1193 (MetaMask / any injected provider) |
| Smart contract | Solidity 0.8.24, Foundry |
| Token standard | ERC-721 (self-contained, no external dependencies) |
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
6. Contract mints ERC-721 NFT (rank = tokenId) to the user's wallet
7. Transaction confirmed — user's wallet permanently holds their pledge NFT

This means users need zero test tokens. The relayer wallet holds the RITUAL needed for gas.

### Image Storage

Images are stored as base64 data URIs directly on-chain inside the contract's storage.

- Client-side: image is center-cropped and resized to **64×64px JPEG** using the Canvas API
- Adaptive quality: tries 0.6 → 0.45 → 0.3 → 0.18 → 0.1 → 0.05 until ≤ 4,600 characters
- Maximum encoded size: **5,000 bytes** — enforced in the contract
- Gas cost per pledge: ~800K–1.2M gas at 1 gwei ≈ **0.001 RITUAL per tx**
- 777 pledges total ≈ **~0.8 RITUAL** in gas

### Smart Contract: `Pledged777.sol`

**Active contract:** `0xB7142038aCde47288772591E9000fd1ECdFF42D7`

The contract is a self-contained ERC-721 — no OpenZeppelin dependency, no proxies, no upgradability. Inline base64 assembly encoder for fully on-chain `tokenURI`.

```solidity
struct Pledge {
    address wallet;
    string imageUri;   // base64 data URI, max 5000 bytes
    string message;    // max 77 chars
    uint64 pledgedAt;
    uint16 rank;
}
```

Key functions:
- `pledge(address, imageUri, message)` — `onlyOwner` (called by relayer); mints ERC-721 to wallet
- `tokenURI(tokenId)` — returns fully on-chain `data:application/json;base64,...` metadata URI
- `ownerOf(tokenId)` — returns the wallet that holds a given rank NFT
- `getPledge(rank)` / `getPledges(startRank, limit)` — read pledge data
- `totalPledged()` — total count
- `hasPledged(address)` — per-wallet check

Constraints enforced on-chain:
- Max 777 pledges (`MAX_PLEDGES = 777`)
- One pledge per wallet (`hasPledged` mapping)
- Message max 77 bytes
- Image max 5,000 bytes
- Custom errors (gas-efficient): `AlreadyPledged`, `WallFull`, `MessageTooLong`, `ImageTooLarge`, `NotOwner`, `InvalidWallet`

---

## Pages

| Route | Description |
|---|---|
| `/` | Landing page — pledge console + live pledge count |
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

---

## Local Development

```bash
npm install
cp .env.example .env.local
# Fill in RELAYER_PRIVATE_KEY and RITUAL_RPC_URL
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
