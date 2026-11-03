"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "quacksec:resend-available-at";

/**
 * Contagem regressiva do reenvio de verificação. Persiste em localStorage
 * para que recarregar a página não permita burlar o cooldown de 60s.
 */
export function useResendCountdown() {
  const [secondsLeft, setSecondsLeft] = useState(0);

  const readRemaining = useCallback((): number => {
    if (typeof window === "undefined") return 0;
    const until = Number(window.localStorage.getItem(STORAGE_KEY) || 0);
    return Number.isFinite(until) ? Math.max(0, Math.ceil((until - Date.now()) / 1000)) : 0;
  }, []);

  useEffect(() => {
    const update = () => setSecondsLeft(readRemaining());
    // Agenda a leitura inicial fora do corpo do effect para não disparar
    // renders em cascata (regra react-hooks/set-state-in-effect).
    const initial = setTimeout(update, 0);
    const timer = setInterval(update, 1000);
    return () => {
      clearTimeout(initial);
      clearInterval(timer);
    };
  }, [readRemaining]);

  const start = useCallback((seconds: number) => {
    if (typeof window !== "undefined") {
      const safe = Math.max(1, Math.ceil(seconds));
      window.localStorage.setItem(STORAGE_KEY, String(Date.now() + safe * 1000));
      setSecondsLeft(safe);
    }
  }, []);

  return { secondsLeft, start };
}
