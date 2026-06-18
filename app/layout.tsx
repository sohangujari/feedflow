import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FeedFlow - Free Real-Time News API",
  description:
    "FeedFlow is a free, open-source real-time news API with 25+ sources across 6 countries. Filter by category, country, language, and search keywords.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
