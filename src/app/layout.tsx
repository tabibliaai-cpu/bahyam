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
  title: "API Monitor - Real-time API Monitoring Dashboard",
  description: "Production-quality API monitoring dashboard with real-time health status, response time tracking, uptime monitoring, and alert management. Built for bahyam.com.",
  keywords: ["API Monitor", "API Monitoring", "Uptime", "Health Check", "Dashboard"],
  authors: [{ name: "bahyam.com" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "API Monitor - Real-time API Monitoring Dashboard",
    description: "Professional API monitoring with real-time health status, response time charts, and alert management.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
