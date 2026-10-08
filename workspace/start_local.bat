@echo off
chcp 65001 >nul
title MoA Studio - Mixture of Agents Desktop
color 0b

echo ========================================================
echo   MoA Studio - 本地端桌面應用程式啟動器 (Windows)
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
    echo 按任意鍵將為您開啟 Node.js 官方下載頁面...
    pause >nul
    start https://nodejs.org
    exit /b 1
)

:: 2. 檢查是否安裝 npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    color 0c
    echo [錯誤] 系統未偵測到 npm 指令！請確認 Node.js 安裝完整。
    pause
    exit /b 1
)

echo [1/3] Node.js 環境檢測通過...
node -v

:: 3. 檢查 node_modules 是否存在，若不存在則自動執行 npm install
if not exist "node_modules\" (
    echo.
    echo [2/3] 第一次啟動，正在為您自動安裝必要套件 (npm install)...
    echo 這可能需要 1~2 分鐘，請稍候...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        color 0c
        echo.
        echo [錯誤] 套件安裝失敗！請檢查網路連線或嘗試手動執行 npm install。
        pause
        exit /b 1
    )
    echo [OK] 套件安裝完成！
) else (
    echo [2/3] 套件目錄 node_modules 已就緒。
)

echo.
echo [3/3] 正在啟動 MoA Studio 核心伺服器 (http://localhost:3000)...
echo.
echo ========================================================
echo  * 系統即將自動在瀏覽器中開啟 http://localhost:3000
echo  * 若未自動開啟，請手動複製該網址至瀏覽器貼上
echo  * 關閉此黑色視窗即可停止服務
echo ========================================================
echo.

:: 延遲 3 秒後在後台嘗試自動開啟瀏覽器
start /min cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000"

:: 啟動主服務
call npm start
if %errorlevel% neq 0 (
    echo.
    echo [通知] 正在嘗試以 dev 模式備援啟動...
    call npm run dev
)

echo.
echo 應用程式已停止。
pause
