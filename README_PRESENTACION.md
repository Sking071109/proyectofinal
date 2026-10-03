<div align="center">

# Bolsillo Claro

### Más claridad para decidir sobre tus gastos.

Una aplicación personal para registrar gastos, reconocer hábitos y llevar las cuentas del mes en un solo lugar.

[Abrir aplicación](https://proyectofinal-frontend-ten.vercel.app/) · [API](https://proyectofinal-qz7q.onrender.com) · [Estado de la API](https://proyectofinal-qz7q.onrender.com/api/health)

</div>

---

## La aplicación

![Panel de Bolsillo Claro con el resumen mensual y gastos de demostración](./screenshots/dashboard.png)

## Qué puedes hacer

- Crear una cuenta e iniciar sesión.
- Registrar, consultar, editar y eliminar tus gastos.
- Filtrar por mes y categoría, buscar por descripción y recorrer resultados paginados.
- Consultar el total y la cantidad de movimientos del mes.
- Mantener tus gastos privados: cada operación se limita a la cuenta autenticada.

## Tecnologías

| Capa | Herramientas |
|---|---|
| Interfaz | HTML, CSS y JavaScript |
| API | Node.js y Express |
| Base de datos | PostgreSQL en Supabase |
| Autenticación | bcryptjs y JWT |
| Protección | Helmet, CORS limitado, rate limiting y consultas parametrizadas |
| Publicación | Vercel (frontend), Render (API) y Supabase (base de datos) |

## Rutas principales

| Método | Endpoint | Función |
|---|---|---|
| `POST` | `/api/auth/register` | Crear cuenta |
| `POST` | `/api/auth/login` | Iniciar sesión |
| `GET` | `/api/auth/me` | Consultar la cuenta activa |
| `GET` | `/api/transactions` | Listar y filtrar gastos propios |
| `POST` | `/api/transactions` | Registrar un gasto |
| `PUT` | `/api/transactions/:id` | Editar un gasto propio |
| `DELETE` | `/api/transactions/:id` | Eliminar un gasto propio |
| `GET` | `/api/admin/summary` | Consultar resumen (solo admin) |

## Probar la demo

Puedes crear tu propia cuenta o usar la cuenta compartida de demostración:

| Correo | Contraseña |
|---|---|
| `demo@bolsilloclaro.example` | `BolsilloDemo2026!` |

La cuenta es pública y desechable. No guardes información personal en ella.

## Ejecutar localmente

Requiere Node.js 20 o superior y pnpm.

```bash
git clone https://github.com/Sking071109/proyectofinal.git
cd proyectofinal
pnpm install
```

1. Ejecuta [`schema.sql`](./schema.sql) en el SQL Editor de Supabase.
2. Copia `.env.example` a `.env`, completa las variables de conexión y genera un secreto JWT aleatorio.
3. Inicia la API con `pnpm dev`.
4. Sirve la carpeta `frontend/` con Live Server en el puerto 5500.
5. Abre la dirección local que indica Live Server.

El detalle de configuración, despliegue y pruebas está en el [README completo](./README.md). No publiques el archivo `.env` ni las credenciales de servicios.

## Estructura del proyecto

```text
src/
  config/       configuración, variables y PostgreSQL
  controllers/  manejo de solicitudes y respuestas
  middlewares/  autenticación, roles y errores
  routes/       endpoints de la API
  services/     lógica y consultas de datos
  utils/        validaciones y errores HTTP
frontend/       aplicación web estática
schema.sql      tablas y registros de demostración
requests.http   ejemplos de solicitudes y validaciones negativas
```
