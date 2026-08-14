# Script completo para crear usuario jArmandoGO
# Este script inicia el servidor, crea el usuario y detiene el servidor

Write-Host "=== Creación de Usuario jArmandoGO ===" -ForegroundColor Cyan
Write-Host ""

# Configuración
$projectPath = "SAdminProjectNom.Server"
$apiUrl = "https://localhost:5001/api/auth/create-user"
$installerKey = "ReplaceThisWithASecureInstallerKey"

# 1. Iniciar el servidor
Write-Host "1. Iniciando servidor..." -ForegroundColor Yellow
$serverProcess = Start-Process -FilePath "dotnet" -ArgumentList "run --project $projectPath" -PassThru -NoNewWindow
Start-Sleep -Seconds 10  # Esperar a que el servidor inicie

Write-Host "   ✓ Servidor iniciado (PID: $($serverProcess.Id))" -ForegroundColor Green
Write-Host ""

# 2. Crear el usuario
Write-Host "2. Creando usuario jArmandoGO..." -ForegroundColor Yellow

$userData = @{
	NombreUsuario = "jArmandoGO"
	Password = "8822"
	Nombre = "José Armando Gutiérrez Ortiz"
} | ConvertTo-Json

$headers = @{
	"Content-Type" = "application/json"
	"X-Installer-Key" = $installerKey
}

try {
	$response = Invoke-WebRequest -Uri $apiUrl -Method POST -Body $userData -Headers $headers -SkipCertificateCheck -ErrorAction Stop
	Write-Host "   ✓ Usuario creado exitosamente!" -ForegroundColor Green
	Write-Host "   Respuesta: $($response.Content)" -ForegroundColor White
}
catch {
	$statusCode = $_.Exception.Response.StatusCode.value__

	if ($statusCode -eq 409) {
		Write-Host "   ⚠ El usuario ya existe en la base de datos" -ForegroundColor Yellow
	}
	elseif ($statusCode -eq 401) {
		Write-Host "   ✗ Error de autenticación - Verifica la API Key" -ForegroundColor Red
	}
	else {
		Write-Host "   ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
	}
}

Write-Host ""
Write-Host "3. Deteniendo servidor..." -ForegroundColor Yellow
Stop-Process -Id $serverProcess.Id -Force
Write-Host "   ✓ Servidor detenido" -ForegroundColor Green
Write-Host ""
Write-Host "=== Proceso completado ===" -ForegroundColor Cyan
