@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo.
echo  [無意味機構ジェネレータ] 起動中...
echo.

:: 開発サーバーをバックグラウンドで起動
start "MuimiGenerator Dev" cmd /k "npm run dev"

:: Vite が起動するまで待機
timeout /t 3 /nobreak > nul

:: ブラウザを開く
start http://localhost:5173

echo  ブラウザが開かない場合は http://localhost:5173 を手動で開いてください
echo  終了するには Dev サーバーのウィンドウを閉じてください
