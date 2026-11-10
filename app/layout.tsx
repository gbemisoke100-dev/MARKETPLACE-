import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ThemeControl from "@/components/theme-control";

const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

export const metadata: Metadata = {
  title: "WORKNA — Work, shop and grow.",
  description: "One trusted home for finding work, hiring talent and discovering products worth keeping.",
  applicationName: "WORKNA",
  openGraph: {
    title: "WORKNA",
    description: "Work that moves you. Things worth finding.",
    type: "website"
  },
  twitter: { card: "summary_large_image", title: "WORKNA", description: "Work that moves you. Things worth finding." }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" data-theme="dark"><body className={inter.variable}>{children}<ThemeControl /></body></html>;
}