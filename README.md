# Mi Espacio

Aplicación personal y de finanzas compartidas con Next.js, TypeScript y Supabase.

## Estado

Repositorio inicial creado. El despliegue de producción debe esperar a que se incorporen y validen los componentes, migraciones, políticas RLS y pruebas con dos cuentas.

## Seguridad

- No subir `.env.local`, credenciales, tokens ni comprobantes reales.
- Configurar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` desde variables de entorno.
- Los aportes y las modificaciones sensibles requieren aprobación y trazabilidad antes de usarse con datos reales.

## Estructura prevista

- `app/`: interfaz
- `features/finances/`: finanzas compartidas
- `lib/`: utilidades y cliente Supabase
- `supabase/`: migraciones y políticas RLS

**No apto aún para datos financieros reales.**
