import React, { useState } from 'react';
import { SkillPreset } from '../types/moa';
import { ShieldCheck, Check, Sparkles, BookOpen, Copy, RotateCcw, Info } from 'lucide-react';

interface SkillSpecManagerProps {
  skillSpec: string;
  onUpdateSkillSpec: (newSpec: string) => void;
  presets: SkillPreset[];
  activeAgentsCount: number;
}

export const SkillSpecManager: React.FC<SkillSpecManagerProps> = ({
  skillSpec,
  onUpdateSkillSpec,
  presets,
  activeAgentsCount,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('general_rigorous');
  const [copied, setCopied] = useState(false);

  const handleSelectPreset = (preset: SkillPreset) => {
    setSelectedPresetId(preset.id);
    onUpdateSkillSpec(preset.spec);
  };

  const handleCopySpec = () => {
    navigator.clipboard.writeText(skillSpec);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>全體代理人統一 Skill 規範 (Standardized Skill Specification)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              本規範將以最高權重注入全體 {activeAgentsCount} 位在編代理人（Proposer 提案群與 Judge 裁決者）的系統指令中，確保統一的思維格式、約束與驗證標準。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopySpec}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-500">已複製規範</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>複製規範</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Preset Selector Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {presets.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {preset.name}
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                {preset.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Interactive Skill Editor */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-sky-500" />
            <span>當前啟用中的 Skill 規範內容</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 text-[11px]">
            <span>字數: {skillSpec.length}</span>
            <span>·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-medium">即時同步至所有 Agent</span>
          </div>
        </div>

        <div className="p-4">
          <textarea
            value={skillSpec}
            onChange={(e) => onUpdateSkillSpec(e.target.value)}
            rows={10}
            className="w-full text-xs font-mono p-3 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 leading-relaxed resize-y"
            placeholder="請輸入欲規範全體代理人的統一 Skill 指引..."
          />
        </div>

        {/* Injection Mechanism Explanation */}
        <div className="px-4 py-3 bg-slate-50/50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 flex items-start gap-2.5 text-xs text-slate-500">
          <Info className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-slate-700 dark:text-slate-300 font-medium">
              MoA Skill 注入原理
            </p>
            <p className="leading-relaxed">
              在呼叫任一模型（無論是 Gemini 還是自訂 OpenAI-compatible 模型）前，後端引擎皆會自動將本段規範封裝於 System Instruction 頂層，並附加上「全體代理人統一規範」標頭。這保證了即使用不同模型或不同提示詞，輸出結構仍維持高度一致性。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
