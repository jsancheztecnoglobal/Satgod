"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { ReportAttachment } from "@/lib/data/contracts";

export function AttachmentUploader({
  workReportId,
  attachments,
}: {
  workReportId: string;
  attachments: ReportAttachment[];
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const upload = (file?: File | null) => {
    if (!file) return;
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("kind", file.type.startsWith("image/") ? "photo" : "document");
        const response = await fetch(`/api/work-reports/${workReportId}/attachments`, {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          const payload = await response.json();
          throw new Error(payload.message ?? "No se pudo subir el archivo.");
        }
        setError("");
        router.refresh();
      } catch (uploadError) {
        setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir el archivo.");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          onChange={(event) => upload(event.target.files?.[0] ?? null)}
          className="block text-sm text-slate-600"
        />
        {pending ? <span className="text-sm text-slate-500">Subiendo...</span> : null}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {attachments.length ? (
          attachments.map((attachment) => (
            <a
              key={attachment.id}
              href={attachment.url}
              target="_blank"
              className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
            >
              {attachment.mimeType.startsWith("image/") ? (
                <Image
                  src={attachment.url}
                  alt={attachment.fileName}
                  width={640}
                  height={360}
                  className="mb-3 h-[180px] w-full rounded-lg object-cover"
                />
              ) : null}
              <p className="font-semibold text-[#1d3557]">{attachment.fileName}</p>
              <p className="mt-1 text-sm text-slate-500">{attachment.kind}</p>
            </a>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Todavia no hay fotos ni adjuntos en este parte.
          </div>
        )}
      </div>
    </div>
  );
}
