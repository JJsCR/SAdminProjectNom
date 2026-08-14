-- ========================================
-- Script para crear usuario jArmandoGO
-- Tabla: Usuario (no Users)
-- ========================================

USE DbAdminProjectNom;
GO

-- 1. Verificar tablas existentes
PRINT '=== TABLAS EN LA BASE DE DATOS ===';
SELECT TABLE_NAME 
FROM INFORMATION_SCHEMA.TABLES 
WHERE TABLE_TYPE = 'BASE TABLE'
ORDER BY TABLE_NAME;
GO

-- 2. Verificar si la tabla Usuario existe
IF NOT EXISTS (SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Usuario')
BEGIN
	PRINT 'ERROR: La tabla Usuario no existe. Ejecuta el servidor primero para crear la base de datos.';
END
ELSE
BEGIN
	PRINT 'OK: Tabla Usuario encontrada.';
END
GO

-- 3. Ver estructura de la tabla Usuario
PRINT '';
PRINT '=== ESTRUCTURA DE LA TABLA Usuario ===';
SELECT 
	COLUMN_NAME,
	DATA_TYPE,
	IS_NULLABLE,
	CHARACTER_MAXIMUM_LENGTH
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'Usuario'
ORDER BY ORDINAL_POSITION;
GO

-- 4. Verificar si el usuario ya existe
PRINT '';
PRINT '=== VERIFICANDO USUARIO jArmandoGO ===';
IF EXISTS (SELECT * FROM Usuario WHERE NombreUsuario = 'jArmandoGO')
BEGIN
	PRINT 'El usuario jArmandoGO YA EXISTE.';
	SELECT 
		UsuarioId,
		NombreUsuario,
		Nombre,
		Activo,
		FechaCreacion,
		CASE WHEN PasswordHash IS NOT NULL AND LEN(PasswordHash) > 0 
			 THEN 'Sí (longitud: ' + CAST(LEN(PasswordHash) AS VARCHAR) + ')'
			 ELSE 'No' 
		END AS TienePassword
	FROM Usuario
	WHERE NombreUsuario = 'jArmandoGO';
END
ELSE
BEGIN
	PRINT 'El usuario jArmandoGO NO EXISTE. Necesitas ejecutar el servidor para crearlo automáticamente.';
	PRINT '';
	PRINT 'INSTRUCCIONES:';
	PRINT '1. Ejecuta: dotnet run --project SAdminProjectNom.Server\SAdminProjectNom.Server.csproj';
	PRINT '2. Espera a que diga "Now listening on..."';
	PRINT '3. Presiona Ctrl+C para detener el servidor';
	PRINT '4. El usuario habrá sido creado automáticamente';
END
GO

-- 5. Mostrar TODOS los usuarios (si existen)
PRINT '';
PRINT '=== TODOS LOS USUARIOS ===';
IF EXISTS (SELECT * FROM Usuario)
BEGIN
	SELECT 
		UsuarioId,
		NombreUsuario,
		Nombre,
		Activo,
		FechaCreacion
	FROM Usuario
	ORDER BY FechaCreacion DESC;
END
ELSE
BEGIN
	PRINT 'No hay usuarios en la tabla.';
	PRINT 'Ejecuta el servidor para que el DbInitializer cree el usuario automáticamente.';
END
GO
