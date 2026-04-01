# Logica funcional del sistema

## Entidades y relaciones

- un `cliente` tiene varios `equipos`
- un `cliente` puede tener varias `ordenes de trabajo`
- un `equipo` pertenece a un `cliente`
- una `orden de trabajo` pertenece a un `cliente` y opcionalmente a un `equipo`
- una `orden` tiene una `asignacion` activa de planificacion
- una `asignacion` une `orden + tecnico + inicio + fin`
- una `orden` puede tener un `parte`
- un `parte` pertenece a una unica `orden`
- un `tecnico` puede tener varias `asignaciones`

## Estados operativos

### Orden

- `planned`
- `in_progress`
- `pending_office_review`
- `pending_material`
- `closed`
- `cancelled`

### Parte

- `draft`
- `ready_for_review`
- `closed`

### Asignacion

- `planned`
- `in_progress`
- `completed`
- `cancelled`

### Tecnico

- `available`
- `busy`
- `off`

## Reglas de negocio implementadas

- una orden puede crear su parte asociado una sola vez; si ya existe, se abre ese mismo parte
- finalizar una orden cierra tambien su asignacion y el parte relacionado si existe
- reasignar tecnico cambia la asignacion y actualiza el tecnico del parte si existe
- ajustar duracion modifica la hora fin de la asignacion y afecta a dashboard y planificacion
- el detalle de cliente muestra sus equipos, ordenes y partes relacionados
- el detalle de tecnico muestra trabajos y partes vinculados a sus asignaciones

## Navegacion real

- `dashboard` abre orden, parte, equipo y mapa reales
- `crear` guarda cliente, equipo u orden y redirige al detalle creado
- `clientes` abre ficha real de cliente
- `equipos/:id` abre ficha real de equipo
- `trabajos/:id` abre detalle real de orden
- `ordenes/:id` abre detalle real de parte
- `tecnicos/:id` abre ficha real del tecnico
- `planificacion` opera sobre la orden y su parte relacionado tanto en vista diaria como semanal

## Backend

- autenticacion: `POST /api/auth/login`
- logout: `POST /api/auth/logout`
- clientes: `GET/POST /api/clients`
- equipos: `GET/POST /api/equipment`
- ordenes: `GET/POST /api/work-orders`
- crear parte desde orden: `POST /api/work-orders/:id/report`
- finalizar orden: `POST /api/work-orders/:id/finalize`
- reasignar tecnico: `POST /api/work-orders/:id/reassign`
- ajustar duracion: `POST /api/work-orders/:id/duration`
- actualizar parte: `PATCH /api/work-reports/:id`
- subir adjunto o foto: `POST /api/work-reports/:id/attachments`
- guardar firma tactil: `POST /api/work-reports/:id/signature`
- servir adjunto: `GET /api/attachments/:id`

## Persistencia

- store local: `data/runtime-db.json`
- usuarios con hash de password y sesiones activas
- adjuntos binarios y firmas persistidas en `data/uploads`
- tablas logicas persistidas:
  - usuarios
  - sesiones
  - clientes
  - equipos
  - ordenes
  - partes
  - adjuntos
  - materiales
  - asignaciones
  - auditoria
