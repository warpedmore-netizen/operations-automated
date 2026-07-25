import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://northstar-governance-lab.warpedmore.chatgpt.site"),
  title: "Operations Automated — Connected Governance",
  description:
    "Connect operational knowledge, build proportionate governance and keep every decision traceable.",
  openGraph: {
    title: "Operations Automated — Connected Governance",
    description: "Connect operational knowledge, build proportionate governance and keep every decision traceable.",
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
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
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
