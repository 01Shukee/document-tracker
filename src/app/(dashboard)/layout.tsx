import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google"; // New Fonts
import "../globals.css"; 
import Sidebar from "../../components/sidebar/Sidebar";
import SecurityWrapper from "../../components/SecurityWrapper"; // Security Lock

// Initialize the "Techy" fonts
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-rare', 
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-code',
});

export const metadata: Metadata = {
  title: "DocuTrack | Dispatch System",
  description: "Web-Based Document Dispatch and Tracking System",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Wrap your entire layout in the Bouncer
    <SecurityWrapper>
      {/* Swap 'inter' for 'spaceGrotesk' and set the global background */}
      <div className={`${spaceGrotesk.className} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased bg-[#0C0D0E] text-zinc-100 min-h-screen flex selection:bg-emerald-500/30`}>
        
        <Sidebar />
        
        {/* MOBILE FIX: flex-1 takes exact remaining space, p-4 on mobile to save screen real estate, md:p-8 for big desktop screens, and overflow-x-hidden stops horizontal scrolling. */}
        <main className="flex-1 ml-16 p-4 md:p-8 transition-all duration-300 overflow-x-hidden">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
        
      </div>
    </SecurityWrapper>
  );
}