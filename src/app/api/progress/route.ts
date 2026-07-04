import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { STEP_KEYS, STEPS } from "@/lib/steps";

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

  const cols = COLUMNS.join(", ");
  const { rows } = await pool.query(
    `SELECT ${cols} FROM workshop.participants WHERE email = $1`,
    [email]
  );

  if (rows.length === 0) {
    // Encara no existeix: tot a false.
    const empty = Object.fromEntries(COLUMNS.map((c) => [c, false]));
    return NextResponse.json({ email, steps: empty });
  }

  return NextResponse.json({ email, steps: rows[0] });
}

// POST /api/progress  { email, key, value }  → upsert d'un pas.
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invàlid" }, { status: 400 });
  }

  const { email: rawEmail, key, value } = (body ?? {}) as {
    email?: unknown;
    key?: unknown;
    value?: unknown;
  };

  const email = normalizeEmail(rawEmail);
  if (!email) {
    return NextResponse.json({ error: "email invàlid" }, { status: 400 });
  }
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
