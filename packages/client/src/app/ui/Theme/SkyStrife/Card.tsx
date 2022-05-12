import { DetailedHTMLProps, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & { primary?: boolean };

export function Card(props: Props) {
  const { className: _className, children, primary, style, ref } = props;

  return (
    <div
      ref={ref}
      className={twMerge(
        "w-full",
        primary ? "bg-ss-bg-1" : "bg-ss-bg-0",
        "rounded",
        "px-6 py-4",
        "border border-ss-stroke",
        "shadow-ss-default",
        _className
      )}
      style={style}
    >
      {children}
    </div>
  );
}
