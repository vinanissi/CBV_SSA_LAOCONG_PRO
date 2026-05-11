<#!
  repo-audit.ps1 — Read-only scan of first-level child folders under -RootPath.
  Lists: package.json, appsscript.json, .clasp.json, supabase/**/config.toml (by depth).
  For git repos: current branch (best effort). Does not modify any source repo.
#>
param(
  [string]$RootPath = "D:\Workspace\projects",
  [string]$ReportPath = (Join-Path $PSScriptRoot "out\repo-audit-report.md"),
  [int]$MaxDepthFiles = 8
)

$ErrorActionPreference = "Stop"

function Sanitize-Remote([string]$u) {
  if ([string]::IsNullOrWhiteSpace($u)) { return "" }
  if ($u -match 'ghp_|github_pat_|xox[baprs]-') { return "<CREDENTIAL_REMOVED>" }
  return ($u -replace 'https://[^:]+:[^@]+@', 'https://')
}

function Get-FilesLimited {
  param([string]$Base, [string]$Filter, [int]$Depth)
  if (-not (Test-Path -LiteralPath $Base)) { return @() }
  # PowerShell -Depth: levels of subfolders under -Path (see Get-ChildItem docs).
  return @(Get-ChildItem -LiteralPath $Base -Filter $Filter -File -Recurse -Depth $Depth -ErrorAction SilentlyContinue)
}

if (-not (Test-Path -LiteralPath $RootPath)) {
  Write-Error "RootPath not found: $RootPath"
}

$dir = Split-Path -Parent $ReportPath
if (-not (Test-Path -LiteralPath $dir)) {
  New-Item -ItemType Directory -Path $dir | Out-Null
}

$children = Get-ChildItem -LiteralPath $RootPath -Directory -ErrorAction SilentlyContinue | Sort-Object Name
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("# Repo audit report")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("| Field | Value |")
[void]$sb.AppendLine("|-------|-------|")
[void]$sb.AppendLine("| Generated (UTC) | $([DateTime]::UtcNow.ToString('yyyy-MM-dd HH:mm:ss'))Z |")
[void]$sb.AppendLine("| RootPath | ``$RootPath`` |")
[void]$sb.AppendLine("| MaxDepthFiles | $MaxDepthFiles |")
[void]$sb.AppendLine("")

$totalPkg = 0
$totalAs = 0
$totalClasp = 0
$totalSb = 0
$totalGit = 0

foreach ($c in $children) {
  $p = $c.FullName
  $name = $c.Name
  $hasGit = Test-Path -LiteralPath (Join-Path $p ".git")

  $pkgs = @(Get-FilesLimited -Base $p -Filter "package.json" -Depth $MaxDepthFiles)
  $apps = @(Get-FilesLimited -Base $p -Filter "appsscript.json" -Depth $MaxDepthFiles)
  $clasps = @(Get-FilesLimited -Base $p -Filter ".clasp.json" -Depth $MaxDepthFiles)
  $supas = @(Get-FilesLimited -Base $p -Filter "config.toml" -Depth $MaxDepthFiles | Where-Object { $_.FullName -match '[\\/]supabase[\\/]' })

  $branch = ""
  $remote = ""
  if ($hasGit) {
    $totalGit++
    Push-Location -LiteralPath $p
    try { $branch = (& git rev-parse --abbrev-ref HEAD 2>$null | Out-String).Trim() } catch { $branch = "" }
    try { $remote = (& git remote get-url origin 2>$null | Out-String).Trim() } catch { $remote = "" }
    Pop-Location
  }
  $remoteS = Sanitize-Remote $remote

  $totalPkg += $pkgs.Count
  $totalAs += $apps.Count
  $totalClasp += $clasps.Count
  $totalSb += $supas.Count

  [void]$sb.AppendLine("## $name")
  [void]$sb.AppendLine("")
  [void]$sb.AppendLine("| Key | Value |")
  [void]$sb.AppendLine("|-----|-------|")
  [void]$sb.AppendLine("| Path | ``$p`` |")
  [void]$sb.AppendLine("| .git | $(if ($hasGit) { 'yes' } else { 'no' }) |")
  if ($hasGit) {
    [void]$sb.AppendLine("| git branch | ``$branch`` |")
    [void]$sb.AppendLine("| git remote origin (sanitized) | ``$remoteS`` |")
  }
  [void]$sb.AppendLine("| package.json count | $($pkgs.Count) |")
  [void]$sb.AppendLine("| appsscript.json count | $($apps.Count) |")
  [void]$sb.AppendLine("| .clasp.json count | $($clasps.Count) |")
  [void]$sb.AppendLine("| supabase config.toml count | $($supas.Count) |")
  [void]$sb.AppendLine("")

  if ($pkgs.Count -gt 0) {
    [void]$sb.AppendLine("### package.json paths")
    foreach ($f in $pkgs | Sort-Object FullName) { [void]$sb.AppendLine("- ``$($f.FullName)``") }
    [void]$sb.AppendLine("")
  }
  if ($apps.Count -gt 0) {
    [void]$sb.AppendLine("### appsscript.json paths")
    foreach ($f in $apps | Sort-Object FullName) { [void]$sb.AppendLine("- ``$($f.FullName)``") }
    [void]$sb.AppendLine("")
  }
  if ($clasps.Count -gt 0) {
    [void]$sb.AppendLine("### .clasp.json paths (do not commit secrets)")
    foreach ($f in $clasps | Sort-Object FullName) { [void]$sb.AppendLine("- ``$($f.FullName)``") }
    [void]$sb.AppendLine("")
  }
  if ($supas.Count -gt 0) {
    [void]$sb.AppendLine("### supabase config.toml paths")
    foreach ($f in $supas | Sort-Object FullName) { [void]$sb.AppendLine("- ``$($f.FullName)``") }
    [void]$sb.AppendLine("")
  }
}

[void]$sb.AppendLine("## Summary (aggregated file hits)")
[void]$sb.AppendLine("")
[void]$sb.AppendLine("| Metric | Value |")
[void]$sb.AppendLine("|--------|-------|")
[void]$sb.AppendLine("| Child folders | $($children.Count) |")
[void]$sb.AppendLine("| With .git | $totalGit |")
[void]$sb.AppendLine("| Total package.json listed | $totalPkg |")
[void]$sb.AppendLine("| Total appsscript.json listed | $totalAs |")
[void]$sb.AppendLine("| Total .clasp.json listed | $totalClasp |")
[void]$sb.AppendLine("| Total supabase config.toml listed | $totalSb |")
[void]$sb.AppendLine("")

[System.IO.File]::WriteAllText($ReportPath, $sb.ToString(), (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Wrote report: $ReportPath"
