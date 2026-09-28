# Chia bsk.exe thanh cac manh 5MB, roi ghep lai thanh file ban dau va doi chieu SHA-256.
# Chay:  powershell -NoProfile -ExecutionPolicy Bypass -File split-bsk.ps1
# Hoac:  bam dup split-bsk.cmd

$ErrorActionPreference = 'Stop'

$Root      = $PSScriptRoot
$Src       = Join-Path $Root 'bsk.exe'
$Dir       = Join-Path $Root 'bsk-parts'
$Restored  = Join-Path $Root 'bsk-restored.exe'
$ChunkSize = 5MB

if (-not (Test-Path $Src)) { throw "Khong tim thay file goc: $Src" }

$origHash = (Get-FileHash $Src -Algorithm SHA256).Hash
$origSize = (Get-Item $Src).Length
Write-Host ""
Write-Host "=== BAN GOC ==="
Write-Host ("  {0} bytes" -f $origSize)
Write-Host ("  SHA256 {0}" -f $origHash)
Write-Host ""

# ---------- CAT ----------
if (Test-Path $Dir) { Remove-Item $Dir -Recurse -Force }
New-Item -ItemType Directory $Dir | Out-Null

$in = [IO.File]::OpenRead($Src)
try {
  $buf = New-Object byte[] $ChunkSize
  $i = 0
  while (($read = $in.Read($buf, 0, $buf.Length)) -gt 0) {
    $name = Join-Path $Dir ('bsk.part{0:D3}' -f $i)
    $out  = [IO.File]::Create($name)
    try { $out.Write($buf, 0, $read) } finally { $out.Dispose() }
    $i++
  }
} finally { $in.Dispose() }

Write-Host "=== CAC MANH ==="
Get-ChildItem $Dir | Sort-Object Name | ForEach-Object {
  Write-Host ("  {0}  {1,10} bytes" -f $_.Name, $_.Length)
}
Write-Host ("  => {0} manh, moi manh toi da 5MB" -f $i)
Write-Host ""

# ---------- GHEP ----------
$out = [IO.File]::Create($Restored)
try {
  $buf = New-Object byte[] (1MB)
  Get-ChildItem $Dir -Filter 'bsk.part*' | Sort-Object Name | ForEach-Object {
    $in = [IO.File]::OpenRead($_.FullName)
    try {
      while (($read = $in.Read($buf, 0, $buf.Length)) -gt 0) { $out.Write($buf, 0, $read) }
    } finally { $in.Dispose() }
  }
} finally { $out.Dispose() }

$newHash = (Get-FileHash $Restored -Algorithm SHA256).Hash
$newSize = (Get-Item $Restored).Length

Write-Host "=== BAN GHEP LAI ==="
Write-Host ("  {0} bytes" -f $newSize)
Write-Host ("  SHA256 {0}" -f $newHash)
Write-Host ""

if ($newHash -eq $origHash -and $newSize -eq $origSize) {
  Write-Host "KET QUA: OK - file ghep lai GIONG HET ban goc." -ForegroundColor Green
  Write-Host ("  {0}" -f $Restored)
} else {
  Write-Host "KET QUA: LOI - file ghep KHAC ban goc. Kiem tra lai cac manh." -ForegroundColor Red
  exit 1
}
Write-Host ""
