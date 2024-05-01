import { twMerge } from "tailwind-merge";

export function SeasonPassImg({ colored = true, className }: { colored?: boolean; className?: string }) {
  const imgName = colored ? "season-pass" : "season-pass-bw";

  return (
    <img
      src={`public/assets/${imgName}.png`}
      alt="Season Pass"
      className={twMerge(
        `lightgray -2.259px -15.671px / 106.667% 150.588% no-repeat] bg-[url(packages/client/src/public/assets/${imgName}.png)`,
        className,
      )}
    />
  );
}
