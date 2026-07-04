"use client";

import { useEffect, useState } from "react";
import { EmailGate } from "@/components/EmailGate";
import { Checklist } from "@/components/Checklist";

const STORAGE_KEY = "workshop-email";

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // Recuperar l'email desat per no tornar-lo a demanar.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setEmail(saved);
    setReady(true);
  }, []);

  function start(value: string) {
    localStorage.setItem(STORAGE_KEY, value);
    setEmail(value);
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setEmail(null);
  }

  if (!ready) return null;

  return email ? (
    <Checklist email={email} onReset={reset} />
  ) : (
    <EmailGate onSubmit={start} />
  );
}
