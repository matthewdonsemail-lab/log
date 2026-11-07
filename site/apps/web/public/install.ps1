$ErrorActionPreference = "Stop"

function Say($message) { Write-Host "log: $message" }
function Fail($message) { Write-Host "log: $message" -ForegroundColor Red; exit 1 }

$Skills = if ($env:LOG_SKILLS) { $env:LOG_SKILLS } else { "" }
$SkillsOnly = $env:LOG_SKILLS_ONLY -eq "1"
$LogSite = if ($env:LOG_SITE) { $env:LOG_SITE } else { "https://log.listeningkit.com" }

function SkillDirs {
  $agents = @(".claude", ".codex", ".cursor", ".gemini", ".copilot", ".config\opencode", ".codeium\windsurf", ".roo", ".continue", ".qwen", ".config\goose")
  $dirs = foreach ($agent in $agents) { if (Test-Path (Join-Path $HOME $agent)) { Join-Path $HOME "$agent\skills" } }
  @($dirs) + (Join-Path $HOME ".agents\skills")
}

function InstallSkill($Site, $Name) {
  if ($Name -notmatch '^[a-z0-9-]+$') { Fail "not a skill name: $Name" }
  try { $Body = (Invoke-WebRequest -UseBasicParsing "$Site/.well-known/skills/$Name/SKILL.md").Content } catch { Fail "couldn't fetch the $Name skill from $Site" }
  if ($Body -is [byte[]]) { $Body = [Text.Encoding]::UTF8.GetString($Body) }
  if (-not $Body.StartsWith("---")) { Fail "$Site sent something that isn't a skill for $Name" }
  foreach ($dir in SkillDirs) {
    $target = Join-Path $dir $Name
    New-Item -ItemType Directory -Force -Path $target | Out-Null
    [IO.File]::WriteAllText((Join-Path $target "SKILL.md"), $Body)
  }
  Say "installed the $Name skill (from $Site)"
  $line = ($Body -split "`n") | Where-Object { $_ -match '^\s*dependsOn:\s*(.+)$' } | Select-Object -First 1
  if ($line) {
    foreach ($dep in (($line -replace '^\s*dependsOn:\s*', '').Trim() -split '\s+')) {
      if ($dep) { InstallSkill ("https://" + $dep.Substring(0, $dep.LastIndexOf('/'))) $dep.Substring($dep.LastIndexOf('/') + 1) }
    }
  }
}

function InstallSkills {
  if (-not $Skills) { return }
  $names = $Skills
  if ($names -eq "all") { $names = ((Invoke-RestMethod "$LogSite/.well-known/skills/index.json").skills | ForEach-Object { $_.name }) -join "," }
  foreach ($name in ($names -split ',')) { if ($name.Trim()) { InstallSkill $LogSite $name.Trim() } }
  Say ("skills are in " + ((SkillDirs) -join ", "))
  Say "start a new agent session so it loads them"
}

if ($SkillsOnly) {
  if (-not $Skills) { Fail "LOG_SKILLS_ONLY needs LOG_SKILLS set to the skill names (or all)" }
  InstallSkills
  return
}

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
InstallSkills
