import React from "react";
import { ButtonHTMLAttributes, DetailedHTMLProps } from "react";
import { twMerge } from "tailwind-merge";
import { PendingIcon } from "./PendingIcon";

export enum ButtonType {
  Primary,
  Secondary,
  Confirm,
  Cancel,
}

type Props = DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement> & {
  buttonType: ButtonType;
  pending?: boolean;
};

export const Button = React.forwardRef<HTMLButtonElement, Props>(
  ({ type, className, pending, buttonType, disabled, children, ...props }, ref) => (
    <button
      ref={ref}
      type={type || "button"}
      disabled={pending || disabled}
      aria-busy={pending}
      className={twMerge(
        "group transition border border-solid border-black/10 disabled:grayscale-[60%] disabled:cursor-not-allowed disabled:aria-busy:cursor-wait enabled:active:translate-y-0.5 shadow px-4 py-1 rounded",
        ButtonType.Primary === buttonType && "bg-[#E6D089] text-black/60 hover:bg-[#EDC645]",
        ButtonType.Secondary === buttonType && "bg-black-10 text-black/60 hover:bg-black/20",
        ButtonType.Confirm === buttonType && "bg-[#61B258] text-black/60 hover:bg-[#4FAA4C]",
        ButtonType.Cancel === buttonType && "bg-[#D9A3A3] text-black/60 hover:bg-[#C47B7B]",
        className
      )}
      {...props}
    >
      <span className="inline-grid pointer-events-none overflow-hidden">
        <span className="row-start-1 col-start-1 transition opacity-100 translate-y-0 group-[[aria-busy=true]]:-translate-y-3 group-[[aria-busy=true]]:opacity-0">
          {children}
        </span>
        <span
          className="row-start-1 col-start-1 transition opacity-0 translate-y-3 group-[[aria-busy=true]]:translate-y-0 group-[[aria-busy=true]]:opacity-100 flex items-center justify-center"
          aria-hidden
        >
          <PendingIcon />
        </span>
      </span>
    </button>
  )
);

Button.displayName = "Button";
