export const dynamic = "force-dynamic";

import { createPublicClient, http } from "viem";
import PledgeConsole from "./PledgeConsole";
import MatrixLogo from "./MatrixLogo";
import Footer from "./Footer";
import { pledged777, pledged777Abi } from "@/lib/contract";

const ritualChain = {
  id: pledged777.chainId,
  name: pledged777.chainName,
  nativeCurrency: { decimals: 18, name: pledged777.currency, symbol: pledged777.currency },
  rpcUrls: { default: { http: [pledged777.rpcUrl] } },
} as const;

async function fetchTotal() {
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
  const total = await fetchTotal();
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
          {/* Left */}
          <div className="heroLeft">
            <MatrixLogo />

            <div className="heroText">
              <h1 className="heroTitle">777 Pledges.</h1>
              <p className="heroSub" style={{ whiteSpace: "nowrap" }}>Bound to the Ritual Chain. Forever.</p>
            </div>

            <div className="heroMeta">
              <div className="metaItem">
                <strong>{total}</strong>
                <span>Pledged</span>
              </div>
              <div className="metaDot" />
              <div className="metaItem">
                <strong>{remaining}</strong>
                <span>Open</span>
              </div>
              <div className="metaDot" />
              <div className="metaItem">
                <strong>
                  <a href={`${pledged777.explorerUrl}/address/${pledged777.address}`}
                     target="_blank" rel="noreferrer">
                    {pledged777.address.slice(0, 10)}…
                  </a>
                </strong>
                <span>Contract</span>
              </div>
            </div>
          </div>

          {/* Right */}
          <aside className="heroRight">
            <PledgeConsole />
          </aside>
        </section>

        <div className="features">
          <div className="featureBox">
            <span className="featureIcon">0 GAS</span>
            <strong>No Gas Required</strong>
            <p>The relayer pays all fees. You need zero RITUAL tokens to claim your slot.</p>
          </div>
          <div className="featureBox">
            <span className="featureIcon">ON-CHAIN</span>
            <strong>Permanent On-Chain</strong>
            <p>Your pledge, image, and message are stored on Ritual Testnet. No IPFS, no servers.</p>
          </div>
          <div className="featureBox">
            <span className="featureIcon">777</span>
            <strong>777. Always.</strong>
            <p>Exactly 777 slots. One per wallet. No exceptions, no extensions, no second chances.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
