import Link from "next/link";
import { notFound } from "next/navigation";

import { AttachmentUploader } from "@/components/forms/attachment-uploader";
import { MaterialUsageEditor } from "@/components/forms/material-usage-editor";
import { LocationSummaryPanel } from "@/components/maps/location-summary-panel";
import { SignatureCapture } from "@/components/forms/signature-capture";
import { WorkReportDetailForm } from "@/components/forms/work-report-detail-form";
import { PageHeader } from "@/components/ui/page-header";
import { Panel } from "@/components/ui/panel";
import { requirePageAccess } from "@/lib/auth/session";
import { getMaterialCatalog, getWorkReportById } from "@/lib/data/repositories";

export default async function WorkReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePageAccess("/ordenes/");
  const { id } = await params;
  const [detail, materialCatalog] = await Promise.all([
    getWorkReportById(id, session),
    getMaterialCatalog(),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <div className="space-y-4 md:space-y-6">
      <PageHeader
        eyebrow="Parte"
        title={`${detail.report.workOrderNumber} - ${detail.report.clientName}`}
        description="Parte operativo listo para trabajar desde movil o escritorio, sin cambiar de flujo."
      />

      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="order-2 space-y-4 xl:order-1">
          <Panel>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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

          <Panel>
            <h2 className="text-[18px] font-semibold text-[#1d3557]">Materiales usados</h2>
            <div className="mt-4">
              <MaterialUsageEditor
                workReportId={detail.report.id}
                materials={detail.report.materials}
                catalog={materialCatalog}
              />
            </div>
          </Panel>
        </div>

        <div className="order-1 space-y-4 xl:order-2">
          {detail.workOrder ? (
            <>
              <Panel className="space-y-3 border-[#dbe7f4] bg-[#f7fafe]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#52729b]">
                  Acciones rapidas
                </p>
                <Link href={`/trabajos/${detail.workOrder.id}`} className="flex w-full items-center justify-center rounded-2xl bg-[#1f4b7f] px-4 py-3 text-sm font-semibold text-white">
                  Abrir orden asociada
                </Link>
                {detail.workOrder.equipmentId && session.role !== "technician" ? (
                  <Link href={`/equipos/${detail.workOrder.equipmentId}`} className="flex w-full items-center justify-center rounded-2xl bg-[#2f7ed8] px-4 py-3 text-sm font-semibold text-white">
                    Abrir equipo
                  </Link>
                ) : null}
              </Panel>
              <LocationSummaryPanel
                title={`Ubicacion de ${detail.workOrder.clientName}`}
                address={detail.workOrder.clientAddress}
                lat={detail.workOrder.lat}
                lng={detail.workOrder.lng}
                helper="Abrimos la ubicacion externa sin montar Google Maps JS fuera del dashboard."
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-[#1d3557]">{value}</p>
    </div>
  );
}
