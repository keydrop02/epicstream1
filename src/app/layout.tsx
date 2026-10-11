import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSports } from "@/lib/api";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = localFont({
  src: "../../public/fonts/InterVariable.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - Watch Any Live Sport Online, Best Source to watch NBA, NHL, MLB, UFC For Free!`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    `${SITE_NAME} is the best source to watch live sport online for free, watch on any device!`,
  applicationName: SITE_NAME,
  icons: { icon: "/favicon.png" },
  openGraph: {
    title: `${SITE_NAME} - Watch Any Live Sport Online, Best Source to watch NBA, NHL, MLB, UFC For Free!`,
    description:
      `${SITE_NAME} is the best source to watch live sport online for free, watch on any device!`,
    url: `${SITE_URL}/`,
    siteName: SITE_NAME,
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const sports = await getSports();

  return (
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          <SiteHeader sports={sports} />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
