import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth-provider";
import Script from "next/script";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import config from "@/lib/config";
import { metadata as siteMetadata } from "./metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Get base URL from config
const baseUrl = config.app.baseUrl || "https://aitravelplanner.richadali.dev";

// Use the metadata from the metadata file
export const metadata: Metadata = siteMetadata;

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
        
        {/* Explicit OG tags to ensure they're properly included */}
        <meta property="og:image" content={`${baseUrl}/og.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="AI Travel Planner" />
        <meta property="twitter:image" content={`${baseUrl}/og.png`} />
        <meta property="twitter:card" content="summary_large_image" />
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
