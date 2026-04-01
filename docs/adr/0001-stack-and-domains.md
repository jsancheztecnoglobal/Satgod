# ADR 0001 — Stack y separación por dominios

## Contexto

Tecnoglobal necesita una solución propia FSM/SAT con buena velocidad de desarrollo, mantenibilidad y experiencia móvil para técnicos.

## Decisión

- `Next.js + React + TypeScript + Tailwind` como aplicación única web/PWA.
- `Supabase` como backend principal.
- `Dexie` para operación offline local.
- Separación por dominios funcionales desde el primer sprint.

## Consecuencias

- Acelera el desarrollo asistido por IA al trabajar schema-first y feature by feature.
- Permite compartir componentes, validaciones y contratos entre backoffice y móvil.
- Obliga a diseñar bien la estrategia offline y las políticas RLS desde el inicio.
