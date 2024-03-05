import { html } from "htm/preact";

type SelectProps = {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  containerStyle?: React.CSSProperties;
} & JSX.IntrinsicElements["div"];

export function Select({ options, value, onChange, label, style, containerStyle }: SelectProps) {
  const selectedOption = options.find((option) => option.value === value);

  const selectStyle = {
    position: "relative",
    cursor: "pointer",
    padding: "8px 16px",
    borderRadius: "2px",
    border: "1px solid rgba(37, 36, 29, 0.50)",
    background: "rgba(244, 243, 241, 0.50)",
    backdropFilter: "blur(10px)",
  };

  return html`
    <div
      style=${{
        display: "flex",
        alignItems: "center",
        ...containerStyle,
      }}
    >
      ${label && html`<label style=${{ marginRight: "8px" }}> ${label} </label>`}

      <label style=${{ ...selectStyle, ...style }}>
        <select
          style=${{
            position: "absolute",
            top: "0",
            left: "0",
            opacity: 0, // make the select invisible but still clickable
            width: "100%", // ensure it covers the label
            height: "100%",
          }}
          value=${value}
          onChange=${(e: React.ChangeEvent<HTMLSelectElement>) => {
            onChange(e.currentTarget.value);
          }}
        >
          ${options.map((option) => html`<option value=${option.value}>${option.label}</option>`)}
        </select>

        ${selectedOption?.label}
      </label>
    </div>
  `;
}
