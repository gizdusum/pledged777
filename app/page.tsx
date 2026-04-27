export const dynamic = "force-dynamic";

import { createPublicClient, http } from "viem";
import PledgeConsole from "./PledgeConsole";
import MatrixLogo from "./MatrixLogo";
import Footer from "./Footer";
import Nav from "./Nav";
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
  const pct = Math.round((total / pledged777.maxPledges) * 100);

  return (
    <div className="shell">
      <Nav />

      <main className="heroMain">
        <section className="hero">
          {/* Left column */}
          <div className="heroLeft">
            <MatrixLogo />

            <div className="heroBadge">
              <span className="heroBadgeDot" />
              Ritual Testnet · Genesis Registry
            </div>

            <div className="heroText">
              <h1 className="heroTitle">
                777 Pledges.<br />
                <span className="heroTitleAccent">Zero Gas.</span>
              </h1>
              <p className="heroSub">
                A permanent on-chain registry on Ritual Testnet. Sign once,
                pay nothing — the relayer covers all fees. Your wallet,
                image, and message live on-chain forever.
              </p>
            </div>

            <div className="heroMeta">
              <div className="metaItem">
                <strong>{total}</strong>
                <span>Pledged</span>
              </div>
              <div className="metaItem">
                <strong>{remaining}</strong>
                <span>Remaining</span>
              </div>
              <div className="metaItem">
                <strong>{pct}%</strong>
                <span>Filled</span>
              </div>
              <div className="metaItem">
                <strong>
                  <a
                    href={`${pledged777.explorerUrl}/address/${pledged777.address}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {pledged777.address.slice(0, 8)}…
                  </a>
                </strong>
                <span>Contract</span>
              </div>
            </div>

            <div className="heroActions">
              <a className="btn btnSolid" href="/#pledge">Claim Your Slot</a>
              <a className="btn" href="/how-it-works">How it Works →</a>
            </div>
          </div>

          {/* Right column — pledge console */}
          <aside className="heroRight" id="pledge">
            <PledgeConsole />
          </aside>
        </section>

        <div className="features">
          <div className="featureBox">
            <span className="featureIcon">0 GAS</span>
            <strong>No Gas Required</strong>
            <p>The relayer pays all transaction fees. You need zero RITUAL tokens — just a wallet signature.</p>
          </div>
          <div className="featureBox">
            <span className="featureIcon">ON-CHAIN</span>
            <strong>Permanent On-Chain</strong>
            <p>Your pledge, image, and message are stored directly on Ritual Testnet. No IPFS, no servers, no expiry.</p>
          </div>
          <div className="featureBox">
            <span className="featureIcon">777</span>
            <strong>Exactly 777. Always.</strong>
            <p>Hard-coded in the contract. One slot per wallet. No extensions, no exceptions, no second chances.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
