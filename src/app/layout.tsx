import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE } from "@/config/site";

const poppins = Poppins({ variable: "--font-poppins", subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const title = `Portofolio Proyek | ${SITE.name}`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE.siteUrl),
  title: { default: title, template: `%s | ${SITE.short}` },
  description: SITE.tagline,
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: SITE.name,
    title,
    description: SITE.tagline,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: { card: "summary_large_image", title, description: SITE.tagline, images: ["/og.png"] },
};

export const viewport: Viewport = { themeColor: "#14144a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${poppins.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-white"
        >
          Lewati ke konten
        </a>
        <SiteHeader />
        <main id="konten" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
