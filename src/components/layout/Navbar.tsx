"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  ClipboardCheck,
  LayoutDashboard,
  Menu,
  PackageSearch,
  Settings,
  ShieldCheck,
  Truck,
  X,
} from "lucide-react";
import { CELULAS, type CelulaId } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useRole } from "./RoleContext";
import { useHealth } from "@/hooks/useHealth";

const LINKS = [
  { href: "/", label: "Transparencia", icon: LayoutDashboard },
  { href: "/inspeccion", label: "Inspección", icon: ClipboardCheck },
  { href: "/inventario", label: "Inventario", icon: PackageSearch },
  { href: "/despacho", label: "Despacho", icon: Truck },
  { href: "/admin", label: "Administración", icon: Settings },
];

export function Navbar() {
  const pathname = usePathname();
  const { celula, setCelula } = useRole();
  const { online, checked } = useHealth();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-bold text-slate-900">
              Ayuda Humanitaria Cusco
            </span>
            <span className="block text-[11px] text-slate-500">
              Logística y Control de Calidad
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span
            className={cn(
              "hidden items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ring-inset sm:inline-flex",
              !checked
                ? "bg-slate-100 text-slate-500 ring-slate-200"
                : online
                  ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                  : "bg-rose-50 text-rose-700 ring-rose-200",
            )}
            title="Estado de sincronización en tiempo real"
          >
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                !checked
                  ? "bg-slate-400"
                  : online
                    ? "animate-live bg-emerald-500"
                    : "bg-rose-500",
              )}
            />
            {!checked ? "Conectando" : online ? "En vivo" : "Sin conexión"}
          </span>

          <select
            value={celula}
            onChange={(event) => setCelula(event.target.value as CelulaId)}
            className="hidden rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs font-medium text-slate-700 focus:border-brand-500 focus:outline-none md:block"
            title="Selecciona tu rol/célula"
          >
            {CELULAS.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nombre}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Abrir menú"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-slate-100 bg-white px-4 py-3 lg:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((link) => {
              const active =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                    active
                      ? "bg-brand-50 text-brand-700"
                      : "text-slate-600 hover:bg-slate-100",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <label className="mb-1 block text-[11px] font-medium text-slate-500">
              Rol / Célula activa
            </label>
            <select
              value={celula}
              onChange={(event) => setCelula(event.target.value as CelulaId)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700"
            >
              {CELULAS.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre} — {item.descripcion}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}
    </header>
  );
}
