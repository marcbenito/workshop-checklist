// Font única de veritat dels passos d'instal·lació.
// La clau (`key`) ha de coincidir EXACTAMENT amb el nom de columna de
// `workshop.participants` a Postgres. Aquesta llista fa de llista blanca per
// validar el nom de columna a l'API (evita SQL injection al nom de columna).

export type Section = "essencials" | "superdev";

export const SECTIONS: { id: Section; label: string; subtitle: string }[] = [
  {
    id: "essencials",
    label: "Parts essencials",
    subtitle: "El mínim per treballar durant el taller.",
  },
  {
    id: "superdev",
    label: "SuperDev",
    subtitle: "Per treure-li tot el suc (ho farem servir a la tarda).",
  },
];

export type Step = {
  key: string;
  section: Section;
  title: string;
  /** Instrucció / detall del pas. */
  detail: string;
  /** Comanda o acció per validar que la instal·lació és correcta. */
  verify?: string;
  /** Etiqueta del bloc de verificació (p. ex. «Executa a la terminal»). */
  verifyLabel?: string;
  /** Procediment pas a pas (per a verificacions que no són una sola comanda). */
  verifySteps?: string[];
  /** Renderitza els verifySteps com a comandes (monospace). */
  verifyStepsMono?: boolean;
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
  // ---- Parts essencials ----
  {
    key: "git",
    section: "essencials",
    title: "git",
    detail: "Control de versions.",
    verify: "git -v",
    hint: "Ha de mostrar «git version 2.x» (o superior).",
    href: "https://git-scm.com/downloads",
    hrefLabel: "git-scm.com",
  },
  {
    key: "node",
    section: "essencials",
    title: "Node.js 20+",
    detail: "Instal·la la versió LTS (20 o superior).",
    verify: "node -v",
    hint: "Ha de mostrar «v20.x» o superior (no «v18» ni «command not found»).",
    href: "https://nodejs.org/en/download",
    hrefLabel: "nodejs.org",
  },
  {
    key: "claude_code",
    section: "essencials",
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
    section: "essencials",
    title: "Claude Code (login)",
    detail: "Inicia sessió a Claude Code amb el correu @icmb.es que et surt a dalt.",
    verify: "claude",
    verifyLabel: "Executa a la terminal",
    verifySteps: [
      "Selecciona la primera opció: «Accedir amb subscripció».",
      "S'obrirà una finestra a Chrome: introdueix el correu @icmb.es que t'hem assignat (el de dalt).",
      "Et respondrà que se t'ha enviat un correu. Ves al teu correu, obre'l i fes clic a l'enllaç.",
      "L'enllaç obre una altra pàgina amb un codi molt llarg: copia'l.",
      "Enganxa el codi al terminal on tens Claude Code.",
      "Si no veus el correu, prova una finestra d'incògnit.",
    ],
    hint: "«/status» ha de mostrar el teu compte loguejat amb el correu @icmb.es.",
    href: "https://claude.com/product/claude-code",
    hrefLabel: "claude.com/product/claude-code",
    warnLogin: true,
  },
  {
    key: "repo_clone",
    section: "essencials",
    title: "Clone del repo del curs",
    detail: "Clona el repo del curs i arrenca l'app en local.",
    verifyLabel: "Executa a la terminal, una comanda rere l'altra",
    verifySteps: [
      "git clone https://github.com/marcbenito/claude_workshop_ensenyament.git",
      "cd claude_workshop_ensenyament",
      "cd app",
      "npm i",
      "npm run dev",
    ],
    verifyStepsMono: true,
    hint: "Després de «npm run dev» veus «Ready» i l'app respon a http://localhost:3000.",
    href: "https://github.com/marcbenito/claude_workshop_ensenyament",
    hrefLabel: "github.com/marcbenito/claude_workshop_ensenyament",
  },
  // ---- SuperDev ----
  {
    key: "claude_desktop",
    section: "superdev",
    title: "Claude Desktop (claude.ai)",
    detail: "Mateix login. L'usarem per a Cowork i Claude Design (H5).",
    verify: "Obre l'app i fes login",
    verifyLabel: "Acció",
    hint: "Un cop dins, veus el teu nom/avatar a baix a l'esquerra.",
    href: "https://claude.ai/download",
    hrefLabel: "claude.ai/download",
    warnLogin: true,
  },
  {
    key: "chrome_ext",
    section: "superdev",
    title: "Claude in Chrome (extensió)",
    detail: "L'extensió Claude in Chrome (alternativa: chrome-devtools-mcp via npx).",
    verify: "chrome://extensions",
    verifyLabel: "Obre al navegador",
    hint: "La icona de Claude apareix a la barra d'extensions de Chrome.",
    href: "https://claude.ai/chrome",
    hrefLabel: "claude.ai/chrome",
  },
  {
    key: "github_cli",
    section: "superdev",
    title: "GitHub CLI",
    detail: "Autentica't amb «gh auth login».",
    verify: "gh auth status",
    hint: "Ha de dir «Logged in to github.com account …» amb el teu usuari.",
    href: "https://cli.github.com",
    hrefLabel: "cli.github.com",
  },
];

/** Conjunt de claus vàlides per validar noms de columna a l'API. */
export const STEP_KEYS = new Set(STEPS.map((s) => s.key));
