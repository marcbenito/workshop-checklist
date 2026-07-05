import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { STEP_KEYS, STEPS } from "@/lib/steps";
import { SURVEY, SURVEY_KEYS } from "@/lib/survey";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLUMNS = STEPS.map((s) => s.key);

function normalizeEmail(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const email = raw.trim().toLowerCase();
  // Validació bàsica.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return null;
  return email;
}

// GET /api/progress?email=...  → rehidrata l'estat d'un participant.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = normalizeEmail(url.searchParams.get("email"));
  if (!email) {
    return NextResponse.json({ error: "email invàlid" }, { status: 400 });
  }

  const surveyCols = SURVEY.map((q) => q.key).join(", ");
  const cols = COLUMNS.join(", ");
  const { rows } = await pool.query(
    `SELECT ${cols}, spend_pct, survey_done, login_email, ${surveyCols}
       FROM workshop.participants WHERE email = $1`,
    [email]
  );

  if (rows.length === 0) {
    // Encara no existeix: tot a false, gasto 0 i login_email = email per defecte.
    const empty = Object.fromEntries(COLUMNS.map((c) => [c, false]));
    return NextResponse.json({
      email,
      steps: empty,
      spend: 0,
      surveyDone: false,
      loginEmail: email,
    });
  }

  const { spend_pct, survey_done, login_email, ...rest } = rows[0];
  const steps = Object.fromEntries(COLUMNS.map((c) => [c, rest[c]]));
  return NextResponse.json({
    email,
    steps,
    spend: spend_pct ?? 0,
    surveyDone: survey_done ?? false,
    loginEmail: login_email || email,
  });
}

// POST /api/progress
//   { email, key, value }  → upsert d'un pas (booleà)
//   { email, spend }       → upsert del % de gasto de la sessió (0–100)
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invàlid" }, { status: 400 });
  }

  const { email: rawEmail, key, value, spend, survey, loginEmail } = (body ?? {}) as {
    email?: unknown;
    key?: unknown;
    value?: unknown;
    spend?: unknown;
    survey?: unknown;
    loginEmail?: unknown;
  };

  const email = normalizeEmail(rawEmail);
  if (!email) {
    return NextResponse.json({ error: "email invàlid" }, { status: 400 });
  }

  // Correu per al login de Claude.
  if (loginEmail !== undefined) {
    const login = normalizeEmail(loginEmail);
    if (!login) {
      return NextResponse.json({ error: "login_email invàlid" }, { status: 400 });
    }
    await pool.query(
      `INSERT INTO workshop.participants (email, login_email)
       VALUES ($1, $2)
       ON CONFLICT (email)
       DO UPDATE SET login_email = EXCLUDED.login_email, updated_at = now()`,
      [email, login]
    );
    return NextResponse.json({ ok: true, email, loginEmail: login });
  }

  // Desa les respostes de l'enquesta inicial i marca survey_done.
  if (survey !== undefined) {
    if (typeof survey !== "object" || survey === null) {
      return NextResponse.json({ error: "survey invàlid" }, { status: 400 });
    }
    const entries = Object.entries(survey as Record<string, unknown>).filter(
      ([k]) => SURVEY_KEYS.has(k)
    );
    // Columnes (validades per llista blanca) + valors parametritzats.
    const cols = ["survey_done", ...entries.map(([k]) => k)];
    const vals: (boolean)[] = [true, ...entries.map(([, v]) => Boolean(v))];
    const insertCols = cols.map((c) => `"${c}"`).join(", ");
    const placeholders = vals.map((_, i) => `$${i + 2}`).join(", ");
    const updates = cols.map((c) => `"${c}" = EXCLUDED."${c}"`).join(", ");
    await pool.query(
      `INSERT INTO workshop.participants (email, ${insertCols})
       VALUES ($1, ${placeholders})
       ON CONFLICT (email)
       DO UPDATE SET ${updates}, updated_at = now()`,
      [email, ...vals]
    );
    return NextResponse.json({ ok: true, email, survey: true });
  }

  // Actualització del % de gasto.
  if (spend !== undefined) {
    const n = Number(spend);
    if (!Number.isFinite(n)) {
      return NextResponse.json({ error: "spend invàlid" }, { status: 400 });
    }
    const pct = Math.max(0, Math.min(100, Math.round(n)));
    await pool.query(
      `INSERT INTO workshop.participants (email, spend_pct)
       VALUES ($1, $2)
       ON CONFLICT (email)
       DO UPDATE SET spend_pct = EXCLUDED.spend_pct, updated_at = now()`,
      [email, pct]
    );
    return NextResponse.json({ ok: true, email, spend: pct });
  }

  // Actualització d'un pas booleà.
  if (typeof key !== "string" || !STEP_KEYS.has(key)) {
    return NextResponse.json({ error: "pas desconegut" }, { status: 400 });
  }
  const val = Boolean(value);

  // `key` està validat contra la llista blanca STEP_KEYS → segur d'interpolar
  // com a nom de columna. El valor va parametritzat.
  await pool.query(
    `INSERT INTO workshop.participants (email, "${key}")
     VALUES ($1, $2)
     ON CONFLICT (email)
     DO UPDATE SET "${key}" = EXCLUDED."${key}", updated_at = now()`,
    [email, val]
  );

  return NextResponse.json({ ok: true, email, key, value: val });
}
