import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | AI Travel Planner",
  description: "The page you're looking for doesn't exist. Let's get you back on track.",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center py-16 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold">404</h1>
            <h2 className="text-2xl font-semibold">Page not found</h2>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button>Return Home</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          </div>
          <div className="pt-8">
            <p className="text-sm text-muted-foreground">
              Looking for travel inspiration? Try our AI travel planner to create your perfect itinerary.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
} 