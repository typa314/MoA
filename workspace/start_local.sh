#!/usr/bin/env bash
echo "========================================================"
echo "  MoA Studio - 本地端桌面應用程式啟動器 (macOS / Linux)"
echo "========================================================"
echo ""

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# 1. 檢查 Node.js
if ! command -v node &> /dev/null; then
    echo "[錯誤] 系統未安裝 Node.js！"
    echo "請先至官方網站安裝: https://nodejs.org (推薦 v18 或 v20 LTS)。"
    exit 1
fi

echo "[1/3] Node.js 環境檢測通過: $(node -v)"

# 2. 檢查 node_modules
if [ ! -d "node_modules" ]; then
    echo "[2/3] 第一次啟動，正在為您自動安裝必要套件 (npm install)..."
    npm install
    if [ $? -ne 0 ]; then
        echo "[錯誤] 套件安裝失敗，請檢查網路連線。"
        exit 1
    fi
    echo "[OK] 套件安裝完成！"
else
    echo "[2/3] 套件目錄 node_modules 已就緒。"
fi

echo ""
echo "[3/3] 正在啟動 MoA Studio 核心伺服器..."
echo "瀏覽器存取網址: http://localhost:3000"
echo "若要停止服務，請按 Ctrl+C。"
echo ""

# 嘗試自動打開預設瀏覽器
if command -v open &> /dev/null; then
    (sleep 3 && open http://localhost:3000) &
elif command -v xdg-open &> /dev/null; then
    (sleep 3 && xdg-open http://localhost:3000) &
fi

npm start || npm run dev
