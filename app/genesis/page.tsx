export const dynamic = "force-dynamic";

import { createPublicClient, http } from "viem";
import Footer from "../Footer";
import { pledged777, pledged777Abi } from "@/lib/contract";

const ritualChain = {
  id: pledged777.chainId,
  name: pledged777.chainName,
  nativeCurrency: { decimals: 18, name: pledged777.currency, symbol: pledged777.currency },
  rpcUrls: { default: { http: [pledged777.rpcUrl] } },
} as const;

async function fetchAllPledges() {
  try {
    const client = createPublicClient({ chain: ritualChain, transport: http() });
    const total = await client.readContract({
      address: pledged777.address as `0x${string}`,
      abi: pledged777Abi,
      functionName: "totalPledged",
    });
    const count = Number(total);
    if (count === 0) return { total: 0, pledges: [] };
    const pledges = await client.readContract({
      address: pledged777.address as `0x${string}`,
      abi: pledged777Abi,
      functionName: "getPledges",
      args: [BigInt(1), BigInt(count)],
    });
    return { total: count, pledges: [...pledges] };
  } catch {
    return { total: 0, pledges: [] };
  }
}

function shortenAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function formatDate(ts: bigint | number) {
  return new Date(Number(ts) * 1000).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
  });
}

const EMPTY_COUNT = 6;

export default async function GenesisPage() {
  const { total, pledges } = await fetchAllPledges();
  const remaining = pledged777.maxPledges - total;

  return (
    <div className="shell">
      <nav className="nav">
        <span className="navBrand"><a href="/">PLEDGED 777</a></span>
        <ul className="navLinks">
          <li><a href="/genesis">Genesis List</a></li>
          <li><a href="/chain">Chain</a></li>
          <li><a href={pledged777.explorerUrl} target="_blank" rel="noreferrer">Explorer</a></li>
        </ul>
      </nav>

      <main>
        <div className="genesisHeader">
          <span className="label">Genesis List</span>
          <h2>{total} / {pledged777.maxPledges} pledged · {remaining} slots open</h2>
          <p className="lede">
            Every wallet below has a permanent on-chain trace on Ritual Testnet.
          </p>
        </div>

        {pledges.length > 0 ? (
          <div className="genesisGrid">
            {pledges.map((p) => (
              <div className="genesisCard" key={p.rank}>
                <span className="cardRank">#{String(p.rank).padStart(3, "0")}</span>
                {p.imageUri ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUri} alt="" className="cardImg" />
                ) : (
                  <div className="cardImg" style={{ background: "var(--bg3)", display: "grid", placeItems: "center", color: "var(--dim)", fontSize: "1.5rem" }}>?</div>
                )}
                <p className="cardWallet">
                  <a href={`${pledged777.explorerUrl}/address/${p.wallet}`} target="_blank" rel="noreferrer">
                    {shortenAddr(p.wallet)}
                  </a>
                </p>
                <p className="cardMsg">{p.message || "—"}</p>
                <p className="cardDate">{formatDate(p.pledgedAt)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">
            <p>No pledges yet. Be the first.</p>
            <a className="btn" href="/" style={{ display: "inline-flex", marginTop: 16 }}>Pledge Now →</a>
          </div>
        )}

        {remaining > 0 && pledges.length > 0 && (
          <div className="emptySlots">
            {Array.from({ length: Math.min(EMPTY_COUNT, remaining) }).map((_, i) => (
              <div className="emptyCard" key={i}>
                <span className="cardRank">#{String(total + i + 1).padStart(3, "0")}</span>
                <div className="emptyImg">_</div>
                <p className="cardWallet">open</p>
                <p className="cardMsg">unclaimed</p>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
