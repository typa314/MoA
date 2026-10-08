@echo off
chcp 65001 >nul
title MoA Studio - Windows 11 Native Desktop App
color 0b

echo ========================================================
echo   MoA Studio - Windows 11 原生獨立桌面軟體啟動器
echo ========================================================
echo.

cd /d "%~dp0"

:: 1. 檢查是否安裝 Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    color 0c
    echo [錯誤] 系統未偵測到 Node.js 環境！
    echo 本應用程式需要 Node.js (推薦 v18 或 v20 LTS 以上)。
    echo 請前往官網下載並安裝: https://nodejs.org
    echo.
    echo 按任意鍵將開啟 Node.js 官方下載頁面...
    pause >nul
    start https://nodejs.org
    exit /b 1
)

:: 2. 檢查套件是否安裝
if not exist "node_modules\" (
    echo [1/2] 首次啟動，正在為您安裝必要套件 (npm install)...
    echo 這可能需要 1~2 分鐘，請稍候...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 0c
        echo [錯誤] npm install 失敗，請檢查網路連線。
        pause
        exit /b 1
    )
)

echo [2/2] 正在啟動原生獨立桌面視窗 (Electron)...
echo.

:: 優先使用本地 node_modules 內的 electron，完全無需 npx，不觸發 PowerShell 權限阻擋
if exist "node_modules\.bin\electron.cmd" (
    call "node_modules\.bin\electron.cmd" electron-main.cjs
) else (
    call npx.cmd electron electron-main.cjs
)

if %errorlevel% neq 0 (
    echo.
    echo 若原生視窗啟動遇阻，您亦可直接雙擊 start_local.bat 改以瀏覽器/PWA 模式運行。
    pause
)
