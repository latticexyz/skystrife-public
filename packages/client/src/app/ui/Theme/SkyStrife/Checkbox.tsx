import { twMerge } from "tailwind-merge";

export const Checkbox = ({
  isChecked,
  setIsChecked,
  disabled,
  uncheckedLabel,
  checkedLabel,
}: {
  isChecked: boolean;
  setIsChecked: (isChecked: boolean) => void;
  disabled?: boolean;
  uncheckedLabel: string;
  checkedLabel: string;
}) => {
  return (
    <div
      className={twMerge(
        disabled ? "cursor-not-allowed hover:cursor-not-allowed" : "cursor-pointer",
        "flex items-center space-x-4"
      )}
    >
      <label className="">
        <span
          className={twMerge(
            "text-ss-text-x-light",
            !isChecked && "text-ss-text-default ",
            isChecked && "line-through"
          )}
        >
          {uncheckedLabel}
        </span>
        <div className="relative inline-block w-12 ml-2 align-middle select-none transition duration-200 ease-in">
          <input
            disabled={disabled}
            type="checkbox"
            checked={isChecked}
            onChange={() => setIsChecked(!isChecked)}
            className="hidden"
          />
          <span className={`block w-10 h-6 bg-gray-400 rounded-full shadow-inner`}></span>
          <span
            className={`absolute transition-all block w-6 h-6 mt-px ml-px rounded-full shadow top-[-1px] left-[-1px] focus-within:shadow-outline ${
              isChecked ? "bg-blue-500 translate-x-4" : "bg-white"
            }`}
          ></span>
        </div>
        <span
          className={twMerge("text-ss-text-x-light", isChecked && "text-ss-text-default", !isChecked && "line-through")}
        >
          {checkedLabel}
        </span>
      </label>
    </div>
  );
};
