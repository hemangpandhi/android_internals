import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as requested/standard
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Providers } from "./providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter", // Expose as CSS variable
});

export const metadata: Metadata = {
  title: "Android Internals - Complete Guide",
  description: "Comprehensive guide to Android Internals - HAL, Framework, System Apps, OS Internals, ADB, Performance, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className={`${inter.className} ${inter.variable} min-h-screen flex flex-col`} suppressHydrationWarning>
        <Providers>
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
