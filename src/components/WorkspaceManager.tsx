import React, { useState } from 'react';
import { WorkspaceFile } from '../types/moa';
import { MarkdownRenderer } from './MarkdownRenderer';
import {
  Folder,
  FileText,
  Download,
  Trash2,
  Eye,
  RefreshCw,
  Search,
  Clock,
  HardDrive,
  Copy,
  Check,
  X,
} from 'lucide-react';

interface WorkspaceManagerProps {
  files: WorkspaceFile[];
  onRefresh: () => void;
  onDeleteFile: (filename: string) => void;
  onGetFileContent: (filename: string) => Promise<string>;
}

export const WorkspaceManager: React.FC<WorkspaceManagerProps> = ({
  files,
  onRefresh,
  onDeleteFile,
  onGetFileContent,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [previewFile, setPreviewFile] = useState<{ filename: string; content: string } | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [copied, setCopied] = useState(false);

  const filteredFiles = files.filter(
    (f) =>
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePreview = async (filename: string) => {
    try {
      setLoadingPreview(true);
      const content = await onGetFileContent(filename);
      setPreviewFile({ filename, content });
    } catch (e: any) {
      alert(`讀取檔案失敗: ${e.message}`);
    } finally {
      setLoadingPreview(false);
    }
  };

  const handleDownload = async (filename: string) => {
    try {
      const content = await onGetFileContent(filename);
      const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`下載失敗: ${e.message}`);
    }
  };

  const handleCopyPreview = () => {
    if (!previewFile) return;
    navigator.clipboard.writeText(previewFile.content);
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
              <Folder className="w-4 h-4 text-sky-500" />
              <span>本地端 Markdown 檔案庫 (Local Workspace)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              每次 MoA 任務執行完畢，系統皆會自動將包含任務提示、各代理人提案與裁決者終稿完整持久化為 Markdown 檔案。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/api/project/download-zip"
              download="moa-studio-complete.zip"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 hover:text-sky-900 dark:hover:text-white border border-sky-200 dark:border-sky-800 rounded-md transition-colors cursor-pointer"
              title="下載包含前後端程式碼、啟動腳本與工作區的完整 ZIP 壓縮檔"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載完整專案源碼 (.ZIP)</span>
            </a>

            <button
              type="button"
              onClick={onRefresh}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-md transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>重新整理</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋本地檔案名稱或主題..."
            className="w-full text-xs pl-8 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="text-xs text-slate-500 font-mono tabular-nums">
          共 {filteredFiles.length} 份本地 MD 記錄
        </div>
      </div>

      {/* File List Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {filteredFiles.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <FileText className="w-8 h-8 mx-auto stroke-1" />
            <p className="text-sm">尚無相關 Markdown 檔案記錄</p>
            <p className="text-xs text-slate-500">在「任務協同」啟動 MoA 工作後，檔案將自動存檔於此。</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                  <th className="py-2.5 px-4">任務標題 / 檔案名稱</th>
                  <th className="py-2.5 px-4 hidden sm:table-cell">大小</th>
                  <th className="py-2.5 px-4 hidden md:table-cell">存檔時間</th>
                  <th className="py-2.5 px-4 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredFiles.map((file) => (
                  <tr
                    key={file.filename}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-sky-500 shrink-0" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white truncate max-w-xs md:max-w-md">
                            {file.title}
                          </div>
                          <div className="text-[11px] font-mono text-slate-400 truncate max-w-xs">
                            {file.filename}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell font-mono text-slate-500 tabular-nums">
                      {(file.size / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell text-slate-500 font-mono text-[11px] tabular-nums">
                      {new Date(file.updatedAt).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePreview(file.filename)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="預覽 Markdown 內容"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownload(file.filename)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="下載至本機硬碟 (.md)"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`確定要刪除本地檔案 ${file.filename} 嗎？`)) {
                              onDeleteFile(file.filename);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors cursor-pointer"
                          title="刪除檔案"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-sky-500" />
                <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-md">
                  {previewFile.filename}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPreview}
                  className="px-2.5 py-1 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-1"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-500">已複製</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>複製</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownload(previewFile.filename)}
                  className="px-2.5 py-1 text-xs font-medium bg-sky-600 hover:bg-sky-500 text-white rounded transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  <span>下載</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <MarkdownRenderer content={previewFile.content} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
