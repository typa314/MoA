import React, { useState } from 'react';
import { AgentConfig, AgentRoleType, ProviderType } from '../types/moa';
import { Sliders, X, Check, Bot, Sparkles, Scale } from 'lucide-react';

interface AgentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: AgentConfig | null;
  onSaveAgent: (agent: AgentConfig) => void;
}

const COLOR_OPTIONS = [
  '#0284c7', // Sky Blue
  '#9333ea', // Purple
  '#16a34a', // Emerald Green
  '#e11d48', // Rose Red
  '#d97706', // Amber Gold
  '#0d9488', // Teal
  '#4f46e5', // Indigo
  '#ea580c', // Orange
];

export const AgentEditModal: React.FC<AgentEditModalProps> = ({
  isOpen,
  onClose,
  agent,
  onSaveAgent,
}) => {
  if (!isOpen || !agent) return null;

  const [form, setForm] = useState<AgentConfig>({ ...agent });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSaveAgent(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-sky-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {form.id.startsWith('new-') ? '新增 MoA 代理人' : `設定代理人：${form.name}`}
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Name & Role Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">代理人名稱</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="例如：邏輯批判審計員"
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">MoA 架構角色</label>
              <select
                value={form.roleType}
                onChange={(e) => setForm({ ...form, roleType: e.target.value as AgentRoleType })}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
              >
                <option value="proposer">提案者 (Proposer - Layer 1)</option>
                <option value="judge">裁決者 (Judge - Layer 2)</option>
              </select>
            </div>
          </div>

          {/* Provider & Model */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">AI 供應商</label>
              <select
                value={form.provider}
                onChange={(e) => {
                  const prov = e.target.value as ProviderType;
                  let defModel = 'gemini-3.8-flash';
                  if (prov === 'anthropic') defModel = 'claude-3-5-sonnet-20241022';
                  if (prov === 'openai-compatible') defModel = 'gpt-4o';
                  if (prov === 'cli') defModel = 'ollama-llama3';
                  setForm({
                    ...form,
                    provider: prov,
                    model: defModel,
                    cliCommand: prov === 'cli' && !form.cliCommand ? 'ollama run llama3 "{prompt}"' : form.cliCommand,
                  });
                }}
                className="w-full text-xs px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
              >
                <option value="gemini">Google Gemini (推薦/內建)</option>
                <option value="anthropic">Anthropic Claude (Claude 3.5 Sonnet / Opus)</option>
                <option value="openai-compatible">OpenAI-Compatible (OpenAI, DeepSeek, Ollama, Groq)</option>
                <option value="cli">本地 CLI 命令行 (Ollama, Claude CLI, Terminal)</option>
                <option value="simulator">本地離線模擬器 (無消耗測試)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">模型名稱 / 識別標籤</label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="例如: gemini-3.8-flash, gpt-4o, ollama-llama3"
                className="w-full text-xs font-mono px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Dedicated CLI Command Field when provider is CLI */}
          {form.provider === 'cli' && (
            <div className="p-3 bg-slate-50 dark:bg-slate-950/80 border border-indigo-200 dark:border-indigo-900/40 rounded-lg space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-800 dark:text-slate-200">
                  本地 CLI 指令模板
                </label>
                <span className="text-[10px] text-indigo-500 font-mono">支援 {'{prompt}'} 變數</span>
              </div>
              <input
                type="text"
                value={form.cliCommand || ''}
                onChange={(e) => setForm({ ...form, cliCommand: e.target.value })}
                placeholder='例如: ollama run llama3 "{prompt}" 或 claude -p "{prompt}"'
                className="w-full text-xs font-mono px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-900 dark:text-white"
              />
              <p className="text-[11px] text-slate-500 leading-relaxed">
                可直接在 PC 端呼叫您已安裝的 CLI 工具（如 Ollama、Claude CLI、Python 腳本）。若包含 <code className="text-indigo-400 font-mono">{'{prompt}'}</code> 會自動替換，否則透過標準輸入 (stdin) 傳入。
              </p>
            </div>
          )}

          {/* Temperature Slider */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <label className="font-medium text-slate-700 dark:text-slate-300">發散度 (Temperature)</label>
              <span className="font-mono text-slate-500 tabular-nums">{form.temperature.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={form.temperature}
              onChange={(e) => setForm({ ...form, temperature: parseFloat(e.target.value) })}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>0.0 (嚴謹確定，適合裁決/代碼)</span>
              <span>1.0 (發散創意，適合頭腦風暴)</span>
            </div>
          </div>

          {/* Persona System Role Prompt */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              角色個性與特長提示詞 (Role Persona Prompt)
            </label>
            <textarea
              rows={4}
              required
              value={form.rolePrompt}
              onChange={(e) => setForm({ ...form, rolePrompt: e.target.value })}
              placeholder="說明此代理人所持的立場、專業背景或思考角度..."
              className="w-full text-xs p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white leading-relaxed resize-y"
            />
          </div>

          {/* Color Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">拓撲節點識別色</label>
            <div className="flex items-center gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, color: c })}
                  className={`w-6 h-6 rounded-full transition-transform cursor-pointer ${
                    form.color === c ? 'scale-125 ring-2 ring-slate-900 dark:ring-white ring-offset-2 dark:ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
              className="px-4 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors cursor-pointer shadow-xs"
            >
              儲存設定
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
