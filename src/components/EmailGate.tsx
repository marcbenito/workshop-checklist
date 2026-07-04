"use client";

import { useState } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailGate({ onSubmit }: { onSubmit: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const clean = email.trim().toLowerCase();
    if (!EMAIL_RE.test(clean)) {
      setError("Introdueix un email vàlid.");
      return;
    }
    setError(null);
    onSubmit(clean);
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="text-3xl font-bold tracking-tight">Claude Code — Taller pràctic</h1>
      <p className="mt-3 text-neutral-500">
        Fase 0 · Instal·lació. Introdueix el teu email i aniràs marcant cada pas a
        mesura que el completis.
      </p>

      <form onSubmit={submit} className="mt-8 space-y-3">
        <label htmlFor="email" className="block text-sm font-medium">
          El teu email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@exemple.com"
          className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-3 text-base outline-none focus:border-[#C15F3C] focus:ring-2 focus:ring-[#C15F3C]/30 dark:border-neutral-700 dark:bg-neutral-900"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-lg bg-[#C15F3C] px-4 py-3 font-medium text-white transition hover:bg-[#a94f30]"
        >
          Comença
        </button>
      </form>
    </div>
  );
}
