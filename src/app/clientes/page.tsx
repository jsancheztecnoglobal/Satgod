import { ClientDirectory } from "@/components/clients/client-directory";
import { PageHeader } from "@/components/ui/page-header";
import { requirePageAccess } from "@/lib/auth/session";
import { getClientsList } from "@/lib/data/repositories";

export default async function ClientesPage() {
  await requirePageAccess("/clientes");
  const clients = await getClientsList();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Clientes"
        title="Clientes y sus equipos"
        description="Directorio operativo. Cada cliente abre su ficha real con equipos, ordenes, partes e historial relacionado."
      />
      <ClientDirectory clients={clients} />
    </div>
  );
}
