# Script para crear el usuario jArmandoGO
# Asegúrate de que el servidor esté corriendo antes de ejecutar este script

$apiUrl = "https://localhost:5001/api/auth/create-user"
$installerKey = "ReplaceThisWithASecureInstallerKey"

$userData = @{
	NombreUsuario = "jArmandoGO"
	Password = "8822"
	Nombre = "José Armando Gutiérrez Ortiz"
} | ConvertTo-Json

$headers = @{
	"Content-Type" = "application/json"
	"X-Installer-Key" = $installerKey
}

Write-Host "Creando usuario jArmandoGO..." -ForegroundColor Cyan

try {
	$response = Invoke-WebRequest -Uri $apiUrl -Method POST -Body $userData -Headers $headers -SkipCertificateCheck
	Write-Host "✓ Usuario creado exitosamente!" -ForegroundColor Green
	Write-Host "Respuesta: $($response.Content)" -ForegroundColor White
}
catch {
	$statusCode = $_.Exception.Response.StatusCode.value__
	$errorMessage = $_.Exception.Message

	if ($statusCode -eq 409) {
		Write-Host "⚠ El usuario ya existe en la base de datos" -ForegroundColor Yellow
	}
	elseif ($statusCode -eq 401) {
		Write-Host "✗ Error de autenticación - Verifica la API Key" -ForegroundColor Red
	}
	else {
		Write-Host "✗ Error al crear usuario: $errorMessage" -ForegroundColor Red
	}
}
