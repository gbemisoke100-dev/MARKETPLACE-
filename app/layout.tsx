import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MARKETPLACE — Find talent. Discover products. Move forward.",
  description: "One trusted destination to hire exceptional people, discover great products and grow your business.",
  metadataBase: new URL("https://marketplace.com"),
  openGraph: { title: "MARKETPLACE", description: "Talent and products, in one place.", type: "website" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}