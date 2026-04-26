"use client";

import { useEffect, useState } from "react";
import { pledged777 } from "@/lib/contract";

type ChainStats = {
  blockNumber: number;
  gasPriceGwei: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  faucetUrl: string;
  error?: string;
};

function ChainLive() {
  const [stats, setStats] = useState<ChainStats | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/chain", { cache: "no-store" });
        const data = await res.json();
        setStats(data);
      } catch {
        setStats(null);
      }
    }
    load();
    const iv = setInterval(load, 5000);
    return () => clearInterval(iv);
  }, []);

  if (!stats) {
    return (
      <div className="chainGrid">
        <div className="chainCard">
          <div className="liveChip"><span className="liveDot" />LIVE</div>
          <div className="bigStat">—</div>
          <p className="statDesc">Latest Block</p>
        </div>
        <div className="chainCard">
          <div className="liveChip"><span className="liveDot" />LIVE</div>
          <div className="bigStat">—</div>
          <p className="statDesc">Gas Price (gwei)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chainGrid">
      <div className="chainCard">
        <div className="liveChip"><span className="liveDot" />LIVE</div>
        <div className="bigStat">{stats.blockNumber?.toLocaleString() ?? "—"}</div>
        <p className="statDesc">Latest Block</p>
      </div>
      <div className="chainCard">
        <div className="liveChip"><span className="liveDot" />LIVE</div>
        <div className="bigStat">{stats.gasPriceGwei ?? "—"}</div>
        <p className="statDesc">Gas Price (gwei)</p>
      </div>
    </div>
  );
}

export default function ChainPage() {
  const metaMaskParams = JSON.stringify({
    chainId: "0x7BB",
    chainName: "Ritual Testnet",
    nativeCurrency: { name: "RITUAL", symbol: "RITUAL", decimals: 18 },
    rpcUrls: ["https://rpc.ritualfoundation.org"],
    blockExplorerUrls: ["https://explorer.ritualfoundation.org"],
  }, null, 2);

  return (
    <div className="shell">
      <nav className="nav">
        <span className="navBrand"><a href="/">PLEDGED_777</a></span>
        <ul className="navLinks">
          <li><a href="/genesis">Genesis List</a></li>
          <li><a href="/chain">Chain</a></li>
          <li><a href={pledged777.explorerUrl} target="_blank" rel="noreferrer">Explorer</a></li>
        </ul>
      </nav>

      <main>
        <div className="chainHeader">
          <span className="label">Ritual Testnet · Chain ID 1979</span>
          <h2>Chain Status &amp; Setup</h2>
          <p className="lede">Live stats and everything you need to connect to Ritual Testnet.</p>
        </div>

        <ChainLive />

        <div className="chainGrid" style={{ marginBottom: 40 }}>
          <div className="chainCard">
            <h3>Network Details</h3>
            <div className="codeBlock">{
`Chain ID:   1979 (0x7BB)
Network:    Ritual Testnet
Currency:   RITUAL
Decimals:   18

RPC:        https://rpc.ritualfoundation.org
Explorer:   https://explorer.ritualfoundation.org
Faucet:     https://faucet.ritualfoundation.org`
            }</div>
          </div>

          <div className="chainCard">
            <h3>Useful Links</h3>
            <ul className="linkList">
              <li>
                <a href={pledged777.explorerUrl} target="_blank" rel="noreferrer">
                  Explorer →
                </a>
              </li>
              <li>
                <a href={pledged777.faucetUrl} target="_blank" rel="noreferrer">
                  Faucet (get test RITUAL) →
                </a>
              </li>
              <li>
                <a href={pledged777.docsUrl} target="_blank" rel="noreferrer">
                  Ritual Docs →
                </a>
              </li>
              <li>
                <a href={`${pledged777.explorerUrl}/address/${pledged777.address}`} target="_blank" rel="noreferrer">
                  Pledged777 Contract →
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="chainCard" style={{ marginBottom: 40 }}>
          <h3>Add Ritual Testnet to MetaMask</h3>
          <div className="rpcStep">
            <span className="rpcStepNum">01</span>
            <div className="rpcStepBody">Open MetaMask → click the network selector at the top.</div>
          </div>
          <div className="rpcStep">
            <span className="rpcStepNum">02</span>
            <div className="rpcStepBody">Click <strong>Add a custom network</strong> or <strong>Add network manually</strong>.</div>
          </div>
          <div className="rpcStep">
            <span className="rpcStepNum">03</span>
            <div className="rpcStepBody">
              Fill in these values:
              <div className="codeBlock">{
`Network Name:   Ritual Testnet
RPC URL:        https://rpc.ritualfoundation.org
Chain ID:       1979
Symbol:         RITUAL
Explorer URL:   https://explorer.ritualfoundation.org`
              }</div>
            </div>
          </div>
          <div className="rpcStep">
            <span className="rpcStepNum">04</span>
            <div className="rpcStepBody">Click <strong>Save</strong>. Ritual Testnet is now in your network list.</div>
          </div>
          <div className="rpcStep">
            <span className="rpcStepNum">05</span>
            <div className="rpcStepBody">
              Get test RITUAL from the{" "}
              <a href={pledged777.faucetUrl} target="_blank" rel="noreferrer">faucet</a>.
            </div>
          </div>
        </div>

        <div className="chainCard" style={{ marginBottom: 40 }}>
          <h3>Add via wallet_addEthereumChain (programmatic)</h3>
          <div className="codeBlock">{metaMaskParams}</div>
        </div>
      </main>

      <footer className="footer">
        <span>PLEDGED_777 · Ritual Testnet</span>
        <div className="footerLinks">
          <a href="/">← Back</a>
        </div>
      </footer>
    </div>
  );
}
