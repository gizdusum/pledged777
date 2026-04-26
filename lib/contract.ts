export const pledged777 = {
  chainId: 1979,
  chainName: "Ritual Testnet",
  currency: "RITUAL",
  rpcUrl: "https://rpc.ritualfoundation.org",
  explorerUrl: "https://explorer.ritualfoundation.org",
  faucetUrl: "https://faucet.ritualfoundation.org",
  docsUrl: "https://docs.ritualfoundation.org",
  address: "0x6679ba59504A9F1AE0977270daB11e6077046425",
  maxPledges: 777,
} as const;

export const pledged777Abi = [
  {
    type: "function",
    name: "pledge",
    stateMutability: "nonpayable",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "imageUri", type: "string" },
      { name: "message", type: "string" },
    ],
    outputs: [],
  },
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
          { name: "wallet", type: "address" },
          { name: "imageUri", type: "string" },
          { name: "message", type: "string" },
          { name: "pledgedAt", type: "uint64" },
          { name: "rank", type: "uint16" },
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
      { name: "limit", type: "uint256" },
    ],
    outputs: [
      {
        name: "page",
        type: "tuple[]",
        components: [
          { name: "wallet", type: "address" },
          { name: "imageUri", type: "string" },
          { name: "message", type: "string" },
          { name: "pledgedAt", type: "uint64" },
          { name: "rank", type: "uint16" },
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
    type: "event",
    name: "Pledged",
    inputs: [
      { name: "wallet", type: "address", indexed: true },
      { name: "rank", type: "uint256", indexed: true },
      { name: "message", type: "string", indexed: false },
      { name: "pledgedAt", type: "uint64", indexed: false },
    ],
  },
] as const;
