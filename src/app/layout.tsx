import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter as a premium, standard font
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "JSON Master Pro - Validator, Editor, Fixer",
  description: "The ultimate tool to validate, format, fix, and minify JSON data. Free, secure, and client-side.",
};

import { GlobalProvider } from "@/context/GlobalContext";

// ... existing code ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google AdSense Script Placeholder */}
        {/* 
            TODO: Replace CLIENT_ID with your actual AdSense Publisher ID (e.g., ca-pub-1234567890).
            The crossorigin attribute is required for AdSense.
        */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID_HERE"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className={inter.className}>
        <GlobalProvider>
          {children}
        </GlobalProvider>
      </body>
    </html>
  );
}
