import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PulseAPI — Monitor. Predict. Never Go Down.",
  description: "AI-powered API monitoring with a real-time public marketplace. Watch 20+ APIs being monitored live, predict failures before they happen, and pay with Bitcoin.",
  keywords: ["API Monitoring", "Uptime", "AI", "Marketplace", "Bitcoin", "Real-time"],
  icons: { icon: "/logo.svg" },
  openGraph: {
    title: "PulseAPI — Monitor. Predict. Never Go Down.",
    description: "AI-powered API monitoring with real-time marketplace.",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
