"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AnalyticsDashboard from "./analytics/page";

export default function AdminPage() {
  return <AnalyticsDashboard />;
} 