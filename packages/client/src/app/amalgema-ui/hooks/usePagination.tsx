import { useState } from "react";
import { Button } from "../../ui/Theme/SkyStrife/Button";
import { twMerge } from "tailwind-merge";

const PaginationButton = ({
  children,
  onClick,
  onPageChange,
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  onPageChange?: (state: "start" | "done") => Promise<void>;
}) => {
  return (
    <Button
      buttonType="tertiary"
      className={twMerge(
        "mx-2",
        disabled ? "text-ss-text-light bg-white hover:bg-white disabled:hover:bg-white" : "text-ss-text",
      )}
      onClick={async () => {
        if (onClick) {
          if (onPageChange) await onPageChange("start");
          onClick();
          if (onPageChange) await onPageChange("done");
        }
      }}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

export function usePagination({
  totalItems,
  pageSize,
  onPageChange,
}: {
  totalItems: number;
  pageSize: number;
  onPageChange?: (state: "start" | "done") => Promise<void>;
}) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  if (totalPages === 1)
    return {
      page: 1,
      form: null,
    };

  const form = (
    <div className="flex items-center text-ss-text-light">
      <PaginationButton disabled={page === 1} onPageChange={onPageChange} onClick={() => setPage(1)}>
        1
      </PaginationButton>
      {page > 2 && (
        <>
          {page > 3 && <span className="mr-2 font-mono px-1">...</span>}
          <PaginationButton onPageChange={onPageChange} onClick={() => setPage(page - 1)}>
            {page - 1}
          </PaginationButton>
        </>
      )}
      {page !== 1 && page !== totalPages && <PaginationButton disabled>{page}</PaginationButton>}
      {page < totalPages - 1 && (
        <>
          <PaginationButton onPageChange={onPageChange} onClick={() => setPage(page + 1)}>
            {page + 1}
          </PaginationButton>
          {page < totalPages - 2 && <span className="mr-2 font-mono px-1">...</span>}
        </>
      )}
      {totalPages > 1 && (
        <PaginationButton
          onPageChange={onPageChange}
          disabled={page === totalPages}
          onClick={() => setPage(totalPages)}
        >
          {totalPages}
        </PaginationButton>
      )}
    </div>
  );

  return {
    page,
    form,
  };
}
