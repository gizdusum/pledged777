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

// Allow up to 60 seconds for slow RPC responses
export const maxDuration = 60;

const ritualTestnet = {
  id: pledged777.chainId,
  name: pledged777.chainName,
  nativeCurrency: { decimals: 18, name: pledged777.currency, symbol: pledged777.currency },
  rpcUrls: { default: { http: [pledged777.rpcUrl] } },
} as const;

// Always returns JSON — never throws to the runtime
export async function POST(request: Request) {
  try {
    // --- Parse body ---
    let body: { address?: string; signature?: string; imageUri?: string; message?: string } | null = null;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const { address, signature, imageUri, message } = body ?? {};

    // --- Validate inputs ---
    if (!address || !isAddress(address) || !signature || typeof signature !== "string") {
      return NextResponse.json({ error: "Invalid payload: address or signature missing." }, { status: 400 });
    }
    if (!imageUri || !imageUri.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image data." }, { status: 400 });
    }
    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required." }, { status: 400 });
    }
    if (Buffer.byteLength(message, "utf8") > 77) {
      return NextResponse.json({ error: "Message exceeds 77 characters." }, { status: 400 });
    }
    if (Buffer.byteLength(imageUri, "utf8") > 4800) {
      return NextResponse.json({ error: "Image too large — try a smaller image." }, { status: 400 });
    }

    // --- Verify signature ---
    let isValid = false;
    try {
      isValid = await verifyMessage({
        address: address as Address,
        message: buildPledgeMessage(address),
        signature: signature as Hex,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: `Signature check failed: ${msg}` }, { status: 400 });
    }

    if (!isValid) {
      return NextResponse.json({ error: "Signature does not match the connected wallet." }, { status: 401 });
    }

    // --- Relayer key ---
    const rawKey = (process.env.RELAYER_PRIVATE_KEY ?? process.env.PRIVATE_KEY ?? "").trim();
    if (!rawKey) {
      return NextResponse.json({ error: "Relayer not configured." }, { status: 503 });
    }

    // --- Build wallet client ---
    let account;
    try {
      const normalised = rawKey.startsWith("0x") ? rawKey : `0x${rawKey}`;
      account = privateKeyToAccount(normalised as Hex);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: `Relayer key error: ${msg}` }, { status: 500 });
    }

    const client = createWalletClient({
      account,
      chain: ritualTestnet,
      transport: http(process.env.RITUAL_RPC_URL ?? pledged777.rpcUrl),
    });

    // --- Send on-chain transaction ---
    let txHash: Hex;
    try {
      txHash = await client.writeContract({
        address: pledged777.address as Address,
        abi: pledged777Abi,
        functionName: "pledge",
        args: [address as Address, imageUri, message],
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: `Transaction failed: ${msg}` }, { status: 500 });
    }

    return NextResponse.json({
      txHash,
      explorerUrl: `${pledged777.explorerUrl}/tx/${txHash}`,
    });

  } catch (err) {
    // Outer catch-all — should never reach here, but ensures JSON is always returned
    const msg = err instanceof Error ? err.message : "Unexpected server error.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
