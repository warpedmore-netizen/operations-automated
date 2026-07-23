import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Northstar Governance Lab",
  description:
    "Build, connect, test and maintain living operational governance.",
  openGraph: {
    title: "Northstar Governance Lab",
    description: "Build, connect, test and maintain living operational governance.",
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
