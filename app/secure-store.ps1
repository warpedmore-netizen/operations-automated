[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("Delete", "Get", "Set")]
    [string]$Operation,

    [Parameter(Mandatory = $true)]
    [string]$StorePath
)

$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Security
$utf8 = [System.Text.UTF8Encoding]::new($false)
$entropy = $utf8.GetBytes("OperationsAutomated.Workbench.Confluence.v1")
$resolvedParent = [System.IO.Path]::GetFullPath((Split-Path -Parent $StorePath))
$localAppData = [System.IO.Path]::GetFullPath($env:LOCALAPPDATA).TrimEnd(
    [System.IO.Path]::DirectorySeparatorChar,
    [System.IO.Path]::AltDirectorySeparatorChar
)
$localAppDataBoundary = $localAppData + [System.IO.Path]::DirectorySeparatorChar

if (-not $resolvedParent.StartsWith($localAppDataBoundary, [System.StringComparison]::OrdinalIgnoreCase)) {
    throw "The credential store must remain inside the current Windows user's local application data."
}

[Console]::OutputEncoding = $utf8

if ($Operation -eq "Delete") {
    if (Test-Path -LiteralPath $StorePath -PathType Leaf) {
        Remove-Item -LiteralPath $StorePath -Force
    }
    [Console]::Out.Write('{"deleted":true}')
    exit 0
}

if ($Operation -eq "Get") {
    if (-not (Test-Path -LiteralPath $StorePath -PathType Leaf)) {
        [Console]::Out.Write('{"configured":false}')
        exit 0
    }
    $protectedBytes = [System.IO.File]::ReadAllBytes($StorePath)
    $plainBytes = [System.Security.Cryptography.ProtectedData]::Unprotect(
        $protectedBytes,
        $entropy,
        [System.Security.Cryptography.DataProtectionScope]::CurrentUser
    )
    $plainText = $utf8.GetString($plainBytes)
    $null = $plainText | ConvertFrom-Json
    [Console]::Out.Write('{"configured":true,"value":')
    [Console]::Out.Write($plainText)
    [Console]::Out.Write("}")
    exit 0
}

$plainText = [Console]::In.ReadToEnd()
if ([string]::IsNullOrWhiteSpace($plainText)) {
    throw "No credential payload was supplied."
}
$null = $plainText | ConvertFrom-Json
[System.IO.Directory]::CreateDirectory($resolvedParent) | Out-Null
$plainBytes = $utf8.GetBytes($plainText)
$protectedBytes = [System.Security.Cryptography.ProtectedData]::Protect(
    $plainBytes,
    $entropy,
    [System.Security.Cryptography.DataProtectionScope]::CurrentUser
)
$temporaryPath = "$StorePath.$PID.tmp"
try {
    [System.IO.File]::WriteAllBytes($temporaryPath, $protectedBytes)
    Move-Item -LiteralPath $temporaryPath -Destination $StorePath -Force
} finally {
    if (Test-Path -LiteralPath $temporaryPath) {
        Remove-Item -LiteralPath $temporaryPath -Force
    }
}
[Console]::Out.Write('{"stored":true}')
