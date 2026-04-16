<#
  Full-system Claude export -> claude_exports/full/
  - Wipes output folder each run; flat numbered names (see lib/Export-ClaudePack.ps1).

  .\scripts\export-claude-full.ps1 [-IncludeAllAppSheet] [-IncludeTools]
#>
[CmdletBinding()]
param(
  [string]$RepoRoot = "",
  [switch]$IncludeAllAppSheet,
  [switch]$IncludeTools
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

function Add-FilesFromDirectory {
  param(
    [System.Collections.Generic.List[string]]$OrderedList,
    [hashtable]$Seen,
    [string]$Subdir,
    [string]$Filter = "*"
  )
  $dir = Join-Path $RepoRoot $Subdir
  if (-not (Test-Path -LiteralPath $dir)) { return }
  Get-ChildItem -LiteralPath $dir -File -Filter $Filter -ErrorAction SilentlyContinue |
    Sort-Object Name |
    ForEach-Object {
      Add-ClaudePathsUnique -OrderedList $OrderedList -Seen $Seen -NewPaths @(
        (Get-RelativeUnixPath -RepoRootResolved $RepoRoot -FullPath $_.FullName)
      )
    }
}

function Add-FilesRecursive {
  param(
    [System.Collections.Generic.List[string]]$OrderedList,
    [hashtable]$Seen,
    [string]$Subdir,
    [string]$Filter = "*"
  )
  $dir = Join-Path $RepoRoot $Subdir
  if (-not (Test-Path -LiteralPath $dir)) { return }
  Get-ChildItem -LiteralPath $dir -File -Recurse -Filter $Filter -ErrorAction SilentlyContinue |
    Sort-Object FullName |
    ForEach-Object {
      Add-ClaudePathsUnique -OrderedList $OrderedList -Seen $Seen -NewPaths @(
        (Get-RelativeUnixPath -RepoRootResolved $RepoRoot -FullPath $_.FullName)
      )
    }
}

$ordered = [System.Collections.Generic.List[string]]::new()
$seen = @{}

# 1 Meta
Add-FilesFromDirectory -OrderedList $ordered -Seen $seen -Subdir "00_META" -Filter "*.md"

# 2 Overview
Add-FilesFromDirectory -OrderedList $ordered -Seen $seen -Subdir "00_OVERVIEW" -Filter "*.md"

# 3 Module specs
Add-FilesRecursive -OrderedList $ordered -Seen $seen -Subdir "02_MODULES" -Filter "*.md"

# 4 Shared
Add-FilesFromDirectory -OrderedList $ordered -Seen $seen -Subdir "03_SHARED" -Filter "*.md"

# 5 Schema markdown
Add-FilesFromDirectory -OrderedList $ordered -Seen $seen -Subdir "01_SCHEMA" -Filter "*.md"

# 6 AppSheet
$mandatoryAppSheet = @(
  "04_APPSHEET/APPSHEET_SECURITY_FILTERS.md",
  "04_APPSHEET/APPSHEET_SLICE_MAP.md",
  "04_APPSHEET/TASK_MAIN_PRO_SPEC.md"
)
Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths $mandatoryAppSheet

$buildPath = Join-Path $RepoRoot "build_manifest.json"
$buildRaw = Get-Content -LiteralPath $buildPath -Raw -Encoding UTF8
$buildList = $buildRaw | ConvertFrom-Json
foreach ($p in $buildList) {
  if ($p -like "04_APPSHEET/*") {
    Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths @($p)
  }
}

if ($IncludeAllAppSheet) {
  $apRoot = Join-Path $RepoRoot "04_APPSHEET"
  Get-ChildItem -LiteralPath $apRoot -File -Recurse -Filter "*.md" -ErrorAction SilentlyContinue |
    Where-Object { $_.FullName -notmatch '\\99_ARCHIVE\\' } |
    Sort-Object FullName |
    ForEach-Object {
      Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths @(
        (Get-RelativeUnixPath -RepoRootResolved $RepoRoot -FullPath $_.FullName)
      )
    }
}

# 7 GAS markdown in 05_GAS_RUNTIME
$gasDir = Join-Path $RepoRoot "05_GAS_RUNTIME"
Get-ChildItem -LiteralPath $gasDir -File -Filter "*.md" -ErrorAction SilentlyContinue |
  Sort-Object Name |
  ForEach-Object {
    Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths @(
      (Get-RelativeUnixPath -RepoRootResolved $RepoRoot -FullPath $_.FullName)
    )
  }

# 8 All .js in clasp push order
$claspPath = Join-Path $RepoRoot ".clasp.json"
$clasp = (Get-Content -LiteralPath $claspPath -Raw -Encoding UTF8) | ConvertFrom-Json
foreach ($gs in $clasp.filePushOrder) {
  $rel = "05_GAS_RUNTIME/$gs"
  Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths @($rel)
}

# 9 Database
Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths @(
  "06_DATABASE/schema_manifest.json",
  "06_DATABASE/SCHEMA_SHEETS_LAOCONG_PRO.md"
)
$csvDir = Join-Path $RepoRoot "06_DATABASE\_generated_schema"
if (Test-Path -LiteralPath $csvDir) {
  Get-ChildItem -LiteralPath $csvDir -File -Filter "*.csv" -ErrorAction SilentlyContinue |
    Sort-Object Name |
    ForEach-Object {
      Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths @(
        (Get-RelativeUnixPath -RepoRootResolved $RepoRoot -FullPath $_.FullName)
      )
    }
}

# 10 Remaining build_manifest (automation, storage, audit, root docs, tools)
foreach ($p in $buildList) {
  $norm = Normalize-ClaudeRepoRelPath $p
  if ($norm -like "99_TOOLS/*" -and -not $IncludeTools) { continue }
  if ($norm -like "05_GAS_RUNTIME/*.js") { continue }
  if ($norm -like "04_APPSHEET/*") { continue }
  if ($norm -like "02_MODULES/*") { continue }
  if ($norm -like "03_SHARED/*") { continue }
  if ($norm -like "00_META/*") { continue }
  if ($norm -like "00_OVERVIEW/*") { continue }
  if ($norm -like "01_SCHEMA/*") { continue }
  if ($norm -like "06_DATABASE/*") { continue }
  Add-ClaudePathsUnique -OrderedList $ordered -Seen $seen -NewPaths @($norm)
}

$outDir = Join-Path $RepoRoot "claude_exports\full"
$huongDan = Join-Path $ScriptDir "claude-full-HUONG_DAN.md"

Export-ClaudeNumberedPack -RepoRoot $RepoRoot -OutDir $outDir -RelativePaths @($ordered) -HuongDanSourcePath $huongDan
