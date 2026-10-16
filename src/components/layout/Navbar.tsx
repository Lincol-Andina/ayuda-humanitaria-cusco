"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth, type AuthRole } from "@/components/layout/AuthContext";

type NavItem = {
  href: string;
  label: string;
  roles?: AuthRole[];
};

const navItems: NavItem[] = [
  { href: "/", label: "Transparencia" },
  { href: "/inspeccion", label: "Inspección", roles: ["inspeccion", "admin"] },
  { href: "/inventario", label: "Inventario", roles: ["inventario", "admin"] },
  { href: "/despacho", label: "Despacho", roles: ["despacho", "admin"] },
  { href: "/admin", label: "Administración", roles: ["admin"] },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { session, logout } = useAuth();

  function visible(item: NavItem) {
    if (!item.roles) return true;
    return session.authenticated && !!session.rol && item.roles.includes(session.rol);
  }

  function isActive(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(href + "/"));
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-slate-800">
            <ShieldCheck className="h-5 w-5 text-brand-600" />
            <span className="hidden sm:inline">Ayuda Humanitaria Cusco</span>
          </Link>
          <nav className="hidden items-center gap-4 text-sm md:flex">
            {navItems.filter(visible).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-slate-900 ${
                  isActive(item.href) ? "font-medium text-slate-900" : "text-slate-500"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {session.authenticated ? (
            <>
              <span className="hidden text-xs text-slate-500 md:inline">
                {session.nombre || session.usuario} ({session.rol})
              </span>
              <Button variant="outline" size="sm" onClick={() => logout()}>
                Cerrar sesión
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm">
                Iniciar sesión
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menú"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-slate-200 bg-white md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 p-4 text-sm">
            {navItems.filter(visible).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`rounded-md px-2 py-2 transition-colors ${
                  isActive(item.href) ? "bg-slate-100 font-medium text-slate-900" : "hover:bg-slate-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {session.authenticated ? (
              <button
                onClick={() => {
                  logout();
                  setOpen(false);
                }}
                className="rounded-md px-2 py-2 text-left hover:bg-slate-50"
              >
                Cerrar sesión
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 hover:bg-slate-50"
              >
                Iniciar sesión
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
