import { DetailedHTMLProps, HTMLAttributes, useEffect, useMemo } from "react";
import { useMUD } from "../../../useMUD";
import { uuid } from "@latticexyz/utils";

type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;

/**
 * Wrap any piece of UI that needs to receive click events with this.
 * Make sure it is unmounted when the click events are no longer needed.
 */
export const ClickWrapper = (props: Props) => {
  const {
    phaserLayer: {
      api: {
        mapInteraction: { disableMapInteraction, enableMapInteraction },
      },
    },
  } = useMUD();

  const id = useMemo(() => uuid(), []);

  useEffect(() => {
    return () => {
      enableMapInteraction(id);
    };
  }, [enableMapInteraction, id]);

  const { children, style } = props;

  return (
    <div
      {...props}
      onMouseEnter={() => disableMapInteraction(id)}
      onMouseLeave={() => enableMapInteraction(id)}
      style={{ pointerEvents: "all", ...style }}
    >
      {children}
    </div>
  );
};
