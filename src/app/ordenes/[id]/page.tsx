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
    <div className="mx-auto w-full max-w-5xl space-y-4 md:space-y-6">
      <PageHeader
        eyebrow="Parte"
        title={`${detail.report.workOrderNumber} - ${detail.report.clientName}`}
        description="Parte operativo para ejecutar la visita, documentarla y devolver el control a la agenda."
      />

      <Panel>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoRow label="OT" value={detail.report.workOrderNumber} />
          <InfoRow label="Cliente" value={detail.report.clientName} />
          <InfoRow label="Equipo" value={detail.report.equipmentLabel ?? "Sin equipo"} />
          <InfoRow label="Estado" value={formatStatusLabel(detail.report.status)} />
        </div>
      </Panel>

      {detail.workOrder?.description ? (
        <Panel className="bg-slate-50">
          <h2 className="text-[18px] font-semibold text-[#1d3557]">Notas</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{detail.workOrder.description}</p>
        </Panel>
      ) : null}

      {detail.workOrder ? (
        <LocationSummaryPanel
          title={`Ubicacion de ${detail.workOrder.clientName}`}
          address={detail.workOrder.clientAddress}
          lat={detail.workOrder.lat}
          lng={detail.workOrder.lng}
          helper="Abrimos la ubicacion externa sin cargar mapas pesados dentro del parte."
        />
      ) : null}

      <Panel>
        <WorkReportDetailForm
          report={detail.report}
          showArrivalTime={false}
          showClientNameField={false}
          returnPath={session.role === "technician" ? "/tecnico" : undefined}
        >
          <div className="space-y-5 pt-2">
            <Section title="Firma del cliente">
              <SignatureCapture
                workReportId={detail.report.id}
                signerName={detail.report.clientNameSigned}
                existingSignatureUrl={detail.report.signatureUrl}
              />
            </Section>

            <Section title="Fotos y adjuntos">
              <AttachmentUploader
                workReportId={detail.report.id}
                attachments={detail.report.attachments}
              />
            </Section>

            <Section title="Materiales usados">
              <MaterialUsageEditor
                workReportId={detail.report.id}
                materials={detail.report.materials}
                catalog={materialCatalog}
              />
            </Section>
          </div>
        </WorkReportDetailForm>
      </Panel>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4 border-t border-slate-200 pt-5">
      <h2 className="text-[18px] font-semibold text-[#1d3557]">{title}</h2>
      {children}
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

function formatStatusLabel(status: "draft" | "ready_for_review" | "closed") {
  switch (status) {
    case "draft":
      return "Borrador";
    case "ready_for_review":
      return "Listo para revision";
    case "closed":
      return "Cerrado";
    default:
      return status;
  }
}
