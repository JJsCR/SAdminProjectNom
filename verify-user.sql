-- Script para verificar si el usuario jArmandoGO fue creado correctamente
USE DbAdminProjectNom;
GO

-- Verificar el usuario
SELECT 
	Id,
	NombreUsuario,
	Nombre,
	Activo,
	FechaCreacion,
	CASE 
		WHEN PasswordHash IS NOT NULL THEN 'Sí (hash presente)'
		ELSE 'No'
	END AS TienePassword
FROM Users
WHERE NombreUsuario = 'jArmandoGO';
GO

-- Si quieres ver TODOS los usuarios
SELECT 
	Id,
	NombreUsuario,
	Nombre,
	Activo,
	FechaCreacion
FROM Users
ORDER BY FechaCreacion DESC;
GO
