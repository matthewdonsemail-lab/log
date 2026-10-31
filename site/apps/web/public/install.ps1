$ErrorActionPreference = "Stop"

function Say($message) { Write-Host "log: $message" }
function Fail($message) { Write-Host "log: $message" -ForegroundColor Red; exit 1 }

$LogHome = if ($env:LOG_HOME) { $env:LOG_HOME } else { Join-Path $HOME ".logCli" }
$Package = if ($env:LOG_PACKAGE) { $env:LOG_PACKAGE } else { "@listeningkit/log" }
New-Item -ItemType Directory -Force -Path $LogHome | Out-Null

if (-not (Get-Command bun -ErrorAction SilentlyContinue)) {
  Say "installing Bun"
  powershell -c "irm bun.sh/install.ps1 | iex"
  $env:Path = "$HOME\.bun\bin;$env:Path"
}
if (-not (Get-Command bun -ErrorAction SilentlyContinue)) { Fail "Bun didn't install. Install it from https://bun.sh and run this again." }

Say "installing $Package"
bun add -g $(if ($env:LOG_PACKAGE_SOURCE) { $env:LOG_PACKAGE_SOURCE } else { $Package })
$GlobalDir = ((bun pm ls -g 2>$null | Select-Object -First 1) -replace ' node_modules .*$', '')
$Root = Join-Path $GlobalDir "node_modules\$Package"
if (-not (Test-Path (Join-Path $Root "package.json"))) {
  $BunHome = if ($env:BUN_INSTALL) { $env:BUN_INSTALL } else { Join-Path $HOME ".bun" }
  $Root = Join-Path $BunHome "install\global\node_modules\$Package"
}
if (-not (Test-Path (Join-Path $Root "package.json"))) { Fail "couldn't find $Package in Bun's global folder ($GlobalDir)" }

if (-not (Get-Command uv -ErrorAction SilentlyContinue)) {
  Say "installing uv (it installs and manages Python)"
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  $env:Path = "$HOME\.local\bin;$env:Path"
}
if (-not (Get-Command uv -ErrorAction SilentlyContinue)) { Fail "uv didn't install. Install it from https://docs.astral.sh/uv and run this again." }

$Venv = Join-Path $LogHome "python"
Say "setting up Python 3.12 for the engines in $Venv"
uv python install 3.12
if (-not (Test-Path $Venv)) { uv venv --python 3.12 $Venv }
$Python = Join-Path $Venv "Scripts\python.exe"
$Wheel = Get-ChildItem (Join-Path $Root "vendor\chatXdk\wheels") -Filter "*win_amd64.whl" -ErrorAction SilentlyContinue | Select-Object -First 1
$Extra = @()
if ($Wheel) { $Extra += $Wheel.FullName }
uv pip install --python $Python -r (Join-Path $Root "vendor\twikit\requirements.txt") (Join-Path $Root "vendor\fbk") (Join-Path $Root "vendor\endcord") @Extra

$EnvFile = Join-Path $LogHome ".env"
if (-not (Test-Path $EnvFile)) { New-Item -ItemType File -Path $EnvFile | Out-Null }
$Current = Get-Content $EnvFile -ErrorAction SilentlyContinue
if (-not ($Current -match '^LOG_PYTHON=')) { Add-Content $EnvFile "LOG_PYTHON=$Python" }
if (-not ($Current -match '^LOG_ACCOUNTS=')) { Add-Content $EnvFile "LOG_ACCOUNTS=local" }

Say "done. Your settings are in $EnvFile and your accounts will live in $LogHome."
Say "next: log localAccount add --platform twitter --account <name>"
if (Get-Command log -ErrorAction SilentlyContinue) { Say "log is on your PATH" } else { Say "open a new terminal so 'log' is on your PATH" }
