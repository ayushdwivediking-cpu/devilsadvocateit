import { Orbitron, DM_Mono, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-orbitron",
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-dm-mono",
  display: "swap",
});

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-barlow",
  display: "swap",
});

export const metadata = {
  title: "Devils Advocate 2.0 — Expose Fragility Before Capital Does",
  description:
    "A deterministic AI engine that deploys 5 adversarial agents against your startup structure and outputs a 0–100 Fragility Index.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${orbitron.variable} ${dmMono.variable} ${barlowCondensed.variable}`}
      >
        {children}
      </body>
    </html>
  );
}