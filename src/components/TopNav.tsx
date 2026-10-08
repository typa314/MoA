import React from 'react';
import { Key, Plus } from 'lucide-react';

export type ActiveTab = 'console' | 'topology' | 'skills' | 'workspace';

interface TopNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenKeyModal: () => void;
  onNewTask: () => void;
  hasGeminiKey: boolean;
  workspaceFileCount: number;
}

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onOpenKeyModal,
  onNewTask,
  hasGeminiKey,
  workspaceFileCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onTabChange('console');
            }}
            className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <span className="w-6 h-6 rounded-md bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white text-xs font-mono shadow-sm">
              M
            </span>
            <span>MoA Studio</span>
          </a>
          <span className="hidden sm:inline text-xs text-slate-400 font-normal">
            Mixture of Agents
          </span>
        </div>

        {/* Zone 2: Clean 4-link navigation controls */}
        <nav className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => onTabChange('console')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'console'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            任務協同
          </button>
          <button
            type="button"
            onClick={() => onTabChange('topology')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'topology'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            架構拓撲
          </button>
          <button
            type="button"
            onClick={() => onTabChange('skills')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === 'skills'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Skill 規範
          </button>
          <button
            type="button"
            onClick={() => onTabChange('workspace')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'workspace'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>本地 MD 庫</span>
            {workspaceFileCount > 0 && (
              <span className="text-[10px] tabular-nums font-mono px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {workspaceFileCount}
              </span>
            )}
          </button>
        </nav>

        {/* Zone 3: Primary utility actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenKeyModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-md transition-colors cursor-pointer whitespace-nowrap"
            title="設置與檢查 API Key"
          >
            <Key className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">金鑰管理</span>
            {hasGeminiKey ? (
              <span className="w-2 h-2 rounded-full bg-emerald-500" title="服務就緒" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-500" title="自訂金鑰模式" />
            )}
          </button>

          <button
            type="button"
            onClick={onNewTask}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 rounded-md transition-colors cursor-pointer whitespace-nowrap shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新任務</span>
          </button>
        </div>
      </div>
    </header>
  );
};
