import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { base64 } from '@/lib/crypto'
import { copyToClipboard } from '@/lib/utils'
import { Copy, Check, FileCode, Trash2, ArrowDownUp } from 'lucide-react'

export function Base64Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleEncode = () => {
    try {
      setError('')
      const result = base64.encode(input)
      setOutput(result)
    } catch (e) {
      setError('编码失败，请检查输入内容')
    }
  }

  const handleDecode = () => {
    try {
      setError('')
      const result = base64.decode(input)
      setOutput(result)
    } catch (e) {
      setError('解码失败，请确保输入有效的Base64字符串')
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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
          <FileCode className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">Base64 编码/解码</h2>
          <p className="text-sm text-muted-foreground">将文本转换为Base64格式或解码Base64字符串</p>
        </div>
      </div>

      {/* 输入区 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">输入</label>
          <span className="text-xs text-muted-foreground">{input.length} 字符</span>
        </div>
        <Textarea
          placeholder="请输入需要编码或解码的内容..."
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

      {/* 操作按钮 */}
      <div className="flex justify-center gap-3">
        <Button onClick={handleEncode} className="px-8">
          编码
        </Button>
        <Button onClick={handleDecode} variant="secondary" className="px-8">
          解码
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* 输出区 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">输出</label>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            disabled={!output}
            className={copied ? 'text-green-500' : ''}
          >
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? '已复制' : '复制'}
          </Button>
        </div>
        <Textarea
          readOnly
          value={output}
          placeholder="结果将显示在这里..."
          className="min-h-[120px] font-mono text-sm bg-muted/50"
        />
        {output && <div className="mt-2 text-xs text-green-500">✅ 转换成功</div>}
      </div>

      <div className="text-xs text-muted-foreground border-t pt-3">
        💡 Base64是一种用64个字符表示任意二进制数据的方法，常用于URL、Cookie传输。
      </div>
    </div>
  )
}
