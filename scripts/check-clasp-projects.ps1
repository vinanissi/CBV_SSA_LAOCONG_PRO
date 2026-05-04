<#
.SYNOPSIS
  Check each apps-script module for a valid .clasp.json.
.DESCRIPTION
  Warns if only .clasp.json.example exists. Does not fail the whole run.
  Modules may be partially set up during rollout.
#>
$ErrorActionPreference = "Continue"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$appsRoot = Join-Path $repoRoot "apps-script"
$modules = @("main-control", "hoso", "task", "finance")
$issues = 0

Write-Host "CBV clasp project check (repo: $repoRoot)" -ForegroundColor Cyan

foreach ($m in $modules) {
  $dir = Join-Path $appsRoot $m
  $claspPath = Join-Path $dir ".clasp.json"
  $examplePath = Join-Path $dir ".clasp.json.example"

  if (-not (Test-Path -LiteralPath $dir)) {
    Write-Warning "[$m] Module folder missing: $dir"
    $issues++
    continue
  }

  if (-not (Test-Path -LiteralPath $claspPath)) {
    if (Test-Path -LiteralPath $examplePath) {
      Write-Warning "[$m] No .clasp.json - copy .clasp.json.example to .clasp.json and set scriptId."
    } else {
      Write-Warning "[$m] Missing both .clasp.json and .clasp.json.example."
    }
    $issues++
    continue
  }

  $moduleOk = $false
  try {
    $json = Get-Content -LiteralPath $claspPath -Raw -Encoding UTF8 | ConvertFrom-Json
    $sid = [string]$json.scriptId
    if ([string]::IsNullOrWhiteSpace($sid)) {
      Write-Warning "[$m] .clasp.json has empty scriptId."
      $issues++
    } elseif ($sid -match "PASTE_|PLACEHOLDER") {
      Write-Warning "[$m] scriptId is still a placeholder - set real Apps Script scriptId."
      $issues++
    } else {
      $moduleOk = $true
    }
  } catch {
    Write-Warning "[$m] Could not parse .clasp.json: $($_.Exception.Message)"
    $issues++
  }

  if ($moduleOk) {
    Write-Host "[$m] OK (.clasp.json + scriptId)" -ForegroundColor Green
  }
}

if ($issues -gt 0) {
  Write-Host ""
  Write-Host "Warnings: $issues (exit code still 0)." -ForegroundColor Yellow
} else {
  Write-Host ""
  Write-Host "All modules have .clasp.json with non-placeholder scriptId." -ForegroundColor Green
}
exit 0
