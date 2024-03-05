import { html } from "htm/preact";

type HighlightProps = { value: string; highlightType?: "primary" | "secondary" } & JSX.IntrinsicElements["span"];

export function Highlight({ value, style, highlightType = "primary" }: HighlightProps) {
  return html`<span
    style=${{
      ...(highlightType === "primary" ? { color: "#A28010" } : { color: "#1A6CBC" }),
      ...style,
    }}
    >${value}</span
  >`;
}
