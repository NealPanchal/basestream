import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import LayoutShell from "@/components/LayoutShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Base Stream - Stream Movies & TV Shows",
    template: "%s | Base Stream"
  },
  description: "Discover and stream your favorite movies and TV shows with Base Stream",
  keywords: ["movies", "tv shows", "streaming", "watch online", "entertainment", "web3", "base"],
  authors: [{ name: "Base Stream" }],
  creator: "Base Stream",
  publisher: "Base Stream",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://basestream.vercel.app'),
  openGraph: {
    title: "Base Stream - Stream Movies & TV Shows",
    description: "Discover and stream your favorite movies and TV shows with Base Stream",
    type: "website",
    locale: "en_US",
    siteName: "Base Stream",
  },
  twitter: {
    card: "summary_large_image",
    title: "Base Stream - Stream Movies & TV Shows",
    description: "Discover and stream your favorite movies and TV shows with Base Stream",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* DNS preconnect hints for streaming providers — eliminates cold-start penalty on fallback */}
        <link rel="preconnect" href="https://vidsrc.to" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://streamimdb.ru" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://embed.su" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.2embed.cc" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://multiembed.mov" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.vidking.net" crossOrigin="anonymous" />
        
        <link rel="dns-prefetch" href="https://vidsrc.to" />
        <link rel="dns-prefetch" href="https://streamimdb.ru" />
        <link rel="dns-prefetch" href="https://embed.su" />
        <link rel="dns-prefetch" href="https://www.2embed.cc" />
        <link rel="dns-prefetch" href="https://multiembed.mov" />
        <link rel="dns-prefetch" href="https://www.vidking.net" />
        {/* TMDB image CDN preconnect */}
        <link rel="preconnect" href="https://image.tmdb.org" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://image.tmdb.org" />
      </head>
      <body className="min-h-full flex flex-col bg-base-black">
        <Providers>
          <LayoutShell>
            {children}
          </LayoutShell>
        </Providers>
      </body>
    </html>
  );
}
