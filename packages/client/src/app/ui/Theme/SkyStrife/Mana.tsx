import { twMerge } from "tailwind-merge";
import { Body } from "./Typography";
import { formatEther } from "viem";
import { EMOJI } from "../../../../constants";

type Props = {
  amount: bigint;
} & React.HTMLAttributes<HTMLDivElement>;

export function Mana({ amount, className, style }: Props) {
  return (
    <Body className={twMerge("flex flex-row items-center text-ss-text-highlight", className)} style={style}>
      {EMOJI} {formatEther(amount)}
    </Body>
  );
}
