# Portal de Selección de Electivas

Aplicación Next.js + TypeScript para registrar estudiantes, administrar materias, controlar cupos y consultar reportes.

## Ejecutar localmente

1. Instala Node.js 20+.
2. Ejecuta `npm install` y copia `.env.example` como `.env.local`.
3. Completa `DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ADMIN_USER` y `ADMIN_PASSWORD`.
4. Ejecuta `npm run dev`.

La aplicación incluye rutas de base de datos para roster, registros y autenticación administrativa. En modo local, `lib/store.ts` permite probar el flujo sin conexión externa. Nunca subas `.env.local`.

## Turso y Vercel

Configura una base libSQL en Turso, ejecuta el primer despliegue para que el sistema cree las tablas y agrega `DATABASE_URL`, `TURSO_AUTH_TOKEN`, `ADMIN_USER` y `ADMIN_PASSWORD` en Vercel. Después conecta el repositorio GitHub y usa `npm run build` como comando de compilación. El endpoint `/api/database` sirve para comprobar la conexión.

## Funcionalidades

Formulario por pasos, validación de dos electivas para 12.º, observaciones, selección de cursos avanzados, dashboard responsive, búsqueda y visualización de cupos. La estructura de materias y reglas puede extenderse en `lib/types.ts` y el repositorio en `lib/store.ts`.
