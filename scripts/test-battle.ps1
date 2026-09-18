$ErrorActionPreference = 'Stop'
$project = Split-Path -Parent $PSScriptRoot
$out = Join-Path $project '.battle-test-temp'
New-Item -ItemType Directory -Force -Path $out | Out-Null
Set-Content -LiteralPath (Join-Path $out 'package.json') -Value '{"type":"commonjs"}'
$sources = @(
  'src\game\battle\BattleModel.ts','src\game\battle\SpatialGrid.ts','src\game\battle\config.ts',
  'src\game\battle\ProgressStore.ts','src\game\battle\settlement.ts','src\game\data\units.ts',
  'src\game\data\weapons.ts','src\services\RewardsService.ts','src\game\config\economy.ts'
) | ForEach-Object { Join-Path $project $_ }
& (Join-Path $project 'node_modules\.bin\tsc.cmd') --ignoreConfig --target ES2020 --module commonjs --outDir $out @sources
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& node (Join-Path $project 'scripts\test-battle.cjs')
exit $LASTEXITCODE
