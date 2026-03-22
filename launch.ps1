Set-Location $PSScriptRoot
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
Write-Host "[無意味機構ジェネレータ] ビルド中..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "ビルドに失敗しました。" -ForegroundColor Red
    Read-Host "Enter キーで閉じる"
    exit 1
}
Write-Host "起動中..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-WindowStyle Hidden -Command `"Start-Sleep 3; Start-Process 'http://localhost:4173'`""
npx vite preview --port 4173
