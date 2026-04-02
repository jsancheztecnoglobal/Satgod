"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { useUiDevice } from "@/components/layout/ui-device-context";
import type { ReportAttachment } from "@/lib/data/contracts";

export function AttachmentUploader({
  workReportId,
  attachments,
}: {
  workReportId: string;
  attachments: ReportAttachment[];
}) {
  const router = useRouter();
  const { isMobile } = useUiDevice();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        setSuccess(file.type.startsWith("image/") ? "Foto guardada." : "Adjunto guardado.");
        router.refresh();
      } catch (uploadError) {
        setSuccess("");
        setError(uploadError instanceof Error ? uploadError.message : "No se pudo subir el archivo.");
      } finally {
        if (inputRef.current) inputRef.current.value = "";
        if (cameraInputRef.current) cameraInputRef.current.value = "";
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className={isMobile ? "grid gap-3" : "flex flex-wrap items-center gap-3"}>
        <input
          ref={inputRef}
          type="file"
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.txt"
          onChange={(event) => upload(event.target.files?.[0] ?? null)}
          className="hidden"
        />
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={(event) => upload(event.target.files?.[0] ?? null)}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="w-full rounded-2xl bg-[#1f4b7f] px-4 py-3.5 text-sm font-semibold text-white sm:w-auto"
        >
          Hacer foto
        </button>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-[#1f4b7f] ring-1 ring-slate-200 sm:w-auto"
        >
          Adjuntar archivo
        </button>
        {pending ? <span className="text-sm text-slate-500">Subiendo...</span> : null}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      <div className="grid gap-3 md:grid-cols-2">
        {attachments.length ? (
          attachments.map((attachment) => (
            <a
              key={attachment.id}
              href={attachment.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-slate-100"
            >
              {attachment.mimeType.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={attachment.url}
                  alt={attachment.fileName}
                  loading="lazy"
                  className="mb-3 h-[180px] w-full rounded-xl object-cover"
                />
              ) : null}
              <p className="font-semibold text-[#1d3557]">{attachment.fileName}</p>
              <p className="mt-1 text-sm text-slate-500">{attachment.kind}</p>
            </a>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            Todavia no hay fotos ni adjuntos en este parte.
          </div>
        )}
      </div>
    </div>
  );
}
