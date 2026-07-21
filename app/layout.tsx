import type { Metadata, Viewport } from "next";

import "./globals.css";
import { AppProviders } from "@/components/app-providers";

export const metadata: Metadata = {
  title: "BaseMint",
  description: "Mint one free daily NFT on Base and earn reward points.",
  metadataBase: new URL("https://basemint.app"),
  other: {
    "base:app_id": "6a5f1b5d078f6baf9ef30004",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0052ff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
