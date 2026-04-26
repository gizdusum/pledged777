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

async function fetchStats() {
  try {
    const client = createPublicClient({ chain: ritualChain, transport: http() });
    const total = await client.readContract({
      address: pledged777.address as `0x${string}`,
      abi: pledged777Abi,
      functionName: "totalPledged",
    });
    return Number(total);
  } catch { return 0; }
}

export default async function Home() {
  const total = await fetchStats();
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

      <main className="heroMain">
        <section className="hero">
          {/* Left column */}
          <div className="heroLeft">
            <div className="logoWrap">
              <Image src="/logo.jpg" alt="Pledged 777" fill className="logoImg" priority />
            </div>

            <h1>
              777 Pledges.<br />
              Promised and Bound<br />
              to the Ritual Chain<br />
              Forever.
            </h1>

            <div className="heroStats">
              <div className="heroStat">
                <strong>{total}</strong>
                <span>Pledged</span>
              </div>
              <div className="heroStatDiv" />
              <div className="heroStat">
                <strong>{remaining}</strong>
                <span>Remaining</span>
              </div>
              <div className="heroStatDiv" />
              <div className="heroStat">
                <strong>Ritual Testnet</strong>
                <span>Network</span>
              </div>
              <div className="heroStatDiv" />
              <div className="heroStat">
                <strong>
                  <a href={`${pledged777.explorerUrl}/address/${pledged777.address}`}
                    target="_blank" rel="noreferrer">
                    {pledged777.address.slice(0, 8)}…
                  </a>
                </strong>
                <span>Contract</span>
              </div>
            </div>
          </div>

          {/* Right column */}
          <aside className="heroRight">
            <PledgeConsole />
          </aside>
        </section>
      </main>

      <Footer />
    </div>
  );
}
