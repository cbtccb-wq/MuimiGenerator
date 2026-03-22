@echo off
chcp 65001 > nul
cd /d "%~dp0"
echo.
echo  [無意味機構ジェネレータ] ビルド中...
echo.

:: ビルド
call npm run build
if %errorlevel% neq 0 (
  echo.
  echo  ビルドに失敗しました。Node.js と依存パッケージをご確認ください。
  pause
  exit /b 1
)

echo.
echo  起動中...
echo.

:: プレビューサーバーをバックグラウンドで起動
start "MuimiGenerator" cmd /k "npx vite preview --port 4173"

:: サーバーが起動するまで待機
timeout /t 2 /nobreak > nul

:: ブラウザを開く
start http://localhost:4173

echo  ブラウザが開かない場合は http://localhost:4173 を手動で開いてください
echo  終了するには MuimiGenerator のウィンドウを閉じてください
