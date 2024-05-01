import React, { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { Danger } from "./Icons/Danger";

interface DangerSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const DangerSection: React.FC<DangerSectionProps> = ({ children, className, ...rest }) => {
  return (
    <div
      className={twMerge(
        "w-full flex items-start p-3 bg-[#FFECEB] shadow-ss-small rounded border border-ss-warning gap-x-4",
        className,
      )}
      {...rest}
    >
      <div className="pt-1">
        <Danger />
      </div>
      <div>{children}</div>
    </div>
  );
};

export default DangerSection;
