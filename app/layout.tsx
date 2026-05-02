import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TPS EduShift Support",
  description: "Teacher Mentorship & Collaboration Platform - The Philippine School",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Fixed Navbar */}
        <Navbar />

        {/* School Background - stays behind everything */}
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat z-[-1]"
          style={{ backgroundImage: "url('/images/school-background.jpg')" }}
        />
        
        {/* Dark overlay for better text readability */}
        <div className="fixed inset-0 bg-black/50 z-[-1]" />

        {/* Main content with proper padding so navbar doesn't cover anything */}
        <main className="pt-24 relative z-10 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
