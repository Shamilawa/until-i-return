import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import { PEOPLE } from "@/lib/config";
import "./globals.css";

const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"] });
const nunito = Nunito({ variable: "--font-nunito", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Until I'm Home",
  description: `A little world for ${PEOPLE.author.name} and ${PEOPLE.reader.name}.`,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: "#a8d4f7",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable} h-full antialiased`}>
      <body className="min-h-full">{children}</body>
    </html>
  );
}
