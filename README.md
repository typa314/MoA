# 🚀 MoA Studio - Mixture of Agents 混合代理人工作台

> **雙層混合代理人 (MoA) 協同架構 · 視覺化拓撲控制 · 統一 Skill 規範注入 · 本地 Markdown 檔案持久化 · PC 桌面端/終端機原生支援**

---

## 📖 系統簡介 (Overview)

**MoA Studio** 是一款專為桌面端與本地 PC 打造的 **Mixture of Agents (MoA)** 視覺化協同工作台。透過學術界前沿的分層合議機制：
1. **Layer 1: 提案者群 (Proposers)**：並行調用多個具備不同專長維度（如邏輯批判、架構工程、發散創意、紅隊質詢）的代理人，產出立體、多視角的獨立方案。
2. **Layer 2: 終審裁決者 (Judge / Aggregator)**：深度交叉比對各方提案之共識與盲點、去蕪存菁，產出權威終審結論。
3. **全體統一 Skill 規範**：強制注入通用規範至所有代理人的頂層 System Instruction，消除跨模型認知偏差與格式錯亂。
4. **本地持久化儲存**：每一輪執行的原始需求、提案矩陣與終審報告，皆自動以結構化 Markdown 存檔於本地硬碟 `workspace/*.md`。

---

## ✨ 核心特色 (Features)

- **多通道模型支援**：
  - **Google Gemini**（最新 `gemini-3.8-flash` 等）
  - **Anthropic Claude**（`claude-3-5-sonnet-20241022`、`claude-3-opus`、`claude-3-haiku`）
  - **OpenAI-Compatible**（OpenAI `gpt-4o`、DeepSeek `deepseek-chat`、Groq）
  - **本地 PC 端 Ollama / 本地 CLI 命令行**（完全離線運行，**零 API Key 支出**）
- **圖像化角色拓撲 (Visual Topology)**：卡片即時切換提案者/裁決者角色、啟閉開關、發散度 (Temperature 0.0~1.0) 與提示詞。
- **免連動 GitHub，一鍵下載打包**：介面內建一鍵將完整專案源碼打包為 `.zip`。
- **全平台本地 APP 支援**：
  - **PWA 桌面應用程式**（Chrome / Edge 1 秒免安裝直裝）
  - **Windows 批次啟動檔 (`start_local.bat`)**
  - **macOS / Linux Shell 啟動檔 (`start_local.sh`)**
  - **PC 終端機獨立 Python 腳本 (`moa_cli.py`)**
  - **Electron 原生桌面外殼 (`electron-main.cjs`)**

---

## 🛠️ 環境需求 (Prerequisites)

- **Node.js**：建議 **v18.0.0** 或更高版本（推薦 Node.js v20 LTS）
- **npm**：v9.0.0 以上（通常隨 Node.js 一併安裝）
- *(選用)* **Python 3**：若欲執行 `moa_cli.py` 獨立終端命令
- *(選用)* **Ollama**：若欲在本機完全離線跑開源大模型（如 Llama 3、Qwen 2.5）

---

## 🚀 快速安裝與本地啟動 (Installation & Quick Start)

### 步驟 1：取得專案檔案
您可以直接在 MoA Studio 網頁介面點選 **「桌面 APP」➔「直接下載專案 (.ZIP)」**，或解壓縮專案包至您喜歡的本機目錄（例如 `D:\MoA-Studio` 或 `~/MoA-Studio`）。

### 步驟 2：啟動本地伺服器

#### 方式 A：一鍵雙擊啟動（最推薦，免打指令）
- **Windows 電腦**：
  在專案資料夾內直接雙擊 **`start_local.bat`**。
- **macOS / Linux 電腦**：
  開啟終端機，執行：
  ```bash
  chmod +x start_local.sh
  ./start_local.sh
  ```

#### 方式 B：標準命令列啟動
開啟終端機進入專案目錄，依序執行：
```bash
# 1. 安裝相依套件
npm install

# 2. 啟動伺服器 (包含 Express 後端 API 與前端 Vite)
npm start
```

若欲使用開發熱重載模式：
```bash
npm run dev
```

### 步驟 3：開始使用
啟動成功後，開啟瀏覽器造訪：
👉 **http://localhost:3000**

---

## 💻 本地 PC 終端機 CLI 使用方式 (免開瀏覽器)

專案已為您預備好獨立的 Python 終端機腳本 **`moa_cli.py`**，可直接在命令列執行 MoA 協同流程：

```bash
# 語法：
python3 moa_cli.py "您的協同任務需求"

# 範例：
python3 moa_cli.py "請為軟體架構師設計一份微服務資料庫高可用拆分策略"
```

或使用互動輸入模式：
```bash
python3 moa_cli.py --interactive
```
執行完畢後，腳本會自動將結構化報告儲存至本機硬碟 `workspace/Task_YYYYMMDD_HHMMSS.md`。

---

## 🖥️ 安裝為 PC 桌面 APP (Desktop Application)

### 1. PWA 桌面獨立應用程式（1 秒直裝）
1. 在 Chrome、Edge 或 Brave 瀏覽器開啟 `http://localhost:3000`。
2. 點擊頂部導航列右上角的 **「桌面 APP」** 按鈕（或點擊瀏覽器網址列右側的 **「安裝應用程式」** 圖示）。
3. 點擊 **「安裝」**，即可將本工作台固定至桌面或工作列，擁有獨立原生視窗！

### 2. Electron 原生桌面視窗
在專案根目錄執行：
```bash
npx electron electron-main.cjs
```
即可直接喚起原生 PC 桌面軟體視窗。

---

## 🔑 API 金鑰與環境變數設定 (.env)

您可以在專案根目錄建立 `.env` 檔案，或直接在網頁介面點擊頂部 **「金鑰管理」** 進行設定（金鑰安全保存在瀏覽器本地記憶體中）：

```env
# Google Gemini API Key (可選，若使用 Gemini 模型)
GEMINI_API_KEY=AIzaSy...

# Anthropic Claude API Key (可選，若使用 Claude 3.5 Sonnet 模型)
ANTHROPIC_API_KEY=sk-ant-api03-...

# OpenAI API Key (可選，若使用 GPT-4o 模型)
OPENAI_API_KEY=sk-...

# 本地離線/Ollama 端點 (免 Key)
# 預設: http://localhost:11434/v1
```

> 💡 **提示**：若完全不想使用付費 API Key，可將 Agent 設為 **「本地 CLI 命令行」**，直接呼叫本機安裝之 `ollama run llama3 "{prompt}"`，完全零花費！

---

## 📁 專案目錄結構 (Directory Structure)

```text
moa-studio/
├── workspace/                  # 📂 本地 Markdown 檔案儲存庫 (*.md)
│   ├── MoA_Quickstart_Guide.md # 快速入門教學文件
│   └── Task_*.md               # 自動持久化的任務報告
├── public/                     # 靜態圖標與 PWA Assets (192px/512px)
├── src/
│   ├── components/             # UI 元件 (TopNav, TaskConsole, VisualTopology...)
│   ├── hooks/                  # PWA 安裝與狀態 Hook
│   ├── types/                  # MoA 型別定義 (AgentConfig, MoARunRecord...)
│   ├── constants/              # 預設代理人與拓撲樣板
│   ├── services/               # 前後端通訊 API 介面
│   ├── App.tsx                 # 主應用程式進入點
│   └── main.tsx                # React 渲染入口
├── server.ts                   # Express 全端整合伺服器 (串接 Gemini/Claude/CLI)
├── moa_cli.py                  # PC 端獨立命令列工具
├── start_local.bat             # Windows 一鍵雙擊啟動腳本
├── start_local.sh              # macOS/Linux 一鍵啟動腳本
├── electron-main.cjs           # Electron 原生桌面包裝設定
├── vite.config.ts              # Vite + VitePWA 打包配置
├── tsconfig.json               # TypeScript 設定
├── package.json                # 專案相依性定義
└── README.md                   # 專案完整安裝與使用指南
```

---

## ❓ 常見問題 (FAQ)

#### Q1: 下載專案需要連動到 GitHub 嗎？
**完全不需要！** 點擊介面頂部「桌面 APP」或「本地 MD 庫」中的 **「直接下載專案 (.ZIP)」**，即可將完整專案直接下載至電腦。若日後需要版本控制，可自由選擇是否使用 `git remote add` 或 AI Studio 右上角的「Export to GitHub」。

#### Q2: 執行任務後的 Markdown 檔案儲存在哪裡？
全部存放在專案目錄下的 **`workspace/`** 資料夾中，每個檔案皆包含 YAML Frontmatter 標頭、各提案者發言矩陣、統一 Skill 規範與終審裁決報告，支援使用 Obsidian、VS Code 或 Typora 直接開啟閱讀。

#### Q3: 如何自訂代理人的能力與思維角度？
進入頂部導航列的 **「架構拓撲」**，點選任意代理人卡片上的設定按鈕，即可自由微調角色名稱、特長提示詞 (Persona Prompt)、模型供應商、發散度 (Temperature 0.0~1.0)，或新增更多代理人。

---

## 📄 授權 (License)

本專案遵循 MIT License 開源授權，歡迎自由修改、擴充與個人/商業使用。
