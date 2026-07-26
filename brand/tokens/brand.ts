export const operationsAutomatedBrand = {
  meta: {
    name: "Operations Automated",
    status: "draft",
    version: "0.1.0",
  },
  colour: {
    obsidian: "#01070F",
    midnight: "#03111E",
    navy: "#063F72",
    ink: "#102A43",
    loopBlue: "#0E5B92",
    blue: "#0B77D2",
    electric: "#32B6FE",
    paper: "#F5F7FA",
    canvas: "#EAF0F5",
    white: "#FFFFFF",
    muted: "#52677C",
    line: "#CDD9E3",
    amber: "#A45A00",
    amberSoft: "#FFF1D6",
    success: "#19705B",
    successSoft: "#E2F3ED",
    warning: "#8A5700",
    warningSoft: "#FFF2D8",
    danger: "#A43D3D",
    dangerSoft: "#FBE8E6",
    neutralSoft: "#E9EFF4",
  },
  type: {
    sans: '"Source Sans 3", "Source Sans Pro", "Segoe UI", Arial, sans-serif',
    display: 'Montserrat, "Aptos Display", Arial, sans-serif',
    mono: '"Cascadia Mono", "SFMono-Regular", Consolas, monospace',
  },
  spacing: [0, 4, 8, 12, 16, 24, 32, 48, 64, 96] as const,
  radius: {
    small: 6,
    medium: 12,
    large: 20,
    pill: 999,
  },
  motion: {
    fast: 140,
    medium: 260,
    easeOut: [0.16, 1, 0.3, 1] as const,
  },
} as const;

export type OperationsAutomatedBrand = typeof operationsAutomatedBrand;
