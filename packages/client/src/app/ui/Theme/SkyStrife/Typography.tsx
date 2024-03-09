import { DetailedHTMLProps, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

const baseStyle = {
  lineHeight: "24px",
  fontWeight: 400,
};

export function OverlineLarge(props: Props) {
  const { className: _className, children, style } = props;

  return (
    <div
      style={{
        fontSize: "18px",
        letterSpacing: "1px",
        ...baseStyle,
        fontWeight: 500,
        ...style,
      }}
      className={twMerge("text-ss-text-default uppercase", _className)}
    >
      {children}
    </div>
  );
}

export function OverlineSmall(props: Props) {
  const { className: _className, style, children } = props;

  return (
    <div
      style={{
        fontSize: "14px",
        letterSpacing: "1px",
        ...baseStyle,
        fontWeight: 400,
        lineHeight: "32px",
        ...style,
      }}
      className={twMerge("text-ss-text-light uppercase", _className)}
    >
      {children}
    </div>
  );
}

export function Heading(props: Props) {
  const { className: _className, style, children } = props;

  return (
    <div
      style={{
        fontSize: "18px",
        ...baseStyle,
        fontWeight: 500,
        ...style,
      }}
      className={twMerge("text-ss-text-default", _className)}
    >
      {children}
    </div>
  );
}

export function Body(props: Props) {
  const { className: _className, children, style } = props;

  return (
    <div
      style={{
        fontSize: "16px",
        ...baseStyle,
        ...style,
      }}
      className={twMerge("text-ss-text-x-light", _className)}
    >
      {children}
    </div>
  );
}

export function Caption(props: Props) {
  const { className: _className, children } = props;

  return (
    <div
      style={{
        fontSize: "14px",
        ...baseStyle,
      }}
      className={twMerge("text-ss-text-x-light", _className)}
    >
      {children}
    </div>
  );
}

type LinkProps = Props & {
  href?: string;
};

export function Link(props: LinkProps) {
  const { className: _className, children, href, style } = props;

  return (
    <a
      href={href}
      target="_blank"
      style={{
        fontSize: "14px",
        ...baseStyle,
        ...style,
      }}
      className={twMerge("text-ss-text-link", "hover:text-ss-text-link-hover hover:underline", _className)}
      rel="noreferrer"
    >
      {children}
    </a>
  );
}
