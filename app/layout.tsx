import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pledged Genesis",
  description: "A gasless Ritual Genesis list for the first 777 pledged contributors.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
