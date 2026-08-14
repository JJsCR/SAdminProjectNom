-- =============================================
-- Script: Insertar usuario jArmandoGO
-- Tabla: Usuario
-- Base de datos: DbAdminProjectNom
-- PasswordHash generado con ASP.NET Core
-- PasswordHasher (PBKDF2 con HMAC-SHA256)
-- =============================================

USE DbAdminProjectNom;
GO

-- Verificar que no exista antes de insertar
IF NOT EXISTS (SELECT 1 FROM Usuario WHERE NombreUsuario = 'jArmandoGO')
BEGIN
	INSERT INTO Usuario (NombreUsuario, PasswordHash, Nombre, Activo, FechaCreacion)
	VALUES (
		'jArmandoGO',
		'AQAAAAIAAYagAAAAEEi44ulxpnzSqJAUT8V9xATX9ZMteNEh6sZzQS4wnw0jgQmvkzhvmE/zAQOEJtIhLA==',
		N'José Armando Gutiérrez Ortiz',
		1,
		GETDATE()
	);

	PRINT '✓ Usuario jArmandoGO creado exitosamente.';
END
ELSE
BEGIN
	PRINT '⚠ El usuario jArmandoGO ya existe.';
END
GO

-- Verificar inserción
SELECT
	UsuarioId,
	NombreUsuario,
	Nombre,
	Activo,
	FechaCreacion
FROM Usuario
WHERE NombreUsuario = 'jArmandoGO';
GO
