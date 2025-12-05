import { useState } from 'react'
import { Copy, ArrowDownUp } from 'lucide-react'

type EscapeType = 'json' | 'html' | 'url' | 'unicode' | 'backslash'

const ESCAPE_TYPES: { id: EscapeType; name: string; desc: string }[] = [
  { id: 'json', name: 'JSON 字符串', desc: '转义 JSON 字符串中的特殊字符' },
  { id: 'html', name: 'HTML 实体', desc: '转义 HTML 特殊字符' },
  { id: 'url', name: 'URL 编码', desc: 'URL 百分号编码' },
  { id: 'unicode', name: 'Unicode', desc: '转换为 \\uXXXX 格式' },
  { id: 'backslash', name: '反斜杠', desc: '转义反斜杠和特殊字符' },
]

function escapeJson(str: string): string {
  return JSON.stringify(str).slice(1, -1)
}

function unescapeJson(str: string): string {
  try {
    return JSON.parse(`"${str}"`)
  } catch {
    return str
  }
}

function escapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }
  return str.replace(/[&<>"']/g, c => map[c])
}

function unescapeHtml(str: string): string {
  const map: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&nbsp;': ' ',
  }
  return str.replace(/&(?:amp|lt|gt|quot|#39|nbsp);/g, m => map[m] || m)
}

function escapeUrl(str: string): string {
  return encodeURIComponent(str)
}

function unescapeUrl(str: string): string {
  try {
    return decodeURIComponent(str)
  } catch {
    return str
  }
}

function escapeUnicode(str: string): string {
  return str.split('').map(c => {
    const code = c.charCodeAt(0)
    if (code > 127) {
      return '\\u' + code.toString(16).padStart(4, '0')
    }
    return c
  }).join('')
}

function unescapeUnicode(str: string): string {
  return str.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => 
    String.fromCharCode(parseInt(hex, 16))
  )
}

function escapeBackslash(str: string): string {
  return str
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}

function unescapeBackslash(str: string): string {
  return str
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
    .replace(/\\\\/g, '\\')
}

export function EscapeTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [escapeType, setEscapeType] = useState<EscapeType>('json')
  const [mode, setMode] = useState<'escape' | 'unescape'>('escape')

  const handleConvert = () => {
    let result = ''
    
    if (mode === 'escape') {
      switch (escapeType) {
        case 'json': result = escapeJson(input); break
        case 'html': result = escapeHtml(input); break
        case 'url': result = escapeUrl(input); break
        case 'unicode': result = escapeUnicode(input); break
        case 'backslash': result = escapeBackslash(input); break
      }
    } else {
      switch (escapeType) {
        case 'json': result = unescapeJson(input); break
        case 'html': result = unescapeHtml(input); break
        case 'url': result = unescapeUrl(input); break
        case 'unicode': result = unescapeUnicode(input); break
        case 'backslash': result = unescapeBackslash(input); break
      }
    }
    
    setOutput(result)
  }

  const handleSwap = () => {
    setMode(mode === 'escape' ? 'unescape' : 'escape')
    setInput(output)
    setOutput('')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">转义/反转义工具</h2>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${mode === 'escape' ? 'text-primary' : 'text-muted-foreground'}`}>转义</span>
          <button
            onClick={handleSwap}
            className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
          <span className={`text-sm ${mode === 'unescape' ? 'text-primary' : 'text-muted-foreground'}`}>反转义</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {ESCAPE_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => setEscapeType(type.id)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              escapeType === type.id
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-accent'
            }`}
            title={type.desc}
          >
            {type.name}
          </button>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">
        {ESCAPE_TYPES.find(t => t.id === escapeType)?.desc}
      </p>

      <div className="space-y-2">
        <label className="text-sm font-medium">输入</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入要转换的文本..."
          className="w-full h-32 p-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
        />
      </div>

      <button
        onClick={handleConvert}
        className="w-full py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
      >
        {mode === 'escape' ? '转义' : '反转义'}
      </button>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">输出</label>
          {output && (
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="w-4 h-4" />
              复制
            </button>
          )}
        </div>
        <textarea
          value={output}
          readOnly
          placeholder="结果..."
          className="w-full h-32 p-3 rounded-lg bg-muted border border-border focus:outline-none resize-none font-mono text-sm"
        />
      </div>
    </div>
  )
}
