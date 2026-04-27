import Nav from "../Nav";
import Footer from "../Footer";
import { pledged777 } from "@/lib/contract";

export const metadata = {
  title: "How it Works — Pledged 777",
  description:
    "A technical breakdown of the zero-fee pledge system: wallet signature, server-side relay, and permanent on-chain storage on Ritual Testnet.",
};

export default function HowItWorksPage() {
  return (
    <div className="shell">
      <Nav />

      <main>
        <div className="howPage">

          {/* ── Header ── */}
          <div className="howHeader">
            <span className="label">Architecture</span>
            <h1>
              How Pledged 777<br />
              <span className="heroTitleAccent">Actually Works</span>
            </h1>
            <p>
              A full technical breakdown of the zero-fee pledge system — from wallet
              signature to permanent on-chain storage on Ritual Testnet. No gas,
              no IPFS, no middlemen.
            </p>
          </div>

          {/* ── 01 What is it ── */}
          <div className="howSection">
            <div className="howSectionLeft">
              <div className="howSectionNum">01</div>
              <div className="howSectionTitle">What is Pledged 777?</div>
            </div>
            <div className="howBody">
              <p>
                Pledged 777 is a <strong>permanent genesis registry</strong> deployed on{" "}
                <strong>Ritual Testnet (Chain ID 1979)</strong>. It lets any wallet claim
                one of exactly 777 slots by submitting a wallet address, a compressed
                image, and a 77-character message — all stored directly in contract storage.
              </p>
              <p>
                The core innovation: <strong>you pay zero gas</strong>. Instead of requiring
                users to hold RITUAL tokens and pay transaction fees, a server-side relayer
                submits the on-chain transaction on your behalf. You only provide a
                cryptographic signature to prove ownership of your wallet.
              </p>
              <div className="infoCard">
                <span className="infoIcon">⬡</span>
                <span>
                  Ritual is an EVM-compatible Layer 1 focused on on-chain AI and coprocessing.
                  Pledged 777 is a genesis community registry built for early supporters
                  of the network — 777 slots, one per wallet, forever.
                </span>
              </div>
            </div>
          </div>

          {/* ── 02 Zero-Fee Architecture ── */}
          <div className="howSection">
            <div className="howSectionLeft">
              <div className="howSectionNum">02</div>
              <div className="howSectionTitle">Zero-Fee Architecture</div>
            </div>
            <div className="howBody">
              <p>
                Traditional dApps require users to pay gas for every on-chain action.
                Pledged 777 uses a <strong>meta-transaction relay pattern</strong>: you sign
                a message locally (free), and our server-side relayer submits the actual
                transaction to the blockchain, covering all gas costs.
              </p>
              <div className="howCode">{`User                     Relayer (Server)            Ritual Testnet
  │                           │                           │
  │── eth_requestAccounts ──▶ │                           │
  │                           │                           │
  │── personal_sign ────────▶ │                           │
  │   (free, local op)        │                           │
  │                           │── verify signature        │
  │                           │── check hasPledged()      │
  │                           │── contract.pledge() ────▶ │
  │                           │   (relayer pays gas)      │── store on-chain
  │                           │                           │── mint ERC-721
  │                           │◀── txHash ─────────────── │
  │◀── txHash ─────────────── │                           │`}</div>
              <p>
                The relayer holds a funded wallet with RITUAL test tokens. When a
                pledge request arrives, it verifies the signature, confirms the wallet
                hasn{"'"}t pledged before, then submits the transaction and absorbs
                the gas cost entirely.
              </p>
            </div>
          </div>

          {/* ── 03 Step-by-Step ── */}
          <div className="howSection">
            <div className="howSectionLeft">
              <div className="howSectionNum">03</div>
              <div className="howSectionTitle">Step-by-Step Process</div>
            </div>
            <div className="howBody">
              <div className="timeline">
                <div className="timelineStep">
                  <div className="timelineNum">01</div>
                  <div className="timelineContent">
                    <strong>Connect Wallet</strong>
                    <p>
                      MetaMask (or any EIP-1193 provider) is prompted via{" "}
                      <code>eth_requestAccounts</code>. No network switch required —
                      you can be on any chain. Only your public address is read.
                    </p>
                  </div>
                </div>
                <div className="timelineStep">
                  <div className="timelineNum">02</div>
                  <div className="timelineContent">
                    <strong>Upload &amp; Compress Image</strong>
                    <p>
                      Your image is resized client-side to 64×64 px and compressed
                      to JPEG at adaptive quality until it fits under 4,600 characters
                      as a Base64 data URI — compact enough to store in contract storage
                      without IPFS.
                    </p>
                  </div>
                </div>
                <div className="timelineStep">
                  <div className="timelineNum">03</div>
                  <div className="timelineContent">
                    <strong>Sign the Message (No Gas)</strong>
                    <p>
                      Your wallet signs a deterministic message via <code>personal_sign</code>{" "}
                      (EIP-191). The message encodes your wallet address, binding the
                      signature cryptographically to you. This is a local operation —
                      it never hits the network and costs nothing.
                    </p>
                  </div>
                </div>
                <div className="timelineStep">
                  <div className="timelineNum">04</div>
                  <div className="timelineContent">
                    <strong>Relayer Verifies &amp; Submits</strong>
                    <p>
                      Your address, signature, image, and message are posted to{" "}
                      <code>/api/pledge</code>. The server recovers the signer via{" "}
                      <code>ecrecover</code>, verifies it matches your address,
                      confirms no prior pledge exists, then calls <code>pledge()</code>{" "}
                      on the contract — paying all gas from the relayer wallet.
                    </p>
                  </div>
                </div>
                <div className="timelineStep">
                  <div className="timelineNum">05</div>
                  <div className="timelineContent">
                    <strong>On-Chain Confirmation</strong>
                    <p>
                      The contract assigns your wallet the next available rank (1–777),
                      stores all data permanently in contract storage, and mints an
                      ERC-721 token directly to your address. The transaction hash is
                      returned and your entry appears in the Genesis List immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── 04 Signature Security ── */}
          <div className="howSection">
            <div className="howSectionLeft">
              <div className="howSectionNum">04</div>
              <div className="howSectionTitle">Signature &amp; Security</div>
            </div>
            <div className="howBody">
              <p>
                The signature mechanism prevents anyone from pledging on behalf of
                another wallet. Here is the exact message that gets signed, deterministically
                constructed from your address:
              </p>
              <div className="howCode">{`I am pledging my place in the Pledged777 genesis registry.

Wallet: 0xYOUR_ADDRESS

By signing, I confirm I am the owner of this wallet.
This action is gasless and irreversible.`}</div>
              <p>
                The relayer recovers the signer with <code>ecrecover</code> and rejects
                any request where the recovered address doesn{"'"}t match the submitted wallet.
                The check runs server-side before the transaction is ever sent.
              </p>
              <div className="infoCard">
                <span className="infoIcon">🔐</span>
                <span>
                  <strong>One wallet, one slot — enforced on-chain.</strong> The contract
                  maintains a <code>hasPledged</code> mapping. Even if the relayer were
                  somehow bypassed, a second pledge from the same wallet would revert
                  at the EVM level with no way around it.
                </span>
              </div>
            </div>
          </div>

          {/* ── 05 On-Chain Storage ── */}
          <div className="howSection">
            <div className="howSectionLeft">
              <div className="howSectionNum">05</div>
              <div className="howSectionTitle">On-Chain Storage</div>
            </div>
            <div className="howBody">
              <p>
                Unlike most NFT projects that store metadata on IPFS or centralized
                servers, Pledged 777 stores <strong>everything directly in contract storage</strong>.
                No external dependencies. No pins that expire. No servers that go offline.
              </p>
              <div className="howCode">{`struct PledgeData {
    address wallet;      // your wallet address
    string  imageUri;    // base64-encoded 64×64 JPEG
    string  message;     // up to 77 characters
    uint64  pledgedAt;   // unix timestamp of pledge
    uint16  rank;        // your slot number (1–777)
}`}</div>
              <p>
                The contract is also <strong>ERC-721 compliant</strong>. When you pledge,
                an NFT is minted to your wallet with a fully on-chain <code>tokenURI</code>{" "}
                that returns your image and metadata as a Base64-encoded JSON data URI —
                readable by any NFT marketplace or wallet without external requests.
              </p>
              <div className="infoCard">
                <span className="infoIcon">♾️</span>
                <span>
                  As long as Ritual{"'"}s chain history exists, your pledge exists. The
                  data is part of the chain state — immutable, censorship-resistant,
                  and readable by any Ethereum-compatible client with no additional
                  infrastructure.
                </span>
              </div>
            </div>
          </div>

          {/* ── 06 Contract ── */}
          <div className="howSection">
            <div className="howSectionLeft">
              <div className="howSectionNum">06</div>
              <div className="howSectionTitle">Smart Contract &amp; Source</div>
            </div>
            <div className="howBody">
              <p>
                The contract is fully open-source. You can read every pledge, verify
                the 777 hard-cap, and audit the code without trusting us. The relayer
                API is also published — every piece of the system is transparent.
              </p>
              <ul className="linkList">
                <li>
                  <a
                    href={`${pledged777.explorerUrl}/address/${pledged777.address}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>View Contract on Explorer</span>
                    <span>↗</span>
                  </a>
                </li>
                <li>
                  <a
                    href="https://github.com/gizdusum/pledged777"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span>Source Code on GitHub</span>
                    <span>↗</span>
                  </a>
                </li>
                <li>
                  <a href="/genesis">
                    <span>View Genesis List</span>
                    <span>→</span>
                  </a>
                </li>
                <li>
                  <a href="/">
                    <span>Claim Your Slot</span>
                    <span>→</span>
                  </a>
                </li>
              </ul>
              <div className="infoCard">
                <span className="infoIcon">📄</span>
                <span>
                  Contract:{" "}
                  <strong style={{ fontFamily: "var(--mono)", fontSize: "0.84em" }}>
                    {pledged777.address}
                  </strong>
                  <br />
                  Network: <strong>Ritual Testnet · Chain ID 1979</strong>
                </span>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
