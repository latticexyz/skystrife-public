import { useState } from "react";
import { Button } from "../../ui/Theme/SkyStrife/Button";
import { twMerge } from "tailwind-merge";

export function usePagination({ totalItems, pageSize }: { totalItems: number; pageSize: number }) {
  const [page, setPage] = useState(1);

  const PaginationButton = ({
    children,
    onClick,
    disabled,
  }: {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <Button
      buttonType="tertiary"
      className={twMerge(
        "mx-2",
        disabled ? "text-ss-text-light bg-white hover:bg-white disabled:hover:bg-white" : "text-ss-text"
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </Button>
  );

  const totalPages = Math.max(Math.ceil(totalItems / pageSize), 1);
  if (totalPages === 1)
    return {
      page: 1,
      form: null,
    };

  const form = (
    <div className="flex items-center text-ss-text-light">
      <PaginationButton disabled={page === 1} onClick={() => setPage(1)}>
        1
      </PaginationButton>
      {page > 2 && (
        <>
          {page > 3 && <span className="mr-2 font-mono px-1">...</span>}
          <PaginationButton onClick={() => setPage(page - 1)}>{page - 1}</PaginationButton>
        </>
      )}
      {page !== 1 && page !== totalPages && <PaginationButton disabled>{page}</PaginationButton>}
      {page < totalPages - 1 && (
        <>
          <PaginationButton onClick={() => setPage(page + 1)}>{page + 1}</PaginationButton>
          {page < totalPages - 2 && <span className="mr-2 font-mono px-1">...</span>}
        </>
      )}
      {totalPages > 1 && (
        <PaginationButton disabled={page === totalPages} onClick={() => setPage(totalPages)}>
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
