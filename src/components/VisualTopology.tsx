import React from 'react';
import { AgentConfig, AgentRoleType } from '../types/moa';
import {
  Scale,
  Users,
  Plus,
  ArrowRight,
  ArrowDown,
  Sliders,
  CheckCircle2,
  Trash2,
  Layers,
  ArrowUpDown,
  Sparkles,
  Bot,
  Shield,
  FileCode,
} from 'lucide-react';

interface VisualTopologyProps {
  agents: AgentConfig[];
  onUpdateAgents: (agents: AgentConfig[]) => void;
  onEditAgent: (agent: AgentConfig) => void;
  onAddNewAgent: (roleType?: AgentRoleType) => void;
  isExecuting?: boolean;
  activeExecutionStage?: 'idle' | 'proposers' | 'judge' | 'done';
}

export const VisualTopology: React.FC<VisualTopologyProps> = ({
  agents,
  onUpdateAgents,
  onEditAgent,
  onAddNewAgent,
  isExecuting = false,
  activeExecutionStage = 'idle',
}) => {
  const proposers = agents.filter((a) => a.roleType === 'proposer');
  const judges = agents.filter((a) => a.roleType === 'judge');

  const handleToggleActive = (id: string) => {
    onUpdateAgents(
      agents.map((a) => (a.id === id ? { ...a, isActive: !a.isActive } : a))
    );
  };

  const handleSwitchRole = (id: string) => {
    const target = agents.find((a) => a.id === id);
    if (!target) return;

    // If switching a judge to proposer, make sure there's at least one judge left or auto-designate
    if (target.roleType === 'judge' && judges.length <= 1) {
      // Find first proposer to promote to judge
      const nextJudge = proposers.find((p) => p.isActive) || proposers[0];
      if (nextJudge) {
        onUpdateAgents(
          agents.map((a) => {
            if (a.id === target.id) return { ...a, roleType: 'proposer' };
            if (a.id === nextJudge.id) return { ...a, roleType: 'judge' };
            return a;
          })
        );
        return;
      }
    }

    onUpdateAgents(
      agents.map((a) =>
        a.id === id
          ? { ...a, roleType: a.roleType === 'proposer' ? 'judge' : 'proposer' }
          : a
      )
    );
  };

  const handleDeleteAgent = (id: string) => {
    if (agents.length <= 2) {
      alert('MoA 體系至少需保留 1 個提案者與 1 個裁決者。');
      return;
    }
    const target = agents.find((a) => a.id === id);
    if (target?.roleType === 'judge' && judges.length <= 1) {
      alert('必須至少保留 1 位裁決者。請先將其他提案者設為裁決者後再刪除。');
      return;
    }
    onUpdateAgents(agents.filter((a) => a.id !== id));
  };

  const applyPresetTopology = (presetType: 'balanced' | 'fast' | 'engineering') => {
    if (presetType === 'fast') {
      onUpdateAgents(
        agents.map((a, i) => {
          if (i === 0) return { ...a, roleType: 'proposer', isActive: true };
          if (i === 1) return { ...a, roleType: 'judge', isActive: true };
          return { ...a, isActive: false };
        })
      );
    } else if (presetType === 'balanced') {
      onUpdateAgents(
        agents.map((a, i) => {
          if (i === agents.length - 1) return { ...a, roleType: 'judge', isActive: true };
          return { ...a, roleType: 'proposer', isActive: true };
        })
      );
    } else if (presetType === 'engineering') {
      onUpdateAgents(
        agents.map((a) => ({
          ...a,
          isActive: true,
          model: 'gemini-3.8-flash',
        }))
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Topology Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-500" />
            <span>MoA 視覺化角色拓撲 (Visual Topology)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            點擊任一代理人卡片上的角色切換按鈕，即可立即在「提案者 (Proposer)」與「裁決者 (Judge)」之間調整。
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="text-xs text-slate-500 hidden md:flex items-center gap-1.5 mr-2">
            <span>快速拓撲模板:</span>
          </div>
          <button
            type="button"
            onClick={() => applyPresetTopology('balanced')}
            className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors cursor-pointer"
          >
            標準合議 (4P+1J)
          </button>
          <button
            type="button"
            onClick={() => applyPresetTopology('fast')}
            className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors cursor-pointer"
          >
            極速對審 (1P+1J)
          </button>
          <button
            type="button"
            onClick={() => onAddNewAgent()}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors cursor-pointer ml-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增代理人</span>
          </button>
        </div>
      </div>

      {/* Main Visual Pipeline Diagram */}
      <div className="relative p-6 bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        {/* Step 1: Input & Shared Skill */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xs text-xs">
            <span className="font-semibold text-slate-900 dark:text-white">任務輸入</span>
            <span className="text-slate-400">＋</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-medium">全體代理人統一 Skill 規範</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
          </div>
          <div className="w-px h-6 bg-slate-300 dark:bg-slate-700 my-1" />
          <ArrowDown className="w-4 h-4 text-slate-400" />
        </div>

        {/* Layer 1: Proposers Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Layer 1: 提案者群 (Proposers)
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                ({proposers.filter((p) => p.isActive).length}/{proposers.length} 啟用中)
              </span>
            </div>
            <span className="text-xs text-slate-500">並行運算 · 發散性思維</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {proposers.map((agent) => (
              <div
                key={agent.id}
                className={`relative p-4 rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900 ${
                  agent.isActive
                    ? 'border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-300 dark:hover:border-sky-700'
                    : 'border-dashed border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50 dark:bg-slate-900/40'
                } ${
                  isExecuting && activeExecutionStage === 'proposers' && agent.isActive
                    ? 'ring-2 ring-sky-500 ring-offset-2 dark:ring-offset-slate-900'
                    : ''
                }`}
              >
                {/* Agent Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: agent.color }}
                    />
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate" title={agent.name}>
                      {agent.name}
                    </h4>
                  </div>
                  <input
                    type="checkbox"
                    checked={agent.isActive}
                    onChange={() => handleToggleActive(agent.id)}
                    className="rounded text-sky-600 focus:ring-sky-500 cursor-pointer"
                    title={agent.isActive ? '停用此代理人' : '啟用此代理人'}
                  />
                </div>

                {/* Model & Temp Info */}
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                  <span className="font-mono text-[11px] truncate">{agent.model}</span>
                  <span>·</span>
                  <span className="font-mono tabular-nums text-[11px]">T={agent.temperature}</span>
                </div>

                {/* Persona Preview */}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {agent.rolePrompt}
                </p>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => handleSwitchRole(agent.id)}
                    className="flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                    title="將此代理人升格為裁決者 (Judge)"
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    <span>設為裁決者</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditAgent(agent)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      title="編輯代理人設定"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteAgent(agent.id)}
                      className="text-slate-400 hover:text-red-500 cursor-pointer"
                      title="刪除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Quick Add Proposer Card */}
            <button
              type="button"
              onClick={() => onAddNewAgent('proposer')}
              className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-400 rounded-xl text-slate-500 hover:text-sky-600 transition-colors cursor-pointer min-h-[140px]"
            >
              <Plus className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">加入新提案者</span>
            </button>
          </div>
        </div>

        {/* Synthesis Hub Flow Line */}
        <div className="flex flex-col items-center my-6">
          <div className="w-full max-w-xl h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-transparent" />
          <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-[11px] text-slate-500 -mt-3 shadow-xs">
            <Sparkles className="w-3 h-3 text-sky-500" />
            <span>MoA 交叉聚合與資訊匯流 (Cross-Aggregation Layer)</span>
          </div>
          <ArrowDown className="w-4 h-4 text-slate-400 mt-2" />
        </div>

        {/* Layer 2: Judge Section */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Layer 2: 終審裁決者 (Judge / Aggregator)
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                ({judges.filter((j) => j.isActive).length}/{judges.length} 啟用中)
              </span>
            </div>
            <span className="text-xs text-slate-500">去蕪存菁 · 糾錯綜合 · 最終決策</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {judges.map((agent) => (
              <div
                key={agent.id}
                className={`relative p-4 rounded-xl border transition-all duration-200 bg-white dark:bg-slate-900 ${
                  agent.isActive
                    ? 'border-amber-200 dark:border-amber-900/60 shadow-xs ring-1 ring-amber-500/20'
                    : 'border-dashed border-slate-200 dark:border-slate-800 opacity-60'
                } ${
                  isExecuting && activeExecutionStage === 'judge' && agent.isActive
                    ? 'ring-2 ring-amber-500 ring-offset-2 dark:ring-offset-slate-900'
                    : ''
                }`}
              >
                {/* Judge Card Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-500 shrink-0" />
                    <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate" title={agent.name}>
                      {agent.name}
                    </h4>
                  </div>
                  <input
                    type="checkbox"
                    checked={agent.isActive}
                    onChange={() => handleToggleActive(agent.id)}
                    className="rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                    title={agent.isActive ? '停用裁決者' : '啟用裁決者'}
                  />
                </div>

                {/* Model & Temp Info */}
                <div className="text-xs text-slate-500 mb-2 flex items-center gap-2">
                  <span className="font-mono text-[11px] truncate">{agent.model}</span>
                  <span>·</span>
                  <span className="font-mono tabular-nums text-[11px]">T={agent.temperature}</span>
                  <span>·</span>
                  <span className="text-amber-600 dark:text-amber-400 font-medium text-[11px]">終審輸出</span>
                </div>

                {/* Persona Preview */}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-3">
                  {agent.rolePrompt}
                </p>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => handleSwitchRole(agent.id)}
                    className="flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                    title="轉為提案者 (Proposer)"
                  >
                    <ArrowUpDown className="w-3 h-3" />
                    <span>轉為提案者</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onEditAgent(agent)}
                      className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      title="編輯代理人設定"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                    </button>
                    {judges.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAgent(agent.id)}
                        className="text-slate-400 hover:text-red-500 cursor-pointer"
                        title="刪除"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Extra Judge */}
            <button
              type="button"
              onClick={() => onAddNewAgent('judge')}
              className="flex flex-col items-center justify-center p-4 border border-dashed border-amber-300 dark:border-amber-900/50 hover:border-amber-500 rounded-xl text-slate-500 hover:text-amber-600 transition-colors cursor-pointer min-h-[140px]"
            >
              <Plus className="w-5 h-5 mb-1" />
              <span className="text-xs font-medium">加入副裁決者</span>
            </button>
          </div>
        </div>

        {/* Persistence Flow to Local MD File */}
        <div className="flex flex-col items-center mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>所有工作產出自動持久化為本地端 Markdown 檔案 (`workspace/*.md`)</span>
          </div>
        </div>
      </div>
    </div>
  );
};
