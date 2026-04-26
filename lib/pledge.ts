import { pledged777 } from "./contract";

// ASCII-only message — avoids UTF-8 encoding edge cases across wallets
export function buildPledgeMessage(address: string): string {
  return [
    "PLEDGED 777 - Ritual Testnet Genesis",
    `Wallet: ${address}`,
    `Contract: ${pledged777.address}`,
    `Chain: Ritual Testnet (${pledged777.chainId})`,
    "Claiming my permanent on-chain slot.",
  ].join("\n");
}
