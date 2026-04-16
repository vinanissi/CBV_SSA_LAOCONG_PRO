<#
  Export Finance + system-link pack to repo root folder: claude/
  - Each run: deletes all contents of claude/, then recreates.
  - Numbered files 01..N; flat names (see lib/Export-ClaudePack.ps1).
  - Source list: _handoff/CLAUDE_FINANCE_PACK/manifest.json

  From repo root:
    .\scripts\export-claude-finance-upload.ps1
#>
[CmdletBinding()]
param(
  [string]$RepoRoot = ""
)

$ErrorActionPreference = "Stop"

if (-not $RepoRoot) {
  $RepoRoot = Split-Path -Parent $PSScriptRoot
}
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path

. (Join-Path $PSScriptRoot "lib\Export-ClaudePack.ps1")

$outDir = Join-Path $RepoRoot "claude"
$manifestPath = Join-Path $RepoRoot "_handoff\CLAUDE_FINANCE_PACK\manifest.json"
$huongDanSrc = Join-Path $PSScriptRoot "claude-finance-upload-HUONG_DAN.md"

if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "Missing manifest: $manifestPath"
}
if (-not (Test-Path -LiteralPath $huongDanSrc)) {
  throw "Missing template: $huongDanSrc"
}

$raw = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8
$manifest = $raw | ConvertFrom-Json

$sorted = [System.Collections.Generic.List[object]]::new()
foreach ($tier in 1..6) {
  foreach ($entry in $manifest.entries) {
    if ([int]$entry.tier -eq $tier) {
      $sorted.Add($entry)
    }
  }
}

$sources = [System.Collections.Generic.List[string]]::new()
foreach ($entry in $sorted) {
  [void]$sources.Add($entry.source)
}

Export-ClaudeNumberedPack -RepoRoot $RepoRoot -OutDir $outDir -RelativePaths @($sources) -HuongDanSourcePath $huongDanSrc
