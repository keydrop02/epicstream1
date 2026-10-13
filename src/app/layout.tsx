import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Orbitron } from "next/font/google";
import { NavTracker } from "@/components/nav-tracker";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = localFont({
  src: "../../public/fonts/InterVariable.woff2",
  variable: "--font-inter",
  display: "swap",
  weight: "100 900",
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: "variable",
  variable: "--font-orbitron",
  display: "swap",
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
  themeColor: "#09090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${orbitron.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased">
        <NavTracker />
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex flex-1 flex-col">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
