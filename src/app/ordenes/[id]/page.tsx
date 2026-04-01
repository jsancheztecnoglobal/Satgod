import Link from "next/link";
import { notFound } from "next/navigation";

import { AttachmentUploader } from "@/components/forms/attachment-uploader";
import { LocationSummaryPanel } from "@/components/maps/location-summary-panel";
import { SignatureCapture } from "@/components/forms/signature-capture";
import { WorkReportDetailForm } from "@/components/forms/work-report-detail-form";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { requirePageAccess } from "@/lib/auth/session";
import { getWorkReportById } from "@/lib/data/repositories";

export default async function WorkReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePageAccess("/ordenes");
  const { id } = await params;
  const detail = await getWorkReportById(id);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Parte"
        title={`${detail.report.workOrderNumber} - ${detail.report.clientName}`}
        description="Detalle real del parte vinculado a su orden, cliente y ubicacion."
      />

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <Panel>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoRow label="OT" value={detail.report.workOrderNumber} />
              <InfoRow label="Cliente" value={detail.report.clientName} />
              <InfoRow label="Equipo" value={detail.report.equipmentLabel ?? "Sin equipo"} />
              <InfoRow label="Tecnico" value={detail.report.technicianId} />
            </div>
          </Panel>

          <Panel>
            <WorkReportDetailForm report={detail.report} />
          </Panel>

          <Panel>
            <h2 className="text-[18px] font-semibold text-[#1d3557]">Firma de cliente</h2>
            <div className="mt-4">
              <SignatureCapture
                workReportId={detail.report.id}
                signerName={detail.report.clientNameSigned}
                existingSignatureUrl={detail.report.signatureUrl}
              />
            </div>
          </Panel>

          <Panel>
            <h2 className="text-[18px] font-semibold text-[#1d3557]">Fotos y adjuntos</h2>
            <div className="mt-4">
              <AttachmentUploader workReportId={detail.report.id} attachments={detail.report.attachments} />
            </div>
          </Panel>

          <Panel className="p-0">
            <div className="border-b border-slate-200 px-5 py-4">
              <h2 className="text-[18px] font-semibold text-[#1d3557]">Materiales usados</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {detail.report.materials.length ? (
                detail.report.materials.map((material) => (
                  <div key={material.id} className="grid grid-cols-[1.5fr_100px_80px] gap-3 px-5 py-4 text-sm">
                    <p className="font-medium text-slate-700">{material.name}</p>
                    <p className="text-slate-600">{material.quantity}</p>
                    <p className="text-slate-600">{material.unit}</p>
                  </div>
                ))
              ) : (
                <div className="px-5 py-4 text-sm text-slate-500">No hay materiales registrados.</div>
              )}
            </div>
          </Panel>
        </div>

        <div className="space-y-5">
          {detail.workOrder ? (
            <>
              <LocationSummaryPanel
                title={`Ubicacion de ${detail.workOrder.clientName}`}
                address={detail.workOrder.clientAddress}
                lat={detail.workOrder.lat}
                lng={detail.workOrder.lng}
                helper="Abrimos la ubicacion externa sin montar Google Maps JS fuera del dashboard."
              />
              <Panel>
                <Link href={`/trabajos/${detail.workOrder.id}`} className="flex w-full items-center justify-center rounded-xl bg-[#1f4b7f] px-4 py-3 text-sm font-semibold text-white">
                  Abrir orden asociada
                </Link>
                {detail.workOrder.equipmentId ? (
                  <Link href={`/equipos/${detail.workOrder.equipmentId}`} className="mt-3 flex w-full items-center justify-center rounded-xl bg-[#2f7ed8] px-4 py-3 text-sm font-semibold text-white">
                    Abrir equipo
                  </Link>
                ) : null}
              </Panel>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-[#1d3557]">{value}</p>
    </div>
  );
}
