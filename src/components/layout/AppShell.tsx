"use client";

import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { RoleProvider } from "./RoleContext";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <RoleProvider>
      <div className="flex min-h-dvh flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
        <footer className="border-t border-slate-200 bg-white">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-1 px-4 py-4 text-[11px] text-slate-400 sm:flex-row sm:px-6">
            <span>
              Actividad de Responsabilidad Social Universitaria — Calidad de
              Sistemas de Información
            </span>
            <span>Datos sincronizados en tiempo real</span>
          </div>
        </footer>
      </div>
    </RoleProvider>
  );
}
