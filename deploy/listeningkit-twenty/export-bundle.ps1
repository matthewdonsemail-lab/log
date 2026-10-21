$ErrorActionPreference = "Stop"

$source = Split-Path -Parent $MyInvocation.MyCommand.Path
$timestamp = (Get-Date).ToUniversalTime().ToString("yyyyMMddTHHmmssZ")
$destination = Join-Path (Split-Path -Parent $source) "listeningkit-twenty-$timestamp.zip"
$staging = Join-Path ([System.IO.Path]::GetTempPath()) "listeningkit-twenty-$timestamp"

try {
  New-Item -ItemType Directory -Path $staging | Out-Null
  Get-ChildItem -Path $source -File | Where-Object {
    $_.Name -notmatch '^\.env$' -and
    $_.Extension -ne '.zip'
  } | Copy-Item -Destination $staging

  Compress-Archive -Path $staging -DestinationPath $destination -CompressionLevel Optimal
  Write-Host "Created secret-free bundle: $destination"
} finally {
  Remove-Item -Recurse -Force $staging -ErrorAction SilentlyContinue
}
