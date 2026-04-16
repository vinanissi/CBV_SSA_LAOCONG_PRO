<#
  Per-module Claude export -> claude_exports/module_<MODULE>/

  .\scripts\export-claude-module.ps1 -Module HO_SO|TASK_CENTER|FINANCE
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory)]
  [ValidateSet("HO_SO", "TASK_CENTER", "FINANCE")]
  [string]$Module,
  [string]$RepoRoot = ""
)

$ErrorActionPreference = "Stop"

$ScriptDir = $PSScriptRoot
if (-not $RepoRoot) {
  $RepoRoot = Split-Path -Parent $ScriptDir
}
$RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path

. (Join-Path $ScriptDir "lib\Export-ClaudePack.ps1")

function Get-RelativeUnixPath {
  param(
    [string]$RepoRootResolved,
    [string]$FullPath
  )
  $a = (Resolve-Path -LiteralPath $FullPath).Path
  if (-not $a.StartsWith($RepoRootResolved, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Path not under repo: $FullPath"
  }
  $rel = $a.Substring($RepoRootResolved.Length).TrimStart([char[]]@('\', '/'))
  return ($rel -replace '\\', '/')
}

function Test-GasNameMatch {
  param(
    [string]$BaseName,
    [string[]]$RegexList
  )
  foreach ($rx in $RegexList) {
    if ($BaseName -match $rx) { return $true }
  }
  return $false
}

$packPath = Join-Path $ScriptDir "claude-module-packs.json"
$packRoot = (Get-Content -LiteralPath $packPath -Raw -Encoding UTF8) | ConvertFrom-Json
$def = $packRoot.PSObject.Properties[$Module].Value
if (-not $def) {
  throw "Unknown module key in claude-module-packs.json: $Module"
}

$ordered = [System.Collections.Generic.List[string]]::new()
$seen = @{}

if ($def.useHandoffManifest -eq $true) {
  $hm = if ($def.handoffManifestPath) { $def.handoffManifestPath } else { "_handoff/CLAUDE_FINANCE_PACK/manifest.json" }
  $hmFull = Join-Path $RepoRoot ($hm -replace '/', [IO.Path]::DirectorySeparatorChar)
  $manifest = (Get-Content -LiteralPath $hmFull -Raw -Encoding UTF8) | ConvertFrom-Json
  $commonFirst = @()
  if ($def.common) { $commonFirst = @($def.common | ForEach-Object { [string]$_ }) }
  Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths $commonFirst
  $sorted = [System.Collections.Generic.List[object]]::new()
  foreach ($tier in 1..6) {
    foreach ($entry in $manifest.entries) {
      if ([int]$entry.tier -eq $tier) { [void]$sorted.Add($entry) }
    }
  }
  foreach ($entry in $sorted) {
    Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths @($entry.source)
  }
}
else {
  $commonList = @()
  if ($def.common) { $commonList = @($def.common | ForEach-Object { [string]$_ }) }
  Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths $commonList

  if ($def.specRecursiveGlobBase) {
    $specDir = Join-Path $RepoRoot ($def.specRecursiveGlobBase -replace '/', [IO.Path]::DirectorySeparatorChar)
    if (Test-Path -LiteralPath $specDir) {
      Get-ChildItem -LiteralPath $specDir -File -Recurse -Filter "*.md" -ErrorAction SilentlyContinue |
        Sort-Object FullName |
        ForEach-Object {
          Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths @(
            (Get-RelativeUnixPath -RepoRootResolved $RepoRoot -FullPath $_.FullName)
          )
        }
    }
  }

  $schemaMd = @()
  if ($def.schemaMarkdown) { $schemaMd = @($def.schemaMarkdown | ForEach-Object { [string]$_ }) }
  Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths $schemaMd

  if ($def.includeSchemaManifest -eq $true) {
    Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths @("06_DATABASE/schema_manifest.json")
    $smPath = Join-Path $RepoRoot "06_DATABASE\schema_manifest.json"
    $sm = (Get-Content -LiteralPath $smPath -Raw -Encoding UTF8) | ConvertFrom-Json
    $prefixes = @()
    if ($def.schemaCsvPrefixes) { $prefixes = @($def.schemaCsvPrefixes | ForEach-Object { [string]$_ }) }
    foreach ($prefix in $prefixes) {
      foreach ($name in ($sm.PSObject.Properties.Name | Sort-Object)) {
        if ($name -like "$prefix*") {
          $csvRel = "06_DATABASE/_generated_schema/$name.csv"
          $csvFull = Join-Path $RepoRoot ($csvRel -replace '/', [IO.Path]::DirectorySeparatorChar)
          if (Test-Path -LiteralPath $csvFull) {
            Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths @($csvRel)
          }
        }
      }
    }
  }

  $claspPath = Join-Path $RepoRoot ".clasp.json"
  $clasp = (Get-Content -LiteralPath $claspPath -Raw -Encoding UTF8) | ConvertFrom-Json
  $gasRx = @()
  if ($def.gasIncludeRegex) { $gasRx = @($def.gasIncludeRegex | ForEach-Object { [string]$_ }) }
  foreach ($gs in $clasp.filePushOrder) {
    if (Test-GasNameMatch -BaseName $gs -RegexList $gasRx) {
      Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths @("05_GAS_RUNTIME/$gs")
    }
  }

  $appPaths = @()
  if ($def.appsheetPaths) { $appPaths = @($def.appsheetPaths | ForEach-Object { [string]$_ }) }
  Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths $appPaths
  $arfList = @()
  if ($def.appsheetRecursiveFilters) { $arfList = @($def.appsheetRecursiveFilters) }
  foreach ($arf in $arfList) {
    if (-not $arf.relativeDir -or -not $arf.filter) { continue }
    $d = Join-Path $RepoRoot ($arf.relativeDir -replace '/', [IO.Path]::DirectorySeparatorChar)
    if (-not (Test-Path -LiteralPath $d)) { continue }
    Get-ChildItem -LiteralPath $d -File -Recurse -Filter $arf.filter -ErrorAction SilentlyContinue |
      Where-Object { $_.FullName -notmatch '\\99_ARCHIVE\\' } |
      Sort-Object FullName |
      ForEach-Object {
        Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths @(
          (Get-RelativeUnixPath -RepoRootResolved $RepoRoot -FullPath $_.FullName)
        )
      }
  }

  $extras = @()
  if ($def.extraPaths) { $extras = @($def.extraPaths | ForEach-Object { [string]$_ }) }
  Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths $extras
}

$outDir = Join-Path $RepoRoot ("claude_exports\module_" + $Module)
$huongDan = Join-Path $ScriptDir "claude-module-HUONG_DAN.md"

Export-ClaudeNumberedPack -RepoRoot $RepoRoot -OutDir $outDir -RelativePaths @($ordered) -HuongDanSourcePath $huongDan
