import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pledged 777 — Ritual Testnet Genesis",
  description:
    "777 permanent on-chain pledges on Ritual Testnet. Connect your wallet, upload an image, leave a message — your trace lives on the blockchain forever.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
