import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard | AI Travel Planner",
  description: "View and manage your saved travel itineraries",
  openGraph: {
    title: "Dashboard | AI Travel Planner",
    description: "View and manage your saved travel itineraries",
    type: "website",
    locale: "en_US",
  },
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
} 