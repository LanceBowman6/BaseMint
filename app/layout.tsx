import type { Metadata, Viewport } from "next";

import "./globals.css";
import { AppProviders } from "@/components/app-providers";

export const metadata: Metadata = {
  applicationName: "BaseMint",
  title: "BaseMint",
  description: "Mint one free daily NFT on Base and earn reward points.",
  metadataBase: new URL("https://basemint-three.vercel.app"),
  manifest: "/site.webmanifest",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "BaseMint",
    description: "Mint one free daily NFT on Base and earn reward points.",
    url: "https://basemint-three.vercel.app",
    siteName: "BaseMint",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "BaseMint daily NFT mint on Base",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BaseMint",
    description: "Mint one free daily NFT on Base and earn reward points.",
    images: ["/og-image.svg"],
  },
  other: {
    "base:app_id": "6a5f1b5d078f6baf9ef30004",
    "talentapp:project_verification":
      "0abee862dd8e3778947c5474f259cfa0587de112e8ed1cd233f9ff9a406ad9ae43cf1495e63be09f171f68dd70d2672a17100ab0e270c1222a0f1d60046f616e",
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
