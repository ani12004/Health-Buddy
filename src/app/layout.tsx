import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { DynamicIsland } from "@/components/ui/dynamic-island";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Health Buddy | AI-Powered Health Platform",
  description: "Premium medical AI web application connecting patients and doctors.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={outfit.className}>
        <DynamicIsland />
        {children}
      </body>
    </html>
  );
}
