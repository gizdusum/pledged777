export const pledged777 = {
  chainId: 1979,
  chainName: "Ritual Testnet",
  currency: "RITUAL",
  rpcUrl: "https://rpc.ritualfoundation.org",
  explorerUrl: "https://explorer.ritualfoundation.org",
  faucetUrl: "https://faucet.ritualfoundation.org",
  docsUrl: "https://docs.ritualfoundation.org",
  address: "0x0967fa38C8Cdcb7f245889F53956Cf0a58D9f261",
  maxPledges: 777,
} as const;

export const pledged777Abi = [
  // ─── Pledge write ──────────────────────────────────────────────────────────
  {
    type: "function",
    name: "pledge",
    stateMutability: "nonpayable",
    inputs: [
      { name: "wallet",   type: "address" },
      { name: "imageUri", type: "string"  },
      { name: "message",  type: "string"  },
    ],
    outputs: [],
  },
  // ─── Pledge reads ──────────────────────────────────────────────────────────
  {
    type: "function",
    name: "getPledge",
    stateMutability: "view",
    inputs: [{ name: "rank", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "wallet",    type: "address" },
          { name: "imageUri",  type: "string"  },
          { name: "message",   type: "string"  },
          { name: "pledgedAt", type: "uint64"  },
          { name: "rank",      type: "uint16"  },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "getPledges",
    stateMutability: "view",
    inputs: [
      { name: "startRank", type: "uint256" },
      { name: "limit",     type: "uint256" },
    ],
    outputs: [
      {
        name: "page",
        type: "tuple[]",
        components: [
          { name: "wallet",    type: "address" },
          { name: "imageUri",  type: "string"  },
          { name: "message",   type: "string"  },
          { name: "pledgedAt", type: "uint64"  },
          { name: "rank",      type: "uint16"  },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "totalPledged",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "hasPledged",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "adminClearPledge",
    stateMutability: "nonpayable",
    inputs: [{ name: "rank", type: "uint256" }],
    outputs: [],
  },
  // ─── ERC-721 reads ─────────────────────────────────────────────────────────
  {
    type: "function",
    name: "name",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "symbol",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "tokenURI",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "string" }],
  },
  {
    type: "function",
    name: "ownerOf",
    stateMutability: "view",
    inputs: [{ name: "tokenId", type: "uint256" }],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "addr", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  // ─── Events ────────────────────────────────────────────────────────────────
  {
    type: "event",
    name: "Pledged",
    inputs: [
      { name: "wallet",    type: "address", indexed: true  },
      { name: "rank",      type: "uint256", indexed: true  },
      { name: "message",   type: "string",  indexed: false },
      { name: "pledgedAt", type: "uint64",  indexed: false },
    ],
  },
  {
    type: "event",
    name: "Transfer",
    inputs: [
      { name: "from",    type: "address", indexed: true },
      { name: "to",      type: "address", indexed: true },
      { name: "tokenId", type: "uint256", indexed: true },
    ],
  },
] as const;
