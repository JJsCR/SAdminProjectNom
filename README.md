# SAdminProjectNom

Panel de administración full-stack construido con **Angular 21** y **ASP.NET Core (.NET 10)**, con autenticación JWT, gestión de usuarios CRUD y un dashboard con múltiples módulos UI.

![.NET 10](https://img.shields.io/badge/.NET-10-512BD4?logo=dotnet)
![Angular 21](https://img.shields.io/badge/Angular-21-DD0031?logo=angular)
![Angular Material](https://img.shields.io/badge/Angular%20Material-21-3f51b5)
![SQL Server](https://img.shields.io/badge/SQL%20Server-Express-CC2927?logo=microsoftsqlserver)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Ejecución](#-ejecución)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Módulos del Frontend](#-módulos-del-frontend)
- [Base de Datos](#-base-de-datos)

---

## ✨ Características

- **Autenticación JWT** con login seguro y guards de ruta
- **Gestión de usuarios** (CRUD completo)
- **Dashboard** con widgets y gráficos
- **Panel de administración** con Angular Material
- **Módulos UI** preconstruidos: tablas, formularios, gráficos, mapas, e-commerce
- **Diseño responsive** con tema personalizable
- **SPA Proxy** integrado para desarrollo (back-end y front-end con un solo comando)
- **Seed automático** de base de datos con usuario inicial

---

## 🛠 Tecnologías

### Backend
| Tecnología | Versión |
|---|---|
| .NET | 10 |
| ASP.NET Core | 10 |
| Entity Framework Core | 10.x |
| SQL Server | Express |
| JWT Bearer Authentication | 10.x |

### Frontend
| Tecnología | Versión |
|---|---|
| Angular | 21.x |
| Angular Material | 21.x |
| Node.js | 22.x |
| TypeScript | 5.x |

---

## 📦 Requisitos Previos

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 22.x](https://nodejs.org/)
- [SQL Server Express](https://www.microsoft.com/en-us/sql-server/sql-server-downloads)
- [Visual Studio 2026](https://visualstudio.microsoft.com/) (recomendado) o VS Code

---

## 🚀 Instalación

### 1. Clonar el repositorio

```bash
git clone https://github.com/JJsCR/SAdminProjectNom.git
cd SAdminProjectNom
```

### 2. Instalar dependencias del frontend

```bash
cd sadminprojectnom.client
npm install
cd ..
```

### 3. Restaurar paquetes del backend

```bash
cd SAdminProjectNom.Server
dotnet restore
cd ..
```

---

## ⚙ Configuración

### Base de Datos

Edita el archivo `SAdminProjectNom.Server/appsettings.json` con tu cadena de conexión:

```json
{
  "ConnectionStrings": {
	"DefaultConnection": "Server=.\\SQLEXPRESS;Database=DbAdminProjectNom;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True"
  }
}
```

> La base de datos se crea automáticamente al iniciar la aplicación (`EnsureCreated`).

### JWT

Configura tu clave secreta JWT en `appsettings.json`:

```json
{
  "Jwt": {
	"Key": "TuClaveSecretaSegura",
	"Issuer": "SAdminProjectNom"
  }
}
```

---

## ▶ Ejecución

### Opción 1: Visual Studio (Recomendado)

1. Abre `SAdminProjectNom.slnx` en Visual Studio
2. Selecciona **`SAdminProjectNom.Server`** como proyecto de inicio
3. Presiona **Ctrl+F5**
4. El backend inicia en `http://localhost:8080`
5. El frontend inicia automáticamente en `http://localhost:3000` (vía SPA Proxy)

### Opción 2: Línea de Comandos

**Terminal 1 - Backend:**
```bash
cd SAdminProjectNom.Server
dotnet run
```

**Terminal 2 - Frontend:**
```bash
cd sadminprojectnom.client
npm start
```

### Puertos

| Servicio | URL |
|---|---|
| Backend API | `http://localhost:8080` |
| Frontend Angular | `http://localhost:3000` |

---

## 📁 Estructura del Proyecto

```
SAdminProjectNom/
├── SAdminProjectNom.Server/          # Backend ASP.NET Core
│   ├── Controllers/
│   │   ├── AuthController.cs         # Autenticación (login, registro)
│   │   ├── UsersController.cs        # CRUD de usuarios
│   │   └── WeatherForecastController.cs
│   ├── Models/
│   │   └── User.cs                   # Modelo de usuario
│   ├── Data/
│   │   ├── AppDbContext.cs           # DbContext de EF Core
│   │   └── DbInitializer.cs         # Seed de datos iniciales
│   ├── Properties/
│   │   └── launchSettings.json       # Configuración de puertos
│   ├── Program.cs                    # Configuración del servidor
│   └── appsettings.json              # Configuración de la app
│
├── sadminprojectnom.client/          # Frontend Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── modules/
│   │   │   │   ├── auth/             # Login y autenticación
│   │   │   │   ├── dashboard/        # Dashboard principal
│   │   │   │   ├── CRUD/             # Gestión de usuarios (admin)
│   │   │   │   ├── user/             # Perfil de usuario
│   │   │   │   ├── e-commerce/       # Módulo e-commerce
│   │   │   │   ├── pages/            # Páginas adicionales
│   │   │   │   └── templates/        # Componentes UI
│   │   │   │       ├── core/         # Tipografía, colores, grid
│   │   │   │       ├── tables/       # Tablas de datos
│   │   │   │       ├── forms/        # Formularios
│   │   │   │       ├── charts/       # Gráficos
│   │   │   │       ├── maps/         # Mapas (Leaflet, Google)
│   │   │   │       ├── ui-elements/  # Componentes UI
│   │   │   │       └── extra/        # Calendario, búsqueda, galería
│   │   │   ├── shared/
│   │   │   │   ├── layout/           # Layout principal (sidebar, header)
│   │   │   │   └── services/         # Servicios compartidos
│   │   │   ├── app.routes.ts         # Rutas principales
│   │   │   └── app.config.ts         # Configuración runtime
│   │   ├── environments/             # Variables de entorno
│   │   └── proxy.conf.js             # Proxy para desarrollo
│   ├── angular.json
│   └── package.json
│
└── SAdminProjectNom.slnx             # Archivo de solución
```

---

## 🔌 API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/api/auth/signin/local` | Login con credenciales |
| `GET` | `/api/auth/me` | Obtener usuario autenticado |

### Usuarios

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/users` | Listar usuarios |
| `GET` | `/api/users/{id}` | Obtener usuario por ID |
| `POST` | `/api/users` | Crear usuario |
| `PUT` | `/api/users/{id}` | Actualizar usuario |
| `DELETE` | `/api/users/{id}` | Eliminar usuario |

---

## 🧩 Módulos del Frontend

| Módulo | Ruta | Descripción |
|---|---|---|
| **Login** | `/login` | Autenticación de usuarios |
| **Dashboard** | `/dashboard` | Panel principal con widgets |
| **Admin (CRUD)** | `/admin` | Gestión de usuarios |
| **Perfil** | `/user` | Perfil del usuario |
| **E-Commerce** | `/e-commerce` | Productos y grid de tienda |
| **Tablas** | `/tables` | Tablas de datos con Material |
| **Formularios** | `/forms` | Formularios con validación |
| **Gráficos** | `/charts` | Gráficos con ApexCharts |
| **Mapas** | `/maps` | Mapas con Leaflet y Google Maps |
| **UI Elements** | `/ui` | Componentes UI (badges, cards, etc.) |
| **Extra** | `/extra` | Calendario, galería, búsqueda |

---

## 🗄 Base de Datos

### Modelo: Usuario

| Columna | Tipo | Descripción |
|---|---|---|
| `UsuarioId` | `int` (PK) | ID del usuario |
| `NombreUsuario` | `string` | Nombre de usuario (login) |
| `PasswordHash` | `string` | Contraseña hasheada |
| `Nombre` | `string` | Nombre completo |
| `Activo` | `bool` | Estado del usuario |
| `FechaCreacion` | `DateTime` | Fecha de creación |

### Seed Inicial

La aplicación crea automáticamente un usuario administrador al iniciar por primera vez.

---

## 🔧 Solución de Problemas

### Error `ERR_CONNECTION_REFUSED`

Asegúrate de que el backend esté corriendo en `http://localhost:8080`. Usa **Ctrl+F5** en Visual Studio con el proyecto Server como inicio.

### Error de CORS

El CORS está configurado para permitir peticiones desde `http://localhost:3000`. Si cambias el puerto del frontend, actualiza la política CORS en `Program.cs`.

### Error `SelfHostWebServer` en Visual Studio

Cierra Visual Studio, elimina la carpeta `.vs` del proyecto y reabre la solución.

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👤 Autor

**JJsCR** - [GitHub](https://github.com/JJsCR)
