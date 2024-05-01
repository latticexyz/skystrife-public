import React, { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { Warning } from "./Icons/Warning";

interface WarningSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const WarningSection: React.FC<WarningSectionProps> = ({ children, className, ...rest }) => {
  return (
    <div
      className={twMerge("w-full flex items-start p-3 bg-[#F9F2C3] rounded border border-ss-stroke gap-x-4", className)}
      {...rest}
    >
      <div className="pt-1">
        <Warning />
      </div>
      <div>{children}</div>
    </div>
  );
};

export default WarningSection;
