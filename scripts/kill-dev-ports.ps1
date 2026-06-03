# Cierra servidores Vite/Node viejos (evita pantalla en blanco en puerto antiguo)
$ports = 5173, 5174, 5175, 5176, 5177
foreach ($port in $ports) {
  Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
    ForEach-Object {
      Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
}
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
Write-Host 'Puertos liberados. Ejecuta: npm run dev'
