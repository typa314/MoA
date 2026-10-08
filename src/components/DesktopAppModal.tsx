import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import {
  Laptop,
  X,
  Check,
  Copy,
  Download,
  Monitor,
  HardDrive,
  Cpu,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Package,
} from 'lucide-react';

interface DesktopAppModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DesktopAppModal: React.FC<DesktopAppModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              本地端桌面應用程式指南 (Local Desktop App)
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Main Affirmation Banner */}
          <div className="p-4 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 rounded-xl space-y-1.5">
            <div className="flex items-center gap-2 text-sky-900 dark:text-sky-200 font-semibold text-sm">
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>如何下載本專案？是否需連動到 GITHUB？</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
              <strong>完全不需要連動 GitHub！</strong> 您可以直接點擊下方按鈕，一秒將完整專案源碼打包下載為 <code className="text-sky-600 dark:text-sky-400 font-mono font-semibold">.ZIP</code> 壓縮檔至您的電腦硬碟中。若您後續有版本控制需求，才選擇性連動 GitHub 即可。
            </p>
          </div>

          {/* Direct Download ZIP Button Card */}
          <div className="p-4 bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-transparent border border-sky-300 dark:border-sky-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h4 className="font-semibold text-slate-900 dark:text-white text-xs">
                  一鍵打包下載完整專案源碼包 (ZIP)
                </h4>
              </div>
              <p className="text-[11px] text-slate-500">
                內含全部前後端原始碼、MoA 拓撲配置、Skill 規範、本地啟動批次檔及 CLI 工具。
              </p>
            </div>

            <a
              href="/api/project/download-zip"
              download="moa-studio-complete.zip"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg font-medium shadow-sm transition-colors text-xs whitespace-nowrap cursor-pointer shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>直接下載專案 (.ZIP)</span>
            </a>
          </div>

          {/* Option 1: PWA Desktop Install */}
          <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] flex items-center justify-center font-bold">
                  1
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  方式一：PWA 桌面應用程式（1 秒免安裝直裝）
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-medium">
                最推薦 · 跨平台
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              在 Chrome、Edge 或 Brave 瀏覽器中，本系統支援一鍵安裝為本機獨立視窗 App。安裝後將擁有<strong>獨立應用程式圖示</strong>、<strong>桌面/Dock 快捷方式</strong>，脫離瀏覽器分頁獨立運行。
            </p>

            <div className="pt-1 flex items-center gap-3">
              {isInstalled ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Check className="w-4 h-4" />
                  <span>您目前已在桌面獨立 App 模式中運行！</span>
                </div>
              ) : isInstallable ? (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium shadow-xs cursor-pointer transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>立即安裝為 PC 桌面 APP</span>
                </button>
              ) : (
                <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-900 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800">
                  💡 提示：您可隨時點擊瀏覽器網址列右側的<strong>「安裝應用程式」</strong>圖示（或選單中的「安裝 MoA Studio」）將其固定至桌面。
                </div>
              )}
            </div>
          </div>

          {/* Option 2: Local Fullstack PC Running */}
          <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono text-[11px] flex items-center justify-center font-bold">
                  2
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  方式二：下載原始碼在 PC 本地啟動（100% 離線本地運算）
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 font-medium">
                純本地 · 隱私無洩露
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              專案內已包含所有前端與後端代碼。將專案下載至本機後，直接雙擊專案中的啟動腳本即可常駐於 PC：
            </p>

            <div className="space-y-2">
              <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-[11px] text-slate-200 flex items-center justify-between">
                <span>Windows 雙擊執行: start_local.bat</span>
                <button
                  type="button"
                  onClick={() => handleCopy('start_local.bat', 'bat')}
                  className="hover:text-white cursor-pointer ml-2"
                >
                  {copiedCmd === 'bat' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>

              <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-[11px] text-slate-200 flex items-center justify-between">
                <span>macOS / Linux 執行: ./start_local.sh 或 npm start</span>
                <button
                  type="button"
                  onClick={() => handleCopy('./start_local.sh', 'sh')}
                  className="hover:text-white cursor-pointer ml-2"
                >
                  {copiedCmd === 'sh' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                </button>
              </div>
            </div>
          </div>

          {/* Option 3: Native Electron Executable */}
          <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] flex items-center justify-center font-bold">
                3
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                方式三：封裝為原生 .exe / .dmg 原生桌面軟體 (Electron)
              </span>
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              專案根目錄已為您預備好 <code className="text-indigo-500 font-mono">electron-main.cjs</code> 原生桌面外殼設定檔。於本機終端機執行下列指令即可呼叫 Electron 原生視窗：
            </p>
            <div className="p-2.5 bg-slate-900 rounded-lg font-mono text-[11px] text-slate-200 flex items-center justify-between">
              <span>npx electron electron-main.cjs</span>
              <button
                type="button"
                onClick={() => handleCopy('npx electron electron-main.cjs', 'electron')}
                className="hover:text-white cursor-pointer ml-2"
              >
                {copiedCmd === 'electron' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Optional GitHub Sync Guide */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1 text-slate-600 dark:text-slate-400">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
              <span>💡 若您未來想要連動到 GITHUB（選用）：</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              1. <strong>AI Studio 介面連動</strong>：在 Google AI Studio 畫面右上角點選 <strong>「Export」➔「Push to GitHub」</strong>，即可將本專案直接建立為您 GitHub 帳號下的 Repository。<br />
              2. <strong>本地 Git 連動</strong>：下載 ZIP 解壓縮後，在目錄內執行 <code className="font-mono text-sky-500">git init && git remote add origin &lt;您的儲存庫網址&gt;</code> 即可隨時推送版本。
            </p>
          </div>

          {/* Privacy & File Persistence Note */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>無論採用哪種模式，所有工作內容皆會自動持久化為您 PC 本機硬碟的 Markdown 檔案 (`workspace/*.md`)。</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">MoA Studio 本地化套件就緒</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md transition-colors cursor-pointer"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};
