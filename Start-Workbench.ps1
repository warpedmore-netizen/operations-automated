[CmdletBinding()]
param(
    [int]$Port = 4173
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$healthUrl = "http://127.0.0.1:$Port/api/settings"
$workbenchUrl = "http://127.0.0.1:$Port"

$existingListener = Get-NetTCPConnection -LocalAddress 127.0.0.1 -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
if ($existingListener) {
    try {
        $existingResponse = Invoke-WebRequest -UseBasicParsing -Uri $healthUrl -TimeoutSec 3
        if ($existingResponse.StatusCode -eq 200) {
            Write-Host "Operations Automated Workbench is already running:"
            Write-Host $workbenchUrl
            exit 0
        }
    } catch {
        throw "Port $Port is already in use by another application."
    }
}

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$bundledNode = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"

if ($nodeCommand) {
    $nodeExecutable = $nodeCommand.Source
} elseif (Test-Path -LiteralPath $bundledNode) {
    $nodeExecutable = $bundledNode
} else {
    throw "Node.js was not found. Install Node.js 24 or start the Workbench from Codex Desktop."
}

$env:PORT = [string]$Port
$workbenchProcess = Start-Process `
    -FilePath $nodeExecutable `
    -ArgumentList "app/server.mjs" `
    -WorkingDirectory $repositoryRoot `
    -WindowStyle Hidden `
    -PassThru

for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 250
    if ($workbenchProcess.HasExited) {
        throw "The Workbench stopped before it became ready."
    }
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $healthUrl -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            Write-Host "Operations Automated Workbench is running:"
            Write-Host $workbenchUrl
            Write-Host "Process ID: $($workbenchProcess.Id)"
            exit 0
        }
    } catch {
        # The local service may still be starting.
    }
}

Stop-Process -Id $workbenchProcess.Id -Force -ErrorAction SilentlyContinue
throw "The Workbench did not become ready at $workbenchUrl."
