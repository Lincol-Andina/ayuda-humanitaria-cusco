"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CELULAS, type CelulaId } from "@/lib/constants";

interface RoleContextValue {
  celula: CelulaId;
  setCelula: (id: CelulaId) => void;
  celulaNombre: string;
}

const RoleContext = createContext<RoleContextValue | null>(null);

const STORAGE_KEY = "donacion.celula";

export function RoleProvider({ children }: { children: ReactNode }) {
  const [celula, setCelulaState] = useState<CelulaId>("publico");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as CelulaId | null;
    if (stored && CELULAS.some((c) => c.id === stored)) setCelulaState(stored);
  }, []);

  const setCelula = (id: CelulaId) => {
    setCelulaState(id);
    window.localStorage.setItem(STORAGE_KEY, id);
  };

  const value = useMemo<RoleContextValue>(() => {
    const found = CELULAS.find((c) => c.id === celula);
    return {
      celula,
      setCelula,
      celulaNombre: found?.nombre ?? "Público general",
    };
  }, [celula]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole(): RoleContextValue {
  const context = useContext(RoleContext);
  if (!context) throw new Error("useRole debe usarse dentro de RoleProvider");
  return context;
}
