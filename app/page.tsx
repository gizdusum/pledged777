import Image from "next/image";
import { createPublicClient, http } from "viem";
import PledgeConsole from "./PledgeConsole";
import Footer from "./Footer";
import { pledged777, pledged777Abi } from "@/lib/contract";

const ritualChain = {
  id: pledged777.chainId,
  name: pledged777.chainName,
  nativeCurrency: { decimals: 18, name: pledged777.currency, symbol: pledged777.currency },
  rpcUrls: { default: { http: [pledged777.rpcUrl] } },
} as const;

async function fetchRecentPledges() {
  try {
    const client = createPublicClient({ chain: ritualChain, transport: http() });
    const total = await client.readContract({
      address: pledged777.address as `0x${string}`,
      abi: pledged777Abi,
      functionName: "totalPledged",
    });
    const count = Number(total);
    if (count === 0) return { total: 0, recent: [] };
    const startRank = Math.max(1, count - 4);
    const limit = count - startRank + 1;
    const pledges = await client.readContract({
      address: pledged777.address as `0x${string}`,
      abi: pledged777Abi,
      functionName: "getPledges",
      args: [BigInt(startRank), BigInt(limit)],
    });
    return { total: count, recent: [...pledges].reverse() };
  } catch {
    return { total: 0, recent: [] };
  }
}

function shortenAddr(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default async function Home() {
  const { total, recent } = await fetchRecentPledges();
  const remaining = pledged777.maxPledges - total;

  return (
    <div className="shell">
      <nav className="nav">
        <span className="navBrand">PLEDGED 777</span>
        <ul className="navLinks">
          <li><a href="/genesis">Genesis List</a></li>
          <li><a href="/chain">Chain</a></li>
          <li><a href={pledged777.explorerUrl} target="_blank" rel="noreferrer">Explorer</a></li>
        </ul>
      </nav>

      <main>
        <section className="hero">
          <div className="heroLeft">
            <div className="logoWrap">
              <Image src="/logo.jpg" alt="Pledged 777" fill className="logoImg" priority />
            </div>

            <span className="label">Ritual Testnet · Chain {pledged777.chainId}</span>
            <h1>777<br />on-chain<br />pledges.</h1>
            <p className="lede">
              Connect your wallet, upload an image, leave a message.
              The relayer writes it permanently to Ritual Testnet —
              your wallet lives on the blockchain forever.
            </p>

            <div className="statsGrid">
              <div className="statCell">
                <span>Pledged</span>
                <strong className="big">{total}</strong>
              </div>
              <div className="statCell">
                <span>Remaining</span>
                <strong className="big">{remaining}</strong>
              </div>
              <div className="statCell">
                <span>Network</span>
                <strong>Ritual Testnet</strong>
              </div>
              <div className="statCell">
                <span>Contract</span>
                <strong>
                  <a href={`${pledged777.explorerUrl}/address/${pledged777.address}`} target="_blank" rel="noreferrer">
                    {pledged777.address.slice(0, 10)}…
                  </a>
                </strong>
              </div>
            </div>

            {recent.length > 0 && (
              <>
                <p className="recentTitle">// recent pledges</p>
                {recent.map((p) => (
                  <div className="pledgeRow" key={p.rank}>
                    <span className="pledgeRank">#{String(p.rank).padStart(3, "0")}</span>
                    {p.imageUri ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.imageUri} alt="" className="pledgeThumb" />
                    ) : (
                      <div className="pledgeThumb" style={{ background: "var(--bg3)", display: "grid", placeItems: "center", color: "var(--dim)", fontSize: "0.7rem" }}>?</div>
                    )}
                    <div className="pledgeInfo">
                      <p className="pledgeWallet">{shortenAddr(p.wallet)}</p>
                      <p className="pledgeMsg">{p.message || "—"}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          <aside>
            <PledgeConsole />
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}
