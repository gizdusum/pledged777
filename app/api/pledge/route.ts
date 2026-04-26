import { NextResponse } from "next/server";
import {
  createWalletClient,
  http,
  isAddress,
  verifyMessage,
  type Address,
  type Hex,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { pledged777, pledged777Abi } from "@/lib/contract";
import { buildPledgeMessage } from "@/lib/pledge";

const ritualTestnet = {
  id: pledged777.chainId,
  name: pledged777.chainName,
  nativeCurrency: { decimals: 18, name: pledged777.currency, symbol: pledged777.currency },
  rpcUrls: { default: { http: [pledged777.rpcUrl] } },
} as const;

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    address?: string;
    signature?: string;
    imageUri?: string;
    message?: string;
  } | null;

  const { address, signature, imageUri, message } = body ?? {};

  if (!address || !isAddress(address) || !signature) {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }
  if (!imageUri || !imageUri.startsWith("data:image/")) {
    return NextResponse.json({ error: "Invalid image." }, { status: 400 });
  }
  if (!message || typeof message !== "string") {
    return NextResponse.json({ error: "Message required." }, { status: 400 });
  }
  if (Buffer.byteLength(message, "utf8") > 77) {
    return NextResponse.json({ error: "Message exceeds 77 characters." }, { status: 400 });
  }
  if (Buffer.byteLength(imageUri, "utf8") > 1500) {
    return NextResponse.json({ error: "Image data too large." }, { status: 400 });
  }

  const pledgeMsg = buildPledgeMessage(address);
  const isValid = await verifyMessage({
    address: address as Address,
    message: pledgeMsg,
    signature: signature as Hex,
  });

  if (!isValid) {
    return NextResponse.json({ error: "Signature does not match wallet." }, { status: 401 });
  }

  const rawKey = process.env.RELAYER_PRIVATE_KEY ?? process.env.PRIVATE_KEY;
  if (!rawKey) {
    return NextResponse.json({ error: "Relayer not configured." }, { status: 503 });
  }

  const privateKey = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
  const account = privateKeyToAccount(privateKey as Hex);
  const client = createWalletClient({
    account,
    chain: ritualTestnet,
    transport: http(process.env.RITUAL_RPC_URL ?? pledged777.rpcUrl),
  });

  try {
    const txHash = await client.writeContract({
      address: pledged777.address as Address,
      abi: pledged777Abi,
      functionName: "pledge",
      args: [address as Address, imageUri, message],
    });

    return NextResponse.json({
      txHash,
      explorerUrl: `${pledged777.explorerUrl}/tx/${txHash}`,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Relayer transaction failed.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
