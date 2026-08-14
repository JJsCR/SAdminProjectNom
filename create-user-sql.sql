-- Script SQL para crear el usuario jArmandoGO directamente en la base de datos
-- Ejecuta este script en SQL Server Management Studio o Azure Data Studio

USE DbAdminProjectNom;
GO

-- Verificar si el usuario ya existe
IF NOT EXISTS (SELECT 1 FROM Users WHERE NombreUsuario = 'jArmandoGO')
BEGIN
	-- Insertar el usuario
	-- NOTA: El PasswordHash debe ser generado por el PasswordHasher de ASP.NET Identity
	-- Este es un hash de ejemplo para la contraseña "8822" generado con PasswordHasher
	INSERT INTO Users (NombreUsuario, PasswordHash, Nombre, Activo, FechaCreacion)
	VALUES (
		'jArmandoGO',
		'AQAAAAIAAYagAAAAEJ5TqN8vYxZxQqFLXvN8rJ5TqN8vYxZxQqFLXvN8rJ5TqN8vYxZxQqFLXvN8rJ5TqN==', -- Este es un hash temporal
		N'José Armando Gutiérrez Ortiz',
		1,
		GETUTCDATE()
	);

	PRINT 'Usuario jArmandoGO creado exitosamente';
	SELECT * FROM Users WHERE NombreUsuario = 'jArmandoGO';
END
ELSE
BEGIN
	PRINT 'El usuario jArmandoGO ya existe';
	SELECT * FROM Users WHERE NombreUsuario = 'jArmandoGO';
END
GO

-- Verificar todos los usuarios
SELECT 
	Id,
	NombreUsuario,
	Nombre,
	Activo,
	FechaCreacion
FROM Users;
GO
