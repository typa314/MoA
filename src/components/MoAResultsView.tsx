import React, { useState } from 'react';
import { MoARunRecord } from '../types/moa';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Download,
  Copy,
  Check,
  Scale,
  Users,
  FileText,
  Clock,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  FolderDown,
  Layers,
} from 'lucide-react';

interface MoAResultsViewProps {
  record: MoARunRecord;
  onDownloadMarkdown: (record: MoARunRecord) => void;
}

export const MoAResultsView: React.FC<MoAResultsViewProps> = ({
  record,
  onDownloadMarkdown,
}) => {
  const [activeTab, setActiveTab] = useState<'judge' | 'proposers' | 'raw' | 'skill'>('judge');
  const [selectedProposerIndex, setSelectedProposerIndex] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  const generateFullMarkdownContent = (): string => {
    const dateStr = new Date(record.timestamp).toISOString();
    let md = `---
title: "${record.taskTitle}"
date: "${dateStr}"
type: "MoA_Synthesis_Report"
total_duration_ms: ${record.totalDurationMs}
judge_model: "${record.judgeVerdict?.model || 'N/A'}"
proposers_count: ${record.proposals.length}
---

# ${record.taskTitle}

> **任務摘要**: ${record.originalPrompt}
> **產出時間**: ${new Date(record.timestamp).toLocaleString()}
> **MoA 耗時**: ${(record.totalDurationMs / 1000).toFixed(2)}s

---

## 🏆 終審裁決與綜合報告 (Final Verdict)
*由終審裁決者【${record.judgeVerdict?.agentName || 'Judge'}】(${record.judgeVerdict?.model}) 綜合評審*

${record.judgeVerdict?.content || '（無裁決內容）'}

---

## 🧩 各提案者 (Proposers) 獨立回答矩陣

`;

    record.proposals.forEach((p, index) => {
      md += `### 提案者 #${index + 1}：${p.agentName} (${p.model})\n`;
      md += `> **角色定位**: ${p.rolePrompt}\n`;
      md += `> **計算耗時**: ${(p.durationMs / 1000).toFixed(2)}s\n\n`;
      md += `${p.content}\n\n---\n\n`;
    });

    md += `## 📜 本次統一執行之 Skill 規範\n\`\`\`text\n${record.skillSpec}\n\`\`\`\n`;
    return md;
  };

  const handleCopy = () => {
    const fullMd = generateFullMarkdownContent();
    navigator.clipboard.writeText(fullMd);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
      {/* Result Header */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {record.taskTitle}
            </h3>
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              ({(record.totalDurationMs / 1000).toFixed(2)}s)
            </span>
          </div>
          {record.savedFilename && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>已存檔至本地：</span>
              <code className="px-1.5 py-0.2 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded text-[11px] font-mono">
                workspace/{record.savedFilename}
              </code>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-500">已複製全文</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>複製 Markdown</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => onDownloadMarkdown(record)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>下載本地 MD 檔</span>
          </button>
        </div>
      </div>

      {/* Segmented View Selector */}
      <div className="px-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('judge')}
          className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'judge'
              ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          <span>終審裁決報告 (Judge)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('proposers')}
          className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'proposers'
              ? 'border-sky-500 text-sky-600 dark:text-sky-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>各提案者矩陣 ({record.proposals.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('raw')}
          className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'raw'
              ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>原始 Markdown 預覽</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('skill')}
          className={`py-2 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'skill'
              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>統一 Skill 規範</span>
        </button>
      </div>

      {/* Tab Contents */}
      <div className="p-5">
        {/* TAB 1: Judge Verdict */}
        {activeTab === 'judge' && (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 rounded-lg text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  終審裁決者：{record.judgeVerdict?.agentName || '裁決長'}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">
                  ({record.judgeVerdict?.model})
                </span>
              </div>
              <span className="text-slate-500 font-mono tabular-nums text-[11px]">
                耗時: {((record.judgeVerdict?.durationMs || 0) / 1000).toFixed(2)}s
              </span>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <MarkdownRenderer content={record.judgeVerdict?.content || '（無裁決內容）'} />
            </div>
          </div>
        )}

        {/* TAB 2: Proposers Matrix */}
        {activeTab === 'proposers' && (
          <div className="space-y-4">
            {/* Proposer sub-tab pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-x-auto">
              {record.proposals.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedProposerIndex(idx)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    selectedProposerIndex === idx
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <span>#{idx + 1} {p.agentName}</span>
                  <span className="text-[10px] font-mono tabular-nums text-slate-400">
                    ({(p.durationMs / 1000).toFixed(1)}s)
                  </span>
                </button>
              ))}
            </div>

            {/* Selected Proposer Details */}
            {record.proposals[selectedProposerIndex] && (
              <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 bg-slate-50/40 dark:bg-slate-950/20">
                <div className="flex items-start justify-between gap-3 text-xs border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white">
                      {record.proposals[selectedProposerIndex].agentName}
                    </h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      {record.proposals[selectedProposerIndex].rolePrompt}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-slate-600 dark:text-slate-400 text-[11px]">
                      {record.proposals[selectedProposerIndex].model}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <MarkdownRenderer content={record.proposals[selectedProposerIndex].content} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Raw Markdown */}
        {activeTab === 'raw' && (
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>本地存檔完整 Markdown 內容</span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
              >
                複製此原始碼
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto leading-relaxed max-h-[500px]">
              {generateFullMarkdownContent()}
            </pre>
          </div>
        )}

        {/* TAB 4: Skill Spec */}
        {activeTab === 'skill' && (
          <div className="space-y-2">
            <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 rounded-lg text-xs text-emerald-800 dark:text-emerald-300">
              以下為本次執行時注入全體 Proposers 及 Judge 的共同 Skill 規範約束條款：
            </div>
            <pre className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
              {record.skillSpec}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
