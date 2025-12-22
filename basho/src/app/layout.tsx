import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Basho Pottery",
  description: "Handcrafted pottery and custom tableware",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logotm-03.jpg" />
        <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      </head>
      <body
        className={`${inter.variable} ${playfair.variable} antialiased japanese-bg min-h-screen font-sans`}
      >
        <Navbar />
        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
