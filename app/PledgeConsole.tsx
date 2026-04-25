"use client";

import { useMemo, useState } from "react";
import { pledgedGenesis } from "@/lib/contract";
import { buildPledgeMessage } from "@/lib/pledge";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

const shorten = (address: string) => `${address.slice(0, 6)}...${address.slice(-4)}`;

export default function PledgeConsole() {
  const [address, setAddress] = useState("");
  const [signature, setSignature] = useState("");
  const [txUrl, setTxUrl] = useState("");
  const [status, setStatus] = useState("Connect wallet to prepare your Genesis pledge.");
  const [isBusy, setIsBusy] = useState(false);

  const pledgeMessage = useMemo(() => {
    if (!address) return "";

    return buildPledgeMessage(address);
  }, [address]);

  async function connectWallet() {
    if (!window.ethereum) {
      setStatus("No wallet found. Install MetaMask or open this page in a wallet browser.");
      return;
    }

    setIsBusy(true);
    try {
      const accounts = (await window.ethereum.request({ method: "eth_requestAccounts" })) as string[];
      const nextAddress = accounts[0] ?? "";
      setAddress(nextAddress);
      setSignature("");
      setTxUrl("");
      setStatus("Wallet connected. Sign the pledge to queue your on-chain trace.");
    } catch {
      setStatus("Wallet connection was cancelled.");
    } finally {
      setIsBusy(false);
    }
  }

  async function signPledge() {
    if (!window.ethereum || !address || !pledgeMessage) return;

    setIsBusy(true);
    try {
      const signed = (await window.ethereum.request({
        method: "personal_sign",
        params: [pledgeMessage, address],
      })) as string;

      setSignature(signed);
      setTxUrl("");
      setStatus("Signature accepted. Sending the pledge to the Ritual relayer...");

      const response = await fetch("/api/pledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature: signed }),
      });
      const result = (await response.json().catch(() => null)) as {
        error?: string;
        explorerUrl?: string;
        readyForRelayer?: boolean;
      } | null;

      if (response.ok && result?.explorerUrl) {
        setTxUrl(result.explorerUrl);
        setStatus("On-chain pledge sent. Your wallet is being written to Ritual.");
      } else if (result?.readyForRelayer) {
        setStatus("Pledge signed. The relayer key is not configured on this server yet.");
      } else {
        setStatus(result?.error ?? "The relayer could not submit this pledge.");
      }
    } catch {
      setStatus("Signature was cancelled.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="pledgeConsole">
      <p className="eyebrow">On-chain entry</p>
      <div className="consoleSteps">
        <button type="button" onClick={connectWallet} disabled={isBusy} className="consoleButton">
          {address ? shorten(address) : "Connect wallet"}
        </button>
        <button type="button" onClick={signPledge} disabled={!address || isBusy} className="consoleButton secondaryButton">
          {signature ? "Pledge signed" : "Sign pledge"}
        </button>
      </div>
      <p className="consoleStatus">{status}</p>
      <div className="onchainReceipt">
        <span>Relayer transaction</span>
        {txUrl ? (
          <a href={txUrl} target="_blank" rel="noreferrer">
            View on Ritual explorer
          </a>
        ) : (
          <strong>User wallet stored in Ritual state</strong>
        )}
      </div>
    </div>
  );
}
