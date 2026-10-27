import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ShipSpeak | Voice-First Last-Mile Engine for Developers",
  description: "Built for the Wispr No Hand Challenge. Convert raw voice brain dumps and git diffs into production GitHub PRs, Mermaid architecture diagrams, demo video scripts, and social updates.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark`}>
      <body className="min-h-screen bg-[#0d0e0f] text-[#e3e2e3] antialiased selection:bg-[#5e6ad2]/30 selection:text-[#bdc2ff]">
        {children}
      </body>
    </html>
  );
}
