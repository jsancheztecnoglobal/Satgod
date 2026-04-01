"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function OpenReportButton({
  workOrderId,
  reportId,
  className,
  label = "Ver parte",
}: {
  workOrderId: string;
  reportId?: string;
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      if (reportId) {
        router.push(`/ordenes/${reportId}`);
        return;
      }

      const response = await fetch(`/api/work-orders/${workOrderId}/report`, {
        method: "POST",
      });
      const payload = await response.json();

      if (response.ok && payload.reportId) {
        router.push(`/ordenes/${payload.reportId}`);
        router.refresh();
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={className}
    >
      {pending ? "Abriendo..." : label}
    </button>
  );
}
