// Font única de veritat dels passos d'instal·lació.
// La clau (`key`) ha de coincidir EXACTAMENT amb el nom de columna de
// `workshop.participants` a Postgres. Aquesta llista fa de llista blanca per
// validar el nom de columna a l'API (evita SQL injection al nom de columna).

export type Step = {
  key: string;
  title: string;
  /** Instrucció / detall del pas. */
  detail: string;
  /** Comanda per validar que la instal·lació és correcta. */
  verify?: string;
  /** Pista: què has de veure si tot ha anat bé. */
  hint?: string;
  /** Enllaç de descàrrega / documentació. */
  href?: string;
  hrefLabel?: string;
  optional?: boolean;
  /** Mostra un avís de fer login amb el correu de Claude. */
  warnLogin?: boolean;
};

export const STEPS: Step[] = [
  {
    key: "git",
    title: "git",
    detail: "Control de versions.",
    verify: "git -v",
    hint: "Ha de mostrar «git version 2.x» (o superior).",
    href: "https://git-scm.com/downloads",
    hrefLabel: "git-scm.com",
  },
  {
    key: "node",
    title: "Node.js 20+",
    detail: "Instal·la la versió LTS (20 o superior).",
    verify: "node -v",
    hint: "Ha de mostrar «v20.x» o superior (no «v18» ni «command not found»).",
    href: "https://nodejs.org/en/download",
    hrefLabel: "nodejs.org",
  },
  {
    key: "claude_code",
    title: "Claude Code (instal·lació)",
    detail: "npm i -g @anthropic-ai/claude-code · necessites compte de Claude (Pro o Max).",
    verify: "claude --version",
    hint: "Ha de mostrar un número de versió, p. ex. «2.1.x (Claude Code)».",
    href: "https://claude.com/product/claude-code",
    hrefLabel: "claude.com/product/claude-code",
    warnLogin: true,
  },
  {
    key: "claude_code_login",
    title: "Claude Code (login)",
    detail: "Executa «claude» i inicia sessió.",
    verify: "claude → /status",
    hint: "«/status» mostra el teu compte, loguejat amb el correu correcte.",
    href: "https://claude.com/product/claude-code",
    hrefLabel: "claude.com/product/claude-code",
    warnLogin: true,
  },
  {
    key: "claude_desktop",
    title: "Claude Desktop (claude.ai)",
    detail: "Mateix login. L'usarem per a Cowork i Claude Design (H5).",
    verify: "obre l'app i fes login",
    hint: "Un cop dins, veus el teu nom/avatar a baix a l'esquerra.",
    href: "https://claude.ai/download",
    hrefLabel: "claude.ai/download",
    warnLogin: true,
  },
  {
    key: "github_cli",
    title: "GitHub CLI",
    detail: "Autentica't amb «gh auth login».",
    verify: "gh auth status",
    hint: "Ha de dir «Logged in to github.com account …» amb el teu usuari.",
    href: "https://cli.github.com",
    hrefLabel: "cli.github.com",
  },
  {
    key: "repo_clone",
    title: "Fork + clone del repo del curs",
    detail:
      "gh repo fork marcbenito/claude_workshop_ensenyament --clone → cd app → npm install → npm run dev",
    verify: "npm run dev",
    hint: "Veus «Ready» i l'app respon a http://localhost:3000.",
    href: "https://github.com/marcbenito/claude_workshop_ensenyament",
    hrefLabel: "github.com/marcbenito/claude_workshop_ensenyament",
  },
  {
    key: "chrome",
    title: "Google Chrome",
    detail: "El navegador Chrome instal·lat. Per a l'H3 (MCP del navegador).",
    verify: "obre chrome://version",
    hint: "Chrome obre i mostra la seva versió.",
    href: "https://www.google.com/chrome/",
    hrefLabel: "google.com/chrome",
  },
  {
    key: "chrome_ext",
    title: "Claude in Chrome (extensió)",
    detail: "L'extensió Claude in Chrome (alternativa: chrome-devtools-mcp via npx).",
    verify: "obre chrome://extensions",
    hint: "La icona de Claude apareix a la barra d'extensions de Chrome.",
    href: "https://claude.ai/chrome",
    hrefLabel: "claude.ai/chrome",
  },
];

/** Conjunt de claus vàlides per validar noms de columna a l'API. */
export const STEP_KEYS = new Set(STEPS.map((s) => s.key));
