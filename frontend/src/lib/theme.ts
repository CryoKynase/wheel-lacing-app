export type AccentThemeId = "cobalt" | "teal" | "olive";

type AccentTokens = {
  primary: string;
  primaryForeground: string;
  ring: string;
  accent: string;
};

export type AccentTheme = {
  id: AccentThemeId;
  label: string;
  description: string;
  tokens: AccentTokens;
};

export const accentThemes: AccentTheme[] = [
  {
    id: "cobalt",
    label: "Cobalt",
    description: "Cool, crisp blue accent.",
    tokens: {
      primary: "221 56% 40%",
      primaryForeground: "210 40% 98%",
      ring: "221 56% 45%",
      accent: "214 50% 96%",
    },
  },
  {
    id: "teal",
    label: "Teal",
    description: "Clean teal accent with a calm feel.",
    tokens: {
      primary: "174 54% 32%",
      primaryForeground: "210 40% 98%",
      ring: "174 54% 40%",
      accent: "174 45% 95%",
    },
  },
  {
    id: "olive",
    label: "Olive",
    description: "Muted olive accent with a soft edge.",
    tokens: {
      primary: "94 30% 32%",
      primaryForeground: "210 40% 98%",
      ring: "94 30% 40%",
      accent: "94 30% 94%",
    },
  },
];

export const defaultAccentThemeId: AccentThemeId = "cobalt";
