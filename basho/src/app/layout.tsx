import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
import Footer from "@/components/Footer";

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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
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
        {/* 👇 Navbar logic moved out */}
        <NavbarWrapper />

        <main className="relative">
          {children}
        </main>
        <Footer/>
      </body>
    </html>
  );
}
