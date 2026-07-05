"use client";

import { useState } from "react";
import { SURVEY } from "@/lib/survey";

type Answers = Record<string, boolean | undefined>;

export function Survey({
  email,
  onDone,
}: {
  email: string;
  onDone: () => void;
}) {
  const [answers, setAnswers] = useState<Answers>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = SURVEY.every((q) => answers[q.key] !== undefined);

  async function submit() {
    if (!allAnswered) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, survey: answers }),
      });
      if (!res.ok) throw new Error();
      onDone();
    } catch {
      setError("No s'ha pogut desar l'enquesta. Torna-ho a provar.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Enquesta inicial</h1>
        <p className="mt-1 text-sm text-neutral-500">{email}</p>
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
          Abans de començar, unes preguntes ràpides per conèixer el grup.
        </p>
      </header>

      <ul className="space-y-3">
        {SURVEY.map((q) => {
          const val = answers[q.key];
          return (
            <li
              key={q.key}
              className="rounded-xl border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <p className="font-medium">{q.label}</p>
              <div className="mt-3 flex gap-2">
                {[
                  { label: "Sí", value: true },
                  { label: "No", value: false },
                ].map((opt) => {
                  const active = val === opt.value;
                  return (
                    <button
                      key={opt.label}
                      onClick={() =>
                        setAnswers((a) => ({ ...a, [q.key]: opt.value }))
                      }
                      className={`w-20 rounded-lg border px-4 py-2 text-sm font-medium transition ${
                        active
                          ? "border-[#C15F3C] bg-[#C15F3C] text-white"
                          : "border-neutral-300 hover:border-[#C15F3C] dark:border-neutral-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      <button
        onClick={submit}
        disabled={!allAnswered || saving}
        className="mt-6 w-full rounded-lg bg-[#C15F3C] px-4 py-3 font-medium text-white transition hover:bg-[#a94f30] disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "Desant…" : "Continua a la configuració →"}
      </button>
    </div>
  );
}
