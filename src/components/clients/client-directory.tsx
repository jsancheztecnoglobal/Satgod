"use client";

import Link from "next/link";

import { Panel } from "@/components/ui/panel";
import type { ClientRecord } from "@/lib/data/contracts";

export function ClientDirectory({
  clients,
}: {
  clients: ClientRecord[];
}) {
  return (
    <Panel className="p-0">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-[18px] font-semibold text-[#1d3557]">Clientes</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {clients.map((client) => (
          <Link
            key={client.id}
            href={`/clientes/${client.id}`}
            className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-slate-50"
          >
            <div>
              <p className="font-semibold text-[#1d3557]">{client.name}</p>
              <p className="mt-1 text-sm text-slate-500">
                {client.city} - {client.contactName}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700">{client.equipmentCount} equipos</p>
              <p className="mt-1 text-xs text-slate-500">{client.openOrders} OT abiertas</p>
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  );
}
