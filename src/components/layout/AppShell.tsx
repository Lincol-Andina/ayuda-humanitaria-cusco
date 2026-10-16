"use client";

import { AuthProvider } from "@/components/layout/AuthContext";
import Navbar from "@/components/layout/Navbar";
import type { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <div className="flex min-h-dvh flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
      </div>
    </AuthProvider>
  );
}
