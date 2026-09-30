# Check-in de huéspedes

Aplicación web para recopilar los datos de llegada de huéspedes y permitir al personal de recepción revisar los registros, asignar habitaciones y exportarlos.

## Requisitos

- Node.js 20.9 o superior.
- npm.
- Un proyecto de Supabase configurado con Auth, la tabla `public.checkins` y Realtime.

## Puesta en marcha

1. Instala las dependencias:

   ```bash
   npm ci
   ```

2. Crea `.env.local` en la raíz del proyecto:

   ```dotenv
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-publicable
   ```

    Usa la clave pública del proyecto. No pongas credenciales privadas en variables `NEXT_PUBLIC_*` ni en código cliente.

3. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

No subas `.env.local` al repositorio. Cada entorno (local, pruebas y producción) necesita las variables de su propio proyecto Supabase.

## Funcionalidad

- Formulario público de check-in con interfaz en español, inglés, alemán, francés, italiano y polaco.
- Inicio de sesión para recepción mediante Supabase Auth.
- Panel con búsqueda, filtro por estado de habitación, edición, actualizaciones realtime y exportación CSV por fecha.
- La fecha del panel y la exportación usan la zona horaria local del navegador.

## Rutas

| Ruta | Uso |
| --- | --- |
| `/` | Registro de huésped. |
| `/admin/login` | Acceso del personal de recepción. |
| `/admin` | Panel de administración. |

El grupo de rutas `(panel)` organiza el layout del panel, pero no forma parte de la URL. El login no hereda la cabecera visual del panel.

## Configuración de Supabase

El proyecto necesita una tabla `public.checkins` y Supabase Auth. El esquema, los permisos y las limitaciones actuales de consentimiento se explican en [Supabase: datos y seguridad](docs/architecture.md#supabase-datos-y-seguridad).

## Comandos

| Comando | Acción |
| --- | --- |
| `npm run dev` | Servidor local de desarrollo. |
| `npm run lint` | ESLint en el proyecto. |
| `npm test` | Ejecuta las pruebas unitarias una vez. |
| `npm run test:watch` | Mantiene Vitest activo durante el desarrollo. |
| `npm run build` | Compilación de producción y comprobación de tipos de Next.js. |
| `npm run start` | Sirve la compilación de producción; ejecuta antes `npm run build`. |

### Cobertura de pruebas

La suite actual valida:

- Fechas del dashboard según el calendario local y selección de registros por día.
- Búsqueda por campos del huésped y filtros de habitaciones pendientes/asignadas.
- Escape de comillas, comas y saltos de línea en CSV, campos vacíos y neutralización de fórmulas.

Las pruebas son unitarias y no necesitan conexión ni credenciales de Supabase. Están junto a las utilidades en `src/lib/*.test.ts`.

## Estructura

```text
src/
  app/                  Rutas y layouts de Next.js
    admin/
      (panel)/          Shell y ruta del dashboard
      login/            Ruta de acceso
  components/           Formularios, dashboard y componentes visuales
  context/              Estado compartido del idioma
  lib/                  Cliente Supabase y utilidades (fechas/CSV)
  locales/              Textos traducidos
  types/                Tipos compartidos del dominio
docs/
  architecture.md       Flujos, responsabilidades y contratos externos
```

Para entender las responsabilidades entre rutas, componentes y Supabase, consulta [la arquitectura del proyecto](docs/architecture.md).
