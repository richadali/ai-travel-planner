import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import Script from "next/script";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import config from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Get base URL from config
const baseUrl = config.app.baseUrl.replace(/\/$/, ''); // Remove trailing slash if present

export const metadata: Metadata = {
  title: "AI Travel Planner | Personalized Trip Itineraries",
  description: "Plan your perfect trip with AI assistance. Get personalized travel itineraries based on your destination, budget, and preferences.",
  metadataBase: new URL(baseUrl),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: "AI Travel Planner | Personalized Trip Itineraries",
    description: "Plan your perfect trip with AI assistance. Get personalized travel itineraries based on your destination, budget, and preferences.",
    siteName: "AI Travel Planner",
    images: [
      {
        url: `${baseUrl}/api/og/home`,
        width: 1200,
        height: 630,
        alt: "AI Travel Planner",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Travel Planner | Personalized Trip Itineraries",
    description: "Plan your perfect trip with AI assistance. Get personalized travel itineraries based on your destination, budget, and preferences.",
    images: [`${baseUrl}/api/og/home`],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  alternates: {
    canonical: baseUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-H1NFKBMBC0"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-H1NFKBMBC0');
          `}
        </Script>
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          geistSans.variable,
          geistMono.variable
        )}
      >
        <AuthProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
      >
        {/* Analytics Tracker */}
        <AnalyticsTracker />
        {children}
        </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
