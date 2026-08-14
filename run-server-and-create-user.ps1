# ========================================
# Script para crear el usuario jArmandoGO
# automáticamente usando el DbInitializer
# ========================================

Write-Host "`n=== CREACION DE USUARIO AUTOMATICA ===" -ForegroundColor Cyan
Write-Host "Usuario: jArmandoGO" -ForegroundColor White
Write-Host "Password: 8822" -ForegroundColor White
Write-Host "Nombre: Jose Armando Gutierrez Ortiz`n" -ForegroundColor White

Write-Host "Iniciando servidor..." -ForegroundColor Yellow
Write-Host "(El usuario se creará automáticamente al iniciar)`n" -ForegroundColor Gray

# Cambiar al directorio del servidor
Set-Location -Path "SAdminProjectNom.Server"

# Ejecutar el servidor (esto ejecutará el DbInitializer automáticamente)
Write-Host "Presiona Ctrl+C después de que veas 'Now listening on...'`n" -ForegroundColor Yellow

dotnet run --project SAdminProjectNom.Server.csproj

Write-Host "`n✓ Servidor detenido." -ForegroundColor Green
Write-Host "`n✓ Si viste 'Now listening on...', el usuario fue creado exitosamente." -ForegroundColor Green
Write-Host "`nAhora puedes hacer login con:" -ForegroundColor Cyan
Write-Host "  Usuario: jArmandoGO" -ForegroundColor White
Write-Host "  Password: 8822`n" -ForegroundColor White
