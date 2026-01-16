import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import NavbarWrapper from "@/components/NavbarWrapper";
import Footer from "@/components/Footer";
import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import PageWrapper from "@/components/common/PageWrapper";

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
  icons: {
    icon: '/favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions as any);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </head>

      <body
        className={`${inter.variable} ${playfair.variable} antialiased min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]`}
        style={{
          backgroundImage: 'url("/images/i2.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <SessionProviderWrapper session={session}>
          <NavbarWrapper />
          <main className="relative pt-20">
            <PageWrapper>{children}</PageWrapper>
          </main>
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
