import Color from "color";
import { DetailedHTMLProps, HTMLAttributes, useEffect, useState } from "react";
import { twMerge } from "tailwind-merge";

type Props = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  borderSize?: number;
  shadowOffset?: number;
  clickable?: boolean;
};

export function BrutalistCard(props: Props) {
  const { borderSize: _borderSize, shadowOffset: _shadowOffset, clickable } = props;
  const borderColor = "#CDC098";

  const [offset, setOffset] = useState(0);
  const [borderSize] = useState(_borderSize ?? 1);
  const [shadowOffset, setShadowOffset] = useState(_shadowOffset ?? 3);

  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!clickable) return;

    if (!hovering) {
      setOffset(0);
      setShadowOffset(_shadowOffset ?? 3);
    } else {
      setOffset(1);
      setShadowOffset((_shadowOffset ?? 3) - 1);
    }
  }, [_borderSize, _shadowOffset, clickable, hovering]);

  return (
    <div
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onMouseDown={() => {
        if (!clickable) return;

        setShadowOffset((b) => b - 1);
        setOffset((o) => o + 1);
      }}
      onMouseUp={() => {
        if (!clickable) return;

        setShadowOffset((b) => b + 1);
        setOffset((o) => o - 1);
      }}
      style={{
        ...props.style,
        boxShadow: `${shadowOffset}px ${shadowOffset}px 0 0 #000000`,
        backgroundColor: "#e3e2dd",
        transform: `translate(${offset}px, ${offset}px)`,
        border: `${borderSize ?? 3}px solid #e3e2dd`,
        transition: "all 0.1s ease-in-out",
      }}
      className={twMerge(
        "bg-gray h-full w-full rounded text-black/80",
        props.className,
        clickable && hovering && "cursor-pointer"
      )}
    >
      <div
        style={{
          transition: "all 0.1s ease-in-out",
          border: `${borderSize ?? 1}px solid ${
            clickable && hovering ? Color(borderColor).darken(0.2).toString() : Color(borderColor)
          }`,
        }}
        className="h-full w-full rounded"
      >
        {props.children}
      </div>
    </div>
  );
}
