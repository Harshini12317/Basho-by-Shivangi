import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Basho by Shivangi",
  description: "Handcrafted pottery and custom tableware",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="scroll-smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Razorpay */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
      </head>

      <body
        className={`
          ${inter.variable}
          ${playfair.variable}
          antialiased
          min-h-screen
          bg-[var(--bg-primary)]
          text-[var(--text-primary)]
          overflow-x-hidden
        `}
      >
        {/* Glass Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="relative">
          {children}
        </main>
      </body>
    </html>
  );
}
