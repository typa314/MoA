import { AgentConfig, ProposerProposal, SkillPreset, WorkspaceFile } from '../types/moa';

export async function checkServerStatus(): Promise<{
  status: string;
  hasGeminiKey: boolean;
  workspaceFileCount: number;
  workspacePath: string;
}> {
  const res = await fetch('/api/status');
  if (!res.ok) throw new Error('伺服器狀態檢測異常');
  return res.json();
}

export async function fetchSkillPresets(): Promise<SkillPreset[]> {
  const res = await fetch('/api/skills/presets');
  if (!res.ok) throw new Error('獲取技能規範預設失敗');
  const data = await res.json();
  return data.presets || [];
}

export async function callProposerAgent(
  agent: AgentConfig,
  prompt: string,
  skillSpec: string,
  customApiKey?: string
): Promise<{ content: string; model: string }> {
  const res = await fetch('/api/moa/execute-proposer', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      agent,
      prompt,
      skillSpec,
      customApiKey,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Proposer ${agent.name} 執行失敗`);
  }
  return data;
}

export async function callJudgeAgent(
  judgeAgent: AgentConfig,
  prompt: string,
  skillSpec: string,
  proposals: Array<{ agentName: string; model: string; content: string }>,
  customApiKey?: string
): Promise<{ content: string; model: string }> {
  const res = await fetch('/api/moa/execute-judge', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      judgeAgent,
      prompt,
      skillSpec,
      proposals,
      customApiKey,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Judge ${judgeAgent.name} 執行失敗`);
  }
  return data;
}

export async function listWorkspaceFiles(): Promise<WorkspaceFile[]> {
  const res = await fetch('/api/workspace/files');
  if (!res.ok) throw new Error('讀取工作區檔案失敗');
  const data = await res.json();
  return data.files || [];
}

export async function getWorkspaceFileContent(filename: string): Promise<{
  filename: string;
  content: string;
  size: number;
  updatedAt: number;
}> {
  const res = await fetch(`/api/workspace/files/${encodeURIComponent(filename)}`);
  if (!res.ok) throw new Error('讀取檔案內容失敗');
  return res.json();
}

export async function saveWorkspaceFile(
  filename: string,
  content: string,
  overwrite = true
): Promise<{ success: boolean; filename: string; path: string }> {
  const res = await fetch('/api/workspace/files', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename, content, overwrite }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '儲存檔案失敗');
  return data;
}

export async function deleteWorkspaceFile(filename: string): Promise<{ success: boolean }> {
  const res = await fetch(`/api/workspace/files/${encodeURIComponent(filename)}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('刪除檔案失敗');
  return res.json();
}
