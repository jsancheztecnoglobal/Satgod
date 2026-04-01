# Tecnoglobal FSM

Aplicacion web operativa para gestion de servicios tecnicos de Tecnoglobal.

## Estado actual

El proyecto ya funciona como producto navegable con:

- login real y sesion persistente
- backend propio con APIs
- persistencia local real en fichero
- dashboard operativo
- clientes, equipos, ordenes y partes enlazados entre si
- planificacion diaria y semanal con reasignacion y ajuste de duracion
- calculo manual de rutas en planificacion
- firma tactil persistente en partes
- fotos y adjuntos reales persistidos en disco local
- Google Maps JS real con estrategia de uso bajo coste

## Puesta en marcha

```bash
npm install
npm run dev
```

Abrir:

```text
http://localhost:3000/login
```

Si quieres activar Google Maps avanzado, crea `.env.local` con:

```text
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key
NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID=tu_map_id
```

`NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID` es opcional para probar. Sin `Map ID`, la app usa mapa y marcadores basicos; con `Map ID`, activa marcadores avanzados.

Uso aplicado para mantenerlo dentro del tramo gratuito:

- `dashboard`: mapa de seguimiento solo bajo demanda
- `dashboard`: sin calculo de rutas
- `planificacion`: calculo de ruta manual por tecnico
- cliente, equipo, orden y parte: enlace externo a Google Maps

## Credenciales iniciales

Todas las cuentas usan la contrasena:

```text
tecnoglobal123
```

Usuarios sembrados:

- `admin@tecnoglobal.local`
- `oficina@tecnoglobal.local`
- `ingenieria@tecnoglobal.local`
- `tecnico1@tecnoglobal.local`
- `tecnico2@tecnoglobal.local`

## Persistencia

La aplicacion guarda sus datos en:

```text
data/runtime-db.json
```

Los adjuntos y firmas se guardan en:

```text
data/uploads
```

Para pruebas aisladas se puede sobreescribir con:

```bash
TECNOGLOBAL_DB_FILE=...
```

Tambien se puede cambiar el directorio de adjuntos con:

```bash
TECNOGLOBAL_UPLOAD_DIR=...
```

## Scripts

```bash
npm run dev
npm run test
npm run typecheck
npm run lint
npm run build
```

## Estructura principal

```text
src/app/                 Rutas App Router y APIs
src/components/          UI y acciones cliente
src/lib/                 Contratos, auth y repositorios
src/server/db/           Seed y store persistente
src/server/services/     Logica de negocio real
planning/                Plan maestro y estado actual
```
