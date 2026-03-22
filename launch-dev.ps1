Set-Location $PSScriptRoot
$env:PATH = "C:\Program Files\nodejs;$env:PATH"
Write-Host "[無意味機構ジェネレータ] 起動中..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-WindowStyle Hidden -Command `"Start-Sleep 4; Start-Process 'http://localhost:5173'`""
npm run dev
