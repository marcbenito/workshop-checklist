"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { STEPS } from "@/lib/steps";

type StepsState = Record<string, boolean>;

export function Checklist({ email, onReset }: { email: string; onReset: () => void }) {
  const [state, setState] = useState<StepsState>({});
  const [spend, setSpend] = useState<number>(0);
  const [loginEmail, setLoginEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // Quan tot està llest es mostra el slider; permet tornar a veure els checks.
  const [viewChecklist, setViewChecklist] = useState(false);
  const spendTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Rehidratar l'estat des de la BD en muntar.
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch(`/api/progress?email=${encodeURIComponent(email)}`);
        const data = await res.json();
        if (active) {
          if (data.steps) setState(data.steps);
          if (typeof data.spend === "number") setSpend(data.spend);
          setLoginEmail(data.loginEmail ?? "");
          setName(data.name ?? "");
        }
      } catch {
        if (active) setError("No s'ha pogut carregar el teu progrés.");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [email]);

  const required = STEPS.filter((s) => !s.optional);
  const doneRequired = required.filter((s) => state[s.key]).length;
  const allDone = doneRequired === required.length;

  const pct = useMemo(
    () => Math.round((doneRequired / required.length) * 100),
    [doneRequired, required.length]
  );

  async function toggle(key: string) {
    const next = !state[key];
    setState((s) => ({ ...s, [key]: next })); // optimista
    setSaving(key);
    setError(null);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, key, value: next }),
      });
      if (!res.ok) throw new Error();
    } catch {
      setState((s) => ({ ...s, [key]: !next })); // revertir
      setError("No s'ha pogut desar. Torna-ho a provar.");
    } finally {
      setSaving(null);
    }
  }

  // Actualitza el % de gasto (amb debounce perquè el slider dispara molts events).
  function onSpendChange(value: number) {
    setSpend(value);
    if (spendTimer.current) clearTimeout(spendTimer.current);
    spendTimer.current = setTimeout(() => {
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, spend: value }),
      }).catch(() => setError("No s'ha pogut desar l'ús de la IA."));
    }, 300);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-6 py-16 text-neutral-500">Carregant…</div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <header className="mb-6">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {allDone ? "Ús de la IA" : "Checklist d'instal·lació"}
          </h1>
          <button
            onClick={onReset}
            className="text-sm text-neutral-500 underline underline-offset-2 hover:text-neutral-800"
          >
            canvia d&apos;email
          </button>
        </div>
        {name && (
          <p className="mt-1 text-base font-medium">
            Hola, {name.includes(",") ? name.split(",")[1].trim() : name} 👋
          </p>
        )}
        <p className="mt-0.5 text-sm text-neutral-500">{email}</p>

        {!allDone && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                {doneRequired}/{required.length} passos
              </span>
              <span className="text-neutral-500">{pct}%</span>
            </div>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
              <div
                className="h-full rounded-full bg-[#C15F3C] transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </header>

      {allDone && !viewChecklist ? (
        <SpendPanel
          value={spend}
          onChange={onSpendChange}
          onViewChecklist={() => setViewChecklist(true)}
        />
      ) : (
        <>
          {allDone && (
            <button
              onClick={() => setViewChecklist(false)}
              className="mb-4 text-sm font-medium text-[#C15F3C] underline underline-offset-2"
            >
              ← Torna a l&apos;ús de la IA
            </button>
          )}

          <LoginEmailCard value={loginEmail} />

          <ul className="space-y-3">
          {STEPS.map((step) => {
            const checked = !!state[step.key];
            return (
              <li
                key={step.key}
                className={`rounded-xl border p-4 transition ${
                  checked
                    ? "border-[#C15F3C]/40 bg-[#C15F3C]/5"
                    : "border-neutral-200 dark:border-neutral-800"
                }`}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(step.key)}
                    className="mt-1 h-5 w-5 shrink-0 accent-[#C15F3C]"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{step.title}</span>
                      {step.optional && (
                        <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-xs text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          opcional
                        </span>
                      )}
                      {saving === step.key && (
                        <span className="text-xs text-neutral-400">desant…</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {step.detail}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                      {step.verify && (
                        <code className="rounded bg-neutral-100 px-2 py-0.5 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                          {step.verify}
                        </code>
                      )}
                      {step.href && (
                        <a
                          href={step.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[#C15F3C] underline underline-offset-2"
                        >
                          {step.hrefLabel ?? "obre"} ↗
                        </a>
                      )}
                    </div>
                    {step.hint && (
                      <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-400">
                        ✅ {step.hint}
                      </p>
                    )}
                    {step.warnLogin && (
                      <p className="mt-2 rounded-md bg-amber-100 px-2 py-1.5 text-xs font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                        ⚠️ Fes login amb aquest correu:{" "}
                        <strong>{loginEmail || "no configurat"}</strong>
                      </p>
                    )}
                  </div>
                </label>
              </li>
            );
          })}
          </ul>
        </>
      )}
    </div>
  );
}

function SpendPanel({
  value,
  onChange,
  onViewChecklist,
}: {
  value: number;
  onChange: (v: number) => void;
  onViewChecklist: () => void;
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
      <div className="mb-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-800 dark:bg-green-950 dark:text-green-200">
        🎉 Tot llest! Ja estàs a punt per començar el taller.
      </div>

      <p className="mt-6 text-sm text-neutral-600 dark:text-neutral-400">
        Marca quin percentatge del teu <strong>ús de la IA</strong>{" "}
        portes consumit de la sessió. Actualitza&apos;l a mesura que avancem.
      </p>

      <div className="mt-6 text-center">
        <span className="text-6xl font-bold tabular-nums text-[#C15F3C]">{value}%</span>
      </div>

      <input
        type="range"
        min={1}
        max={100}
        value={value === 0 ? 1 : value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-6 h-2 w-full cursor-pointer appearance-none rounded-full bg-neutral-200 accent-[#C15F3C] dark:bg-neutral-800"
      />
      <div className="mt-1 flex justify-between text-xs text-neutral-400">
        <span>1%</span>
        <span>100%</span>
      </div>

      <div className="mt-8 border-t border-neutral-200 pt-4 text-center dark:border-neutral-800">
        <button
          onClick={onViewChecklist}
          className="text-sm font-medium text-[#C15F3C] underline underline-offset-2"
        >
          Torna a veure els checks d&apos;instal·lació
        </button>
      </div>
    </div>
  );
}

function LoginEmailCard({ value }: { value: string }) {
  const configured = value.trim().length > 0;
  return (
    <div className="mb-6 rounded-2xl border-2 border-[#C15F3C]/40 bg-[#C15F3C]/5 p-5">
      <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
        📧 Correu per al login de Claude
      </p>

      <div className="mt-1">
        {configured ? (
          <span className="break-all text-3xl font-bold text-[#C15F3C]">{value}</span>
        ) : (
          <span className="text-3xl font-bold text-neutral-400">no configurat</span>
        )}
      </div>

      <p className="mt-3 text-sm text-amber-800 dark:text-amber-300">
        ⚠️ Fes el login de <strong>Claude Code</strong> i <strong>Claude</strong> (claude.ai)
        <strong> amb aquest correu</strong>.
      </p>
    </div>
  );
}
