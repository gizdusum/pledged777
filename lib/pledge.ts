import { pledgedGenesis } from "./contract";

export function buildPledgeMessage(address: string) {
  return [
    "Pledged Genesis Block",
    `Wallet: ${address}`,
    `Registry: ${pledgedGenesis.address}`,
    `Network: ${pledgedGenesis.chainName}`,
    "Action: Request gasless on-chain pledge",
  ].join("\n");
}
