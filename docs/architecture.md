# Arquitectura inicial

## Decisiones implementadas

- Frontend único en Next.js App Router con shell de backoffice y PWA.
- UI basada en componentes reutilizables y datos demo tipados.
- Formularios validados con Zod antes de tocar persistencia.
- Base offline con Dexie para snapshots, cola de sync y adjuntos pendientes.
- PDF server-side con `@react-pdf/renderer`.
- Supabase reservado como backend principal para Auth, Postgres, RLS y Storage.

## Dominios

- `iam`: roles, perfiles y reglas de acceso.
- `crm`: empresas, centros y contactos.
- `assets`: equipos instalados y tipologías.
- `ops`: órdenes, asignaciones, logs, horas y materiales.
- `compliance`: legalizaciones, revisiones y vencimientos.
- `reporting`: KPI y cuadros de mando.
- `integration`: exportes ERP y jobs auxiliares.

## Estado actual

- Navegación y vistas iniciales: listo.
- Contratos TypeScript y validación base: listo.
- Esquema SQL y seed inicial: listo.
- Persistencia real Supabase: pendiente.
- Auth real y RLS efectiva en app: pendiente.
- Offline binario completo y replay contra backend: pendiente.
