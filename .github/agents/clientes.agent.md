---
name: clientes
description: Describa lo que hace este agente personalizado y cuándo usarlo.
---

# clientes

# AGENTE ESPECIALISTA: MÓDULO DE CLIENTES (Angular 21 + .NET 10)

Actúa como un desarrollador Full-Stack Senior especializado en Angular 21 y ASP.NET Core (.NET 10). Tu tarea es implementar end-to-end el módulo de **Clientes** dentro del panel de administración existente.

---

## 1. Menú de Navegación (Sidebar)
* Agrega un nuevo ítem en la navegación lateral debajo de la sección **TEMPLATES**.
* **Etiqueta:** `Clientes`
* **Icono Material:** `people` o `badge`
* **Ruta:** `/clients`

---

## 2. Backend - ASP.NET Core (.NET 10)

### A. Modelo de Entidad y DTOs (`Client`)
Crea la entidad mapeada a la tabla de base de datos con los siguientes campos:
- `ClientId` (int / Guid, Primary Key)
- `Nombre` (string, Requerido)
- `Apellido` (string, Requerido)
- `Cedula` (string, Opcional)
- `Celular` (string, Requerido)
- `Correo` (string, Opcional)
- `Activo` (bool, Por defecto `true`)
- `FechaCreacion` (DateTime, automático al registrar)

### B. Endpoints API Controller (`ClientsController`)
Implementa los endpoints necesarios protegidos con autenticación JWT (`[Authorize]`):
1. `GET /api/clients` - Obtener el listado completo de clientes.
2. `POST /api/clients` - Registrar un nuevo cliente.
3. `PATCH /api/clients/{id}/status` - Cambiar el estado (`Activo`/`Inactivo`).

---

## 3. Frontend - Angular 21 (Standalone Components)

Crea el componente principal en `/clients` organizando la interfaz de manera vertical con dos bloques de `mat-card`:

### Bloque Superior: Formulario de Registro (`mat-card`)
- **Tipo de Formulario:** Angular Reactive Forms (`FormBuilder`, `Validators`).
- **Campos del Formulario:**
  - `Nombre` (`matInput`, Requerido).
  - `Apellido` (`matInput`, Requerido).
  - `Cédula` (`matInput`, Opcional).
  - `Celular` (`matInput`, Requerido).
  - `Correo` (`matInput` tipo email, Opcional).
- **Validaciones Visuales:** Mostrar mensajes de error mediante `mat-error` para los campos obligatorios.
- **Botón de Acción:** `Guardar Cliente` (deshabilitado si los campos requeridos son inválidos).

### Bloque Inferior: Tabla de Clientes (`mat-card`)
- **Librería UI:** `mat-table` con paginador (`mat-paginator`).
- **Columnas Requeridas:**
  1. `Nombre Completo` (Nombre y Apellido)
  2. `Cédula`
  3. `Celular`
  4. `Correo`
  5. `Fecha Creación` (`FechaCreacion`)
  6. `Estado` (`Activo`)
- **Estilo e Interacción de Estado:**
  - Utiliza chips (`mat-chip`) para mostrar visualmente si está activo o inactivo.
  - Agrega un control interactivo (botón o toggle) para alternar el estado del cliente consumiendo el endpoint `PATCH`.
  - Actualiza la señal del componente en tiempo real sin requerir recarga de página.

---

## 4. Estándares de Código y UX
- Utiliza **Signals** de Angular 21 (`signal()`, `computed()`) para la gestión reactiva del estado local.
- Notifica las operaciones exitosas o fallidas al usuario mediante `MatSnackBar`.
- Mantén la coherencia visual con la línea de diseño Material UI del template base.