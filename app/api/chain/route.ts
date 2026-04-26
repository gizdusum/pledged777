import { NextResponse } from "next/server";
import { pledged777 } from "@/lib/contract";

async function rpc(method: string, params: unknown[] = []) {
  const res = await fetch(pledged777.rpcUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    cache: "no-store",
  });
  const data = await res.json();
  return data.result;
}

export async function GET() {
  try {
    const [blockHex, gasPriceHex, chainIdHex] = await Promise.all([
      rpc("eth_blockNumber"),
      rpc("eth_gasPrice"),
      rpc("eth_chainId"),
    ]);

    return NextResponse.json({
      blockNumber: parseInt(blockHex, 16),
      gasPriceGwei: (parseInt(gasPriceHex, 16) / 1e9).toFixed(4),
      chainId: parseInt(chainIdHex, 16),
      rpcUrl: pledged777.rpcUrl,
      explorerUrl: pledged777.explorerUrl,
      faucetUrl: pledged777.faucetUrl,
    });
  } catch {
    return NextResponse.json({ error: "RPC unreachable" }, { status: 503 });
  }
}
