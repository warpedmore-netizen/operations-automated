param(
    [Parameter(Mandatory = $true)]
    [string]$Query
)

$terms = [regex]::Matches($Query.ToLowerInvariant(), '[a-z0-9][a-z0-9-]{2,}') |
    ForEach-Object { $_.Value } |
    Where-Object { $_ -notin @('and', 'the', 'for', 'with', 'from', 'into', 'this', 'that', 'work') } |
    Select-Object -Unique

if (-not $terms) {
    Write-Output 'No usable search terms were supplied.'
    exit 0
}

$ideaFiles = Get-ChildItem -LiteralPath $PSScriptRoot -Filter '*.md' -File |
    Where-Object { $_.Name -ne 'README.md' }

$minimumMatches = if (@($terms).Count -eq 1) { 1 } else { 2 }

$matches = foreach ($file in $ideaFiles) {
    $content = Get-Content -Raw -LiteralPath $file.FullName
    $normalised = $content.ToLowerInvariant()
    $matchedTerms = @($terms | Where-Object { $normalised.Contains($_) })

    if ($matchedTerms.Count -ge $minimumMatches) {
        $title = if ($content -match '(?m)^title:\s*(.+)$') { $Matches[1].Trim() } else { $file.BaseName }
        $ideaStatus = if ($content -match '(?m)^idea_status:\s*(.+)$') { $Matches[1].Trim() } else { 'unknown' }

        [PSCustomObject]@{
            Score = $matchedTerms.Count
            Title = $title
            IdeaStatus = $ideaStatus
            MatchedTerms = ($matchedTerms -join ', ')
            Path = $file.FullName
        }
    }
}

if (-not $matches) {
    Write-Output 'No related ideas were found by the text search. Check explicit links and the Ideas Space register before finalising scope.'
    exit 0
}

Write-Output 'There are existing ideas related to this area. Review them before finalising the scope.'
$matches |
    Sort-Object -Property @{ Expression = 'Score'; Descending = $true }, Title |
    Format-Table -AutoSize Title, IdeaStatus, MatchedTerms, Path
