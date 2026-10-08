# MoA Studio - Windows PowerShell 啟動腳本
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  MoA Studio - 本地端桌面應用程式啟動器 (PowerShell)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location -Path $PSScriptRoot

# 1. 檢查 Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "[錯誤] 系統未安裝 Node.js！" -ForegroundColor Red
    Write-Host "請前往官方網站下載並安裝: https://nodejs.org" -ForegroundColor Yellow
    Read-Host "按 Enter 鍵開啟 Node.js 網站..."
    Start-Process "https://nodejs.org"
    exit 1
}

$nodeVersion = node -v
Write-Host "[1/3] Node.js 環境檢測通過: $nodeVersion" -ForegroundColor Green

# 2. 檢查 node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "[2/3] 第一次啟動，正在執行 npm install..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[錯誤] npm install 失敗，請檢查網路連線。" -ForegroundColor Red
        Read-Host "按 Enter 鍵結束..."
        exit 1
    }
} else {
    Write-Host "[2/3] 套件目錄 node_modules 已就緒。" -ForegroundColor Green
}

# 3. 啟動服務
Write-Host ""
Write-Host "[3/3] 正在啟動伺服器 (http://localhost:3000)..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

npm start
