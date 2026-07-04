// Font única de veritat dels passos d'instal·lació.
// La clau (`key`) ha de coincidir EXACTAMENT amb el nom de columna de
// `workshop.participants` a Postgres. Aquesta llista fa de llista blanca per
// validar el nom de columna a l'API (evita SQL injection al nom de columna).

export type Step = {
  key: string;
  title: string;
  /** Instrucció / detall del pas (pot contenir la comanda de verificació). */
  detail: string;
  /** Comanda de verificació a la terminal, si escau. */
  verify?: string;
  /** Enllaç de descàrrega / documentació. */
  href?: string;
  hrefLabel?: string;
  optional?: boolean;
};

export const STEPS: Step[] = [
  {
    key: "node",
    title: "Node.js 20+",
    detail: "Instal·la la versió LTS (20 o superior).",
    verify: "node -v",
    href: "https://nodejs.org/en/download",
    hrefLabel: "nodejs.org",
  },
  {
    key: "git",
    title: "git",
    detail: "Control de versions.",
    verify: "git -v",
    href: "https://git-scm.com/downloads",
    hrefLabel: "git-scm.com",
  },
  {
    key: "claude_code",
    title: "Claude Code",
    detail: "npm i -g @anthropic-ai/claude-code · necessites compte de Claude (Pro o Max).",
    verify: "claude --version",
    href: "https://claude.com/product/claude-code",
    hrefLabel: "claude.com/product/claude-code",
  },
  {
    key: "claude_desktop",
    title: "Claude Desktop",
    detail: "Mateix login. L'usarem per a Cowork i Claude Design (H5).",
    verify: "obre l'app i fes login",
    href: "https://claude.ai/download",
    hrefLabel: "claude.ai/download",
  },
  {
    key: "github_cli",
    title: "GitHub CLI",
    detail: "Autentica't amb `gh auth login`.",
    verify: "gh auth status",
    href: "https://cli.github.com",
    hrefLabel: "cli.github.com",
  },
  {
    key: "repo_clone",
    title: "Fork + clone del repo del curs",
    detail:
      "gh repo fork marcbenito/claude_workshop_ensenyament --clone → cd app → npm install → npm run dev",
    verify: "l'app arrenca a localhost:3000",
    href: "https://github.com/marcbenito/claude_workshop_ensenyament",
    hrefLabel: "github.com/marcbenito/claude_workshop_ensenyament",
  },
  {
    key: "chrome_ext",
    title: "Google Chrome + Claude in Chrome",
    detail: "Chrome amb l'extensió Claude in Chrome (o chrome-devtools-mcp via npx). Per a l'H3.",
    href: "https://www.google.com/chrome/",
    hrefLabel: "google.com/chrome",
  },
  {
    key: "env_mcp",
    title: "`.env` i `.mcp.json` verificats",
    detail:
      "Comprova que el repo clonat ja porta `.env` (amb DATABASE_URL) i `.mcp.json`. No cal configurar res.",
    verify: "ls .env .mcp.json",
  },
  {
    key: "openspec",
    title: "OpenSpec (opcional)",
    detail: "npm i -g openspec — per a la demo final.",
    verify: "openspec --version",
    optional: true,
  },
];

/** Conjunt de claus vàlides per validar noms de columna a l'API. */
export const STEP_KEYS = new Set(STEPS.map((s) => s.key));
