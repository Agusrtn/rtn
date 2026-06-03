# Ejecutar PowerShell COMO ADMINISTRADOR (clic derecho → Ejecutar como administrador)
# Corrige el archivo corrupto C:\package.json que rompe Vite, npm y otros tools.

$path = 'C:\package.json'

if (-not (Test-Path $path)) {
  Write-Host 'No existe C:\package.json. Nada que hacer.'
  exit 0
}

$bytes = [System.IO.File]::ReadAllBytes($path)
$isJson = $bytes.Length -gt 0 -and $bytes[0] -eq 0x7B # {

if ($isJson) {
  Write-Host 'C:\package.json parece JSON valido.'
  exit 0
}

$backup = 'C:\package.json.corrupt.bak'
if (Test-Path $backup) { Remove-Item $backup -Force }
Rename-Item -Path $path -NewName 'package.json.corrupt.bak' -Force
Write-Host "Listo: archivo corrupto renombrado a $backup"
Write-Host 'Vuelve a ejecutar: npm run dev'
