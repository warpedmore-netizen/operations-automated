[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
$repositoryRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$environmentPath = Join-Path $repositoryRoot ".env"

Write-Host "Operations Automated Workbench - OpenAI setup"
Write-Host ""
Write-Host "Your API key will be written only to the local .env file."
Write-Host "It will not be displayed, committed, stored in SQLite, or sent to the browser."
Write-Host ""

$secureKey = Read-Host "Paste your OpenAI API key" -AsSecureString
$keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)

try {
    $apiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
    if ([string]::IsNullOrWhiteSpace($apiKey) -or $apiKey.Length -lt 20) {
        throw "The API key was empty or too short."
    }

    $environmentContent = @"
# Local server-side configuration. This file is excluded from Git.
OPENAI_API_KEY=$apiKey
OPENAI_TIER_1_MODEL=gpt-5.6-sol
OPENAI_TIER_2_MODEL=gpt-5.6-sol
OPENAI_TIER_3_MODEL=gpt-5.6-sol
OPENAI_TRANSCRIBE_MODEL=gpt-4o-mini-transcribe
WORKBENCH_REPOSITORY_MODE=manual
PORT=4173
"@

    $utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)
    [IO.File]::WriteAllText($environmentPath, $environmentContent, $utf8WithoutBom)
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
    $apiKey = $null
}

Write-Host ""
Write-Host "Configuration saved."
Write-Host "1. Close the window titled 'Operations Automated Workbench - keep open' if it is running."
Write-Host "2. Run Start-Workbench.ps1."
Write-Host "3. Open http://127.0.0.1:4173 and confirm the header says 'Provider connected'."
Write-Host ""
Write-Host "API usage is billed separately from ChatGPT subscriptions. Configure billing and limits in your OpenAI API account."
