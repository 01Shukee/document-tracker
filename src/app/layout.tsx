import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: 'swap' });

export const metadata: Metadata = {
  title: "DocuTrack | FUTO",
  description: "Secure Document Dispatch",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} antialiased bg-[#0C0D0E] text-zinc-100 min-h-screen`}>
        {children}
      </body>
    </html>
  );
}