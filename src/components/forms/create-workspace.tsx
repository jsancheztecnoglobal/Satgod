"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import type { ClientRecord, Equipment, Technician } from "@/lib/data/contracts";

type CreateKind = "client" | "equipment" | "work_order";

export function CreateWorkspace({
  clients,
  equipment,
  technicians,
}: {
  clients: ClientRecord[];
  equipment: Equipment[];
  technicians: Technician[];
}) {
  const router = useRouter();
  const [activeKind, setActiveKind] = useState<CreateKind>("work_order");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>("");

  const [clientForm, setClientForm] = useState({
    name: "",
    taxId: "",
    city: "",
    address: "",
    postalCode: "",
    contactName: "",
    contactPhone: "",
  });

  const [equipmentForm, setEquipmentForm] = useState({
    clientId: clients[0]?.id ?? "",
    name: "",
    category: "compressor",
    serialNumber: "",
    manufacturer: "",
    model: "",
    location: "",
  });

  const [orderForm, setOrderForm] = useState({
    title: "",
    description: "",
    type: "maintenance",
    priority: "normal",
    clientId: clients[0]?.id ?? "",
    equipmentId: equipment[0]?.id ?? "",
    technicianId: technicians[0]?.id ?? "",
    plannedStart: "2026-04-02T08:00",
    plannedEnd: "2026-04-02T10:00",
  });

  const visibleEquipment = useMemo(
    () => equipment.filter((item) => item.clientId === orderForm.clientId),
    [equipment, orderForm.clientId],
  );

  const submitClient = () => {
    startTransition(async () => {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clientForm),
      });
      const payload = await response.json();
      if (response.ok && payload.clientId) {
        router.push(`/clientes/${payload.clientId}`);
        router.refresh();
      } else {
        setMessage(payload.message ?? "No se pudo crear el cliente.");
      }
    });
  };

  const submitEquipment = () => {
    startTransition(async () => {
      const response = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(equipmentForm),
      });
      const payload = await response.json();
      if (response.ok && payload.equipmentId) {
        router.push(`/equipos/${payload.equipmentId}`);
        router.refresh();
      } else {
        setMessage(payload.message ?? "No se pudo crear el equipo.");
      }
    });
  };

  const submitWorkOrder = () => {
    startTransition(async () => {
      const response = await fetch("/api/work-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...orderForm,
          plannedStart: new Date(orderForm.plannedStart).toISOString(),
          plannedEnd: new Date(orderForm.plannedEnd).toISOString(),
        }),
      });
      const payload = await response.json();
      if (response.ok && payload.workOrderId) {
        router.push(`/trabajos/${payload.workOrderId}`);
        router.refresh();
      } else {
        setMessage(payload.message ?? "No se pudo crear la orden.");
      }
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-2">
        <TabButton active={activeKind === "work_order"} onClick={() => setActiveKind("work_order")}>
          Crear orden
        </TabButton>
        <TabButton active={activeKind === "client"} onClick={() => setActiveKind("client")}>
          Crear cliente
        </TabButton>
        <TabButton active={activeKind === "equipment"} onClick={() => setActiveKind("equipment")}>
          Crear equipo
        </TabButton>
      </div>

      {message ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {message}
        </div>
      ) : null}

      {activeKind === "client" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre"><input value={clientForm.name} onChange={(event) => setClientForm({ ...clientForm, name: event.target.value })} className={inputClassName} /></Field>
          <Field label="CIF"><input value={clientForm.taxId} onChange={(event) => setClientForm({ ...clientForm, taxId: event.target.value })} className={inputClassName} /></Field>
          <Field label="Ciudad"><input value={clientForm.city} onChange={(event) => setClientForm({ ...clientForm, city: event.target.value })} className={inputClassName} /></Field>
          <Field label="Codigo postal"><input value={clientForm.postalCode} onChange={(event) => setClientForm({ ...clientForm, postalCode: event.target.value })} className={inputClassName} /></Field>
          <Field label="Direccion" className="md:col-span-2"><input value={clientForm.address} onChange={(event) => setClientForm({ ...clientForm, address: event.target.value })} className={inputClassName} /></Field>
          <Field label="Contacto"><input value={clientForm.contactName} onChange={(event) => setClientForm({ ...clientForm, contactName: event.target.value })} className={inputClassName} /></Field>
          <Field label="Telefono"><input value={clientForm.contactPhone} onChange={(event) => setClientForm({ ...clientForm, contactPhone: event.target.value })} className={inputClassName} /></Field>
          <div className="md:col-span-2">
            <button type="button" disabled={pending} onClick={submitClient} className={primaryButtonClassName}>
              {pending ? "Guardando..." : "Guardar cliente"}
            </button>
          </div>
        </div>
      ) : null}

      {activeKind === "equipment" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Cliente">
            <select value={equipmentForm.clientId} onChange={(event) => setEquipmentForm({ ...equipmentForm, clientId: event.target.value })} className={inputClassName}>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </Field>
          <Field label="Nombre"><input value={equipmentForm.name} onChange={(event) => setEquipmentForm({ ...equipmentForm, name: event.target.value })} className={inputClassName} /></Field>
          <Field label="Categoria">
            <select value={equipmentForm.category} onChange={(event) => setEquipmentForm({ ...equipmentForm, category: event.target.value })} className={inputClassName}>
              <option value="compressor">Compresor</option>
              <option value="dryer">Secador</option>
              <option value="tank">Deposito</option>
              <option value="filter">Filtro</option>
              <option value="line">Linea</option>
            </select>
          </Field>
          <Field label="Serie"><input value={equipmentForm.serialNumber} onChange={(event) => setEquipmentForm({ ...equipmentForm, serialNumber: event.target.value })} className={inputClassName} /></Field>
          <Field label="Fabricante"><input value={equipmentForm.manufacturer} onChange={(event) => setEquipmentForm({ ...equipmentForm, manufacturer: event.target.value })} className={inputClassName} /></Field>
          <Field label="Modelo"><input value={equipmentForm.model} onChange={(event) => setEquipmentForm({ ...equipmentForm, model: event.target.value })} className={inputClassName} /></Field>
          <Field label="Ubicacion" className="md:col-span-2"><input value={equipmentForm.location} onChange={(event) => setEquipmentForm({ ...equipmentForm, location: event.target.value })} className={inputClassName} /></Field>
          <div className="md:col-span-2">
            <button type="button" disabled={pending} onClick={submitEquipment} className={primaryButtonClassName}>
              {pending ? "Guardando..." : "Guardar equipo"}
            </button>
          </div>
        </div>
      ) : null}

      {activeKind === "work_order" ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Titulo" className="md:col-span-2"><input value={orderForm.title} onChange={(event) => setOrderForm({ ...orderForm, title: event.target.value })} className={inputClassName} /></Field>
          <Field label="Cliente">
            <select value={orderForm.clientId} onChange={(event) => setOrderForm({ ...orderForm, clientId: event.target.value, equipmentId: visibleEquipment[0]?.id ?? "" })} className={inputClassName}>
              {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
            </select>
          </Field>
          <Field label="Equipo">
            <select value={orderForm.equipmentId} onChange={(event) => setOrderForm({ ...orderForm, equipmentId: event.target.value })} className={inputClassName}>
              <option value="">Sin equipo</option>
              {visibleEquipment.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </Field>
          <Field label="Tipo">
            <select value={orderForm.type} onChange={(event) => setOrderForm({ ...orderForm, type: event.target.value })} className={inputClassName}>
              <option value="maintenance">Mantenimiento</option>
              <option value="breakdown">Averia</option>
              <option value="installation">Instalacion</option>
              <option value="commissioning">Puesta en marcha</option>
              <option value="technical_visit">Visita tecnica</option>
            </select>
          </Field>
          <Field label="Prioridad">
            <select value={orderForm.priority} onChange={(event) => setOrderForm({ ...orderForm, priority: event.target.value })} className={inputClassName}>
              <option value="low">Baja</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="critical">Critica</option>
            </select>
          </Field>
          <Field label="Tecnico">
            <select value={orderForm.technicianId} onChange={(event) => setOrderForm({ ...orderForm, technicianId: event.target.value })} className={inputClassName}>
              {technicians.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
          </Field>
          <Field label="Inicio previsto">
            <input type="datetime-local" value={orderForm.plannedStart} onChange={(event) => setOrderForm({ ...orderForm, plannedStart: event.target.value })} className={inputClassName} />
          </Field>
          <Field label="Fin previsto">
            <input type="datetime-local" value={orderForm.plannedEnd} onChange={(event) => setOrderForm({ ...orderForm, plannedEnd: event.target.value })} className={inputClassName} />
          </Field>
          <Field label="Descripcion" className="md:col-span-2">
            <textarea value={orderForm.description} onChange={(event) => setOrderForm({ ...orderForm, description: event.target.value })} rows={5} className={inputClassName} />
          </Field>
          <div className="md:col-span-2">
            <button type="button" disabled={pending} onClick={submitWorkOrder} className={primaryButtonClassName}>
              {pending ? "Guardando..." : "Guardar orden"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-semibold ${active ? "bg-[#1f4b7f] text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"}`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputClassName = "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm";
const primaryButtonClassName = "rounded-xl bg-[#1f4b7f] px-5 py-3 text-sm font-semibold text-white";
