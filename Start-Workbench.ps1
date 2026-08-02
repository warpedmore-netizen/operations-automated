[CmdletBinding()]
param(
    [int]$Port = 4173,
    [ValidateSet("", "brand")]
    [string]$InitialView = "",
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$healthUrl = "http://127.0.0.1:$Port/api/settings"
$workbenchBaseUrl = "http://127.0.0.1:$Port"
$workbenchUrl = if ($InitialView) { "$workbenchBaseUrl#$InitialView" } else { $workbenchBaseUrl }
$expectedBuildVersion = (Get-Content -LiteralPath (Join-Path $repositoryRoot "app\build-version.txt") -Raw).Trim()

function Get-ListeningProcessId {
    param([int]$PortNumber)
    $pattern = "^\s*TCP\s+\S+:$PortNumber\s+\S+\s+LISTENING\s+(\d+)\s*$"
    foreach ($line in (& netstat -ano -p TCP)) {
        if ($line -match $pattern) { return [int]$Matches[1] }
    }
    return $null
}

$recognisedWorkbench = $false
try {
    $existingResponse = Invoke-WebRequest -UseBasicParsing -Uri $healthUrl -TimeoutSec 2
    if ($existingResponse.StatusCode -eq 200) {
        $existingSettings = $existingResponse.Content | ConvertFrom-Json
        if ($existingSettings.buildVersion -eq $expectedBuildVersion) {
            Write-Host "Operations Automated Workbench is already running:"
            Write-Host $workbenchUrl
            if (-not $NoBrowser) { Start-Process $workbenchUrl }
            exit 0
        }
        if (-not $existingSettings.buildVersion -or -not $existingSettings.currentUser) {
            throw "Port $Port is responding, but it is not a recognised Operations Automated Workbench."
        }
        $recognisedWorkbench = $true
        $listenerProcessId = Get-ListeningProcessId -PortNumber $Port
        $listenerProcess = if ($listenerProcessId) { Get-Process -Id $listenerProcessId -ErrorAction SilentlyContinue } else { $null }
        if (-not $listenerProcess -or $listenerProcess.ProcessName -ne "node") {
            throw "An outdated Workbench is responding on port $Port, but its server process could not be verified safely. Stop the existing Operations Automated Workbench process and run the launcher again."
        }
        Write-Host "Refreshing outdated Workbench server $($existingSettings.buildVersion) to $expectedBuildVersion..."
        Stop-Process -Id $listenerProcessId -ErrorAction Stop
        for ($attempt = 0; $attempt -lt 20; $attempt++) {
            Start-Sleep -Milliseconds 100
            try {
                $null = Invoke-WebRequest -UseBasicParsing -Uri $healthUrl -TimeoutSec 1
            } catch {
                break
            }
        }
    }
} catch {
    if ($recognisedWorkbench -or $_.Exception.Message -match "not a recognised") { throw }
    # No healthy Workbench is currently responding, or the verified stale server has stopped.
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

$serverCommand = "Set-Location -LiteralPath '$repositoryRoot'; `$env:PORT='$Port'; `$env:WORKBENCH_REPOSITORY_ROOT='$repositoryRoot'; & '$nodeExecutable' 'app\server.mjs'"
$workbenchProcess = Start-Process `
    -FilePath "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe" `
    -ArgumentList @("-NoProfile", "-Command", $serverCommand) `
    -WindowStyle Hidden `
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
