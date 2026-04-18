# ============================================================
# Vu UniVerse360 Unified Bootstrapper v2.1
# Starts: NestJS Backend (5001) + AI Agent (8000) + Frontend (3000)
# ============================================================

$Host.UI.RawUI.WindowTitle = "Vu UniVerse360 - Unified Controller"

function Show-Header {
    Clear-Host
    Write-Host ""
    Write-Host "  +------------------------------------------------------+" -ForegroundColor Cyan
    Write-Host "  |    Vu UniVerse360 - UNIFIED CONTROLLER v2.1          |" -ForegroundColor Cyan
    Write-Host "  |    NestJS + React + AI Agent                         |" -ForegroundColor Cyan
    Write-Host "  +------------------------------------------------------+" -ForegroundColor Cyan
    Write-Host ""
}

function Check-Prereqs {
    Write-Host "[1/4] Checking environment..." -ForegroundColor Yellow
    if (!(Get-Command node -ErrorAction SilentlyContinue)) {
        Write-Error "Node.js not found. Please install it from https://nodejs.org"
        exit 1
    }
    $nodeVer = (node --version)
    Write-Host "   ✓ Node.js $nodeVer" -ForegroundColor Green

    if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error "npm not found."
        exit 1
    }

    if (!(Get-Command python -ErrorAction SilentlyContinue)) {
        Write-Warning "   ⚠ Python not found - AI Agent will be skipped."
    }
    else {
        $pyVer = (python --version)
        Write-Host "   ✓ $pyVer" -ForegroundColor Green
    }
    Write-Host ""
}

function Cleanup-Ports {
    Write-Host "[2/4] Freeing ports 3000, 5001, 8000..." -ForegroundColor Yellow
    $ports = @(3000, 5001, 8000)
    foreach ($port in $ports) {
        $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($connections) {
            $procId = ($connections | Select-Object -First 1).OwningProcess
            if ($procId -gt 0) {
                try {
                    Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
                    Write-Host "   ✓ Freed port $port (PID $procId)" -ForegroundColor Gray
                }
                catch {
                    # Ignore
                }
            }
        }
    }
    Start-Sleep -Milliseconds 500
    Write-Host ""
}

function Build-NestBackend {
    Write-Host "[3/4] Checking dependencies..." -ForegroundColor Yellow
    $nestDir = Join-Path $PSScriptRoot "backend-nest"
    $distMain = Join-Path $nestDir "dist\main.js"
    $rootNodeModules = Join-Path $PSScriptRoot "node_modules"

    if (!(Test-Path $rootNodeModules)) {
        Write-Host "   Installing frontend dependencies (first run)..." -ForegroundColor Gray
        Push-Location $PSScriptRoot
        npm install --legacy-peer-deps --silent
        Pop-Location
        Write-Host "   ✓ Frontend dependencies installed" -ForegroundColor Green
    }
    else {
        Write-Host "   ✓ Frontend node_modules present" -ForegroundColor Green
    }

    if (!(Test-Path (Join-Path $nestDir "node_modules"))) {
        Write-Host "   Installing NestJS dependencies..." -ForegroundColor Gray
        Push-Location $nestDir
        npm install --legacy-peer-deps --silent
        Pop-Location
    }

    if (!(Test-Path $distMain)) {
        Write-Host "   Building NestJS backend (first time)..." -ForegroundColor Gray
        Push-Location $nestDir
        npm run build
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "   ⚠ NestJS build failed. Will run in dev mode instead."
        }
        else {
            Write-Host "   ✓ NestJS build complete" -ForegroundColor Green
        }
        Pop-Location
    }
    else {
        Write-Host "   ✓ NestJS dist already built" -ForegroundColor Green
    }
    Write-Host ""
}

function Start-AllServices {
    Write-Host "[4/4] Launching all services..." -ForegroundColor Yellow
    
    if (!(Test-Path (Join-Path $PSScriptRoot "run-all.js"))) {
        Write-Error "run-all.js not found!"
        return
    }

    Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne $PID } | ForEach-Object {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }

    Start-Process node "run-all.js" -NoNewWindow -WorkingDirectory $PSScriptRoot

    Write-Host ""
    Write-Host "  +------------------------------------------------------+" -ForegroundColor Green
    Write-Host "  |   🚀  SYSTEM ONLINE!                                 |" -ForegroundColor Green
    Write-Host "  |   Frontend: http://localhost:3000                    |" -ForegroundColor Green
    Write-Host "  |   NestJS:   http://localhost:5001/api                |" -ForegroundColor Green
    Write-Host "  |   AI Agent: http://localhost:8000                    |" -ForegroundColor Green
    Write-Host "  |   Press any key to STOP all services and exit.       |" -ForegroundColor Green
    Write-Host "  +------------------------------------------------------+" -ForegroundColor Green
    Write-Host ""

    if ($Host.UI.RawUI -and $Host.Name -notmatch "Visual Studio") {
        try {
            $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        }
        catch {
            Write-Host "Running... (Press Ctrl+C to stop)"
            while ($true) { Start-Sleep 1 }
        }
    }
    else {
        Write-Host "Running... (Press Ctrl+C to stop)"
        while ($true) { Start-Sleep 1 }
    }

    Write-Host "`n  Stopping all services..." -ForegroundColor Red
    Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object { $_.Id -ne $PID } | ForEach-Object {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Get-Process -Name python -ErrorAction SilentlyContinue | ForEach-Object {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Write-Host "  ✓ All services stopped." -ForegroundColor Green
    Write-Host ""
}

# --- EXECUTION ---
Show-Header
Check-Prereqs
Cleanup-Ports
Build-NestBackend
Start-AllServices
