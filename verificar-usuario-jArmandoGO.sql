-- ============================================
-- QUERY PARA VERIFICAR USUARIO jArmandoGO
-- Ejecuta esto en SQL Server Management Studio
-- ============================================

USE DbAdminProjectNom;
GO

-- Verificar si el usuario existe
SELECT 
	UsuarioId,
	NombreUsuario,
	Nombre,
	Activo,
	FechaCreacion,
	CASE 
		WHEN PasswordHash IS NOT NULL AND LEN(PasswordHash) > 0 
		THEN 'SI - Hash presente (longitud: ' + CAST(LEN(PasswordHash) AS VARCHAR) + ' caracteres)'
		ELSE 'NO'
	END AS TienePasswordHash
FROM Usuario
WHERE NombreUsuario = 'jArmandoGO';
GO

-- Si no aparece nada, ver todos los usuarios:
SELECT * FROM Usuario;
GO
