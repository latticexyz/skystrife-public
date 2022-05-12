import { useState } from "react";
import { Button } from "../../ui/Theme/SkyStrife/Button";

export function usePagination({ totalItems, pageSize }: { totalItems: number; pageSize: number }) {
  const [page, setPage] = useState(1);

  const form = (
    <div className="flex items-center text-ss-text-light">
      {page !== 1 && (
        <Button
          buttonType="tertiary"
          className="mr-2 py-1 px-2"
          style={{
            fontSize: "0.75rem",
          }}
          onClick={() => {
            if (page > 1) setPage(page - 1);
          }}
        >
          &lt;
        </Button>
      )}

      <div className="font-mono">
        Page {page} of {Math.max(Math.ceil(totalItems / pageSize), 1)}
      </div>

      {page !== Math.max(Math.ceil(totalItems / pageSize), 1) && (
        <Button
          buttonType="tertiary"
          className="ml-2 py-1 px-2"
          style={{
            fontSize: "0.75rem",
          }}
          onClick={() => {
            if (page < Math.max(Math.ceil(totalItems / pageSize), 1)) setPage(page + 1);
          }}
        >
          &gt;
        </Button>
      )}
    </div>
  );

  return {
    page,
    form,
  };
}
