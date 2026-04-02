"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useRouter } from "next/navigation";

import { useUiDevice } from "@/components/layout/ui-device-context";
import { cn } from "@/lib/cn";

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
  const canvasWrapperRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { isMobile } = useUiDevice();
  const [localSignerName, setLocalSignerName] = useState(signerName);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const resizeCanvas = () => {
      const signature = signatureRef.current;
      const wrapper = canvasWrapperRef.current;

      if (!signature || !wrapper) {
        return;
      }

      const canvas = signature.getCanvas();
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      const width = wrapper.offsetWidth;
      const height = isMobile ? 280 : 220;
      const existingData = signature.isEmpty() ? [] : signature.toData();

      canvas.width = width * ratio;
      canvas.height = height * ratio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const context = canvas.getContext("2d");
      context?.scale(ratio, ratio);
      signature.clear();

      if (existingData.length) {
        signature.fromData(existingData);
      }
    };

    const frameId = window.requestAnimationFrame(resizeCanvas);
    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [isMobile]);

  return (
    <div className="space-y-4">
      <label>
        <span className="mb-2 block text-sm font-medium text-slate-700">Firmante</span>
        <input
          value={localSignerName}
          onChange={(event) => setLocalSignerName(event.target.value)}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm outline-none transition focus:border-[#2f7ed8]"
        />
      </label>

      <div className="rounded-2xl border border-slate-200 bg-[#f7fafe] p-4">
        <div className="mb-3">
          <p className="text-sm font-semibold text-[#1d3557]">Firma tactil</p>
          <p className="mt-1 text-sm text-slate-500">
            Firma directamente en pantalla y guarda el resultado dentro del parte.
          </p>
        </div>

        <div
          ref={canvasWrapperRef}
          className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
        >
          <SignatureCanvas
            ref={signatureRef}
            penColor="#1d3557"
            backgroundColor="white"
            canvasProps={{
              className: cn("w-full touch-none", isMobile ? "h-[280px]" : "h-[220px]"),
            }}
          />
        </div>
      </div>

      <div className={cn("grid gap-3", isMobile ? "grid-cols-1" : "md:grid-cols-2")}>
        <button
          type="button"
          onClick={() => {
            signatureRef.current?.clear();
            setError("");
            setSuccess("");
          }}
          className="w-full rounded-2xl bg-white px-4 py-3.5 text-sm font-semibold text-[#1f4b7f] ring-1 ring-slate-200"
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
                  setSuccess("");
                  return;
                }
                const dataUrl = signatureRef.current?.getTrimmedCanvas().toDataURL("image/png");
                if (!dataUrl) {
                  setError("Debes dibujar una firma antes de guardar.");
                  setSuccess("");
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
                setSuccess("Firma guardada correctamente.");
                router.refresh();
              } catch (saveError) {
                setSuccess("");
                setError(
                  saveError instanceof Error
                    ? saveError.message
                    : "No se pudo guardar la firma.",
                );
              }
            })
          }
          className="w-full rounded-2xl bg-[#1f4b7f] px-4 py-3.5 text-sm font-semibold text-white"
        >
          {pending ? "Guardando firma..." : "Guardar firma"}
        </button>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

      {existingSignatureUrl ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="mb-3 text-sm font-semibold text-[#1d3557]">Firma guardada</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={existingSignatureUrl}
            alt="Firma guardada"
            loading="lazy"
            className="max-h-[220px] w-full rounded-xl border border-slate-200 bg-white object-contain"
          />
        </div>
      ) : null}
    </div>
  );
}
