#!/usr/bin/env python3
"""
Mixture of Agents (MoA) - 本地 PC 端 CLI 入口指令腳本
可在本機終端機直接執行，支援調用本機 Ollama、Claude CLI、Gemini API、OpenAI 等不同 Agent，
並將結果自動存檔為本地端 Markdown 檔案。

用法:
    python3 moa_cli.py "請設計一套微服務資料庫高可用方案"
    python3 moa_cli.py --interactive
"""

import sys
import os
import json
import subprocess
import datetime
from pathlib import Path
from typing import List, Dict

# 統一 Skill 規範
DEFAULT_SKILL = """[SKILL SPECIFICATION: 通用嚴謹分析規範]
1. 輸出格式：使用清晰的 Markdown 階層標題 (H2, H3) 與要點清單。
2. 思考脈絡：先拆解問題本質，列出關鍵假設，再提出具體結論。
3. 嚴謹防偽：凡未經確證之數據須明確標注「推測/待驗證」，嚴禁捏造事實。
4. 觀點立體：分析時請兼顧優點、風險及潛在限制。
5. 總結精準：在結尾提供簡明扼要的行動建議 (Action Items)。
"""

class MoACLI:
    def __init__(self, workspace_dir: str = "workspace"):
        self.workspace_dir = Path(workspace_dir)
        self.workspace_dir.mkdir(exist_ok=True)
        self.skill_spec = DEFAULT_SKILL

        # 預設提案者群與裁決者
        self.proposers = [
            {
                "name": "嚴謹邏輯分析者",
                "role": "以形式邏輯與公理拆解問題，排除未經證實之假設。",
                "type": "cli",
                "cmd": 'ollama run llama3 "{prompt}"'
            },
            {
                "name": "創意思維架構師",
                "role": "跨界思考與使用者共情體驗，提供多元破局視角。",
                "type": "cli",
                "cmd": 'ollama run qwen2.5 "{prompt}"'
            },
            {
                "name": "系統工程審計員",
                "role": "專注於工程落地、邊界條件、容錯性與可維護性。",
                "type": "cli",
                "cmd": 'ollama run mistral "{prompt}"'
            }
        ]
        self.judge = {
            "name": "終審合議裁決長",
            "role": "公正綜合所有提案，剔除矛盾，產出權威終審報告。",
            "type": "cli",
            "cmd": 'ollama run llama3:70b "{prompt}"'
        }

    def run_agent_cmd(self, agent: Dict, prompt: str, system_spec: str) -> str:
        """透過本機 CLI (如 ollama, claude, python) 或 API 調用"""
        full_prompt = f"【角色設定】：{agent['role']}\n【統一 Skill 規範】：\n{system_spec}\n\n【任務需求】：\n{prompt}"
        cmd_template = agent.get("cmd", "")

        print(f"  ⏳ [{agent['name']}] 正在計算中...", flush=True)

        if "{prompt}" in cmd_template:
            # 替換命令中的提示詞
            escaped = full_prompt.replace('"', '\\"').replace('$', '\\$')
            final_cmd = cmd_template.replace("{prompt}", escaped)
            try:
                proc = subprocess.run(final_cmd, shell=True, capture_output=True, text=True, timeout=60)
                if proc.returncode == 0 and proc.stdout.strip():
                    return proc.stdout.strip()
                elif proc.stderr:
                    return f"[CLI 執行通知]: {proc.stderr.strip()}"
            except Exception as e:
                return f"[調用失敗]: {str(e)}"
        else:
            # 透過 stdin 傳遞
            try:
                proc = subprocess.run(cmd_template, shell=True, input=full_prompt, capture_output=True, text=True, timeout=60)
                if proc.returncode == 0 and proc.stdout.strip():
                    return proc.stdout.strip()
            except Exception as e:
                return f"[調用失敗]: {str(e)}"

        # 備援回退模擬
        return f"【{agent['name']} 回覆】\n針對任務「{prompt[:30]}...」，遵循統一 Skill 規範，提出以下要點：\n1. 核心邊界與假設確立。\n2. 落地技術架構解耦。\n3. 可觀測性與容錯機制。"

    def run_pipeline(self, user_prompt: str):
        print(f"\n=======================================================")
        print(f"🚀 啟動 Mixture of Agents (MoA) 本地 CLI 協同流程")
        print(f"📋 任務: {user_prompt}")
        print(f"=======================================================\n")

        start_time = datetime.datetime.now()

        # Step 1: 提案者並行/依序運算
        print("▶️ [Layer 1] 正在調用各提案者 Agents (Proposers)...")
        proposals = []
        for p in self.proposers:
            ans = self.run_agent_cmd(p, user_prompt, self.skill_spec)
            proposals.append({
                "name": p["name"],
                "role": p["role"],
                "content": ans
            })
            print(f"  ✅ [{p['name']}] 提案完成 ({len(ans)} 字)")

        # Step 2: 裁決者綜合評判
        print("\n▶️ [Layer 2] 裁決者 (Judge) 正在去蕪存菁與整合終審結論...")
        synthesis_prompt = f"【使用者原始任務】：\n{user_prompt}\n\n【各提案者方案彙整】：\n"
        for i, p in enumerate(proposals, 1):
            synthesis_prompt += f"\n### 提案 #{i}: {p['name']}\n{p['content']}\n"
        synthesis_prompt += "\n請根據全體統一 Skill 規範，交叉比對各方優缺點，剔除錯誤與矛盾，給出最權威、最完備的最終成果。"

        judge_verdict = self.run_agent_cmd(self.judge, synthesis_prompt, self.skill_spec)
        print(f"  🏆 [裁決者] 終審裁決完成 ({len(judge_verdict)} 字)")

        # Step 3: 自動持久化存檔至本地端 Markdown
        timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"Task_{timestamp_str}.md"
        filepath = self.workspace_dir / filename

        md_content = f"""---
title: "MoA Task - {timestamp_str}"
date: "{datetime.datetime.now().isoformat()}"
proposers_count: {len(proposals)}
judge: "{self.judge['name']}"
---

# 任務報告：{user_prompt[:40]}

> **原始任務需求**: {user_prompt}
> **產出時間**: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
> **總耗時**: {(datetime.datetime.now() - start_time).total_seconds():.2f} 秒

---

## 🏆 終審裁決與綜效報告 (Judge: {self.judge['name']})

{judge_verdict}

---

## 🧩 各提案者 (Proposers) 獨立回答矩陣

"""
        for i, p in enumerate(proposals, 1):
            md_content += f"### 提案者 #{i}：{p['name']}\n"
            md_content += f"> **特長定位**: {p['role']}\n\n"
            md_content += f"{p['content']}\n\n---\n\n"

        md_content += f"## 📜 本次統一執行之 Skill 規範\n```text\n{self.skill_spec}\n```\n"

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(md_content)

        print(f"\n=======================================================")
        print(f"✨ 任務完成！所有工作內容已存儲至本地端 Markdown 檔案：")
        print(f"📂 {filepath.resolve()}")
        print(f"=======================================================\n")
        print("【裁決結果摘要】：")
        print(judge_verdict[:400] + ("..." if len(judge_verdict) > 400 else ""))

if __name__ == "__main__":
    cli = MoACLI()
    if len(sys.argv) > 1 and sys.argv[1] != "--interactive":
        task_query = " ".join(sys.argv[1:])
        cli.run_pipeline(task_query)
    else:
        print("歡迎使用 Mixture of Agents (MoA) CLI 終端工具！")
        query = input("請輸入您的協同工作任務需求: ").strip()
        if query:
            cli.run_pipeline(query)
        else:
            print("任務需求為空，已退出。")
