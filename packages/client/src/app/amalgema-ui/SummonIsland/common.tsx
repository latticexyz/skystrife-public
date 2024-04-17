import { DetailedHTMLProps, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";
import { Body } from "../../ui/Theme/SkyStrife/Typography";
import { formatEther } from "viem";

const ETHER_TO_WEI = 1000000000000000000n;

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

export function PercentageInput({
  amount,
  className,
  setAmount,
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  amount: bigint | number;
  setAmount?: (amount: bigint) => void;
}) {
  return (
    <div className="relative w-full">
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

      <span className="absolute right-3 top-[8px]">%</span>
    </div>
  );
}

export function OrbInput({
  amount,
  setAmount,
  className,
  containerClassName,
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  amount: bigint | number;
  setAmount?: (amount: bigint) => void;
  containerClassName?: string;
}) {
  return (
    <div className={twMerge("relative w-full", containerClassName)}>
      <input
        className={twMerge("w-full bg-ss-bg-2 px-4 py-2 border border-[#DDDAD0]", className)}
        type="text"
        value={formatEther(BigInt(amount))}
        readOnly={!setAmount}
        disabled={!setAmount}
        onChange={(e) => {
          if (!setAmount) return;

          const valueNum = parseInt(e.target.value);
          if (valueNum >= 0) {
            setAmount(BigInt(valueNum) * ETHER_TO_WEI);
          } else {
            setAmount(0n);
          }
        }}
      />

      <span className="absolute right-3 top-[8px]">🔮</span>
    </div>
  );
}

export function ReadOnlyTextInput({
  value,
  className,
  label,
  symbol,
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  value: string;
  label?: string;
  symbol?: React.ReactNode;
}) {
  return (
    <div className="relative w-full">
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
  label,
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  amount: bigint | number;
  label?: React.ReactNode | string;
}) {
  return (
    <div className="flex flex-row items-baseline w-full h-[36px] bg-ss-bg-2 px-4 py-1 border border-[#DDDAD0] align-middle">
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
        readOnly
        value={formatEther(BigInt(amount))}
      />

      <Body className="text-ss-text-default right-3">🔮</Body>
    </div>
  );
}

export function EthInput({
  amount,
  className,
  label,
}: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement> & {
  amount: bigint;
  label?: React.ReactNode | string;
}) {
  return (
    <div className="flex flex-row items-baseline w-full h-[36px] bg-ss-bg-2 px-4 py-1 border border-[#DDDAD0] align-middle">
      <span
        style={{
          fontSize: "12px",
        }}
        className=" w-full left-3 text-ss-text-x-light uppercase"
      >
        {label}
      </span>

      <input
        className={twMerge("w-[120px] align-middle shrink text-right pr-3 bg-ss-bg-2", className)}
        type="text"
        readOnly
        value={parseFloat(formatEther(amount)).toFixed(5)}
      />

      <Body className="text-ss-text-default right-3">ETH</Body>
    </div>
  );
}
