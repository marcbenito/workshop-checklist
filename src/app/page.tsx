"use client";

import { useEffect, useState } from "react";
import { EmailGate } from "@/components/EmailGate";
import { Survey } from "@/components/Survey";
import { Checklist } from "@/components/Checklist";

const STORAGE_KEY = "workshop-email";

export default function Home() {
  const [email, setEmail] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  // null = carregant estat de l'enquesta; true/false = fet o no.
  const [surveyDone, setSurveyDone] = useState<boolean | null>(null);

  // Recuperar l'email desat per no tornar-lo a demanar.
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setEmail(saved);
    setReady(true);
  }, []);

  // En tenir email, esbrinar si ja ha fet l'enquesta.
  useEffect(() => {
    if (!email) return;
    let active = true;
    setSurveyDone(null);
    fetch(`/api/progress?email=${encodeURIComponent(email)}`)
      .then((r) => r.json())
      .then((d) => active && setSurveyDone(Boolean(d.surveyDone)))
      .catch(() => active && setSurveyDone(false));
    return () => {
      active = false;
    };
  }, [email]);

  function start(value: string) {
    localStorage.setItem(STORAGE_KEY, value);
    setEmail(value);
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    setEmail(null);
    setSurveyDone(null);
  }

  if (!ready) return null;

  if (!email) return <EmailGate onSubmit={start} />;

  if (surveyDone === null) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-neutral-500">Carregant…</div>
    );
  }

  if (!surveyDone) {
    return <Survey email={email} onDone={() => setSurveyDone(true)} />;
  }

  return <Checklist email={email} onReset={reset} />;
}
