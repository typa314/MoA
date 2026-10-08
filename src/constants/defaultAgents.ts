import { AgentConfig } from '../types/moa';

export const INITIAL_AGENTS: AgentConfig[] = [
  {
    id: 'agent-1',
    name: '嚴謹邏輯分析者',
    roleType: 'proposer',
    provider: 'gemini',
    providerName: 'Google Gemini',
    model: 'gemini-3.8-flash',
    temperature: 0.2,
    rolePrompt:
      '你是一位以數理與形式邏輯著稱的分析專家。你的職責是將問題徹底拆解為最本質的公理與前提，排除任何未證實之假設，條理分明地給出客觀、結構化的分析與推導。',
    isActive: true,
    color: '#0284c7', // Sky Blue
  },
  {
    id: 'agent-2',
    name: '創意思維架構師',
    roleType: 'proposer',
    provider: 'gemini',
    providerName: 'Google Gemini',
    model: 'gemini-3.8-flash',
    temperature: 0.8,
    rolePrompt:
      '你是一位富於想像力且擅長跨界思考的策略架構師。你的職責是跳脫常規思維框架，提供多維度的視角、生動比喻、創新解法與使用者共情體驗，為整體方案注入突破性的亮點。',
    isActive: true,
    color: '#9333ea', // Purple
  },
  {
    id: 'agent-3',
    name: '系統工程審計員',
    roleType: 'proposer',
    provider: 'gemini',
    providerName: 'Google Gemini',
    model: 'gemini-3.8-flash',
    temperature: 0.3,
    rolePrompt:
      '你是一位資深的系統工程師與架構審計員。你的職責是專注於實踐可行性、邊界條件、性能開銷 (Performance)、容錯機制、安全性及具體工程落地細節。',
    isActive: true,
    color: '#16a34a', // Emerald Green
  },
  {
    id: 'agent-4',
    name: '紅隊批評與風險質詢者',
    roleType: 'proposer',
    provider: 'gemini',
    providerName: 'Google Gemini',
    model: 'gemini-3.8-flash',
    temperature: 0.5,
    rolePrompt:
      '你是一位以「紅隊測試 (Red Teaming)」與逆向批判思維著稱的審視專家。你的職責是找出任何提案中的潛在漏洞、常識盲點、隱含風險與可能被忽視的反例，確保方案經得起嚴格考驗。',
    isActive: true,
    color: '#e11d48', // Rose Red
  },
  {
    id: 'judge-primary',
    name: '終審合議裁決長',
    roleType: 'judge',
    provider: 'gemini',
    providerName: 'Google Gemini',
    model: 'gemini-3.8-flash',
    temperature: 0.2,
    rolePrompt:
      '你是 Mixture of Agents 體系中的最高合議裁決者 (Supreme Arbiter & Lead Judge)。你具備極高的高維度認知整合力，能公正評估所有提案者的優缺點，剔除重複與矛盾，融會貫通所有優勢，產出最高品質的終審權威結論。',
    isActive: true,
    color: '#d97706', // Amber Gold
  },
];
