"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export function FinalizeWorkOrderButton({
  workOrderId,
  className,
  label = "Finalizar trabajo",
}: {
  workOrderId: string;
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await fetch(`/api/work-orders/${workOrderId}/finalize`, { method: "POST" });
          router.refresh();
        })
      }
      className={className}
    >
      {pending ? "Finalizando..." : label}
    </button>
  );
}
