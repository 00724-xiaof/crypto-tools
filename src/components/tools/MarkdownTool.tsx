import { useState, useMemo } from 'react'
import { Copy, Eye, Code } from 'lucide-react'

// Simple markdown parser
const parseMarkdown = (md: string): string => {
  let html = md
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headers
    .replace(/^###### (.*$)/gm, '<h6 class="text-sm font-semibold mt-4 mb-2">$1</h6>')
    .replace(/^##### (.*$)/gm, '<h5 class="text-base font-semibold mt-4 mb-2">$1</h5>')
    .replace(/^#### (.*$)/gm, '<h4 class="text-lg font-semibold mt-4 mb-2">$1</h4>')
    .replace(/^### (.*$)/gm, '<h3 class="text-xl font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    // Strikethrough
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 bg-muted rounded text-sm font-mono">$1</code>')
    // Code blocks
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="p-4 bg-muted rounded-lg overflow-x-auto my-4"><code class="text-sm font-mono">$2</code></pre>')
    // Blockquote
    .replace(/^&gt; (.*$)/gm, '<blockquote class="border-l-4 border-primary pl-4 my-4 italic text-muted-foreground">$1</blockquote>')
    // Unordered list
    .replace(/^\* (.*$)/gm, '<li class="ml-4">• $1</li>')
    .replace(/^- (.*$)/gm, '<li class="ml-4">• $1</li>')
    // Ordered list
    .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline hover:no-underline" target="_blank" rel="noopener">$1</a>')
    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="max-w-full rounded my-4" />')
    // Horizontal rule
    .replace(/^---$/gm, '<hr class="my-6 border-t border-border" />')
    .replace(/^\*\*\*$/gm, '<hr class="my-6 border-t border-border" />')
    // Line breaks
    .replace(/\n\n/g, '</p><p class="my-2">')
    .replace(/\n/g, '<br />')
  
  return `<div class="prose dark:prose-invert max-w-none"><p class="my-2">${html}</p></div>`
}

export function MarkdownTool() {
  const [markdown, setMarkdown] = useState(`# Markdown 预览

这是一个 **Markdown** 预览工具。

## 功能特性

- 支持 *斜体* 和 **粗体**
- 支持 \`行内代码\`
- 支持 [链接](https://example.com)
- 支持列表

### 代码块

\`\`\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\`\`\`

> 这是一段引用文字

---

1. 第一项
2. 第二项
3. 第三项
`)
  const [viewMode, setViewMode] = useState<'split' | 'preview' | 'edit'>('split')

  const html = useMemo(() => parseMarkdown(markdown), [markdown])

  const copyHtml = () => {
    navigator.clipboard.writeText(html)
  }

  const copyMarkdown = () => {
    navigator.clipboard.writeText(markdown)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Markdown 预览</h1>
        <p className="text-muted-foreground mt-1">实时 Markdown 编辑和预览</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode('edit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
            viewMode === 'edit' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
          }`}
        >
          <Code className="w-4 h-4" />
          编辑
        </button>
        <button
          onClick={() => setViewMode('split')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
            viewMode === 'split' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
          }`}
        >
          分栏
        </button>
        <button
          onClick={() => setViewMode('preview')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
            viewMode === 'preview' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
          }`}
        >
          <Eye className="w-4 h-4" />
          预览
        </button>
        <div className="flex-1" />
        <button
          onClick={copyMarkdown}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-secondary hover:bg-secondary/80"
        >
          <Copy className="w-4 h-4" />
          复制MD
        </button>
        <button
          onClick={copyHtml}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm bg-secondary hover:bg-secondary/80"
        >
          <Copy className="w-4 h-4" />
          复制HTML
        </button>
      </div>

      <div className={`grid gap-4 ${viewMode === 'split' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className="space-y-2">
            {viewMode === 'split' && <label className="text-sm font-medium">Markdown</label>}
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              placeholder="输入 Markdown 内容..."
              className="w-full h-[500px] p-4 rounded-md border bg-background resize-none font-mono text-sm"
            />
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className="space-y-2">
            {viewMode === 'split' && <label className="text-sm font-medium">预览</label>}
            <div 
              className="w-full h-[500px] p-4 rounded-md border bg-background overflow-y-auto"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>

      <div className="p-4 bg-secondary/50 rounded-lg">
        <h3 className="font-medium mb-2">Markdown 语法参考</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm font-mono">
          <div><strong># H1</strong> 一级标题</div>
          <div><strong>**粗体**</strong> 粗体</div>
          <div><strong>*斜体*</strong> 斜体</div>
          <div><strong>`代码`</strong> 行内代码</div>
          <div><strong>[文字](url)</strong> 链接</div>
          <div><strong>- 项目</strong> 列表</div>
          <div><strong>&gt; 引用</strong> 引用</div>
          <div><strong>---</strong> 分隔线</div>
        </div>
      </div>
    </div>
  )
}
