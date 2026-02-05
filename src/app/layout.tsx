/* src/app/layout.tsx */

import type { Metadata } from "next";
import "./globals.css";
import { JourneyProvider } from "@/app/context/JourneyContext";
import { BrandingProvider } from "@/app/context/BrandingContext";
import { cn } from "@/lib/utils";
import { Open_Sans } from "next/font/google";

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "HDFC Bank - Salaried Account",
  description: "Streamlined account opening for salaried employees.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // --- MODIFIED: Removed 'dark' class ---
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      {/* --- MODIFIED: Removed all extra classes --- */}
      <body
        className={cn(
          "h-screen overflow-hidden font-sans antialiased",
          openSans.variable
        )}
      >
        <BrandingProvider>
          <JourneyProvider>
            {children}
          </JourneyProvider>
        </BrandingProvider>
      </body>
    </html>
  );
}