import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (!content) {
    return <div className="text-slate-400 italic">（無內容）</div>;
  }

  // Parse markdown into sections/blocks
  const lines = content.split('\n');
  const renderedElements: React.ReactNode[] = [];
  let inCodeBlock = false;
  let codeBuffer: string[] = [];
  let codeLang = '';
  let codeBlockCounter = 0;
  let listBuffer: string[] = [];
  let listKeyCounter = 0;

  const flushList = () => {
    if (listBuffer.length > 0) {
      renderedElements.push(
        <ul key={`list-${listKeyCounter++}`} className="list-disc list-outside pl-5 my-2 space-y-1 text-slate-700 dark:text-slate-300">
          {listBuffer.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ul>
      );
      listBuffer = [];
    }
  };

  const formatInline = (text: string): string => {
    // Escape HTML first
    let escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Bold **text**
    escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900 dark:text-white">$1</strong>');
    // Italic *text*
    escaped = escaped.replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em class="italic">$1</em>');
    // Inline code `code`
    escaped = escaped.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-sky-600 dark:text-sky-400 rounded">$1</code>');
    return escaped;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block toggle
    if (line.trim().startsWith('```')) {
      flushList();
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.trim().slice(3).trim();
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        const currentCode = codeBuffer.join('\n');
        const codeIdx = codeBlockCounter++;
        renderedElements.push(
          <div key={`code-${codeIdx}`} className="my-3 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 text-xs font-mono">
            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 border-b border-slate-800 text-slate-400 text-[11px]">
              <span>{codeLang || 'text'}</span>
              <button
                type="button"
                onClick={() => handleCopyCode(currentCode, codeIdx)}
                className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
              >
                {copiedIndex === codeIdx ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">已複製</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>複製</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-3 overflow-x-auto leading-relaxed">{currentCode}</pre>
          </div>
        );
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // List item
    if (line.match(/^[\*\-]\s+(.*)$/)) {
      const match = line.match(/^[\*\-]\s+(.*)$/);
      if (match) {
        listBuffer.push(match[1]);
        continue;
      }
    } else {
      flushList();
    }

    // Headings
    if (line.startsWith('# ')) {
      renderedElements.push(
        <h1 key={`h1-${i}`} className="text-xl font-bold tracking-tight text-slate-900 dark:text-white mt-5 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1.5">
          {line.slice(2)}
        </h1>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      renderedElements.push(
        <h2 key={`h2-${i}`} className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white mt-4 mb-2">
          {line.slice(3)}
        </h2>
      );
      continue;
    }
    if (line.startsWith('### ')) {
      renderedElements.push(
        <h3 key={`h3-${i}`} className="text-base font-medium text-slate-900 dark:text-white mt-3 mb-1.5">
          {line.slice(4)}
        </h3>
      );
      continue;
    }

    // Divider
    if (line.trim() === '---' || line.trim() === '***') {
      renderedElements.push(<hr key={`hr-${i}`} className="my-4 border-slate-200 dark:border-slate-800" />);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      renderedElements.push(
        <blockquote key={`quote-${i}`} className="border-l-4 border-sky-500 pl-3 my-2 text-slate-600 dark:text-slate-400 italic text-sm">
          <span dangerouslySetInnerHTML={{ __html: formatInline(line.slice(2)) }} />
        </blockquote>
      );
      continue;
    }

    // Empty line
    if (!line.trim()) {
      continue;
    }

    // Standard paragraph
    renderedElements.push(
      <p key={`p-${i}`} className="my-1.5 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <span dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      </p>
    );
  }

  flushList();

  return <div className={`space-y-1 ${className}`}>{renderedElements}</div>;
};
