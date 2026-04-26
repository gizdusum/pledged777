"use client";

import { useCallback, useRef, useState } from "react";
import { buildPledgeMessage } from "@/lib/pledge";

type EIP1193 = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EIP1193;
  }
}

async function resizeToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = 48;
      canvas.height = 48;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas not supported"));
      const s = Math.min(img.width, img.height);
      const sx = (img.width - s) / 2;
      const sy = (img.height - s) / 2;
      ctx.drawImage(img, sx, sy, s, s, 0, 0, 48, 48);
      resolve(canvas.toDataURL("image/jpeg", 0.55));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image load failed")); };
    img.src = url;
  });
}

function truncate(addr: string) {
  return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "";
}

type Status = { text: string; kind: "idle" | "ok" | "err" };

export default function PledgeConsole() {
  const [address, setAddress] = useState<string>("");
  const [imageUri, setImageUri] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [status, setStatus] = useState<Status>({ text: "Connect your wallet to begin.", kind: "idle" });
  const [txHash, setTxHash] = useState<string>("");
  const [txUrl, setTxUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const setErr = (text: string) => setStatus({ text, kind: "err" });
  const setOk = (text: string) => setStatus({ text, kind: "ok" });
  const setIdle = (text: string) => setStatus({ text, kind: "idle" });

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setErr("No wallet detected. Install MetaMask or a compatible wallet.");
      return;
    }
    try {
      setLoading(true);
      const accounts = (await window.ethereum.request({
        method: "eth_requestAccounts",
      })) as string[];
      if (!accounts[0]) throw new Error("No account returned.");
      setAddress(accounts[0]);
      setOk(`Connected: ${truncate(accounts[0])}`);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Connection failed.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      setErr("Only image files are accepted.");
      return;
    }
    try {
      setIdle("Resizing image...");
      const uri = await resizeToBase64(file);
      setImageUri(uri);
      setIdle("Image ready. Write your message.");
    } catch {
      setErr("Could not process image.");
    }
  }, []);

  const handleFilePick = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const submitPledge = useCallback(async () => {
    if (!address) { setErr("Connect your wallet first."); return; }
    if (!imageUri) { setErr("Upload an image first."); return; }
    if (!message.trim()) { setErr("Write a message first."); return; }
    if (message.length > 77) { setErr("Message exceeds 77 characters."); return; }

    setLoading(true);
    setIdle("Requesting signature...");

    try {
      const provider = window.ethereum!;
      const pledgeMsg = buildPledgeMessage(address);
      const sig = (await provider.request({
        method: "personal_sign",
        params: [pledgeMsg, address],
      })) as string;

      setIdle("Signature received. Sending to relayer...");

      const res = await fetch("/api/pledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address, signature: sig, imageUri, message }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error ?? "Relayer error.");

      setTxHash(data.txHash);
      setTxUrl(data.explorerUrl);
      setOk("Pledge confirmed on Ritual Testnet.");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [address, imageUri, message]);

  const charLeft = 77 - message.length;
  const charClass = charLeft < 0 ? "charCount over" : charLeft < 15 ? "charCount warn" : "charCount";

  if (txHash) {
    return (
      <div className="console">
        <p className="consoleTitle">// pledge confirmed</p>
        <div className="receipt">
          <span>Transaction Hash</span>
          <a href={txUrl} target="_blank" rel="noreferrer">{txHash}</a>
          <span style={{ marginTop: 8 }}>Your wallet is now permanently on Ritual Testnet.</span>
        </div>
        <a className="btn" href={txUrl} target="_blank" rel="noreferrer" style={{ fontSize: "0.78rem" }}>
          View on Explorer →
        </a>
      </div>
    );
  }

  return (
    <div className="console">
      <p className="consoleTitle">// claim your slot</p>

      <div className="step">
        <p className={"stepLabel" + (address ? " done" : "")}>
          {address ? ("✓ " + truncate(address)) : "01 — Connect Wallet"}
        </p>
        {!address && (
          <button className="btnSolid btn" onClick={connectWallet} disabled={loading}>
            Connect
          </button>
        )}
      </div>

      {address && (
        <div className="step">
          <p className={"stepLabel" + (imageUri ? " done" : "")}>
            {imageUri ? "✓ Image ready" : "02 — Upload Image"}
          </p>
          {imageUri ? (
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <img src={imageUri} alt="preview" className="imagePreview" />
              <button className="btn" style={{ fontSize: "0.78rem" }} onClick={() => { setImageUri(""); if (fileRef.current) fileRef.current.value = ""; }}>
                Change
              </button>
            </div>
          ) : (
            <>
              <button
                className="imageUploadArea"
                onClick={() => fileRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                Drop image here or click to upload
                <br />
                <span style={{ fontSize: "0.72rem", opacity: 0.6 }}>Resized to 48x48px · stored on-chain</span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFilePick}
              />
            </>
          )}
        </div>
      )}

      {address && imageUri && (
        <div className="step">
          <p className={"stepLabel" + (message.trim() ? " done" : "")}>
            03 — Your Message
          </p>
          <textarea
            className="inputField"
            rows={2}
            maxLength={80}
            placeholder="Leave your mark... (77 chars max)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <p className={charClass}>{charLeft} chars left</p>
        </div>
      )}

      {address && imageUri && (
        <button
          className="btnSolid btn"
          onClick={submitPledge}
          disabled={loading || !message.trim() || message.length > 77}
        >
          {loading ? "Processing..." : "Sign & Pledge On-Chain"}
        </button>
      )}

      <p className={"statusMsg" + (status.kind === "err" ? " err" : status.kind === "ok" ? " ok" : "")}>
        {status.text}
      </p>
    </div>
  );
}
