import React, { useState } from 'react';
import { ApiKeysState } from '../types/moa';
import { Key, X, Check, Shield, AlertCircle, Laptop, Server, HelpCircle } from 'lucide-react';

interface KeyManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeysState;
  onSaveKeys: (keys: ApiKeysState) => void;
  hasServerGeminiKey: boolean;
}

export const KeyManagerModal: React.FC<KeyManagerModalProps> = ({
  isOpen,
  onClose,
  apiKeys,
  onSaveKeys,
  hasServerGeminiKey,
}) => {
  const [formKeys, setFormKeys] = useState<ApiKeysState>(apiKeys);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKeys(formKeys);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              API 金鑰與供應商設定 (API Keys & Providers)
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

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Gemini Status Box */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-sky-500" />
                <span>預設 Gemini API 狀態</span>
              </span>
              {hasServerGeminiKey ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  已就緒 (環境預載)
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  請填寫自訂金鑰
                </span>
              )}
            </div>
            <p className="text-slate-500 text-[11px] leading-relaxed">
              系統支援直接呼叫 Gemini 3 系列模型（如 gemini-3.8-flash）。若您有專屬之 Google AI Studio Key，可在下方自訂覆蓋。
            </p>
          </div>

          {/* Custom Gemini Key */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              自訂 Google Gemini API Key (可選填)
            </label>
            <input
              type="password"
              value={formKeys.geminiKey || ''}
              onChange={(e) => setFormKeys({ ...formKeys, geminiKey: e.target.value })}
              placeholder={hasServerGeminiKey ? '（使用環境變數中的預設金鑰，留空即可）' : 'AIzaSy...'}
              className="w-full text-xs font-mono px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* OpenAI Key */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              OpenAI API Key (適用 gpt-4o 等模型)
            </label>
            <input
              type="password"
              value={formKeys.openaiKey || ''}
              onChange={(e) => setFormKeys({ ...formKeys, openaiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full text-xs font-mono px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Anthropic Claude Key */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Anthropic Claude API Key (適用 Claude 3.5 Sonnet / Opus / Haiku)</span>
              </label>
              <span className="text-[10px] text-slate-400 font-mono">sk-ant-...</span>
            </div>
            <input
              type="password"
              value={formKeys.anthropicKey || ''}
              onChange={(e) => setFormKeys({ ...formKeys, anthropicKey: e.target.value })}
              placeholder="sk-ant-api03-..."
              className="w-full text-xs font-mono px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* DeepSeek Key */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              DeepSeek API Key (適用 deepseek-chat, deepseek-reasoner)
            </label>
            <input
              type="password"
              value={formKeys.deepseekKey || ''}
              onChange={(e) => setFormKeys({ ...formKeys, deepseekKey: e.target.value })}
              placeholder="sk-..."
              className="w-full text-xs font-mono px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
            />
          </div>

          {/* Custom OpenAI-Compatible Base URL & Key (Ollama, Groq, vLLM) */}
          <div className="p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200">
              <Laptop className="w-3.5 h-3.5 text-indigo-500" />
              <span>本地 PC 端 Ollama / 自訂 API 端點</span>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">
                端點 URL (例如 Ollama 本地: http://localhost:11434/v1 或 Groq)
              </label>
              <input
                type="text"
                value={formKeys.customBaseUrl || ''}
                onChange={(e) => setFormKeys({ ...formKeys, customBaseUrl: e.target.value })}
                placeholder="http://localhost:11434/v1"
                className="w-full text-xs font-mono px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] text-slate-500">端點 API Key (Ollama 可留空或填任意字元)</label>
              <input
                type="password"
                value={formKeys.customKey || ''}
                onChange={(e) => setFormKeys({ ...formKeys, customKey: e.target.value })}
                placeholder="端點金鑰或 ollama"
                className="w-full text-xs font-mono px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Direct CLI Runner Guidance */}
          <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/60 rounded-lg space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-indigo-900 dark:text-indigo-300">
              <Laptop className="w-3.5 h-3.5 text-indigo-500" />
              <span>不想使用付費 API Key？可直接呼叫本地 CLI！</span>
            </div>
            <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
              1. <strong>工作台內調用</strong>：在「架構拓撲」編輯任一 Agent，供應商選擇<strong>「本地 CLI 命令行」</strong>，即可填入如 <code className="px-1 py-0.2 bg-white dark:bg-slate-900 rounded font-mono text-indigo-600 dark:text-indigo-400">ollama run llama3 "{'{prompt}'}"</code> 或 <code className="px-1 py-0.2 bg-white dark:bg-slate-900 rounded font-mono text-indigo-600 dark:text-indigo-400">claude -p "{'{prompt}'}"</code> 執行。<br />
              2. <strong>PC 終端機直接執行</strong>：本專案已生成獨立腳本 <code className="px-1 py-0.2 bg-white dark:bg-slate-900 rounded font-mono text-indigo-600 dark:text-indigo-400">python3 moa_cli.py</code>，可在本機終端機直接呼叫並自動產生 Markdown 存檔。
            </p>
          </div>

          {/* Local Security Assurance */}
          <div className="flex items-center gap-2 text-[11px] text-slate-500">
            <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>所有金鑰皆安全儲存於本地瀏覽器記憶體與受保護之後端環境，絕不外流。</span>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors cursor-pointer shadow-xs"
            >
              {saveSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>已保存金鑰</span>
                </>
              ) : (
                <span>儲存並生效</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
