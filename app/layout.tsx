// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { SideNav } from "@/components/layout/SideNav";
import { Toaster } from "@/components/ui/Toaster";

export const metadata: Metadata = {
  title: "Campaign Content Operations Hub",
  description: "Reform UK · Bromford & Hodge Hill · Birmingham City Council",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-campaign-black text-white min-h-screen font-sans antialiased">
        <div className="flex min-h-screen">
          <SideNav />
          <main className="flex-1 ml-0 md:ml-64 min-h-screen">
            <div className="p-4 md:p-8 max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
