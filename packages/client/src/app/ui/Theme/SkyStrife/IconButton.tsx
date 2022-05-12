import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { twMerge } from "tailwind-merge";

type Props = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;

export const IconButton = (props: Props) => {
  const { type, className, disabled, children } = props;

  return (
    <button
      type={type || "button"}
      disabled={disabled}
      style={{
        lineHeight: "24px",
        letterSpacing: "1px",
      }}
      className={twMerge(
        "cursor-pointer group transition enabled:active:translate-y-0.5 rounded text-ss-text-light",
        "disabled:grayscale-[60%] disabled:cursor-not-allowed disabled:aria-busy:cursor-wait",
        "uppercase",
        className
      )}
      {...props}
    >
      <span className="inline-grid pointer-events-none overflow-hidden">
        <span
          className={twMerge(
            "p-2 border border-solid border-ss-stroke rounded bg-ss-bg-0",
            "row-start-1 col-start-1 transition opacity-100 translate-y-0 group-[[aria-busy=true]]:-translate-y-3 group-[[aria-busy=true]]:opacity-0"
          )}
        >
          {children}
        </span>
      </span>
    </button>
  );
};
