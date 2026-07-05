// Preguntes de l'enquesta inicial. La `key` coincideix amb la columna de
// `workshop.participants` i fa de llista blanca a l'API.

export type Question = { key: string; label: string };

export const SURVEY: Question[] = [
  { key: "q_claude_code", label: "Has treballat amb Claude Code?" },
  { key: "q_cli", label: "Has treballat amb algun CLI d'IA?" },
  { key: "q_vscode", label: "Has fet servir alguna IA per programar amb VS Code?" },
  { key: "q_chatgpt", label: "Has fet servir ChatGPT?" },
  {
    key: "q_ia_docs",
    label: "Has fet servir alguna IA connectada als teus documents (Gmail, Excel…)?",
  },
];

export const SURVEY_KEYS = new Set(SURVEY.map((q) => q.key));
