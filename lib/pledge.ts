import { pledged777 } from "./contract";

export function buildPledgeMessage(address: string): string {
  return [
    "PLEDGED 777 — Ritual Testnet Genesis",
    "",
    `Wallet: ${address}`,
    `Contract: ${pledged777.address}`,
    `Chain: ${pledged777.chainName} (${pledged777.chainId})`,
    "",
    "I am claiming my permanent on-chain slot.",
    "This signature authorizes the relayer to write my pledge to the blockchain.",
  ].join("\n");
}
