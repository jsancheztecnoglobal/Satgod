# Supabase bootstrap

- `migrations/20260331143000_initial_schema.sql`: modelo inicial del dominio, funciones helper y base RLS.
- `seed.sql`: roles, tipos de activo y materiales iniciales.

## Orden sugerido

1. Crear proyecto Supabase en región UE.
2. Ejecutar la migración inicial.
3. Ejecutar el seed.
4. Crear usuarios en `auth.users`.
5. Dar de alta `user_profiles` enlazando cada usuario a su rol.

## Nota

Las políticas incluidas son una base sólida para el MVP, pero las acciones críticas deberían terminar encapsuladas en rutas server-side o RPC específicas para reforzar reglas de transición y auditoría.
