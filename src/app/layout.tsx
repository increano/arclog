import type { Metadata } from "next";
import { Quicksand, Playfair_Display } from "next/font/google";
import { BrandHeader } from "@/components/ui/brand-header";
import { Footer } from "@/components/ui/footer";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Arclog",
  description:
    "Learn the Bible, one verse at a time — a gamified Bible learning journey.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${quicksand.variable} ${playfair.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-background font-sans">
        <BrandHeader />
        <div className="flex-grow pt-16">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
