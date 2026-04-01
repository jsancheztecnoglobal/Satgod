"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";

export function SignatureCapture({
  workReportId,
  signerName,
  existingSignatureUrl,
}: {
  workReportId: string;
  signerName: string;
  existingSignatureUrl?: string;
}) {
  const signatureRef = useRef<SignatureCanvas | null>(null);
  const router = useRouter();
  const [localSignerName, setLocalSignerName] = useState(signerName);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");

  return (
    <div className="space-y-4">
      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">Firmante</span>
        <input
          value={localSignerName}
          onChange={(event) => setLocalSignerName(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm"
        />
      </label>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <SignatureCanvas
          ref={signatureRef}
          penColor="#1d3557"
          backgroundColor="white"
          canvasProps={{
            className: "h-[220px] w-full",
          }}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => signatureRef.current?.clear()}
          className="rounded-xl bg-white px-4 py-3 text-sm font-semibold text-[#1f4b7f] ring-1 ring-slate-200"
        >
          Limpiar firma
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              try {
                const signer = localSignerName.trim();
                if (!signer) {
                  setError("Debes indicar el nombre del firmante.");
                  return;
                }
                const dataUrl = signatureRef.current?.getTrimmedCanvas().toDataURL("image/png");
                if (!dataUrl) {
                  setError("Debes dibujar una firma antes de guardar.");
                  return;
                }
                const response = await fetch(`/api/work-reports/${workReportId}/signature`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    dataUrl,
                    signerName: signer,
                  }),
                });
                if (!response.ok) {
                  const payload = (await response.json()) as { message?: string };
                  throw new Error(payload.message ?? "No se pudo guardar la firma.");
                }
                setError("");
                router.refresh();
              } catch (saveError) {
                setError(
                  saveError instanceof Error
                    ? saveError.message
                    : "No se pudo guardar la firma.",
                );
              }
            })
          }
          className="rounded-xl bg-[#1f4b7f] px-4 py-3 text-sm font-semibold text-white"
        >
          {pending ? "Guardando firma..." : "Guardar firma"}
        </button>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {existingSignatureUrl ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-semibold text-[#1d3557]">Firma guardada</p>
          <Image
            src={existingSignatureUrl}
            alt="Firma guardada"
            width={640}
            height={240}
            className="max-h-[180px] rounded-lg border border-slate-200 bg-white object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}
