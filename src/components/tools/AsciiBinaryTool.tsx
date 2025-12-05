import { useState } from 'react'
import { Copy, ArrowRightLeft } from 'lucide-react'

export function AsciiBinaryTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'toBinary' | 'toAscii'>('toBinary')

  const textToBinary = (text: string): string => {
    return text.split('').map(char => {
      return char.charCodeAt(0).toString(2).padStart(8, '0')
    }).join(' ')
  }

  const binaryToText = (binary: string): string => {
    const bytes = binary.replace(/[^01]/g, '').match(/.{1,8}/g)
    if (!bytes) return ''
    return bytes.map(byte => {
      return String.fromCharCode(parseInt(byte, 2))
    }).join('')
  }

  const handleConvert = () => {
    try {
      if (mode === 'toBinary') {
        setOutput(textToBinary(input))
      } else {
        setOutput(binaryToText(input))
      }
    } catch (error) {
      setOutput('转换错误')
    }
  }

  const handleSwap = () => {
    setMode(mode === 'toBinary' ? 'toAscii' : 'toBinary')
    setInput(output)
    setOutput(input)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ASCII/Binary 转换</h1>
        <p className="text-muted-foreground mt-1">ASCII文本与二进制互相转换</p>
      </div>

      <div className="flex items-center gap-4">
        <span className={mode === 'toBinary' ? 'font-medium' : 'text-muted-foreground'}>
          ASCII → Binary
        </span>
        <button
          onClick={handleSwap}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          title="切换方向"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>
        <span className={mode === 'toAscii' ? 'font-medium' : 'text-muted-foreground'}>
          Binary → ASCII
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {mode === 'toBinary' ? '输入文本' : '输入二进制'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'toBinary' ? '请输入ASCII文本...' : '请输入二进制数据 (如: 01001000 01101001)'}
          className="w-full h-32 p-3 rounded-md border bg-background resize-none font-mono text-sm"
        />
      </div>

      <button
        onClick={handleConvert}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        转换
      </button>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            {mode === 'toBinary' ? '二进制结果' : 'ASCII结果'}
          </label>
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
    </div>
  )
}
