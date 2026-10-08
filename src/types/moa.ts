export type AgentRoleType = 'proposer' | 'judge';

export type ProviderType = 'gemini' | 'openai-compatible' | 'anthropic' | 'cli' | 'simulator';

export interface AgentConfig {
  id: string;
  name: string;
  avatarIcon?: string;
  roleType: AgentRoleType;
  provider: ProviderType;
  providerName?: string;
  model: string;
  temperature: number;
  rolePrompt: string;
  apiKey?: string;
  baseUrl?: string;
  cliCommand?: string;
  isActive: boolean;
  color: string;
}

export interface SkillPreset {
  id: string;
  name: string;
  description: string;
  spec: string;
}

export interface ProposerProposal {
  agentId: string;
  agentName: string;
  model: string;
  rolePrompt: string;
  content: string;
  durationMs: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  error?: string;
}

export interface JudgeVerdict {
  agentId: string;
  agentName: string;
  model: string;
  content: string;
  durationMs: number;
  status: 'idle' | 'running' | 'completed' | 'error';
  error?: string;
}

export interface MoARunRecord {
  id: string;
  taskTitle: string;
  originalPrompt: string;
  skillSpec: string;
  timestamp: number;
  proposals: ProposerProposal[];
  judgeVerdict?: JudgeVerdict;
  totalDurationMs: number;
  status: 'idle' | 'proposers_running' | 'judge_running' | 'completed' | 'error';
  savedFilename?: string;
}

export interface WorkspaceFile {
  filename: string;
  title: string;
  size: number;
  createdAt: number;
  updatedAt: number;
  preview: string;
}

export interface ApiKeysState {
  geminiKey?: string;
  openaiKey?: string;
  anthropicKey?: string;
  deepseekKey?: string;
  groqKey?: string;
  customBaseUrl?: string;
  customKey?: string;
}
