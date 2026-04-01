# Plan Maestro de Producto y Arquitectura — Tecnoglobal FSM / SAT / GMAO

## Resumen
Proyecto greenfield para una plataforma interna de gestión integral de servicios técnicos de aire comprimido industrial, con backoffice web y app PWA móvil para técnicos. El diseño se fija con estos criterios ya cerrados: sin migración inicial, integración ERP por exportación manual en primeras fases, módulo legal España-first orientado al Reglamento de Equipos a Presión, firma de cliente como aceptación operativa y soporte offline robusto para el flujo principal del técnico.

## SECCIÓN A — Resumen ejecutivo
- Se construirá una plataforma FSM/SAT/GMAO específica para Tecnoglobal que unifique clientes, centros, activos, órdenes de trabajo, planificación, partes, documentación, legalizaciones y KPI.
- Responde a problemas típicos del SAT actual: mala trazabilidad, fricción entre oficina y campo, dificultad para planificar, duplicidad documental, cierres lentos y poca capacidad de escalar sin perder control.
- Usuarios principales: oficina/planificación, ingenieros, técnicos de campo, comerciales, administración/gerencia y administrador del sistema.
- Tiene sentido para Tecnoglobal porque el negocio depende de coordinar 8 técnicos con una sola función de planificación, mantener histórico técnico por equipo y controlar vencimientos/documentación de instalaciones industriales con criterio operativo y regulatorio.

## SECCIÓN B — Principios de diseño del sistema
- Simplicidad operativa: cada rol ve solo lo necesario para hacer su trabajo rápido.
- Mobile-first real para técnico: navegación mínima, una mano, lectura rápida, acciones grandes y tolerancia a mala cobertura.
- Trazabilidad total: cada OT, cambio de estado, firma, foto, documento y vencimiento deja rastro auditable.
- Offline-safe: el técnico puede seguir trabajando sin red; la sincronización es explícita, visible e idempotente.
- Planificación eficaz: el planner prioriza día/semana por técnico, carga, conflicto y reprogramación rápida.
- Modularidad: CRM, activos, operaciones, compliance, reporting e IAM separados a nivel funcional y técnico.
- Escalabilidad: modelo preparado para más técnicos, delegaciones, nuevos tipos de activo y futuras integraciones.
- Seguridad y mantenibilidad: RLS por defecto, contratos de datos tipados, migraciones SQL versionadas y lógica crítica del lado servidor.
- UX clara para perfiles no técnicos: lenguaje operativo, estados consistentes, formularios cortos y ayudas contextuales.

## SECCIÓN C — Roles y permisos
- Administrador: ve todo; crea usuarios, roles, catálogos, plantillas y parámetros; edita cualquier entidad; aprueba acciones críticas y reconfigura seguridad; restricción: no usar claves privilegiadas desde cliente ni operar fuera de flujos auditados.
- Oficina / planificación: ve clientes, centros, activos, OT, agenda, compliance y documentos; crea clientes, centros, contactos, OT y asignaciones; edita planificación, datos operativos y cierre administrativo; puede cerrar a “facturable”; restricción: no cambia políticas, roles ni costes maestros sensibles.
- Ingeniero: ve todo lo operativo y técnico; crea OT técnicas, planes de mantenimiento, criterios y revisiones; edita diagnóstico, alcance, criticidad, activos y compliance técnico; aprueba cierres técnicos, reaperturas y legalizaciones; restricción: no administra IAM ni parámetros globales no técnicos.
- Comercial: ve clientes, centros, contactos, activos instalados, histórico resumido y estado comercial de solicitudes; crea solicitudes de visita, oportunidades y OT tipo presupuesto técnico; edita contactos y notas comerciales; restricción: no planifica técnicos, no cierra OT y no ve costes internos detallados salvo permiso explícito.
- Técnico: ve solo agenda asignada, detalle del cliente/centro, activos vinculados, documentos necesarios, sus notificaciones y sus propios registros; crea checklists, horas, materiales, observaciones, fotos, firma e incidencias de trabajo; edita sus apuntes mientras la OT está abierta; puede dejar la OT en “pendiente firma”, “pendiente material” o “pendiente revisión oficina”; restricción: no toca maestro de clientes, precios, planificación global, estados facturables ni legalizaciones administrativas.
- Gerencia / lectura: ve dashboards, OT, clientes, activos, compliance, trazabilidad y rentabilidad agregada; exporta informes; restricción: no crea ni modifica operaciones salvo comentarios internos o validaciones configuradas.

## SECCIÓN D — Módulos funcionales
- CRM / Clientes: empresas, centros, contactos, direcciones, facturación, horarios, accesos, observaciones operativas, responsables y segmentación comercial mínima; debe detectar duplicados por CIF/nombre/dirección.
- Activos / Equipos instalados: ficha por equipo con jerarquía opcional padre-hijo, serial, fabricante, modelo, año, puesta en marcha, atributos técnicos, documentación, histórico, próximos vencimientos y relación con OTs.
- Órdenes de trabajo: tipologías definidas por negocio; prioridad, criticidad, SLA interno, origen, técnico responsable, activo principal, checklist, tiempos planificados/reales y máquina de estados controlada.
- Estados OT recomendados: borrador, pendiente de asignar, planificada, en curso, pausada, pendiente de material, pendiente de firma, pendiente de revisión oficina, cerrada, facturable, facturada, cancelada y reabierta bajo permiso.
- Planificación / agenda: vista día y semana por técnico, tablero por carga, drag and drop, filtros por zona/tipo/prioridad, alertas de solape, huecos, sobrecarga y trabajos no cerrados del día anterior.
- App del técnico: login, agenda, detalle OT, cliente, mapa, activos, checklist, horas, materiales, observaciones, fotos, firma, cierre parcial/final, cola offline, estado de sincronización y aviso de conflictos.
- Partes de trabajo: parte digital normalizado, incidencias, materiales, horas, desplazamientos, firma, PDF, envío por correo opcional, histórico por cliente y activo y trazabilidad de quién cerró qué y cuándo.
- Materiales / consumibles: catálogo, uso por OT, snapshots de coste, preparación para stock de furgoneta en v2 y trazabilidad por técnico/equipo.
- Legalizaciones / revisiones / vencimientos: control documental, expedientes, certificados, fechas de emisión y vencimiento, periodicidades, alertas, responsable, estado administrativo y relación directa con el activo.
- Informes / KPI: productividad, backlog, tiempo de ciclo, repetitividad de averías, first-time-fix, cumplimiento preventivo, cumplimiento de vencimientos, consumo de materiales, coste estimado y panel ejecutivo.

## SECCIÓN E — Flujos operativos reales
1. Alta de cliente y centro: actor oficina o comercial; crea empresa, centro y contactos; valida duplicados, dirección y datos fiscales; bloquea si falta centro operativo; automatiza geocodificación, contacto principal y checklist de alta.
2. Alta de equipo: actor oficina o ingeniero; crea activo con tipo, serial y atributos; valida serial único cuando exista, centro obligatorio y tipo de activo; bloquea si no hay centro; automatiza próximos vencimientos base y carpeta documental.
3. Creación de orden: actor oficina, ingeniero o comercial según tipo; genera OT con cliente, centro, activo, prioridad y descripción; valida tipo/estado inicial/datos mínimos; bloquea si falta centro o responsable; automatiza numeración y SLA interno.
4. Asignación por oficina: actor oficina; asigna técnico y ventana horaria; modifica `work_order_assignments` y estado a planificada; valida solapes, jornada y zona; bloquea si técnico no disponible; automatiza alertas de conflicto.
5. Ejecución por técnico: actor técnico; inicia OT, registra tiempos, materiales, observaciones, fotos y checklist; valida horas coherentes, materiales positivos y campos obligatorios por tipo de OT; bloquea cierre si faltan datos mínimos; automatiza guardado offline y timestamps.
6. Cierre y firma: actor técnico y cliente; captura resumen y firma; crea `signatures`, adjuntos y parte base; valida firmante y cierre mínimo; bloquea “cerrada” si falta firma cuando sea obligatoria; automatiza PDF preliminar.
7. Revisión en oficina: actor oficina o ingeniero; revisa coherencia, estado final y documentación; edita mínimos administrativos; valida materiales, horas y clasificación final; bloquea facturable si faltan anexos; automatiza correo al cliente si aplica.
8. Facturación o traspaso a ERP: actor administración/oficina; marca OT facturable, exporta lote o genera fichero; valida cliente facturable y conceptos; bloquea si OT no cerrada; automatiza lote de exportación y sello de envío.
9. Seguimiento histórico: actor cualquier rol con permiso; consulta histórico por cliente, centro, activo o serial; valida acceso por rol; bloquea técnicos fuera de sus OTs; automatiza enlaces cruzados entre activo, OT, parte y documento.
10. Flujo de legalización o revisión periódica: actor ingeniero/oficina; crea `compliance_record`, adjunta expediente, genera OT asociada y controla vencimiento; valida periodicidad, tipo de registro y documentación crítica; bloquea cierre administrativo si falta certificado; automatiza alertas previas y creación de OT preventiva.

## SECCIÓN F — Arquitectura técnica
- Arquitectura general: `Next.js App Router + React + TypeScript + Tailwind` como única aplicación web/PWA; `Supabase` para Auth, Postgres, Storage y funciones server-side auxiliares; despliegue principal en `Vercel`.
- Frontend: Server Components para lectura inicial en backoffice, Client Components donde haya interacción rica, diseño basado en tokens y componentes accesibles; `React Hook Form + Zod 4` para formularios; `TanStack Table + TanStack Virtual` para listados complejos.
- Estado cliente: `TanStack Query` para server-state; estado de filtros en URL; estado local/UI con React; evitar stores globales salvo necesidades concretas del planner.
- Planificación / calendario: recomendación final por vuestra preferencia: planner open source hecho a medida con grid temporal + `dnd-kit` + `date-fns`, porque encaja mejor con un SAT de recursos por técnico y evita dependencia temprana de licencias cerradas.
- Aplicación móvil: misma app responsive/PWA, con shell instalable, cámara, firma, banners de conectividad y layouts específicos para 360–430 px.
- Offline y sincronización: `Dexie` como base local operativa para agenda asignada, OT, borradores, adjuntos pendientes y cola de comandos; `TanStack Query persistQueryClient` en IndexedDB para cache; la cola propia de la app es la fuente de verdad y `Workbox Background Sync` se usa como acelerador cuando el navegador lo soporte.
- Qué corre en cliente: render, validación ligera, cache, cola offline, compresión de imagen, captura de firma, merges optimistas y resolución visual de conflictos.
- Qué corre en servidor: generación PDF, correo, validaciones críticas finales, funciones privilegiadas, reglas de cierre, exportes ERP, snapshots KPI y recordatorios.
- Qué resuelve Supabase: Auth, Postgres, RLS, Storage privado, Realtime puntual, SQL/RPC, cron programado y auditoría de base.
- Qué conviene desarrollar como funciones server-side: `mobile_bootstrap`, `sync_batch`, `generate_work_report_pdf`, `send_work_report_email`, `planner_conflicts`, `compliance_due_digest`, `erp_export_batch`.
- PDF: `@react-pdf/renderer` desde Route Handler o función Node del lado servidor para obtener PDFs consistentes sin depender de un navegador headless.
- Imágenes y adjuntos: subida diferida a Storage con buckets privados, checksum, compresión en cliente, thumbnails opcionales y metadatos en `attachments`.
- Logs y auditoría: triggers SQL a `audit_logs`, request id por operación, actor, before/after JSON, origen `web/mobile/offline_sync`.
- Notificaciones: in-app siempre; email para OT cerrada, vencimientos y recordatorios; push web solo como mejora posterior.
- Backups y observabilidad: Supabase con PITR/backup gestionado, export periódico de configuración crítica, logs de función y observabilidad en Vercel; Sentry o equivalente recomendado para errores de frontend y sync.
- Separación por dominios: `iam`, `crm`, `assets`, `ops`, `compliance`, `reporting`, `integration`.
- Contratos públicos internos recomendados: `WorkOrderSummary`, `WorkOrderDetail`, `SyncCommand`, `SyncAck`, `ComplianceDueItem`, `WorkReportPdfPayload`, `PlannerAssignmentInput`.

## SECCIÓN G — Modelo de datos
- Convención transversal: todas las tablas operativas tendrán `id uuid`, `created_at`, `created_by`, `updated_at`, `updated_by`, `deleted_at`, `deleted_by`, `source`, `version`; soft delete en maestros y documentos; índices parciales para filas activas.
- `users` (`auth.users`): identidad y acceso; campos email, phone, last_sign_in_at, disabled; relación 1:1 con `user_profiles`; PK `id`; índice por email; auditoría vía Auth.
- `roles`: catálogo de roles; campos `code`, `name`, `description`, `is_system`; relación 1:N con `user_profiles`; PK `id`, unique `code`; auditoría básica.
- `user_profiles`: perfil de usuario; campos `user_id`, `role_id`, `full_name`, `mobile`, `department`, `active`, `default_view`; relación con `users` y `roles`; unique `user_id`; índices por `role_id`, `active`; auditoría de cambios de rol.
- `companies`: cliente empresa; campos `legal_name`, `trade_name`, `tax_id`, `billing_email`, `billing_terms`, `service_notes`, `status`; relación con `company_sites`, `contacts`, `assets`, `work_orders`; índices por `tax_id`, nombre y estado; auditoría de alta/bloqueo.
- `company_sites`: centro de trabajo; campos `company_id`, `code`, `name`, `address`, `city`, `province`, `postal_code`, `lat`, `lng`, `access_notes`, `hours_notes`; relación con `companies`, `assets`, `work_orders`; unique `(company_id, code)`; índices por `company_id`, geolocalización; auditoría de geocodificación.
- `contacts`: contactos operativos y administrativos; campos `company_id`, `site_id`, `name`, `role`, `phone`, `email`, `is_primary`, `contact_type`; relación con empresa y centro; índices por `company_id`, `site_id`; auditoría de consentimiento y cambios.
- `asset_types`: tipologías; campos `code`, `name`, `family`, `default_attributes_schema_jsonb`, `requires_compliance`, `default_checklist_jsonb`; relación con `assets` y `maintenance_plans`; unique `code`; índices por `family`; auditoría básica.
- `assets`: equipos instalados; campos `site_id`, `asset_type_id`, `serial_number`, `manufacturer`, `model`, `year`, `commissioned_on`, `status`, `parent_asset_id`, `attributes_jsonb`, `criticality`, `compliance_category`; relación con centro, tipo, OT, documentos y compliance; índices por `site_id`, `asset_type_id`, `serial_number`, `status`; auditoría de puesta en marcha/baja.
- `work_orders`: OT; campos `number`, `type`, `priority`, `status`, `company_id`, `site_id`, `primary_asset_id`, `requester_contact_id`, `title`, `description`, `diagnosis`, `planned_start`, `planned_end`, `actual_start`, `actual_end`, `engineer_owner_id`, `billing_status`; relación con casi todo el dominio operativo; índices por `(status, planned_start)`, `company_id`, `site_id`, `primary_asset_id`, `type`, `billing_status`; auditoría de cambios de estado y cierre.
- `work_order_status_history`: histórico de estados; campos `work_order_id`, `from_status`, `to_status`, `changed_by`, `reason`, `changed_at`; relación N:1 con OT; índice por `(work_order_id, changed_at)`; auditoría inmutable.
- `work_order_assignments`: asignaciones; campos `work_order_id`, `user_id`, `role_in_job`, `scheduled_start`, `scheduled_end`, `is_primary`, `assignment_status`; relación con OT y usuarios; índices por `(user_id, scheduled_start)` y `(work_order_id, is_primary)`; auditoría de reasignación.
- `work_logs`: bitácora; campos `work_order_id`, `log_type`, `body`, `visibility`, `device_created_at`, `geo_lat`, `geo_lng`; relación con OT; índices por `(work_order_id, created_at)`; auditoría de origen móvil/offline.
- `labor_entries`: horas; campos `work_order_id`, `user_id`, `labor_type`, `started_at`, `ended_at`, `minutes`, `overtime`, `billable`, `cost_rate_snapshot`; relación con OT y usuario; índices por `(user_id, started_at)` y `work_order_id`; auditoría de aprobación.
- `material_catalog`: catálogo; campos `sku`, `name`, `unit`, `family`, `default_cost`, `default_price`, `active`; relación con `material_usage`; unique `sku`; índices por nombre/familia; auditoría de coste.
- `material_usage`: consumo; campos `work_order_id`, `material_id`, `user_id`, `quantity`, `unit_cost_snapshot`, `source_stock_type`, `notes`; relación con OT, catálogo y usuario; índices por `work_order_id`, `material_id`; auditoría de entrada y revisión.
- `attachments`: metadatos de ficheros; campos `entity_type`, `entity_id`, `bucket`, `path`, `file_kind`, `mime_type`, `size_bytes`, `checksum_sha256`, `captured_at`, `captured_by`, `upload_status`; relación polimórfica; índice unique `(bucket, path)` y por `(entity_type, entity_id)`; auditoría de dispositivo y sincronización.
- `signatures`: firma de aceptación; campos `work_order_id`, `signer_name`, `signer_role`, `signed_at`, `strokes_json`, `image_path`, `hash_sha256`, `consent_text_version`, `device_meta_jsonb`; relación 1:N controlada con OT; índice por `work_order_id`; auditoría reforzada.
- `compliance_records`: legalizaciones y revisiones; campos `asset_id`, `regulation_code`, `record_type`, `authority`, `certificate_number`, `issue_date`, `due_date`, `status`, `responsible_user_id`, `document_attachment_id`, `recurrence_rule`, `last_completed_on`, `next_due_on`; relación con activo y adjuntos; índices por `(asset_id, due_date)`, `status`, `regulation_code`; auditoría de validación/cierre.
- `maintenance_plans`: preventivos; campos `asset_id`, `asset_type_id`, `cadence_type`, `cadence_value`, `estimated_minutes`, `auto_generate_window_days`, `checklist_template_jsonb`, `active`; relación con activo/tipo y generación de OT; índices por `asset_id`, `asset_type_id`, `active`; auditoría de última generación.
- `notifications`: bandeja y envíos; campos `user_id`, `channel`, `topic`, `payload_jsonb`, `sent_at`, `read_at`, `status`, `dedupe_key`; relación con usuario; índices por `(user_id, read_at)` y `status`; auditoría de reintentos.
- `audit_logs`: auditoría inmutable; campos `entity_type`, `entity_id`, `action`, `actor_user_id`, `request_id`, `before_jsonb`, `after_jsonb`, `reason`, `occurred_at`, `source_ip`, `user_agent`; índices por entidad, actor y fecha; es el núcleo de trazabilidad.
- Extensiones recomendadas desde el diseño aunque no sean MVP estricto: `checklist_templates`, `checklist_instances`, `erp_export_batches`, `kpi_snapshots`, `device_registrations`.

## SECCIÓN H — Seguridad y permisos
- Autenticación: Supabase Auth con email/password corporativo; MFA obligatoria para administrador y recomendable para ingeniería/oficina; recuperación controlada.
- Autorización: RLS activada por defecto en todas las tablas operativas; políticas basadas en `auth.uid()` y funciones seguras que consulten `user_profiles` y `work_order_assignments`.
- Regla principal de técnico: solo puede leer/escribir sobre OTs asignadas activas y entidades relacionadas a esas OTs.
- Regla principal de oficina/ingeniería: acceso global a operación según rol; acciones críticas diferenciadas por permiso adicional.
- Storage: buckets privados con rutas por entidad, ejemplo `work-orders/{work_order_id}/...`; políticas sobre `storage.objects` alineadas con rol y relación de la entidad.
- Protección documental: PDFs, fotos y certificados no serán públicos; acceso siempre firmado o mediado por servidor.
- Borrado lógico: maestros, OT y documentos quedan desactivados o archivados; hard delete solo por política de retención y proceso administrativo.
- Recuperación ante errores: reapertura controlada de OT, restauración por backup/PITR, versionado de adjuntos críticos y marcas de conflicto de sync.
- Acciones críticas protegidas: cambio de rol, reapertura de OT cerrada, cambio a facturable/facturada, anulación de cumplimiento legal, borrado de adjuntos y modificación post-firma; todas con motivo obligatorio y auditoría.
- Rendimiento RLS: indexar todas las columnas usadas en políticas, especialmente `user_id`, `work_order_id`, `company_id`, `site_id`, `status`.

## SECCIÓN I — UX/UI
- Panel de oficina: KPIs arriba, agenda del día, conflictos, OTs urgentes, vencimientos próximos y bloqueos administrativos.
- Calendario/planner: vista por técnico y por día/semana, drag and drop, colores por estado/tipo, chips de prioridad, alertas de solape y huecos.
- Formularios: autosave de borradores, secciones cortas, defaults por tipo de OT y por tipo de activo, selectores rápidos y búsqueda omnibox.
- Móvil técnico: home con agenda de hoy, acceso a “en curso”, “pendientes de sync” y “terminadas”; botones grandes, contraste alto, cámara y firma en primer plano.
- Navegación: máximo tres niveles en móvil; uso de drawers y tabs en escritorio; breadcrumbs claros en backoffice.
- Estilo visual: SaaS industrial moderno, limpio, sobrio, con modo oscuro opcional y paleta semántica consistente.
- Estados y colores: azul planificada, verde cerrada, ámbar pendiente, rojo urgente/bloqueada, gris cancelada; siempre acompañados de texto.
- Pantallas clave: dashboard oficina, listado clientes, ficha cliente, ficha equipo, tablero OT, planner de planificación, detalle OT móvil, formulario parte, pantalla de firma, panel KPI.
- Mejora recomendada: mostrar siempre “estado de sincronización” por OT y por dispositivo para reducir incertidumbre operativa.

## SECCIÓN J — Roadmap de desarrollo
- Fase 0 — descubrimiento funcional: objetivo cerrar procesos, estados, campos, roles y wireframes; dependencias ninguna; entregables mapa de dominios, diccionario, estados OT y criterios de aceptación; aceptación: dirección y operación validan el flujo de punta a punta.
- Fase 1 — base técnica y autenticación: objetivo levantar repo, CI/CD, Supabase, Auth, roles, shell UI y RLS base; dependencias F0; entregables proyecto desplegado, login por rol, seed de catálogos, layout principal; aceptación: cada rol entra y solo ve su área.
- Fase 2 — clientes + equipos: objetivo disponer del maestro operativo; dependencias F1; entregables CRM, centros, contactos, tipos de activo, activos y adjuntos; aceptación: oficina crea cliente-centro-equipo y consulta histórico vacío inicial.
- Fase 3 — órdenes de trabajo + planificación: objetivo operar y planificar; dependencias F2; entregables OT, estados, asignaciones, planner día/semana y reglas de conflicto; aceptación: oficina crea, asigna y reprograma una OT completa.
- Fase 4 — app técnico + partes + firma: objetivo ejecutar en campo; dependencias F3; entregables PWA, offline core, horas, materiales, fotos, firma y PDF; aceptación: técnico completa una OT sin cobertura y sincroniza después.
- Fase 5 — legalizaciones + vencimientos: objetivo controlar cumplimiento; dependencias F2 y F3; entregables compliance records, alertas, dashboards y OTs generadas desde vencimiento; aceptación: oficina ve próximos vencimientos y abre trabajo asociado.
- Fase 6 — informes y KPI: objetivo aportar control de gestión; dependencias F3–F5; entregables paneles, vistas materializadas/snapshots y exportes; aceptación: gerencia consulta métricas fiables por técnico, cliente y periodo.
- Fase 7 — endurecimiento, seguridad, despliegue y mantenimiento: objetivo pasar a operación estable; dependencias todas; entregables pruebas, observabilidad, backups, runbooks, documentación y formación; aceptación: UAT superada y checklist de producción en verde.

## SECCIÓN K — Definición del MVP
- Entra en MVP: autenticación y roles, clientes/centros/contactos, activos, OT con flujo principal, planner por técnico día/semana, PWA técnico, horas/materiales/fotos/firma, PDF, offline robusto core, compliance de vencimientos y panel básico de operación.
- No entra en MVP: ERP en tiempo real, stock completo, compras, portal cliente, optimización automática de rutas, contratos complejos, pipeline comercial avanzado, push nativo y analítica avanzada financiera.
- Queda para v2: stock de furgoneta, integración ERP bidireccional, SLAs avanzados, presupuestos completos, plantillas dinámicas de checklist, portal cliente, IoT/telemetría y reporting predictivo.
- Impacto: este MVP ya sustituye trabajo real diario de oficina y técnicos, reduce llamadas y papeles, mejora trazabilidad y habilita cumplimiento y facturación más ordenada.

## SECCIÓN L — Riesgos y decisiones clave
- Exceso de alcance; mitigación: congelar MVP por outcomes operativos y pasar todo lo no esencial a v2.
- Mala definición inicial de flujos; mitigación: talleres por proceso con oficina, ingeniería y un técnico de referencia antes de modelar.
- Complejidad offline; mitigación: limitar offline robusto al flujo core, diseñar cola idempotente y probar en iOS/Android desde Fase 4 temprana.
- Resistencia al cambio; mitigación: piloto con 2 técnicos + oficina, formación corta y feedback semanal.
- Mala calidad de datos; mitigación: alta guiada, duplicados, campos obligatorios mínimos y revisiones semanales de maestro.
- Sobrecarga de formularios; mitigación: progressive disclosure, defaults por tipo de OT/activo y checklists resumidos.
- Dependencias futuras con ERP; mitigación: definir ya un contrato estable de exportación y un identificador externo por OT.
- Crecimiento de requisitos; mitigación: arquitectura por dominios, ADRs y backlog gobernado por impacto real.
- Cambios regulatorios; mitigación: módulo compliance parametrizable porque el REP aprobado por RD 809/2021 fue modificado el 2 de septiembre de 2025 por RD 770/2025.
- Riesgo de falsa seguridad con firma; mitigación: documentar que la firma del MVP es evidencia operativa de aceptación, no firma electrónica cualificada.

## SECCIÓN M — Recomendaciones de implementación con IA
- Trabajar schema-first: SQL y estados antes que pantallas; luego tipos TypeScript; después validaciones Zod; por último UI y tests.
- Dividir para Codex en slices pequeños y verificables: IAM, CRM, activos, OT, planner, offline/sync, parte/PDF, compliance, KPI.
- Definir contratos antes de programar: nombres de estados, payloads de sync, DTOs y políticas RLS.
- Construir feature by feature verticalmente, no capa por capa sin cerrar: datos + lógica + UI + test de aceptación en cada módulo.
- Obligar a que cada prompt incluya alcance, no-alcance, archivos afectados, criterios de aceptación y casos de prueba.
- Validar cada módulo con demo data realista de Tecnoglobal: compresores, secadores, depósitos, filtros y centros industriales.
- Evitar deuda por prompts vagos: no pedir “haz el módulo X”; pedir “implementa flujo Y con estas tablas, estados y tests”.
- Documentar para futuro: ADRs, catálogo de estados, diagrama de dominio, README por módulo, convención de rutas y políticas RLS comentadas.
- Mantener un backlog de bugs y decisiones separando claramente “deuda técnica”, “mejora UX” y “alcance nuevo”.

## SECCIÓN N — Entregables técnicos que debe producir el siguiente paso
- Schema SQL inicial con migraciones versionadas.
- Tipos TypeScript generados desde Supabase.
- Mapa de rutas web/PWA y endpoints internos.
- Estructura de carpetas por dominios.
- Wireframes de escritorio y móvil para pantallas clave.
- Backlog técnico priorizado por fases.
- Historias de usuario con criterios de aceptación.
- Políticas RLS iniciales y funciones helper de autorización.
- Componentes base de diseño: tablas, badges, formularios, drawer, timeline, planner card, file uploader.
- Módulos MVP scaffolded: auth, CRM, activos, OT, planner, app técnico, parte/PDF, compliance base.
- Datos seed de demo y matriz de pruebas E2E del flujo principal.

## Supuestos y defaults cerrados
- Arranque greenfield total; no se migra nada al inicio.
- Aplicación interna, sin portal cliente en MVP.
- Integración ERP por exportación manual en primeras fases.
- Planner open source construido a medida.
- Offline robusto para técnico en el flujo principal.
- Firma de cliente como aceptación operativa.
- Cumplimiento España-first orientado a REP y documentación asociada.
- Una única empresa operadora en la primera versión; sin multi-tenant real.

## Referencias externas utilizadas
- Next.js App Router: https://nextjs.org/docs/app
- Next.js Route Handlers: https://nextjs.org/docs/app/getting-started/route-handlers-and-middleware
- Next.js PWA guide: https://nextjs.org/docs/app/guides/progressive-web-apps
- Supabase Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase Storage access control: https://supabase.com/docs/guides/storage/security/access-control
- Supabase Background Tasks: https://supabase.com/docs/guides/functions/background-tasks
- TanStack Query offline/persist: https://tanstack.com/query/latest/docs/framework/react/plugins/persistQueryClient/
- Dexie React y persistencia local: https://dexie.org/docs/Tutorial/React
- Dexie StorageManager: https://dexie.org/docs/StorageManager
- Workbox Background Sync: https://developer.chrome.com/docs/workbox/modules/workbox-background-sync
- Vercel para Next.js: https://vercel.com/docs/frameworks/nextjs
- Reglamento de Equipos a Presión RD 809/2021: https://www.boe.es/buscar/act.php?id=BOE-A-2021-16407
- Modificación REP RD 770/2025: https://www.boe.es/buscar/doc.php?id=BOE-A-2025-17507

## Resumen de arquitectura recomendada
- Frontend único en `Next.js App Router` con `React + TypeScript + Tailwind`, diseño responsive/PWA y componentes accesibles.
- Backend principal en `Supabase`: `PostgreSQL + Auth + RLS + Storage`, con funciones server-side para PDF, email, sincronización y jobs.
- Offline robusto con `Dexie + TanStack Query persist + cola propia de sync`; `Workbox` solo como mejora de replay, no como dependencia única.
- Planner open source a medida con `dnd-kit` y `date-fns`; tablas con `TanStack Table`; formularios con `React Hook Form + Zod`.
- Despliegue en `Vercel` y datos en región UE; observabilidad, auditoría y backups activados desde el primer día.

## MVP recomendado en 90 días
- Días 1–15: Fase 0 y Fase 1; procesos cerrados, modelo de dominio, auth, roles, RLS base y shell de aplicación.
- Días 16–35: Fase 2; clientes, centros, contactos, activos y adjuntos básicos.
- Días 36–55: Fase 3; OT, estado, asignación, planner día/semana y conflictos.
- Días 56–80: Fase 4; PWA técnico, offline core, horas, materiales, fotos, firma y PDF.
- Días 81–90: hardening MVP; compliance básico de vencimientos, dashboard operativo, UAT, formación y salida controlada a piloto.

## Backlog inicial priorizado
1. Definir estados OT, reglas de transición y catálogo de tipos/prioridades.
2. Diseñar schema SQL inicial y helpers de autorización/RLS.
3. Configurar Supabase, Vercel, CI/CD, entornos y seeds.
4. Implementar autenticación, perfiles, roles y navegación por permisos.
5. Implementar CRM de clientes, centros y contactos.
6. Implementar activos y documentos asociados.
7. Implementar OT y asignaciones.
8. Implementar planner operativo día/semana por técnico.
9. Implementar PWA técnico con bootstrap offline.
10. Implementar parte de trabajo, firma y PDF.
11. Implementar sincronización robusta e idempotente.
12. Implementar compliance records y alertas.
13. Implementar dashboard operativo y KPI mínimos.
14. Endurecer seguridad, auditoría, backups y pruebas E2E.

## Siguientes prompts exactos para Codex
1. Prompt para diseñar base de datos  
```text
Actúa como arquitecto backend senior especializado en FSM/SAT industrial. En este repo greenfield genera el schema SQL inicial para una app de Tecnoglobal con Supabase/PostgreSQL. Debes crear migraciones para roles, user_profiles, companies, company_sites, contacts, asset_types, assets, work_orders, work_order_status_history, work_order_assignments, work_logs, labor_entries, material_catalog, material_usage, attachments, signatures, compliance_records, maintenance_plans, notifications y audit_logs. Usa UUID, timestamps de auditoría, soft delete, índices pensados para RLS y planificación, y prepara enums/tablas catálogo para tipos de OT, prioridades y estados. No implementes todavía integraciones ERP ni stock completo. Añade comentarios SQL y un README corto explicando el modelo.
```

2. Prompt para autenticación y permisos  
```text
Implementa autenticación y autorización base para la app Tecnoglobal con Next.js + Supabase Auth. Necesito login, logout, guards por rol, user_profiles enlazado a auth.users, middleware/routing protegido y políticas RLS iniciales para admin, office_planner, engineer, sales, technician y management_readonly. Los técnicos solo pueden ver OTs asignadas y entidades relacionadas. Añade funciones SQL helper para autorización, seeds de roles y una página interna de prueba para verificar permisos por rol.
```

3. Prompt para generar el frontend de oficina  
```text
Construye el shell del backoffice web de Tecnoglobal con Next.js App Router, TypeScript y Tailwind. Quiero layout profesional SaaS industrial, navegación lateral, top bar, dashboard de oficina, listado de clientes, ficha cliente, listado de activos, tablero de órdenes y placeholders reales conectados a tipos. Usa TanStack Table para listados, filtros en URL y componentes reutilizables. No inventes lógica compleja todavía: prioriza estructura, rutas, UX clara y componentes listos para conectar con Supabase.
```

4. Prompt para órdenes de trabajo y planificación  
```text
Implementa el módulo de órdenes de trabajo y planificación para Tecnoglobal. Necesito crear OT, editarla, cambiar estado con reglas de transición, asignar técnico y mostrar un planner día/semana por técnico. El planner debe ser open source/custom con dnd-kit y date-fns, mostrar conflictos de solape y permitir reprogramación drag and drop. Incluye tipos TypeScript, validación Zod, hooks de datos, vistas de oficina y pruebas de los cambios de estado clave.
```

5. Prompt para generar la app móvil del técnico  
```text
Construye la experiencia móvil/PWA del técnico para Tecnoglobal. Debe incluir login, agenda de hoy/semana, detalle OT, cliente, activos relacionados, checklist básico, registro de horas, materiales, observaciones, fotos, firma y cierre parcial/final. Diseña para móvil real, con botones grandes, navegación mínima y estado visible de conectividad/sincronización. Prepara la estructura offline con Dexie y una cola local de cambios, aunque inicialmente dejes algunos handlers como TODO bien documentados.
```

6. Prompt para partes de trabajo y PDF  
```text
Implementa el flujo de parte de trabajo digital para Tecnoglobal. A partir de una OT, el técnico debe poder registrar horas, materiales, observaciones, incidencias, fotos y firma del cliente. Después genera un PDF profesional del parte usando una solución mantenible server-side y guarda el documento en Supabase Storage con su metadata. Añade pantalla de firma, payload tipado, plantilla PDF y test del flujo de generación.
```

7. Prompt para módulo de legalizaciones  
```text
Desarrolla el módulo base de legalizaciones/revisiones para Tecnoglobal, orientado a España y al Reglamento de Equipos a Presión. Necesito compliance_records vinculados a activos, control de fechas de emisión/vencimiento, estado administrativo, adjuntos y alertas. Debe existir listado de vencimientos, ficha del registro, filtros por cliente/centro/equipo y capacidad de lanzar una OT asociada desde un vencimiento. Diseña el modelo para que futuras modificaciones regulatorias no obliguen a rehacer la estructura.
```

8. Prompt para dashboard KPI  
```text
Implementa el panel KPI inicial de Tecnoglobal con métricas operativas y ejecutivas: horas por técnico, trabajos por mes, trabajos por cliente, materiales consumidos, tiempo medio de cierre, backlog abierto, vencimientos próximos y tasa de repetición de incidencias. Usa vistas o consultas eficientes, filtros por rango de fechas y una UI clara para gerencia y oficina. No hagas BI avanzado todavía; prioriza métricas fiables y rápidas de entender.
```

9. Prompt para sincronización offline robusta  
```text
Diseña e implementa la base técnica de sincronización offline para la PWA de técnicos de Tecnoglobal. Usa Dexie como store local y define una cola idempotente de SyncCommand/SyncAck para horas, materiales, logs, fotos y firma. Quiero contratos claros, estrategia de reintentos, detección de conflictos y utilidades para ver el estado de sincronización por OT. No dependas solo del service worker: la cola de la app debe ser la fuente de verdad y Workbox, si se usa, debe quedar como mejora complementaria.
```
