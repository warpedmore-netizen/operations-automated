[CmdletBinding()]
param(
    [int]$Port = 4173,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$healthUrl = "http://127.0.0.1:$Port/api/settings"
$workbenchUrl = "http://127.0.0.1:$Port"

try {
    $existingResponse = Invoke-WebRequest -UseBasicParsing -Uri $healthUrl -TimeoutSec 2
    if ($existingResponse.StatusCode -eq 200) {
        Write-Host "Operations Automated Workbench is already running:"
        Write-Host $workbenchUrl
        if (-not $NoBrowser) { Start-Process $workbenchUrl }
        exit 0
    }
} catch {
    # No healthy Workbench is currently responding.
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

$serverCommand = "Set-Location -LiteralPath '$repositoryRoot'; `$env:PORT='$Port'; `$Host.UI.RawUI.WindowTitle='Operations Automated Workbench - keep open'; Write-Host 'Keep this window open while using the Workbench.'; & '$nodeExecutable' 'app\server.mjs'"
$workbenchProcess = Start-Process `
    -FilePath "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" `
    -ArgumentList @("-NoExit", "-Command", $serverCommand) `
    -PassThru

for ($attempt = 0; $attempt -lt 20; $attempt++) {
    Start-Sleep -Milliseconds 250
    if ($workbenchProcess.HasExited) { throw "The Workbench stopped before it became ready." }
    try {
        $response = Invoke-WebRequest -UseBasicParsing -Uri $healthUrl -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            Write-Host "Operations Automated Workbench is running:"
            Write-Host $workbenchUrl
            Write-Host "Process ID: $($workbenchProcess.Id)"
            if (-not $NoBrowser) { Start-Process $workbenchUrl }
            exit 0
        }
    } catch {
        # The local service may still be starting.
    }
}

Stop-Process -Id $workbenchProcess.Id -Force -ErrorAction SilentlyContinue
throw "The Workbench did not become ready at $workbenchUrl."
