<#
Start-Dev.ps1
Automatiza el arranque del entorno de desarrollo en Windows:
- Inicia MongoDB en Docker si no existe
- Copia .env desde los ejemplos si no existen
- Instala dependencias (opcional)
- Abre dos consolas: una para el backend (DeadApp) y otra para el frontend (DEADFRONT/frontend)

Uso:
  powershell -ExecutionPolicy Bypass -File .\scripts\start-dev.ps1  # usa defaults
  .\scripts\start-dev.ps1 -InstallDependencies  # instala deps antes de arrancar

# Requiere PowerShell en Windows y Docker (opcional, pero recomendado)
# Puede pedir credenciales o mostrar prompts al usuario.
#>

param(
  [switch]$InstallDependencies = $false,
  [int]$BackendPort = 3002,
  [string]$BackendPath = "$PSScriptRoot\..",
  [string]$FrontendPath = "$PSScriptRoot\..\DEADFRONT\frontend",
  [string]$MongoContainerName = 'test-mongo'
)

Set-StrictMode -Version Latest

Function Write-Ok($msg) { Write-Host $msg -ForegroundColor Green }
Function Write-Warn($msg) { Write-Host $msg -ForegroundColor Yellow }
Function Write-Err($msg) { Write-Host $msg -ForegroundColor Red }

Write-Host "[start-dev] Preparando entorno de desarrollo..."

# 1) Docker / Mongo
try {
  docker version > $null 2>&1
  $dockerAvailable = $true
} catch {
  $dockerAvailable = $false
}

if ($dockerAvailable) {
  Write-Host "Docker detectado. Verificando contenedor MongoDB ($MongoContainerName)..."
  $container = docker ps -a --filter "name=$MongoContainerName" --format "{{.Names}}:{{.Status}}" 2>$null
  if (-not $container) {
    Write-Host "No existe el contenedor $MongoContainerName. Creando y arrancando MongoDB..."
    docker run -d --name $MongoContainerName -p 27017:27017 mongo:6 | Out-Null
    Start-Sleep -Seconds 3
    Write-Ok "MongoDB iniciado en contenedor $MongoContainerName (puerto 27017)."
  } else {
    if ($container -match ':Exited') {
      Write-Host "Contenedor existe pero está detenido. Iniciando..."
      docker start $MongoContainerName | Out-Null
      Start-Sleep -Seconds 2
      Write-Ok "Contenedor $MongoContainerName iniciado."
    } else {
      Write-Ok "Contenedor $MongoContainerName ya está en ejecución."
    }
  }
} else {
  Write-Warn "Docker no encontrado: asegúrate de tener MongoDB corriendo manualmente (mongod)."
}

# 2) Copiar .env si falta
Write-Host "Asegurando archivos de entorno..."

$backendEnvExample = Join-Path $BackendPath '.env.example'
$backendEnv = Join-Path $BackendPath '.env'
if (-not (Test-Path $backendEnv)) {
  if (Test-Path $backendEnvExample) {
    Copy-Item $backendEnvExample $backendEnv
    Write-Ok "Se creó $backendEnv desde el ejemplo. Edita si necesitas ajustar valores."
  } else {
    Write-Warn "No se encontró .env.example en $BackendPath. Crea .env manualmente."
  }
} else { Write-Ok "Backend .env ya existe." }

$frontendEnvExample = Join-Path $FrontendPath '.env.local.example'
$frontendEnv = Join-Path $FrontendPath '.env.local'
if (-not (Test-Path $frontendEnv)) {
  if (Test-Path $frontendEnvExample) {
    Copy-Item $frontendEnvExample $frontendEnv
    Write-Ok "Se creó $frontendEnv desde el ejemplo. Edita si necesitas ajustar valores."
  } else {
    Write-Warn "No se encontró .env.local.example en $FrontendPath. Crea .env.local manualmente."
  }
} else { Write-Ok "Frontend .env.local ya existe." }

# 3) Instalar dependencias si se pidió
if ($InstallDependencies) {
  Write-Host "Instalando dependencias (puede tardar)..."
  Push-Location $BackendPath
  if (Test-Path package.json) { npm install }
  Pop-Location

  Push-Location $FrontendPath
  if (Test-Path package.json) { npm install }
  Pop-Location
  Write-Ok "Dependencias instaladas."
} else {
  Write-Host "Salteando instalación de dependencias. Usa -InstallDependencies para instalarlas ahora." 
}

# 4) Abrir ventanas nuevas para backend y frontend
Write-Host "Abriendo consolas para backend y frontend..."

$backendCmd = "cd `"$BackendPath`"; npm run dev"
$frontendCmd = "cd `"$FrontendPath`"; npm run dev"

Start-Process powershell -ArgumentList "-NoExit","-Command","$backendCmd" -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit","-Command","$frontendCmd" -WindowStyle Normal

Write-Ok "Se abrieron las ventanas para backend y frontend. Esperando a que el backend responda en http://localhost:$BackendPort/health ..."

# 5) Esperar a que /health responda
$healthUrl = "http://localhost:$BackendPort/health"
$maxAttempts = 30
$attempt = 0
while ($attempt -lt $maxAttempts) {
  try {
    $resp = Invoke-RestMethod -Method Get -Uri $healthUrl -ErrorAction Stop
    if ($resp -and $resp.status) {
      Write-Ok "Backend listo: $healthUrl responded: $($resp | ConvertTo-Json -Depth 2)"
      break
    }
  } catch {
    Start-Sleep -Seconds 2
    $attempt++
  }
}

if ($attempt -ge $maxAttempts) {
  Write-Err "Timeout esperando /health. Revisa la consola del backend para errores."
  exit 1
}

Write-Ok "Frontend disponible en http://localhost:3000 (abre en navegador)..."
Start-Process "http://localhost:3000"

Write-Host "Listo. Si ves 'Network Error' en la UI, revisa que NEXT_PUBLIC_API_URL en $frontendEnv apunte a http://localhost:$BackendPort/api y que el backend no tenga errores en la consola."
