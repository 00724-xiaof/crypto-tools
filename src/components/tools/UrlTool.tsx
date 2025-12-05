import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { url } from '@/lib/crypto'
import { copyToClipboard } from '@/lib/utils'
import { Copy, Check, Link, Trash2, ArrowDownUp } from 'lucide-react'

export function UrlTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleEncode = () => {
    try {
      setError('')
      setOutput(url.encode(input))
    } catch (e) {
      setError('编码失败')
    }
  }

  const handleDecode = () => {
    try {
      setError('')
      setOutput(url.decode(input))
    } catch (e) {
      setError('解码失败，请检查输入是否为有效的URL编码字符串')
    }
  }

  const handleCopy = async () => {
    await copyToClipboard(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSwap = () => {
    setInput(output)
    setOutput('')
    setError('')
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center">
          <Link className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">URL 编码/解码</h2>
          <p className="text-sm text-muted-foreground">对URL中的特殊字符进行编码或解码</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">输入</label>
          <span className="text-xs text-muted-foreground">{input.length} 字符</span>
        </div>
        <Textarea
          placeholder="请输入需要编码或解码的URL/文本..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[120px] font-mono text-sm"
        />
        <div className="flex justify-end gap-2 mt-2">
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="w-4 h-4 mr-1" />
            清空
          </Button>
          <Button variant="outline" size="sm" onClick={handleSwap}>
            <ArrowDownUp className="w-4 h-4 mr-1" />
            交换
          </Button>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button onClick={handleEncode} className="px-8">编码</Button>
        <Button onClick={handleDecode} variant="secondary" className="px-8">解码</Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm">{error}</div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">输出</label>
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output} className={copied ? 'text-green-500' : ''}>
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? '已复制' : '复制'}
          </Button>
        </div>
        <Textarea readOnly value={output} placeholder="结果将显示在这里..." className="min-h-[120px] font-mono text-sm bg-muted/50" />
        {output && <div className="mt-2 text-xs text-green-500">✅ 转换成功</div>}
      </div>

      <div className="text-xs text-muted-foreground border-t pt-3">
        💡 URL编码将特殊字符转换为%XX格式，用于URL传参。
      </div>
    </div>
  )
}
