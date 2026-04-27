"use client";

import { useEffect, useState } from "react";
import Footer from "../Footer";
import Nav from "../Nav";
import { pledged777 } from "@/lib/contract";

type Stats = {
  blockNumber: number;
  gasPriceGwei: string;
  chainId: number;
};

export default function ChainPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/chain", { cache: "no-store" });
        const data = await res.json();
        if (!data.error) setStats(data);
      } catch { /* silent */ }
      setTick((t) => t + 1);
    }
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  void tick;

  return (
    <div className="shell">
      <Nav />

      <main>
        <div className="chainPage">
          <span className="label">Ritual Testnet · Chain ID 1979</span>
          <h2>Chain Status</h2>

          <div className="chainHero">
            <div className="chainStatBlock">
              <div className="liveBadge"><span className="liveDot" />Live</div>
              <div className="chainBigNum">
                {stats ? stats.blockNumber.toLocaleString() : "—"}
              </div>
              <div className="chainLabel">Latest Block</div>
            </div>

            <div className="chainStatBlock center">
              <div className="liveBadge"><span className="liveDot" />Live</div>
              <div className="chainBigNum">
                {stats ? `${stats.gasPriceGwei} gwei` : "—"}
              </div>
              <div className="chainLabel">Gas Price</div>
            </div>

            <div className="chainStatBlock">
              <div className="liveBadge" style={{ opacity: 0.45 }}>Static</div>
              <div className="chainBigNum">1979</div>
              <div className="chainLabel">Chain ID</div>
            </div>
          </div>

          <div className="chainRow">
            <div className="chainCard">
              <h3>Network Details</h3>
              <div className="codeBlock">{`Name     Ritual Testnet
RPC      rpc.ritualfoundation.org
Symbol   RITUAL
ChainID  1979  (0x7BB)`}</div>
            </div>

            <div className="chainCard">
              <h3>Resources</h3>
              <ul className="linkList">
                <li>
                  <a href={pledged777.explorerUrl} target="_blank" rel="noreferrer">
                    Block Explorer <span>↗</span>
                  </a>
                </li>
                <li>
                  <a href={pledged777.faucetUrl} target="_blank" rel="noreferrer">
                    Test Token Faucet <span>↗</span>
                  </a>
                </li>
                <li>
                  <a href={pledged777.docsUrl} target="_blank" rel="noreferrer">
                    Ritual Docs <span>↗</span>
                  </a>
                </li>
                <li>
                  <a href={`${pledged777.explorerUrl}/address/${pledged777.address}`} target="_blank" rel="noreferrer">
                    Pledged777 Contract <span>↗</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="chainCard">
            <h3>Add to MetaMask</h3>
            <div className="mmSteps">
              <div className="mmStep">
                <span className="mmStepN">01</span>
                <span>Open MetaMask → Network selector → <strong>Add a custom network</strong></span>
              </div>
              <div className="mmStep">
                <span className="mmStepN">02</span>
                <span>Fill in the values below and click <strong>Save</strong></span>
              </div>
            </div>
            <div className="codeBlock">{`Network Name   Ritual Testnet
RPC URL        https://rpc.ritualfoundation.org
Chain ID       1979
Symbol         RITUAL
Explorer       https://explorer.ritualfoundation.org`}</div>
            <div className="mmStep" style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 4 }}>
              <span className="mmStepN">03</span>
              <span>
                Get test tokens from the{" "}
                <a href={pledged777.faucetUrl} target="_blank" rel="noreferrer">
                  faucet ↗
                </a>
              </span>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
