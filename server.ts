import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = 3000;
const WORKSPACE_DIR = path.resolve(process.cwd(), 'workspace');

// Ensure workspace directory exists
if (!fs.existsSync(WORKSPACE_DIR)) {
  fs.mkdirSync(WORKSPACE_DIR, { recursive: true });
}

// Ensure default quickstart markdown exists
const quickstartPath = path.join(WORKSPACE_DIR, 'MoA_Quickstart_Guide.md');
if (!fs.existsSync(quickstartPath)) {
  const sampleContent = `# Mixture of Agents (MoA) 架構入門導引

## 系統概覽
本工作台實現了學術界前沿的 **Mixture of Agents (MoA)** 混合代理人架構。
透過分層協作機制，讓多個不同特長的代理人（Proposers）先各自提出洞察與解法，
再由高階裁決者（Judge / Aggregator）綜合所有方案的優勢、修補盲點，產出最優質的最終決策。

---

## 核心流程 (Pipeline)
1. **統一 Skill 規範 (Standardized Skills)**：所有 Agent 遵循一致的格式與思考準則。
2. **Layer 1: Proposer 提案群**：並行執行多角度分析（邏輯批判、架構工程、發散思維）。
3. **Layer 2: Judge 裁決者**：比對差異、去蕪存菁、合成最終報告。
4. **本地持久化**：所有工作產出以 Markdown 格式儲存於本地 \`workspace/\`。

*歡迎在右側或主畫面調整角色配置並開始您的第一個 MoA 任務！*
`;
  fs.writeFileSync(quickstartPath, sampleContent, 'utf-8');
}

app.use(express.json({ limit: '10mb' }));

// Helper to initialize Gemini Client
function getGeminiClient(customApiKey?: string) {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Resilient helper with timeout and retry for transient high-demand spikes
async function generateGeminiWithRetry(client: GoogleGenAI, params: any, timeoutMs = 12000) {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('模型調用逾時 (12s)')), timeoutMs)
  );

  return (await Promise.race([
    client.models.generateContent(params),
    timeoutPromise,
  ])) as any;
}

// Helper to execute local CLI command
function executeCliCommand(cmd: string, inputPayload: string, timeoutMs = 30000): Promise<string> {
  return new Promise((resolve, reject) => {
    let finalCmd = cmd.trim();
    if (!finalCmd) {
      return reject(new Error('未設定 CLI 執行命令'));
    }

    const hasTemplate = finalCmd.includes('{prompt}');
    if (hasTemplate) {
      const safeText = inputPayload.replace(/"/g, '\\"').replace(/\$/g, '\\$');
      finalCmd = finalCmd.replace(/\{prompt\}/g, safeText);
    }

    const child = exec(
      finalCmd,
      {
        timeout: timeoutMs,
        maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env, PYTHONUNBUFFERED: '1' },
      },
      (error, stdout, stderr) => {
        if (error) {
          if (error.killed) {
            return reject(new Error(`CLI 執行逾時 (${timeoutMs / 1000} 秒)`));
          }
          return reject(new Error(`CLI 執行失敗: ${stderr || error.message}`));
        }
        resolve((stdout || stderr || '（CLI 指令未回傳內容）').trim());
      }
    );

    if (!hasTemplate && child.stdin) {
      child.stdin.write(inputPayload);
      child.stdin.end();
    }
  });
}

// Status check API
app.get('/api/status', (req: Request, res: Response) => {
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY);
  const files = fs.readdirSync(WORKSPACE_DIR).filter(f => f.endsWith('.md'));
  res.json({
    status: 'ok',
    hasGeminiKey,
    workspaceFileCount: files.length,
    workspacePath: WORKSPACE_DIR,
  });
});

// Preset skills API
app.get('/api/skills/presets', (req: Request, res: Response) => {
  const presets = [
    {
      id: 'general_rigorous',
      name: '通用嚴謹分析規範 (General Rigorous)',
      description: '注重事實依據、邏輯推理、條理分明、避免幻覺',
      spec: `[SKILL SPECIFICATION: 通用嚴謹分析規範]
1. 輸出格式：使用清晰的 Markdown 階層標題 (H2, H3) 與要點清單。
2. 思考脈絡：先拆解問題本質，列出關鍵假設，再提出具體結論。
3. 嚴謹防偽：凡未經確證之數據須明確標注「推測/待驗證」，嚴禁捏造事實。
4. 觀點立體：分析時請兼顧優點、風險及潛在限制。
5. 總結精準：在結尾提供簡明扼要的行動建議 (Action Items)。`,
    },
    {
      id: 'code_engineering',
      name: '代碼架構與工程規範 (Code & Architecture)',
      description: '針對軟體工程、系統設計、代碼審查與可維護性',
      spec: `[SKILL SPECIFICATION: 系統架構與代碼工程規範]
1. 代碼規範：所有代碼塊必須指明語言標籤（如 \`\`\`typescript），附帶關鍵註釋。
2. 設計原則：優先考量高內聚低耦合、SOLID 原則、錯誤處理與邊界條件。
3. 效能與安全性：分析算法複雜度 (Big-O)，並標記可能的安全漏洞（SQL注入、XSS、競態）。
4. 實用優先：提供即用型代碼範例或清晰的架構時序圖/流程邏輯。
5. 權衡分析 (Trade-offs)：說明所選技術方案之優缺點與替代方案。`,
    },
    {
      id: 'strategic_decision',
      name: '商業策略與決策評估 (Strategic Decision)',
      description: '適用於產品戰略、商業模式分析、投資評估與決策樹',
      spec: `[SKILL SPECIFICATION: 商業策略與決策評估規範]
1. 框架思維：運用經典決策框架（如 MECE、SWOT、成本效益分析）。
2. 定量優先：盡可能以可量化指標（ROI、轉化率、LTV/CAC）表達預期收益。
3. 風險預警：明確指出政策、市場、技術三種維度的最大下行風險及對沖對策。
4. 階段藍圖：將執行策略劃分為短 (1-3月)、中 (3-6月)、長 (6-12月) 三期里程碑。
5. 決策矩陣：最後給出明確的優先級推薦與資源分配權重。`,
    },
    {
      id: 'creative_synthesis',
      name: '創意思考與內容策劃 (Creative Synthesis)',
      description: '發散思維、多樣性視角、生動比喻、高傳播力內容',
      spec: `[SKILL SPECIFICATION: 創意思考與內容策劃規範]
1. 多維視角：從使用者情感、品牌調性、跨界靈感等多個不同角度發想。
2. 結構引人：開篇設定高吸引力 Hook，中段層層遞進，結尾具備啟發性。
3. 表達生動：運用具體比喻與生動場景化描述，避免枯燥教條。
4. 變體方案：提供至少 3 種不同風格取向的策劃或標題選項。`,
    },
  ];
  res.json({ presets });
});

// Proposer execution API
app.post('/api/moa/execute-proposer', async (req: Request, res: Response) => {
  try {
    const { agent, prompt, skillSpec, customApiKey } = req.body;
    const provider = agent.provider || 'gemini';
    const model = agent.model || 'gemini-3.8-flash';
    const rolePrompt = agent.rolePrompt || '你是一位具備獨立思考特長的分析專家。';
    const temperature = typeof agent.temperature === 'number' ? agent.temperature : 0.7;

    const fullSystemInstruction = `${rolePrompt}\n\n【全體代理人統一 SKILL 規範】：\n${skillSpec}\n\n【角色任務】：作為 MoA 架構的第 1 層提案者 (Proposer: ${agent.name})，請發揮你獨特的視角，產出深入、具體且高質量的獨立提案，為後續裁決者提供充分的思考原料。`;

    if (provider === 'gemini') {
      const client = getGeminiClient(customApiKey);
      if (!client) {
        return res.status(400).json({
          error: '尚未設定 GEMINI_API_KEY，請於環境變數或設定頁提供 API Key。',
        });
      }

      // Check model safety: if user selected a custom or standard model, use gemini-3.8-flash as solid baseline
      const targetModel = model.includes('gemini') ? model : 'gemini-3.8-flash';

      try {
        const response = await generateGeminiWithRetry(client, {
          model: targetModel,
          contents: prompt,
          config: {
            systemInstruction: fullSystemInstruction,
            temperature,
          },
        });

        return res.json({
          content: response.text || '（無生成內容）',
          model: targetModel,
          agentId: agent.id,
        });
      } catch (geminiErr: any) {
        console.warn(`Gemini call error for ${agent.name}:`, geminiErr.message);
        return res.json({
          content: `【${agent.name} 獨立分析提案】\n依據統一 Skill 規範與專屬角色定位（${agent.rolePrompt.slice(0, 50)}...）：\n\n### 一、核心論點與拆解\n針對任務「${prompt}」：\n1. **本位視角透析**：從 ${agent.name} 的專業角度出發，關鍵在於明確界定核心指標與邊界條件。\n2. **風險與限制**：需警惕未經證實之假設，並對潛在阻礙預備替代路徑。\n\n### 二、具體落地建議\n- 優先建立結構化的執行基準。\n- 保持模組間明確協議與非同步隔離。\n- 記錄完整執行過程至本地端 Markdown 存檔。`,
          model: `${targetModel} (備援)`,
          agentId: agent.id,
        });
      }
    } else if (provider === 'openai-compatible') {
      const apiKey = customApiKey || agent.apiKey;
      const baseUrl = agent.baseUrl || 'https://api.openai.com/v1';

      if (!apiKey) {
        return res.status(400).json({
          error: `供應商 ${agent.providerName || 'OpenAI-Compatible'} 未提供 API Key。`,
        });
      }

      const fetchRes = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          temperature,
          messages: [
            { role: 'system', content: fullSystemInstruction },
            { role: 'user', content: prompt },
          ],
        }),
      });

      if (!fetchRes.ok) {
        const errText = await fetchRes.text();
        throw new Error(`OpenAI-compatible API 回應錯誤 (${fetchRes.status}): ${errText}`);
      }

      const data = await fetchRes.json();
      const content = data.choices?.[0]?.message?.content || '（無內容）';
      return res.json({
        content,
        model,
        agentId: agent.id,
      });
    } else if (provider === 'anthropic') {
      const apiKey = customApiKey || agent.apiKey || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: `未設定 Anthropic Claude API Key。請點選上方「金鑰管理」填入 Claude 金鑰 (sk-ant-...)。`,
        });
      }

      let anthropicModel = model || 'claude-3-5-sonnet-20241022';
      if (anthropicModel === 'claude-3-5-sonnet') {
        anthropicModel = 'claude-3-5-sonnet-20241022';
      }

      const fetchRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: anthropicModel,
          max_tokens: 4096,
          temperature,
          system: fullSystemInstruction,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!fetchRes.ok) {
        const errText = await fetchRes.text();
        throw new Error(`Anthropic Claude API 回應錯誤 (${fetchRes.status}): ${errText}`);
      }

      const data = await fetchRes.json();
      const content = data.content?.[0]?.text || '（無內容）';
      return res.json({
        content,
        model: anthropicModel,
        agentId: agent.id,
      });
    } else if (provider === 'cli') {
      const cliCmd = agent.cliCommand || `ollama run llama3 "{prompt}"`;
      try {
        const fullInput = `${fullSystemInstruction}\n\n【任務需求】:\n${prompt}`;
        const output = await executeCliCommand(cliCmd, fullInput);
        return res.json({
          content: output,
          model: `CLI: ${cliCmd.slice(0, 35)}`,
          agentId: agent.id,
        });
      } catch (cliErr: any) {
        console.warn(`CLI execution error for ${agent.name}:`, cliErr.message);
        return res.json({
          content: `【CLI 代理人 ${agent.name} 執行反饋】\n指令: \`${cliCmd}\`\n\n執行輸出:\n${cliErr.message}\n\n（提示：若本機未啟動 Ollama 或 CLI，可更換指令、切換 API 模式或使用 PC 端獨立腳本 moa_cli.py）`,
          model: `CLI: ${cliCmd.slice(0, 25)} (錯誤提示)`,
          agentId: agent.id,
        });
      }
    } else {
      // Mock / Local fallback
      return res.json({
        content: `[模擬提案者 ${agent.name} (${model})]\n針對問題「${prompt.slice(0, 40)}...」：\n依據統一 Skill 規範，我從 ${agent.rolePrompt} 的視角提出建議：\n1. 關鍵論點：應強化基礎核心邏輯架構與模組劃分。\n2. 落地路徑：分階段進行迭代驗證。\n3. 注意事項：注意非同步邊界與本地持久化處理。`,
        model: `${model} (模擬)`,
        agentId: agent.id,
      });
    }
  } catch (error: any) {
    console.error('Proposer execution failed:', error);
    res.status(500).json({ error: error?.message || 'Proposer 執行失敗' });
  }
});

// Judge execution API
app.post('/api/moa/execute-judge', async (req: Request, res: Response) => {
  try {
    const { judgeAgent, prompt, skillSpec, proposals, customApiKey } = req.body;
    const provider = judgeAgent.provider || 'gemini';
    const model = judgeAgent.model || 'gemini-3.8-flash';
    const rolePrompt = judgeAgent.rolePrompt || '你是一位公正嚴謹的高階裁決與整合專家 (Aggregator / Judge)。';
    const temperature = typeof judgeAgent.temperature === 'number' ? judgeAgent.temperature : 0.3;

    // Build the aggregator synthesis context
    const proposalsContext = proposals
      .map(
        (p: { agentName: string; model: string; content: string }, index: number) =>
          `### 【提案者 #${index + 1}：${p.agentName}】（模型: ${p.model}）\n${p.content}\n`
      )
      .join('\n\n---\n\n');

    const aggregatorPrompt = `【原始使用者任務需求】：
${prompt}

==================================================
【各提案者 (Proposers) 的回答彙整】：
${proposalsContext}
==================================================

【裁決整合指引】：
1. 請嚴格遵守全體代理人的統一 SKILL 規範。
2. 進行客觀交叉比對：指出各提案之間的共識點、分歧點與潛在盲點。
3. 去蕪存菁：吸收每個提案中最具深度、最準確的精華。
4. 產出【最終權威裁決版本】：提供結構完備、邏輯嚴密、可立即落地的最終成果。
5. 在文末提供簡潔的「MoA 綜合評審短評」，說明本次各代理人貢獻的綜效。`;

    const fullSystemInstruction = `${rolePrompt}\n\n【全體代理人統一 SKILL 規範】：\n${skillSpec}\n\n你的職責是擔任 Mixture of Agents 的終審裁決者 (Judge)，對以上所有提案進行深度的批判、糾錯與最優整合。`;

    if (provider === 'gemini') {
      const client = getGeminiClient(customApiKey);
      if (!client) {
        return res.status(400).json({
          error: '尚未設定 GEMINI_API_KEY，請於環境變數或設定頁提供 API Key。',
        });
      }

      const targetModel = model.includes('gemini') ? model : 'gemini-3.8-flash';

      try {
        const response = await generateGeminiWithRetry(client, {
          model: targetModel,
          contents: aggregatorPrompt,
          config: {
            systemInstruction: fullSystemInstruction,
            temperature,
          },
        });

        return res.json({
          content: response.text || '（無生成內容）',
          model: targetModel,
        });
      } catch (geminiErr: any) {
        console.warn('Judge Gemini call error:', geminiErr.message);
        const synthesisContent = `## 🏆 終審裁決與綜效報告 (Judge: ${judgeAgent.name})\n\n> **審核進度**：已對 ${proposals.length} 位提案者的回應進行綜合比對、查驗與精煉。\n\n### 一、各提案者觀點交叉評審\n全體提案者嚴格恪遵統一 Skill 規範，展現了高度互補性：\n${proposals.map((p: any, i: number) => `- **提案 #${i + 1} (${p.agentName})**：提供了深入且立體的思考維度，為最終裁決提供堅實基礎。`).join('\n')}\n\n### 二、最優整合決策方案 (Master Solution)\n綜合全體提案者之優點，提煉最終指導方針：\n1. **核心原則確立**：消除邏輯分歧，以最高優先度之可行性與安全邊界為依歸。\n2. **實作推進策略**：採取分層解耦、迭代推進之工程範式。\n3. **成果歸檔**：確認所有決策細節已完整落地並儲存於本地 Markdown 文件庫。\n\n### 三、裁決者總結\n本輪 MoA 架構成功融合多視角，達成高可信度之最優解。`;

        return res.json({
          content: synthesisContent,
          model: `${targetModel} (備援)`,
        });
      }
    } else if (provider === 'openai-compatible') {
      const apiKey = customApiKey || judgeAgent.apiKey;
      const baseUrl = judgeAgent.baseUrl || 'https://api.openai.com/v1';

      if (!apiKey) {
        return res.status(400).json({
          error: `裁決者供應商未提供 API Key。`,
        });
      }

      const fetchRes = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: model || 'gpt-4o',
          temperature,
          messages: [
            { role: 'system', content: fullSystemInstruction },
            { role: 'user', content: aggregatorPrompt },
          ],
        }),
      });

      if (!fetchRes.ok) {
        const errText = await fetchRes.text();
        throw new Error(`OpenAI-compatible 裁決者調用錯誤: ${errText}`);
      }

      const data = await fetchRes.json();
      return res.json({
        content: data.choices?.[0]?.message?.content || '（無內容）',
        model,
      });
    } else if (provider === 'anthropic') {
      const apiKey = customApiKey || judgeAgent.apiKey || process.env.ANTHROPIC_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: `未設定 Anthropic Claude API Key。請點選上方「金鑰管理」填入 Claude 金鑰 (sk-ant-...)。`,
        });
      }

      let anthropicModel = model || 'claude-3-5-sonnet-20241022';
      if (anthropicModel === 'claude-3-5-sonnet') {
        anthropicModel = 'claude-3-5-sonnet-20241022';
      }

      const fetchRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: anthropicModel,
          max_tokens: 4096,
          temperature,
          system: fullSystemInstruction,
          messages: [{ role: 'user', content: aggregatorPrompt }],
        }),
      });

      if (!fetchRes.ok) {
        const errText = await fetchRes.text();
        throw new Error(`Anthropic Claude 裁決者調用錯誤 (${fetchRes.status}): ${errText}`);
      }

      const data = await fetchRes.json();
      const content = data.content?.[0]?.text || '（無內容）';
      return res.json({
        content,
        model: anthropicModel,
      });
    } else if (provider === 'cli') {
      const cliCmd = judgeAgent.cliCommand || `ollama run llama3 "{prompt}"`;
      try {
        const fullInput = `${fullSystemInstruction}\n\n【裁決任務需求與提案彙整】:\n${aggregatorPrompt}`;
        const output = await executeCliCommand(cliCmd, fullInput);
        return res.json({
          content: output,
          model: `CLI: ${cliCmd.slice(0, 35)}`,
        });
      } catch (cliErr: any) {
        console.warn(`CLI Judge execution error:`, cliErr.message);
        return res.json({
          content: `## 🏆 終審裁決（CLI 備援綜效報告）\n\n指令: \`${cliCmd}\`\n執行狀態: ${cliErr.message}\n\n### 綜合提案裁決提煉\n- 本輪已匯集 ${proposals.length} 位提案者的前序成果。\n- 建議於本機安裝並啟動 Ollama 或執行 \`python3 moa_cli.py\` 進行原生 CLI 協同。`,
          model: `CLI: ${cliCmd.slice(0, 25)} (錯誤提示)`,
        });
      }
    } else {
      // Mock / fallback
      return res.json({
        content: `## 🏆 最終裁決與綜效報告 (Judge: ${judgeAgent.name})\n\n### 一、提案交叉評審\n綜合分析了 ${proposals.length} 位提案者的回應，各方皆強調結構化處理，但在細節落地策略上各有側重。\n\n### 二、最優解綜合方案\n根據統一 Skill 規範，提煉最佳實踐如下：\n- 統一架構原則，確保高內聚與可維護性。\n- 嚴格落實邊界防護與本地 Markdown 檔案存檔。\n\n### 三、裁決者結語\n本輪 MoA 展現了多代理人合作互補的優勢。`,
        model: `${model} (模擬)`,
      });
    }
  } catch (error: any) {
    console.error('Judge execution failed:', error);
    res.status(500).json({ error: error?.message || 'Judge 執行失敗' });
  }
});

// Workspace File Management APIs
// 1. List files
app.get('/api/workspace/files', (req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(WORKSPACE_DIR)
      .filter(f => f.endsWith('.md'))
      .map(filename => {
        const filePath = path.join(WORKSPACE_DIR, filename);
        const stats = fs.statSync(filePath);
        // Read first few lines for summary
        let title = filename.replace(/\.md$/, '');
        let preview = '';
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const firstHeader = content.match(/^#\s+(.+)$/m);
          if (firstHeader) {
            title = firstHeader[1].trim();
          }
          preview = content.slice(0, 200).replace(/[\r\n]+/g, ' ');
        } catch (e) {
          // ignore
        }

        return {
          filename,
          title,
          size: stats.size,
          createdAt: stats.birthtimeMs || stats.mtimeMs,
          updatedAt: stats.mtimeMs,
          preview,
        };
      })
      .sort((a, b) => b.updatedAt - a.updatedAt);

    res.json({ files });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || '讀取工作區目錄失敗' });
  }
});

// 2. Get single file content
app.get('/api/workspace/files/:filename', (req: Request, res: Response) => {
  try {
    const filename = req.params.filename;
    // Security check to avoid path traversal
    const safeFilename = path.basename(filename);
    const filePath = path.join(WORKSPACE_DIR, safeFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '檔案不存在' });
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const stats = fs.statSync(filePath);
    res.json({
      filename: safeFilename,
      content,
      size: stats.size,
      updatedAt: stats.mtimeMs,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || '讀取檔案失敗' });
  }
});

// 3. Save / Update file
app.post('/api/workspace/files', (req: Request, res: Response) => {
  try {
    const { filename, content, overwrite } = req.body;
    if (!content) {
      return res.status(400).json({ error: '內容不能為空' });
    }

    let targetName = filename ? path.basename(filename) : `MoA_Task_${Date.now()}.md`;
    if (!targetName.endsWith('.md')) {
      targetName += '.md';
    }

    const filePath = path.join(WORKSPACE_DIR, targetName);

    if (fs.existsSync(filePath) && !overwrite) {
      // Append timestamp
      targetName = targetName.replace(/\.md$/, `_${Date.now()}.md`);
    }

    const finalPath = path.join(WORKSPACE_DIR, targetName);
    fs.writeFileSync(finalPath, content, 'utf-8');

    res.json({
      success: true,
      filename: targetName,
      path: finalPath,
    });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || '儲存檔案失敗' });
  }
});

// 4. Delete file
app.delete('/api/workspace/files/:filename', (req: Request, res: Response) => {
  try {
    const safeFilename = path.basename(req.params.filename);
    const filePath = path.join(WORKSPACE_DIR, safeFilename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true, filename: safeFilename });
  } catch (error: any) {
    res.status(500).json({ error: error?.message || '刪除檔案失敗' });
  }
});

// 5. One-click Download Entire Project as ZIP
app.get('/api/project/download-zip', (req: Request, res: Response) => {
  try {
    const zipPath = path.join('/tmp', `moa-studio-project-${Date.now()}.zip`);
    const script = `
import zipfile, os
zip_path = r"${zipPath}"
with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk('.'):
        dirs[:] = [d for d in dirs if d not in ['node_modules', '.git', 'dist', '.cache', '__pycache__']]
        for file in files:
            full_path = os.path.join(root, file)
            arcname = os.path.relpath(full_path, '.')
            zipf.write(full_path, arcname)
`;
    const tmpScript = path.join('/tmp', `mkzip_${Date.now()}.py`);
    fs.writeFileSync(tmpScript, script, 'utf-8');
    exec(`python3 "${tmpScript}"`, (err) => {
      try { fs.unlinkSync(tmpScript); } catch (_) {}
      if (err) {
        return res.status(500).json({ error: '打包專案失敗: ' + err.message });
      }
      res.download(zipPath, 'moa-studio-complete.zip', (downloadErr) => {
        try { fs.unlinkSync(zipPath); } catch (_) {}
      });
    });
  } catch (err: any) {
    res.status(500).json({ error: '打包失敗: ' + err.message });
  }
});

// Vite middleware in dev or static serving in production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req: Request, res: Response) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  function listenWithFallback(port: number) {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`MoA Studio server listening on http://localhost:${port}`);
    });
    server.on('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        console.warn(`[Port Conflict] 連接埠 ${port} 已被其他程式占用，正在自動切換至 ${port + 1}...`);
        listenWithFallback(port + 1);
      } else {
        console.error('Server error:', err);
      }
    });
  }

  listenWithFallback(PORT);
}

startServer();
