import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import "../styles/prism-hacker.css";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import CyberAssistant from "@/components/CyberAssistant";

const sansFont = localFont({
  src: [
    {
      path: "./fonts/Inter-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Inter-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Inter-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Inter-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

const monoFont = localFont({
  src: [
    {
      path: "./fonts/JetBrainsMono-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/JetBrainsMono-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/JetBrainsMono-SemiBold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/JetBrainsMono-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rohit Saindane | Cybersecurity Portfolio & Writeups",
  description:
    "Professional cybersecurity portfolio documenting Hack The Box machine writeups, offensive security research, and penetration testing walkthroughs.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${sansFont.variable} ${monoFont.variable} antialiased bg-background text-foreground font-sans theme-transition min-h-screen flex flex-col`}
      >
        <Providers>
          <Navbar />
          <main className="flex-grow flex flex-col">{children}</main>
          <Footer />
          <SearchModal />
          <CyberAssistant />
        </Providers>
      </body>
    </html>
  );
}
