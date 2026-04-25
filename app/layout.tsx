import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pledged Genesis Block",
  description: "A gasless Ritual Genesis registry for the first 333 pledged contributors.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
