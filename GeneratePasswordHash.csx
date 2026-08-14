using System;
using Microsoft.AspNetCore.Identity;
using SAdminProjectNom.Server.Models;

// Mini programa para generar el hash de contraseña
var hasher = new PasswordHasher<User>();
var user = new User { NombreUsuario = "jArmandoGO" };
var passwordHash = hasher.HashPassword(user, "8822");

Console.WriteLine("=== HASH GENERADO ===");
Console.WriteLine(passwordHash);
Console.WriteLine("=====================");
Console.WriteLine();
Console.WriteLine("-- Query SQL para insertar usuario:");
Console.WriteLine($@"
USE DbAdminProjectNom;
GO

-- Insertar usuario jArmandoGO
INSERT INTO Usuario (NombreUsuario, PasswordHash, Nombre, Activo, FechaCreacion)
VALUES (
    'jArmandoGO',
    '{passwordHash}',
    N'José Armando Gutiérrez Ortiz',
    1,
    GETUTCDATE()
);
GO

-- Verificar
SELECT * FROM Usuario WHERE NombreUsuario = 'jArmandoGO';
GO
");
