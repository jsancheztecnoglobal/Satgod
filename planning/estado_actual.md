# Estado actual del trabajo

## Punto de control

La aplicacion ya no se apoya en datos demo para el flujo principal. Ahora funciona sobre un backend real integrado en el propio proyecto con persistencia en fichero, autenticacion con sesion y APIs operativas. Tambien quedan cerrados los cuatro bloques que estaban pendientes: firma tactil persistente, adjuntos/fotos reales, vista semanal completa y Google Maps JS avanzado.

## Arquitectura implementada en este bloque

- frontend `Next.js App Router` con rutas reales y detalle por entidad
- backend propio en `route handlers` + servicios server-side
- persistencia local real en `data/runtime-db.json`
- adjuntos binarios persistidos en `data/uploads`
- autenticacion real con usuarios, password hash y cookie de sesion
- relaciones persistentes entre cliente, equipo, orden, parte y asignacion
- Google Maps JS real con estrategia de bajo consumo: seguimiento en dashboard y rutas manuales en planificacion

## Lo que ya funciona de extremo a extremo

### Login y sesion

- login real contra backend local
- sesion persistente por cookie
- logout funcional
- proteccion de rutas por rol
- cuentas iniciales reales sembradas en la base local

### Menus y navegacion

- `dashboard`
- `crear`
- `clientes`
- `partes`
- `planificacion`
- `tecnicos`
- rutas de detalle reales para cliente, equipo, orden y parte

### Dashboard

- seleccion de orden real
- mapa real con Google Maps bajo demanda para seguimiento
- `Ver parte` abre o crea el parte real asociado
- `Ver equipo` abre la ficha real del equipo
- `Finalizar trabajo` persiste estado y refresca UI
- `Detalle` abre la orden real

### Crear

- crear cliente
- crear equipo
- crear orden de trabajo
- cada guardado persiste
- redireccion automatica al detalle creado

### Clientes

- listado real de clientes
- ficha real por cliente
- equipos relacionados
- ordenes relacionadas
- partes relacionados
- mapa real de ubicacion

### Tecnicos

- listado real de tecnicos
- ficha real por tecnico
- trabajos asignados
- partes vinculados

### Ordenes y partes

- detalle real de orden
- creacion de parte desde orden
- detalle real de parte
- edicion persistente del parte
- cierre de parte persistente
- firma tactil persistente con guardado real de imagen
- fotos y adjuntos persistentes con subida real al backend local
- PDF de orden generado desde datos reales

### Planificacion

- vista diaria por horas
- vista semanal completa por dias
- detalle de bloque seleccionado
- reasignacion real de tecnico
- ajuste real de duracion
- apertura real del parte asociado
- enlace real a la orden correspondiente
- calculo manual de ruta por tecnico con Google Maps

### Mapas y ubicaciones

- Google Maps JS real en dashboard y planificacion, no embebido decorativo
- multiples marcadores simultaneos en dashboard
- rutas entre intervenciones del tecnico seleccionado solo desde planificacion y bajo accion manual
- cliente, equipo, orden y parte usan enlace externo a Google Maps para evitar cargas extra
- estado vacio claro si no hay ubicacion o falta configurar la API key

## Estructura tecnica clave

- store y seed: `src/server/db/`
- servicios de dominio: `src/server/services/`
- auth HTTP: `src/server/http/auth.ts`
- repositorios de lectura: `src/lib/data/repositories.ts`
- APIs REST internas: `src/app/api/`

## Tests y validaciones realizados

- `npm run test` OK
- `npm run typecheck` OK
- `npm run lint` OK
- `npm run build` OK

## Flujos cubiertos por test

- login correcto
- login incorrecto
- logout
- crear cliente
- crear equipo
- crear orden
- crear parte desde orden
- editar parte
- guardar firma tactil
- guardar adjunto/foto en parte
- reasignar tecnico
- ajustar duracion
- finalizar trabajo
- persistencia tras releer datos

## Pendiente real despues de este bloque

### Ya no pendiente del bloque anterior

- firma tactil persistente
- adjuntos/fotos reales
- mapa con multiples marcadores simultaneos y rutas
- semanal completa en planificacion

### Mejoras posteriores no bloqueantes

- borrado de adjuntos desde UI
- auditoria visible en UI
- integracion con Supabase o PostgreSQL externo
- rutas avanzadas con trafico o posicion GPS real de tecnico

### Importante

El flujo base operativo actual queda cubierto y los pendientes restantes ya son mejoras posteriores, no huecos funcionales del flujo principal.
