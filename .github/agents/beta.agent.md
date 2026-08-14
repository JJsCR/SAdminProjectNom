---
name: beta
description: Describa lo que hace este agente personalizado y cuándo usarlo.
---

# beta

Actúa como un desarrollador Full-Stack Senior especializado en Angular 21 y ASP.NET Core (.NET 10). Tu tarea es implementar end-to-end el módulo de **Productos** dentro de un panel de administración existente.

---

1. Menú de Navegación (Sidebar)
* Agrega un nuevo ítem en la navegación lateral debajo de la sección **TEMPLATES**.
* **Etiqueta:** `Productos`
* **Icono Material:** `shopping_bag` o `inventory_2`
* **Ruta:** `/products`

---

Backend - ASP.NET Core (.NET 10)

A. Modelo de Entidad y DTOs (`Product`)
Crea la entidad con los campos necesarios para el formulario y la tabla:
- `Id` (int / Guid)
- `Name` (string, Requerido)
- `Price` (decimal, Requerido)
- `City` / Ubicación (string)
- `ImageUrl` (string, Opcional - puede ser base64 o URL)
- `IsActive` / `Status` (bool, Por defecto `true`)
- `CreatedAt` (DateTime)

B. Endpoints API Controller (`ProductsController`)
Implementa los siguientes endpoints protegidos con autenticación JWT (`[Authorize]`):
1. `GET /api/products` - Obtener lista de productos.
2. `POST /api/products` - Crear un nuevo producto (soportar subida opcional de imagen en Base64 o Multipart/Form-Data).
3. `PATCH /api/products/{id}/status` - Cambiar estado (Activar/Desactivar).

---

3. Frontend - Angular 21 (Standalone Components)

Crea el componente principal en `/products` con un maquetado vertical en 2 bloques (`mat-card`):

Bloque Superior: Formulario de Creación (`mat-card`)
- **Tipo de Formulario:** Angular Reactive Forms (`FormBuilder`, `Validators`).
- **Campos del Formulario:**
  - `Nombre del Producto` (`matInput`, Requerido).
  - `Precio` (`matInput` tipo number, Requerido, min 0).
  - `Ciudad` (`matInput`, Opcional).
  - `Imagen` (`input type="file"`, Opcional con vista previa).
- **Validaciones Visuales:** Mostrar mensajes de error en `mat-error` si los campos requeridos están vacíos o inválidos.
- **Botón de Acción:** `Guardar Producto` (deshabilitado si el formulario es inválido).

Bloque Inferior: Tabla de Productos (`mat-card`)
- **Librería UI:** `mat-table` con paginador (`mat-paginator`).
- **Columnas Requeridas:**
  1. `Foto / Avatar` (Imagen circular o inicial en Badge).
  2. `Nombre` (`NAME`).
  3. `Precio` (`PRICE` formateado con `currency`).
  4. `Ciudad` (`CITY`).
  5. `Estado` (`STATUS`).
- **Estilo de Columna Status:**
  - Utiliza chips de color (`mat-chip` o insignias redondeadas similares al template).
  - `Verde / Activo`: Muestra "Activo" o "Send".
  - `Gris / Inactivo`: Muestra "Inactivo".
- **Interacción de Cambio de Estado:**
  - Botón/Toggle para activar o desactivar el producto en tiempo real mediante consumo del endpoint `PATCH`.
  - Actualizar la señal/estado del componente dinámicamente sin recargar la página.

---

4. Estándares de Código y UX
- Utiliza **Signals** de Angular 21 (`signal()`, `computed()`) para la gestión del estado local.
- Asegura la gestión correcta de errores notificando al usuario mediante `MatSnackBar`.
- Mantén la coherencia visual con la guía de estilos de Material UI utilizada en el template.