import React, { useState } from 'react';
import { Terminal, X, Copy, Check, Download, Laptop, Play, ShieldCheck, FileCode } from 'lucide-react';

interface CliModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CliModal: React.FC<CliModalProps> = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadScript = () => {
    window.location.href = '/api/workspace/files/moa_cli.py';
  };

  const samplePythonCommand = `python3 moa_cli.py "請為軟體工程師寫一份關於微服務高可用分散式架構的重構方案"`;
  const sampleOllamaCommand = `ollama run llama3 "分析以下問題並遵守通用嚴謹分析規範: 如何避免分散式死鎖？"`;
  const sampleClaudeCliCommand = `claude -p "作為嚴謹審計員，請評估以下系統設計方案的安全性盲點"`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              PC 端 CLI 命令行呼叫指南 (Direct CLI Calling)
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

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs">
          {/* Explanation Banner */}
          <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl space-y-1.5 text-emerald-900 dark:text-emerald-200">
            <div className="font-semibold flex items-center gap-1.5 text-xs">
              <Laptop className="w-4 h-4 text-emerald-500" />
              <span>不想綁定付費 API Key？直接使用 PC 本機 CLI 免費執行！</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              您可以使用 PC 端本機已安裝的模型工具（如 <strong>Ollama</strong> 本地跑 Llama 3/Qwen、<strong>Claude CLI</strong> 或自訂 Python 腳本），完全在您的本機離線運行，無須消耗任何雲端 API Key 額度。
            </p>
          </div>

          {/* Mode 1: Run via Python CLI Script */}
          <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono text-[11px] flex items-center justify-center font-bold">
                  1
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  方式一：PC 終端機直接執行 MoA 獨立腳本
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadScript}
                className="flex items-center gap-1 text-[11px] text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                <Download className="w-3 h-3" />
                <span>下載 moa_cli.py 腳本</span>
              </button>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              本專案根目錄已為您生成完整的 <code className="text-sky-600 dark:text-sky-400 font-mono">moa_cli.py</code>。只要在本機終端機開啟命令提示字元或 Terminal，輸入任務指令即可自動呼叫多個代理人並將結果存為本地 Markdown：
            </p>

            <div className="relative p-2.5 bg-slate-900 rounded-lg text-slate-100 font-mono text-[11px] overflow-x-auto flex items-center justify-between gap-2">
              <span className="truncate">{samplePythonCommand}</span>
              <button
                type="button"
                onClick={() => handleCopy(samplePythonCommand, 'python')}
                className="p-1 hover:text-white cursor-pointer shrink-0"
                title="複製指令"
              >
                {copiedCode === 'python' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Mode 2: In-Studio CLI Agent */}
          <div className="p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono text-[11px] flex items-center justify-center font-bold">
                2
              </span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                方式二：在視覺化拓撲中將 Agent 設為「本地 CLI」
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              點擊「架構拓撲」中任一代理人的編輯按鈕，將供應商切換為<strong>「本地 CLI 命令行」</strong>，即可自訂終端命令模板：
            </p>

            <div className="space-y-2">
              <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">
                <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                  <span>Ollama 本地開源模型指令範例：</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(sampleOllamaCommand, 'ollama')}
                    className="hover:text-slate-200 cursor-pointer flex items-center gap-1"
                  >
                    {copiedCode === 'ollama' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>複製</span>
                  </button>
                </div>
                <code className="text-slate-800 dark:text-slate-200 font-mono text-[11px] block">{sampleOllamaCommand}</code>
              </div>

              <div className="p-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md">
                <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                  <span>Claude CLI 指令範例：</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(sampleClaudeCliCommand, 'claude')}
                    className="hover:text-slate-200 cursor-pointer flex items-center gap-1"
                  >
                    {copiedCode === 'claude' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>複製</span>
                  </button>
                </div>
                <code className="text-slate-800 dark:text-slate-200 font-mono text-[11px] block">{sampleClaudeCliCommand}</code>
              </div>
            </div>
          </div>

          {/* Guarantee */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>無論透過網頁工作台或是 PC 終端機執行，全體代理人都會強制綁定統一 Skill 規範，並自動將最終報告保存為本地 Markdown 檔案。</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-md transition-colors cursor-pointer"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};
