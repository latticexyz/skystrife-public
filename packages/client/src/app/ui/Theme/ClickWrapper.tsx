import { DetailedHTMLProps, HTMLAttributes, useEffect } from "react";
import { useMUD } from "../../../useMUD";

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

  useEffect(() => {
    return () => {
      enableMapInteraction();
    };
  }, [enableMapInteraction]);

  const { children, style } = props;

  return (
    <div
      {...props}
      onMouseEnter={() => disableMapInteraction()}
      onMouseLeave={() => enableMapInteraction()}
      style={{ pointerEvents: "all", ...style }}
    >
      {children}
    </div>
  );
};
