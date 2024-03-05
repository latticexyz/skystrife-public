import { useState } from "preact/hooks";
import { html } from "htm/preact";

type ButtonProps = { buttonType: "primary" | "secondary"; label: string } & JSX.IntrinsicElements["button"];

export function Button({ buttonType, label, style, ...rest }: ButtonProps) {
  const [hovering, setHovering] = useState(false);
  const [active, setActive] = useState(false);

  const primaryStyles = {
    backgroundColor: "rgba(0, 0, 0, 0.80)",
    color: "white",
  };

  const secondaryStyles = {
    backgroundColor: "rgba(0, 0, 0, 0)",
    color: "#25241D",
  };

  const commonStyles = {
    cursor: "pointer",
    padding: "8px 16px",
    borderRadius: "2px",
    border: "1px solid rgba(37, 36, 29, 0.50)",
  };

  const hoveringStyles = {
    backgroundColor: buttonType === "primary" ? "rgba(0, 0, 0, 0.90)" : "rgba(0, 0, 0, 0.05)",
  };

  const activeStyles = {
    transform: "translateY(2px)",
  };

  return html`<button
    onMouseEnter=${() => setHovering(true)}
    onMouseLeave=${() => setHovering(false)}
    onMouseDown=${() => setActive(true)}
    onMouseUp=${() => setActive(false)}
    style=${{
      ...commonStyles,
      ...(buttonType === "primary" ? primaryStyles : secondaryStyles),
      ...(hovering ? hoveringStyles : {}),
      ...(active ? activeStyles : {}),
      ...style,
    }}
    ...${rest}
  >
    ${label}
  </button>`;
}
