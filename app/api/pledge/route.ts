import { NextResponse } from "next/server";
import {
  createWalletClient,
  http,
  isAddress,
  keccak256,
  stringToBytes,
  verifyMessage,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { pledgedGenesis } from "@/lib/contract";
import { buildPledgeMessage } from "@/lib/pledge";

const pledgedAbi = [
  {
    type: "function",
    name: "pledge",
    stateMutability: "nonpayable",
    inputs: [
      { name: "wallet", type: "address" },
      { name: "handle", type: "string" },
      { name: "proofHash", type: "bytes32" },
      { name: "score", type: "uint96" },
    ],
    outputs: [],
  },
] as const;

const ritualTestnet = {
  id: pledgedGenesis.chainId,
  name: pledgedGenesis.chainName,
  nativeCurrency: {
    decimals: 18,
    name: pledgedGenesis.currency,
    symbol: pledgedGenesis.currency,
  },
  rpcUrls: {
    default: { http: [pledgedGenesis.rpcUrl] },
  },
};

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    address?: string;
    signature?: string;
  } | null;

  const address = body?.address;
  const signature = body?.signature;

  if (!address || !isAddress(address) || !signature) {
    return NextResponse.json({ error: "Invalid pledge payload." }, { status: 400 });
  }

  const message = buildPledgeMessage(address);
  const isValid = await verifyMessage({
    address: address as Address,
    message,
    signature: signature as Hex,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Signature does not match the connected wallet." }, { status: 401 });
  }

  const privateKey = process.env.RELAYER_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json(
      {
        error: "Relayer is not configured yet.",
        readyForRelayer: true,
      },
      { status: 503 }
    );
  }

  const normalizedKey = privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`;
  const account = privateKeyToAccount(normalizedKey as Hex);
  const client = createWalletClient({
    account,
    chain: ritualTestnet,
    transport: http(process.env.RITUAL_RPC_URL ?? pledgedGenesis.rpcUrl),
  });

  const proofHash = keccak256(stringToBytes(`${pledgedGenesis.address}:${address}:${signature}`));
  try {
    const txHash = await client.writeContract({
      address: pledgedGenesis.address as Address,
      abi: pledgedAbi,
      functionName: "pledge",
      args: [address as Address, "Genesis member", proofHash, BigInt(100)],
    });

    return NextResponse.json({
      txHash,
      explorerUrl: `${pledgedGenesis.explorerUrl}/tx/${txHash}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Relayer transaction failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
