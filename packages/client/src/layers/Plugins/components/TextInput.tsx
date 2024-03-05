import { useState } from "preact/hooks";
import { html } from "htm/preact";

type TextInputProps = {
  label?: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  containerStyle?: React.CSSProperties;
} & JSX.IntrinsicElements["input"];

export function TextInput({ label, value, onChange, style, placeholder, containerStyle, ...rest }: TextInputProps) {
  const [hovering, setHovering] = useState(false);

  const hoveringStyle = {};

  return html`
    <div
      style=${{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        ...containerStyle,
      }}
    >
      ${label && html`<div style=${{ marginRight: "12px" }}>${label}</div>`}
      <input
        type="text"
        value=${value}
        onInput=${(e: Event) => {
          if (onChange) onChange((e.target as HTMLInputElement).value);
        }}
        onMouseEnter=${() => setHovering(true)}
        onMouseLeave=${() => setHovering(false)}
        readonly=${!onChange}
        placeholder=${placeholder}
        style=${{
          padding: "8px 16px",
          borderRadius: "2px",
          border: "1px solid rgba(37, 36, 29, 0.50)",
          background: "rgba(244, 243, 241, 0.50)",
          color: "#25241D",
          ...style,
          ...(hovering ? hoveringStyle : {}),
        }}
        ...${rest}
      />
    </div>
  `;
}
