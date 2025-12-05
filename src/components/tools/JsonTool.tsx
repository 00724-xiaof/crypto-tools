import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { copyToClipboard } from '@/lib/utils'
import { Copy, Check, FileJson, Trash2, Minimize2, Maximize2 } from 'lucide-react'

export function JsonTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleFormat = () => {
    try {
      setError('')
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed, null, 2))
    } catch (e) {
      setError('无效的JSON格式: ' + (e as Error).message)
    }
  }

  const handleMinify = () => {
    try {
      setError('')
      const parsed = JSON.parse(input)
      setOutput(JSON.stringify(parsed))
    } catch (e) {
      setError('无效的JSON格式: ' + (e as Error).message)
    }
  }

  const handleEscape = () => {
    try {
      setError('')
      const escaped = input
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t')
      setOutput(escaped)
    } catch (e) {
      setError('转义失败')
    }
  }

  const handleUnescape = () => {
    try {
      setError('')
      const unescaped = input
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
      setOutput(unescaped)
    } catch (e) {
      setError('反转义失败')
    }
  }

  const handleCopy = async () => {
    await copyToClipboard(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
          <FileJson className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">JSON 格式化</h2>
          <p className="text-sm text-muted-foreground">格式化、压缩、转义JSON数据</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">输入</label>
          <span className="text-xs text-muted-foreground">{input.length} 字符</span>
        </div>
        <Textarea placeholder='{"name": "value"}' value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[150px] font-mono text-sm" />
        <div className="flex justify-end mt-2">
          <Button variant="outline" size="sm" onClick={handleClear}><Trash2 className="w-4 h-4 mr-1" />清空</Button>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button onClick={handleFormat} className="px-4">
          <Maximize2 className="w-4 h-4 mr-1" />
          格式化
        </Button>
        <Button onClick={handleMinify} variant="secondary" className="px-4">
          <Minimize2 className="w-4 h-4 mr-1" />
          压缩
        </Button>
        <Button onClick={handleEscape} variant="outline" className="px-4">
          转义
        </Button>
        <Button onClick={handleUnescape} variant="outline" className="px-4">
          反转义
        </Button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm">{error}</div>}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">输出</label>
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output} className={copied ? 'text-green-500' : ''}>
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? '已复制' : '复制'}
          </Button>
        </div>
        <Textarea readOnly value={output} placeholder="结果将显示在这里..." className="min-h-[150px] font-mono text-sm bg-muted/50" />
        {output && <div className="mt-2 text-xs text-green-500">✅ 处理成功</div>}
      </div>

      <div className="text-xs text-muted-foreground border-t pt-3">
        💡 格式化美化JSON | 压缩移除空白 | 转义/反转义处理特殊字符
      </div>
    </div>
  )
}
