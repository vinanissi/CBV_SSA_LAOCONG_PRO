<#
  Sync mirrored copies for _handoff/CLAUDE_FINANCE_PACK from repo sources listed in manifest.json.
  Usage (from repo root):
    .\scripts\export-claude-finance-pack.ps1
    .\scripts\export-claude-finance-pack.ps1 -Tiers 1,2,3
#>
[CmdletBinding()]
param(
  [string]$RepoRoot = "",
  [string]$PackDir = "",
  [ValidateRange(1, 6)]
  [int[]]$Tiers = @(1, 2, 3, 4, 5, 6)
)

$ErrorActionPreference = "Stop"

if (-not $RepoRoot) {
  $RepoRoot = Split-Path -Parent $PSScriptRoot
}
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path

if (-not $PackDir) {
  $PackDir = Join-Path $RepoRoot "_handoff\CLAUDE_FINANCE_PACK"
}
$PackDir = (Resolve-Path -LiteralPath $PackDir).Path

$manifestPath = Join-Path $PackDir "manifest.json"
if (-not (Test-Path -LiteralPath $manifestPath)) {
  throw "Missing manifest: $manifestPath"
}

$raw = Get-Content -LiteralPath $manifestPath -Raw -Encoding UTF8
$manifest = $raw | ConvertFrom-Json
$tierSet = @{}
foreach ($t in $Tiers) { $tierSet[$t] = $true }

$copied = 0
foreach ($entry in $manifest.entries) {
  $tier = [int]$entry.tier
  if (-not $tierSet.ContainsKey($tier)) { continue }

  $srcRel = $entry.source -replace "/", [IO.Path]::DirectorySeparatorChar
  $destRel = $entry.dest -replace "/", [IO.Path]::DirectorySeparatorChar
  $src = Join-Path $RepoRoot $srcRel
  $dest = Join-Path $PackDir $destRel

  if (-not (Test-Path -LiteralPath $src)) {
    throw "Source missing: $src (tier $tier)"
  }

  $destParent = Split-Path -Parent $dest
  if (-not (Test-Path -LiteralPath $destParent)) {
    New-Item -ItemType Directory -Path $destParent -Force | Out-Null
  }
  Copy-Item -LiteralPath $src -Destination $dest -Force
  $copied++
}

Write-Host "export-claude-finance-pack: copied $copied file(s) into $PackDir (tiers: $($Tiers -join ', '))"
