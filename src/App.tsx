/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AgentConfig,
  AgentRoleType,
  ApiKeysState,
  MoARunRecord,
  ProposerProposal,
  SkillPreset,
  WorkspaceFile,
} from './types/moa';
import { INITIAL_AGENTS } from './constants/defaultAgents';
import {
  checkServerStatus,
  fetchSkillPresets,
  callProposerAgent,
  callJudgeAgent,
  listWorkspaceFiles,
  saveWorkspaceFile,
  deleteWorkspaceFile,
  getWorkspaceFileContent,
} from './services/api';
import { TopNav, ActiveTab } from './components/TopNav';
import { TaskConsole } from './components/TaskConsole';
import { VisualTopology } from './components/VisualTopology';
import { SkillSpecManager } from './components/SkillSpecManager';
import { WorkspaceManager } from './components/WorkspaceManager';
import { MoAResultsView } from './components/MoAResultsView';
import { KeyManagerModal } from './components/KeyManagerModal';
import { AgentEditModal } from './components/AgentEditModal';
import { Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_AGENTS = 'moa_agents_config_v1';
const STORAGE_KEY_KEYS = 'moa_api_keys_v1';
const STORAGE_KEY_SKILL = 'moa_active_skill_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('console');
  const [hasGeminiKey, setHasGeminiKey] = useState<boolean>(true);
  const [workspaceFiles, setWorkspaceFiles] = useState<WorkspaceFile[]>([]);
  const [presets, setPresets] = useState<SkillPreset[]>([]);

  // Agent State
  const [agents, setAgents] = useState<AgentConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_AGENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return INITIAL_AGENTS;
  });

  // Skill Spec State
  const [skillSpec, setSkillSpec] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SKILL);
      if (saved) return saved;
    } catch (e) {
      // ignore
    }
    return `[SKILL SPECIFICATION: 通用嚴謹分析規範]
1. 輸出格式：使用清晰的 Markdown 階層標題 (H2, H3) 與要點清單。
2. 思考脈絡：先拆解問題本質，列出關鍵假設，再提出具體結論。
3. 嚴謹防偽：凡未經確證之數據須明確標注「推測/待驗證」，嚴禁捏造事實。
4. 觀點立體：分析時請兼顧優點、風險及潛在限制。
5. 總結精準：在結尾提供簡明扼要的行動建議 (Action Items)。`;
  });

  // API Keys State
  const [apiKeys, setApiKeys] = useState<ApiKeysState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_KEYS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {};
  });

  // Task & Execution State
  const [prompt, setPrompt] = useState<string>(
    '請為大眾科技愛好者寫一篇關於「量子計算現況與商用化三大核心瓶頸」的深度科普解析。需兼具通俗比喻與學術嚴謹性。'
  );
  const [isExecuting, setIsExecuting] = useState(false);
  const [activeExecutionStage, setActiveExecutionStage] = useState<'idle' | 'proposers' | 'judge' | 'done'>('idle');
  const [currentRun, setCurrentRun] = useState<MoARunRecord | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(null);

  // Modals
  const [isKeyModalOpen, setIsKeyModalOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentConfig | null>(null);

  // Persist agents
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AGENTS, JSON.stringify(agents));
    } catch (e) {
      // ignore
    }
  }, [agents]);

  // Persist skill
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SKILL, skillSpec);
    } catch (e) {
      // ignore
    }
  }, [skillSpec]);

  // Persist API Keys
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_KEYS, JSON.stringify(apiKeys));
    } catch (e) {
      // ignore
    }
  }, [apiKeys]);

  // Initial load
  useEffect(() => {
    async function init() {
      try {
        const status = await checkServerStatus();
        setHasGeminiKey(status.hasGeminiKey);
      } catch (e) {
        console.error('Server status check error:', e);
      }

      try {
        const fetchedPresets = await fetchSkillPresets();
        setPresets(fetchedPresets);
      } catch (e) {
        console.error('Presets load error:', e);
      }

      loadWorkspaceFiles();
    }
    init();
  }, []);

  const loadWorkspaceFiles = async () => {
    try {
      const files = await listWorkspaceFiles();
      setWorkspaceFiles(files);
    } catch (e) {
      console.error('Failed to load workspace files:', e);
    }
  };

  const getApiKeyForAgent = (agent: AgentConfig): string | undefined => {
    if (agent.apiKey) return agent.apiKey;
    if (agent.provider === 'gemini') return apiKeys.geminiKey;
    if (agent.provider === 'anthropic') return apiKeys.anthropicKey;
    if (agent.provider === 'openai-compatible') {
      if (agent.model.toLowerCase().includes('deepseek')) return apiKeys.deepseekKey || apiKeys.customKey;
      return apiKeys.openaiKey || apiKeys.customKey;
    }
    return undefined;
  };

  // Execute MoA pipeline
  const handleExecuteMoA = async () => {
    if (!prompt.trim()) return;

    const activeProposers = agents.filter((a) => a.roleType === 'proposer' && a.isActive);
    const activeJudges = agents.filter((a) => a.roleType === 'judge' && a.isActive);

    if (activeProposers.length === 0) {
      alert('請先在「架構拓撲」中至少啟用 1 位提案者 (Proposer)。');
      return;
    }
    if (activeJudges.length === 0) {
      alert('請先在「架構拓撲」中至少啟用 1 位裁決者 (Judge)。');
      return;
    }

    const primaryJudge = activeJudges[0];
    const startTime = Date.now();
    setIsExecuting(true);
    setStatusMessage(null);

    // Initial run record skeleton
    const newRecordId = `moa-${Date.now()}`;
    const taskTitle = prompt.slice(0, 30).trim().replace(/[\r\n]+/g, ' ') || 'MoA 協同任務';

    try {
      // STAGE 1: Execute all proposers in parallel
      setActiveExecutionStage('proposers');

      const proposalPromises = activeProposers.map(async (agent) => {
        const pStart = Date.now();
        try {
          const res = await callProposerAgent(
            agent,
            prompt,
            skillSpec,
            getApiKeyForAgent(agent)
          );
          return {
            agentId: agent.id,
            agentName: agent.name,
            model: res.model,
            rolePrompt: agent.rolePrompt,
            content: res.content,
            durationMs: Date.now() - pStart,
            status: 'completed' as const,
          };
        } catch (err: any) {
          return {
            agentId: agent.id,
            agentName: agent.name,
            model: agent.model,
            rolePrompt: agent.rolePrompt,
            content: `執行錯誤: ${err.message}`,
            durationMs: Date.now() - pStart,
            status: 'error' as const,
            error: err.message,
          };
        }
      });

      const finishedProposals = await Promise.all(proposalPromises);

      // STAGE 2: Execute Judge synthesis
      setActiveExecutionStage('judge');

      const judgeStart = Date.now();
      const validProposals = finishedProposals.map((p) => ({
        agentName: p.agentName,
        model: p.model,
        content: p.content,
      }));

      const judgeRes = await callJudgeAgent(
        primaryJudge,
        prompt,
        skillSpec,
        validProposals,
        getApiKeyForAgent(primaryJudge)
      );

      const judgeVerdict = {
        agentId: primaryJudge.id,
        agentName: primaryJudge.name,
        model: judgeRes.model,
        content: judgeRes.content,
        durationMs: Date.now() - judgeStart,
        status: 'completed' as const,
      };

      // STAGE 3: Auto-save to local workspace MD file
      setActiveExecutionStage('done');
      const totalDuration = Date.now() - startTime;

      const dateClean = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const safeTitle = taskTitle.replace(/[\\/:*?"<>|]/g, '_').slice(0, 20);
      const filename = `MoA_${safeTitle}_${dateClean}.md`;

      // Generate complete markdown content
      let mdDoc = `---
title: "${taskTitle}"
timestamp: ${Date.now()}
date_str: "${new Date().toISOString()}"
judge_model: "${judgeRes.model}"
proposers_count: ${finishedProposals.length}
total_duration_ms: ${totalDuration}
---

# ${taskTitle}

> **原始任務需求**: ${prompt}  
> **協同執行時間**: ${new Date().toLocaleString()}  
> **MoA 雙層合議耗時**: ${(totalDuration / 1000).toFixed(2)} 秒  

---

## 🏆 終審裁決與綜效報告 (Judge Verdict)
*由終審裁決者【${primaryJudge.name}】(${judgeRes.model}) 彙整產出*

${judgeRes.content}

---

## 🧩 各提案者 (Proposers) 獨立回答矩陣

`;

      finishedProposals.forEach((p, idx) => {
        mdDoc += `### 提案者 #${idx + 1}：${p.agentName} (${p.model})\n`;
        mdDoc += `> 角色定位: ${p.rolePrompt}\n`;
        mdDoc += `> 運算耗時: ${(p.durationMs / 1000).toFixed(2)}s\n\n`;
        mdDoc += `${p.content}\n\n---\n\n`;
      });

      mdDoc += `## 📜 統一 Skill 規範規格\n\`\`\`text\n${skillSpec}\n\`\`\`\n`;

      // Save to server workspace
      try {
        await saveWorkspaceFile(filename, mdDoc, true);
        await loadWorkspaceFiles();
      } catch (saveErr) {
        console.error('Auto-save to workspace failed:', saveErr);
      }

      const completedRecord: MoARunRecord = {
        id: newRecordId,
        taskTitle,
        originalPrompt: prompt,
        skillSpec,
        timestamp: Date.now(),
        proposals: finishedProposals,
        judgeVerdict,
        totalDurationMs: totalDuration,
        status: 'completed',
        savedFilename: filename,
      };

      setCurrentRun(completedRecord);
      setStatusMessage({
        type: 'success',
        text: `MoA 任務已順利完成！耗時 ${(totalDuration / 1000).toFixed(1)} 秒，已儲存至 workspace/${filename}。`,
      });
    } catch (fatalErr: any) {
      console.error('Fatal MoA execution error:', fatalErr);
      setStatusMessage({
        type: 'error',
        text: `執行過程中發生異常: ${fatalErr.message}。若為 API 金鑰問題，可點選上方「金鑰管理」設定或切換至離線模擬器。`,
      });
    } finally {
      setIsExecuting(false);
      setActiveExecutionStage('idle');
    }
  };

  // Download markdown directly from client
  const handleDownloadMarkdown = (record: MoARunRecord) => {
    const filename = record.savedFilename || `MoA_Task_${Date.now()}.md`;
    let md = `# ${record.taskTitle}\n\n> 需求: ${record.originalPrompt}\n\n---\n\n## 🏆 終審裁決\n${record.judgeVerdict?.content}\n\n---\n\n## 🧩 提案者內容\n`;
    record.proposals.forEach((p, idx) => {
      md += `### #${idx + 1} ${p.agentName} (${p.model})\n${p.content}\n\n`;
    });
    md += `\n---\n## Skill 規範\n${record.skillSpec}\n`;

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle agent edit / add
  const handleAddNewAgent = (roleType: AgentRoleType = 'proposer') => {
    const newId = `agent-${Date.now()}`;
    const newAgent: AgentConfig = {
      id: newId,
      name: roleType === 'proposer' ? '新提案者' : '副裁決者',
      roleType,
      provider: 'gemini',
      providerName: 'Google Gemini',
      model: 'gemini-3.8-flash',
      temperature: roleType === 'proposer' ? 0.7 : 0.2,
      rolePrompt:
        roleType === 'proposer'
          ? '你是一位具備獨立觀點的領域專家，請提出具體創新的提案。'
          : '你是一位公正嚴格的裁決整合專家，負責去蕪存菁產出終稿。',
      isActive: true,
      color: roleType === 'proposer' ? '#0d9488' : '#d97706',
    };
    setEditingAgent(newAgent);
  };

  const handleSaveAgent = (saved: AgentConfig) => {
    const exists = agents.some((a) => a.id === saved.id);
    if (exists) {
      setAgents(agents.map((a) => (a.id === saved.id ? saved : a)));
    } else {
      setAgents([...agents, saved]);
    }
  };

  const handleDeleteWorkspaceFile = async (filename: string) => {
    try {
      await deleteWorkspaceFile(filename);
      await loadWorkspaceFiles();
    } catch (e: any) {
      alert(`刪除檔案失敗: ${e.message}`);
    }
  };

  const handleGetWorkspaceContent = async (filename: string): Promise<string> => {
    const res = await getWorkspaceFileContent(filename);
    return res.content;
  };

  const handleNewTask = () => {
    setPrompt('');
    setCurrentRun(null);
    setStatusMessage(null);
    setActiveTab('console');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Navigation conforming to Top Bar Contract */}
      <TopNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        onNewTask={handleNewTask}
        hasGeminiKey={hasGeminiKey}
        workspaceFileCount={workspaceFiles.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Status notification if any */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                : statusMessage.type === 'error'
                ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300'
                : 'bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800 text-sky-800 dark:text-sky-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setStatusMessage(null)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer text-xs"
            >
              關閉
            </button>
          </div>
        )}

        {/* Tab 1: Task Console (Main Execution & Results) */}
        {activeTab === 'console' && (
          <div className="space-y-6">
            <TaskConsole
              prompt={prompt}
              onPromptChange={setPrompt}
              onExecuteMoA={handleExecuteMoA}
              isExecuting={isExecuting}
              activeExecutionStage={activeExecutionStage}
              agents={agents}
              skillSpec={skillSpec}
            />

            {/* Results Display */}
            {currentRun && (
              <MoAResultsView
                record={currentRun}
                onDownloadMarkdown={handleDownloadMarkdown}
              />
            )}
          </div>
        )}

        {/* Tab 2: Visual Topology (Interactive Role Orchestration) */}
        {activeTab === 'topology' && (
          <VisualTopology
            agents={agents}
            onUpdateAgents={setAgents}
            onEditAgent={(agent) => setEditingAgent(agent)}
            onAddNewAgent={handleAddNewAgent}
            isExecuting={isExecuting}
            activeExecutionStage={activeExecutionStage}
          />
        )}

        {/* Tab 3: Unified Skill Spec Manager */}
        {activeTab === 'skills' && (
          <SkillSpecManager
            skillSpec={skillSpec}
            onUpdateSkillSpec={setSkillSpec}
            presets={presets}
            activeAgentsCount={agents.filter((a) => a.isActive).length}
          />
        )}

        {/* Tab 4: Local Workspace MD Files */}
        {activeTab === 'workspace' && (
          <WorkspaceManager
            files={workspaceFiles}
            onRefresh={loadWorkspaceFiles}
            onDeleteFile={handleDeleteWorkspaceFile}
            onGetFileContent={handleGetWorkspaceContent}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-4 px-4 text-center text-xs text-slate-400">
        <span>MoA Studio · Mixture of Agents Architecture · Local Markdown Persistence</span>
      </footer>

      {/* Key Manager Modal */}
      <KeyManagerModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        apiKeys={apiKeys}
        onSaveKeys={setApiKeys}
        hasServerGeminiKey={hasGeminiKey}
      />

      {/* Agent Edit Modal */}
      <AgentEditModal
        isOpen={Boolean(editingAgent)}
        onClose={() => setEditingAgent(null)}
        agent={editingAgent}
        onSaveAgent={handleSaveAgent}
      />
    </div>
  );
}
