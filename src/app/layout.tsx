import type { Metadata } from "next";
import { Inter, Barlow_Condensed } from "next/font/google";
import "./globals.css";
import { WebVitals } from "@/components/monitoring/WebVitals";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "MotoTrack",
  description: "Suivi d'entretien et gestion de garage moto",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.variable} ${barlowCondensed.variable} font-sans`}>
        <WebVitals />
        {children}
      </body>
    </html>
  );
}
