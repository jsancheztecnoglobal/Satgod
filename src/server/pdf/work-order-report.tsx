import React from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";

import type { WorkOrderDetail } from "@/lib/data/contracts";

const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
  },
  subtitle: {
    marginTop: 4,
    color: "#475569",
  },
  section: {
    marginBottom: 16,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f8fafc",
  },
  sectionTitle: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: 700,
    color: "#0f766e",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 4,
  },
  cellLabel: {
    color: "#475569",
  },
  cellValue: {
    fontWeight: 600,
  },
  bullet: {
    marginBottom: 4,
  },
});

function WorkOrderPdfDocument({ workOrder }: { workOrder: WorkOrderDetail }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Parte de trabajo Tecnoglobal</Text>
          <Text style={styles.subtitle}>
            {workOrder.number} - {workOrder.title}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos principales</Text>
          <View style={styles.row}>
            <Text style={styles.cellLabel}>Cliente</Text>
            <Text style={styles.cellValue}>{workOrder.clientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cellLabel}>Equipo</Text>
            <Text style={styles.cellValue}>{workOrder.equipmentLabel ?? "Sin equipo"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cellLabel}>Tipo</Text>
            <Text style={styles.cellValue}>{workOrder.type}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cellLabel}>Estado</Text>
            <Text style={styles.cellValue}>{workOrder.status}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Descripcion tecnica</Text>
          <Text>{workOrder.description}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Checklist</Text>
          {workOrder.checklist.map((item) => (
            <Text key={item.id} style={styles.bullet}>
              - {item.label}: {item.done ? "OK" : "Pendiente"}
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Materiales y tiempos</Text>
          {workOrder.materials.map((item) => (
            <Text key={item.id} style={styles.bullet}>
              - {item.name} ({item.quantity} {item.unit})
            </Text>
          ))}
          {workOrder.laborEntries.map((entry) => (
            <Text key={entry.id} style={styles.bullet}>
              - {entry.technician}: {entry.minutes} min ({entry.laborType})
            </Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conformidad</Text>
          <Text>Firma cliente: pendiente de captura en la aplicacion</Text>
          <Text>Tecnicos: {workOrder.assignedTechnicianIds.join(", ") || "Sin asignar"}</Text>
        </View>
      </Page>
    </Document>
  );
}

export async function renderWorkOrderPdf(workOrder: WorkOrderDetail) {
  return renderToBuffer(<WorkOrderPdfDocument workOrder={workOrder} />);
}
