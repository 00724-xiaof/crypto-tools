import { useState } from 'react'
import { Copy, ArrowRightLeft } from 'lucide-react'

export function HtmlEntityTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const htmlEncode = (text: string): string => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
      '/': '&#x2F;',
      '`': '&#x60;',
      '=': '&#x3D;'
    }
    return text.replace(/[&<>"'`=/]/g, char => entities[char] || char)
  }

  const htmlDecode = (text: string): string => {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    return textarea.value
  }

  const handleConvert = () => {
    try {
      if (mode === 'encode') {
        setOutput(htmlEncode(input))
      } else {
        setOutput(htmlDecode(input))
      }
    } catch (error) {
      setOutput('转换错误')
    }
  }

  const handleSwap = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode')
    setInput(output)
    setOutput(input)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">HTML实体编码</h1>
        <p className="text-muted-foreground mt-1">HTML特殊字符的编码与解码</p>
      </div>

      <div className="flex items-center gap-4">
        <span className={mode === 'encode' ? 'font-medium' : 'text-muted-foreground'}>
          编码
        </span>
        <button
          onClick={handleSwap}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          title="切换方向"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>
        <span className={mode === 'decode' ? 'font-medium' : 'text-muted-foreground'}>
          解码
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {mode === 'encode' ? '输入文本' : '输入HTML实体'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? '请输入要编码的文本...' : '请输入HTML实体 (如: &lt;div&gt;)'}
          className="w-full h-32 p-3 rounded-md border bg-background resize-none font-mono text-sm"
        />
      </div>

      <button
        onClick={handleConvert}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        {mode === 'encode' ? '编码' : '解码'}
      </button>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">结果</label>
          <button
            onClick={copyToClipboard}
            className="p-1.5 rounded hover:bg-accent transition-colors"
            title="复制结果"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <textarea
          value={output}
          readOnly
          className="w-full h-32 p-3 rounded-md border bg-muted/50 resize-none font-mono text-sm"
        />
      </div>

      <div className="p-4 bg-secondary/50 rounded-lg">
        <h3 className="font-medium mb-2">常见HTML实体</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm font-mono">
          <div>&amp;lt; → &lt;</div>
          <div>&amp;gt; → &gt;</div>
          <div>&amp;amp; → &</div>
          <div>&amp;quot; → "</div>
          <div>&amp;nbsp; → 空格</div>
          <div>&amp;copy; → ©</div>
          <div>&amp;reg; → ®</div>
          <div>&amp;trade; → ™</div>
        </div>
      </div>
    </div>
  )
}
