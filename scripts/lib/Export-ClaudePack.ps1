# Shared helpers for Claude numbered export packs (flat NN__path__names).

function Normalize-ClaudeRepoRelPath {
  param([string]$Path)
  $n = $Path.Trim() -replace '\\', '/'
  $n = $n.TrimStart('./')
  return $n
}

function Get-ClaudeFlatExportName {
  param(
    [int]$Index,
    [string]$SourceRel
  )
  $flat = (Normalize-ClaudeRepoRelPath $SourceRel) -replace '/', '__'
  return ('{0:D2}__{1}' -f $Index, $flat)
}

function Add-ClaudePathsUnique {
  param(
    [System.Collections.Generic.List[string]]$OrderedList,
    [hashtable]$Seen,
    [string[]]$NewPaths
  )
  foreach ($raw in $NewPaths) {
    if (-not $raw) { continue }
    $norm = Normalize-ClaudeRepoRelPath $raw
    if ($Seen.ContainsKey($norm)) { continue }
    $Seen[$norm] = $true
    [void]$OrderedList.Add($norm)
  }
}

function Export-ClaudeNumberedPack {
  [CmdletBinding()]
  param(
    [Parameter(Mandatory)]
    [string]$RepoRoot,
    [Parameter(Mandatory)]
    [string]$OutDir,
    [Parameter(Mandatory)]
    [string[]]$RelativePaths,
    [string]$HuongDanSourcePath = ""
  )

  $RepoRoot = (Resolve-Path -LiteralPath $RepoRoot).Path

  if (Test-Path -LiteralPath $OutDir) {
    Remove-Item -LiteralPath $OutDir -Recurse -Force
  }
  New-Item -ItemType Directory -Path $OutDir -Force | Out-Null

  $readmeDest = Join-Path $OutDir "00_HUONG_DAN.md"
  if ($HuongDanSourcePath -and (Test-Path -LiteralPath $HuongDanSourcePath)) {
    Copy-Item -LiteralPath $HuongDanSourcePath -Destination $readmeDest -Force
  }
  else {
    @"
# Claude export pack

Generated paths are numbered 01..N. Original repo path is encoded after ``NN__`` (slashes become ``__``).

Run the export script from repo root to regenerate this folder.
"@ | Set-Content -LiteralPath $readmeDest -Encoding utf8
  }

  $idx = 1
  foreach ($rel in $RelativePaths) {
    $norm = Normalize-ClaudeRepoRelPath $rel
    if (-not $norm) { continue }
    $srcRel = $norm -replace '/', [IO.Path]::DirectorySeparatorChar
    $src = Join-Path $RepoRoot $srcRel
    if (-not (Test-Path -LiteralPath $src)) {
      throw "Missing source file: $src (listed as $norm)"
    }
    $destName = Get-ClaudeFlatExportName -Index $idx -SourceRel $norm
    $dest = Join-Path $OutDir $destName
    Copy-Item -LiteralPath $src -Destination $dest -Force
    $idx++
  }

  $n = $idx - 1
  Write-Host "Export-ClaudeNumberedPack: $n files + 00_HUONG_DAN.md -> $OutDir"
}
