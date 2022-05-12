import { DetailedHTMLProps, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { Body } from "../../ui/Theme/SkyStrife/Typography";

export function RequiredAsterisk() {
  return <span className="text-red-500">*</span>;
}

export function ChevronDown() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
      <path
        fillRule="evenodd"
        d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"
      />
    </svg>
  );
}

type Props = DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  amount: bigint | number;
  setAmount?: (amount: bigint) => void;
  containerClassName?: string;
  label?: React.ReactNode | string;
};

export function OrbInput({ amount, className, containerClassName, setAmount, label }: Props) {
  return (
    <div className={twMerge("relative w-full", containerClassName)}>
      <input
        className={twMerge("w-full bg-ss-bg-2 px-4 py-2 border border-[#DDDAD0]", className)}
        type="text"
        value={Number(amount)}
        readOnly={!setAmount}
        disabled={!setAmount}
        onChange={(e) => {
          if (!setAmount) return;

          const valueNum = parseInt(e.target.value);
          if (valueNum >= 0) {
            setAmount(BigInt(valueNum));
          } else {
            setAmount(0n);
          }
        }}
      />

      <span className="absolute right-3 top-[8px]">{label || "🔮"}</span>
    </div>
  );
}

export function ReadOnlyTextInput({
  value,
  className,
  containerClassName,
  label,
  symbol,
}: Omit<Props, "amount"> & { value: string; symbol?: string | React.ReactNode }) {
  return (
    <div className={twMerge("relative w-full", containerClassName)}>
      <span
        style={{
          fontSize: "14px",
        }}
        className="absolute left-3 top-[11px] text-ss-text-x-light uppercase"
      >
        {label}
      </span>

      <input
        className={twMerge("w-full bg-ss-bg-2 px-4 py-2 border border-[#DDDAD0]", className)}
        type="text"
        readOnly
        value={value}
      />

      <span className="absolute right-3 top-[8px]">{symbol}</span>
    </div>
  );
}

export function LabeledOrbInput({
  amount,
  className,
  containerClassName,
  setAmount,
  label,
  symbol,
}: Props & { symbol?: string }) {
  return (
    <div
      className={twMerge(
        "flex flex-row items-baseline w-full h-[36px] bg-ss-bg-2 px-4 py-1 border border-[#DDDAD0] align-middle",
        containerClassName
      )}
    >
      <span
        style={{
          fontSize: "14px",
        }}
        className=" w-full left-3 text-ss-text-x-light uppercase"
      >
        {label}
      </span>

      <input
        className={twMerge(" w-[100px] align-middle	shrink text-right pr-3 bg-ss-bg-2", className)}
        type="text"
        value={Number(amount)}
        readOnly={!setAmount}
        disabled={!setAmount}
        onChange={(e) => {
          if (!setAmount) return;

          const valueNum = parseInt(e.target.value);
          if (valueNum >= 0) {
            setAmount(BigInt(valueNum));
          } else {
            setAmount(0n);
          }
        }}
      />

      <Body className="text-ss-text-default right-3">{symbol ?? "🔮"}</Body>
    </div>
  );
}
