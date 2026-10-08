import React, { useState } from 'react';
import { AgentConfig, SkillPreset } from '../types/moa';
import {
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  Scale,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Send,
  Zap,
} from 'lucide-react';

interface TaskConsoleProps {
  prompt: string;
  onPromptChange: (val: string) => void;
  onExecuteMoA: () => void;
  isExecuting: boolean;
  activeExecutionStage: 'idle' | 'proposers' | 'judge' | 'done';
  agents: AgentConfig[];
  skillSpec: string;
}

const SAMPLE_PROMPTS = [
  {
    title: '量子計算科普與核心瓶頸',
    prompt:
      '請為大眾科技愛好者寫一篇關於「量子計算現況與商用化三大核心瓶頸」的深度科普解析。需兼具通俗比喻與學術嚴謹性。',
  },
  {
    title: '分散式高併發微服務重構',
    prompt:
      '現有單體電商系統在雙十一大促面臨資料庫死鎖與效能瓶頸，請設計一份微服務拆分架構方案，涵蓋分散式事務、緩存一致性、限流熔斷策略與可觀測性。',
  },
  {
    title: 'AI 產品冷啟動增長戰略',
    prompt:
      '一款針對設計師的 AI 自動生圖協作工具，目前面臨冷啟動流量不足問題。請提出為期 3 個月的產品增長 (Product-Led Growth) 策略、社群運營打法與可量化指標 (KPI)。',
  },
  {
    title: '高價值合約法律與商業風險審查',
    prompt:
      '審查一筆跨國 SaaS 軟體授權合約草案，重點識別資料主權合規 (GDPR)、SLA 懲罰條款、智慧財產權歸屬爭議，並提供具體談判對策。',
  },
];

export const TaskConsole: React.FC<TaskConsoleProps> = ({
  prompt,
  onPromptChange,
  onExecuteMoA,
  isExecuting,
  activeExecutionStage,
  agents,
  skillSpec,
}) => {
  const activeProposers = agents.filter((a) => a.roleType === 'proposer' && a.isActive);
  const activeJudges = agents.filter((a) => a.roleType === 'judge' && a.isActive);

  return (
    <div className="space-y-6">
      {/* Current Team HUD Overview */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                MoA 協同引擎陣列 (Mixture of Agents Array)
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>{activeProposers.length} 位提案者 (Layer 1)</span>
                <span>＋</span>
                <span>{activeJudges.length} 位裁決者 (Layer 2)</span>
                <span>·</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">統一 Skill 規範已加載</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {activeProposers.map((p) => (
              <span
                key={p.id}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                title={`${p.name} (${p.model})`}
              >
                P: {p.name.slice(0, 4)}
              </span>
            ))}
            <span className="text-slate-400">➔</span>
            {activeJudges.map((j) => (
              <span
                key={j.id}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                title={`${j.name} (${j.model})`}
              >
                J: {j.name.slice(0, 4)}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Main Task Input Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
          <span className="font-medium text-slate-700 dark:text-slate-300">輸入工作任務需求</span>
          <span className="text-slate-400 font-mono tabular-nums">{prompt.length} 字元</span>
        </div>

        <div className="p-4 space-y-3">
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            disabled={isExecuting}
            rows={5}
            placeholder="請具體描述您的任務目標、背景與期望產出（例如：分析量子計算瓶頸、撰寫高併發重構方案、審定商業合約）..."
            className="w-full text-sm p-3 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-sky-500 leading-relaxed resize-y disabled:opacity-60"
          />

          {/* Quick Inspirations */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-400">快速靈感任務：</span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_PROMPTS.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isExecuting}
                  onClick={() => onPromptChange(item.prompt)}
                  className="px-2.5 py-1 text-[11px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors cursor-pointer text-left disabled:opacity-50"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Execution Footer Bar */}
        <div className="px-4 py-3 bg-slate-50/70 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-500 flex items-center gap-2">
            {isExecuting ? (
              <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                {activeExecutionStage === 'proposers' && 'Layer 1: 正在並行調用各提案者 Agents...'}
                {activeExecutionStage === 'judge' && 'Layer 2: 裁決者正在綜合交叉評審與生成終稿...'}
                {activeExecutionStage === 'done' && '正在自動儲存至本地 Markdown 檔案...'}
              </span>
            ) : (
              <span>點擊按鈕啟動 MoA 雙層合議流程，產出將自動儲存為本地 Markdown。</span>
            )}
          </div>

          <button
            type="button"
            disabled={isExecuting || !prompt.trim() || activeProposers.length === 0 || activeJudges.length === 0}
            onClick={onExecuteMoA}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer shadow-sm"
          >
            {isExecuting ? (
              <>
                <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                <span>MoA 協同進行中...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>啟動 MoA 混合代理人工作</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
