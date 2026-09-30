# Arquitectura del proyecto

## Límites del sistema

La aplicación es una interfaz Next.js que usa Supabase desde el navegador. Next.js resuelve las rutas y sirve los componentes; Supabase proporciona autenticación, persistencia y eventos realtime. El esquema y la configuración del servicio se administran en Supabase.

## Rutas y layouts

| Archivo | URL | Responsabilidad |
| --- | --- | --- |
| `src/app/page.tsx` | `/` | Instala el proveedor de idioma y monta la experiencia de registro. |
| `src/app/admin/login/page.tsx` | `/admin/login` | Muestra el formulario de acceso de Supabase Auth. |
| `src/app/admin/(panel)/page.tsx` | `/admin` | Punto de entrada del dashboard administrativo. |
| `src/app/admin/layout.tsx` | Segmento `/admin` | Define metadatos compartidos; no añade una cabecera visual. |
| `src/app/admin/(panel)/layout.tsx` | Grupo `(panel)` | Añade el shell visual solo al dashboard. El nombre entre paréntesis no forma parte de la URL. |

Los componentes que usan estado, eventos del navegador o Supabase llevan la directiva `use client`. Las páginas de ruta se mantienen como entradas pequeñas y delegan la interacción en componentes de `src/components/`.

## Flujo de registro público

1. `LanguageProvider` comienza en español y entrega el diccionario elegido a los componentes.
2. `LanguageSelector` permite cambiar entre español, inglés, alemán, francés, italiano y polaco.
3. `RegisterForm` valida los campos obligatorios en el navegador y envía el registro a `public.checkins` con el cliente anon de Supabase.
4. `room_number` y `booking_reference` se envían como `null`; recepción los completa más tarde.
5. Tras una inserción correcta, `GuestCheckInExperience` muestra `ThankYouCard`.

## Flujo administrativo

1. `AdminLoginForm` usa `signInWithPassword`; el usuario de recepción debe existir en Supabase Auth.
2. El formulario navega a `/admin` después del inicio de sesión.
3. `AdminDashboardController` comprueba que haya una sesión de cliente, carga los registros y después se suscribe a eventos `INSERT` y `UPDATE`.
4. El controlador mantiene filtros, fecha seleccionada, estado de edición, notificaciones y exportación. `AdminDashboardView` presenta esos datos y comunica las acciones mediante props.
5. La fecha y la exportación usan la zona horaria local del navegador.

## Componentes principales

| Módulo | Responsabilidad |
| --- | --- |
| `src/components/GuestCheckInExperience.tsx` | Alterna entre el formulario público y la confirmación. |
| `src/components/RegisterForm.tsx` | Estado y envío de los datos del huésped. |
| `src/components/AdminLoginForm.tsx` | Inicio de sesión del personal. |
| `src/components/AdminDashboardController.tsx` | Consultas, autenticación de interfaz, realtime, edición y exportación. |
| `src/components/AdminDashboardView.tsx` | Cabecera, métricas, filtros, tabla y mensajes de carga. |
| `src/context/LanguageContext.tsx` | Estado del idioma y acceso al diccionario actual. |
| `src/locales/index.ts` | Tipos de idioma y diccionarios de interfaz. |
| `src/lib/supabase.ts` | Cliente compartido de Supabase. |
| `src/lib/checkinCsv.ts` | Formato de fecha local y serialización de CSV. |
| `src/types/checkin.ts` | Tipos compartidos del registro y del panel. |

## Contrato de datos

El cliente espera que `public.checkins` contenga los campos `id`, `created_at`, `room_number`, `booking_reference`, `full_name`, `street`, `street_number`, `postal_code`, `city`, `country`, `phone` y `email`. `src/types/checkin.ts` describe la forma que consumen los componentes; no crea ni valida el esquema de PostgreSQL.

Para añadir un campo nuevo, revisa todos los puntos que participan en su ciclo de vida:

1. La tabla y sus migraciones en Supabase.
2. El payload de `RegisterForm` si lo proporciona el huésped.
3. `Checkin` y `CheckinEditForm` en `src/types/checkin.ts`.
4. El estado, controles de edición y presentación del dashboard.
5. Las columnas del CSV si el dato debe exportarse.
6. Los diccionarios de `src/locales/index.ts` si aparece en la interfaz traducida.

## Supabase: datos y seguridad

El cliente usa `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`. La clave anon está pensada para el navegador; no es un secreto ni una autorización para leer o modificar cualquier fila. Nunca expongas una clave `service_role` en código cliente o en una variable `NEXT_PUBLIC_*`.

El formulario público inserta filas en la tabla descrita en el contrato de datos; el panel consulta y actualiza esas filas.

La casilla RGPD es obligatoria en la interfaz, pero `gdpr_accepted` no se envía ni existe como columna declarada en este proyecto. Marcarla no constituye actualmente una evidencia persistida del consentimiento.

Antes de producción, configura y prueba RLS en Supabase con estas necesidades funcionales:

- Permitir al visitante crear un check-in solo con los campos públicos previstos.
- Permitir al personal autorizado leer y actualizar registros.
- Evitar que cualquier usuario autenticado obtenga permisos de recepción por el mero hecho de tener sesión.
- Habilitar `public.checkins` en la publicación Realtime para recibir `INSERT` y `UPDATE`.

Las políticas exactas dependen del esquema y de cómo se identifique al personal (por ejemplo, claims o roles). El cliente redirige a la pantalla de acceso cuando no encuentra una sesión, pero esa comprobación solo controla la navegación. Este repo no define las políticas ni los roles, así que no se debe asumir que los requisitos anteriores ya están aplicados.

## Exportación y fechas

`formatLocalDate` convierte una fecha al calendario local para compararla con el valor de `<input type="date">`. Si el hotel necesita una zona horaria fija independiente del dispositivo del recepcionista, hay que definir esa zona explícitamente y usarla tanto en la tabla como en el filtro y el CSV.

`serializeCsv` envuelve y escapa los campos para preservar comas, comillas y saltos de línea. También antepone un apóstrofo a valores que empiezan como fórmulas de hoja de cálculo; esto reduce el riesgo de que datos aportados por usuarios se ejecuten al abrir el CSV.

## Desarrollo y validación

Los comandos disponibles se documentan en el README. `npm run lint` ejecuta ESLint, `npm test` corre Vitest una vez, `npm run test:watch` inicia el modo interactivo y `npm run build` compila la aplicación y valida tipos.

Las pruebas unitarias están junto a las utilidades que verifican: `src/lib/checkinCsv.test.ts` cubre fechas locales y serialización CSV; `src/lib/checkinFilters.test.ts` cubre selección por día, búsqueda y filtros de habitación. Son pruebas puras: no necesitan conexión ni credenciales de Supabase. Al cambiar esos comportamientos, actualiza o amplía las pruebas correspondientes.
