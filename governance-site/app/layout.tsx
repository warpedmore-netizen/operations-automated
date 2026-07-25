import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://northstar-governance-lab.warpedmore.chatgpt.site"),
  title: "Operations Automated — Connected Governance",
  description:
    "Turn operating context into explained, reviewable governance while keeping approval human.",
  openGraph: {
    title: "Operations Automated — Connected Governance",
    description:
      "Turn operating context into explained, reviewable governance while keeping approval human.",
    images: [
      {
        url: "/og.png",
        width: 1731,
        height: 909,
        alt: "Operations Automated Connected Governance",
      },
    ],
  },
  icons: {
    icon: "/brand-favicon.png",
    shortcut: "/brand-favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
