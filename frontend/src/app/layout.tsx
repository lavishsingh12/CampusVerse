import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CampusVerse | College Dating & Social Discovery",
  description: "Connect, discover, and build meaningful relationships across campus.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased selection:bg-rose-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
