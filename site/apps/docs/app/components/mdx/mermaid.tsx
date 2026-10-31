'use client';

import { Mermaid as FumadocsMermaid, type MermaidProps } from "fumadocs-mermaid/ui";
import { useTheme } from "next-themes";

const BRAND_CONFIG = JSON.stringify({
  config: JSON.stringify({
    theme: "base",
    themeVariables: {
      primaryColor: "#D3E5FA",
      primaryTextColor: "#0B0B0C",
      primaryBorderColor: "#2A8CFF",
      secondaryColor: "#EFF6FF",
      tertiaryColor: "#F4F9FF",
      lineColor: "#2A8CFF",
      clusterBkg: "#EFF6FF",
      clusterBorder: "#9DC2F7",
      edgeLabelBackground: "#FBFCFE",
      titleColor: "#0B3B8F",
      nodeBorder: "#2A8CFF",
      mainBkg: "#D3E5FA",
    },
  }),
});

export function Mermaid({ chart, theme, config, ...props }: MermaidProps) {
  const { resolvedTheme } = useTheme();
  if (theme !== undefined || resolvedTheme === "dark" || config !== undefined) {
    return <FumadocsMermaid chart={chart} theme={theme} config={config} {...props} />;
  }
  return <FumadocsMermaid chart={chart} config={BRAND_CONFIG} {...props} />;
}