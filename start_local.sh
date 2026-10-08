#!/usr/bin/env bash
echo "========================================================"
echo "  MoA Studio - 本地端桌面應用程式啟動中 (macOS / Linux)"
echo "========================================================"
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"
npm start
