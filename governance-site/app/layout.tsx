import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Operations Automated — Connected Governance",
  description:
    "Connect operational knowledge, build proportionate governance and keep every decision traceable.",
  openGraph: {
    title: "Operations Automated — Connected Governance",
    description: "Connect operational knowledge, build proportionate governance and keep every decision traceable.",
    images: [{ url: "/governance-network.png", width: 1664, height: 922 }],
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
