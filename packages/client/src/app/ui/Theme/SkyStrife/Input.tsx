import { twMerge } from "tailwind-merge";

export function Input({
  value,
  setValue,
  label,
  className,
}: {
  value: string;
  setValue: (value: string) => void;
  label: string;
  className?: string;
}) {
  return (
    <div className="flex flex-row items-baseline w-full h-[36px] bg-ss-bg-2 pl-4 py-1 border border-[#DDDAD0] align-middle">
      <span
        style={{
          fontSize: "12px",
        }}
        className="left-3 text-ss-text-x-light uppercase"
      >
        {label}
      </span>

      <div className="w-4" />

      <input
        className={twMerge("grow align-middle shrink text-right pr-3 bg-ss-bg-2", className)}
        type="text"
        onChange={(e) => setValue(e.target.value)}
        value={value}
      />
    </div>
  );
}
