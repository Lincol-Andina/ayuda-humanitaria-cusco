"use client";

import { useEffect, useState } from "react";

export interface HealthState {
  online: boolean;
  checked: boolean;
}

/** Lightweight poller used by the header to show backend connectivity. */
export function useHealth(intervalMs = 20000): HealthState {
  const [online, setOnline] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;

    const ping = async () => {
      try {
        const response = await fetch("/api/health", { cache: "no-store" });
        if (active) {
          setOnline(response.ok);
          setChecked(true);
        }
      } catch {
        if (active) {
          setOnline(false);
          setChecked(true);
        }
      }
    };

    void ping();
    const id = setInterval(ping, intervalMs);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [intervalMs]);

  return { online, checked };
}
