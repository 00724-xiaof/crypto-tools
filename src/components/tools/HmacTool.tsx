import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { hash } from '@/lib/crypto'
import { copyToClipboard } from '@/lib/utils'
import { Copy, Check, Hash, Trash2 } from 'lucide-react'

type HmacAlgorithm = 'md5' | 'sha256' | 'sha512'

export function HmacTool() {
  const [input, setInput] = useState('')
  const [key, setKey] = useState('')
  const [algorithm, setAlgorithm] = useState<HmacAlgorithm>('sha256')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleCompute = () => {
    try {
      setError('')
      if (!key) {
        setError('请输入密钥')
        return
      }
      let result = ''
      switch (algorithm) {
        case 'md5':
          result = hash.hmacMd5(input, key)
          break
        case 'sha256':
          result = hash.hmacSha256(input, key)
          break
        case 'sha512':
          result = hash.hmacSha512(input, key)
          break
      }
      setOutput(result)
    } catch (e) {
      setError('计算失败')
    }
  }

  const handleCopy = async () => {
    await copyToClipboard(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleClear = () => {
    setInput('')
    setKey('')
    setOutput('')
    setError('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <Hash className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">HMAC 计算</h2>
          <p className="text-sm text-muted-foreground">带密钥的哈希消息认证码</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">⚙️ 配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">算法</label>
              <Select value={algorithm} onValueChange={(v) => setAlgorithm(v as HmacAlgorithm)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="md5">HMAC-MD5</SelectItem>
                  <SelectItem value="sha256">HMAC-SHA256</SelectItem>
                  <SelectItem value="sha512">HMAC-SHA512</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">密钥 (Key)</label>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="输入密钥..."
                className="font-mono"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📝 输入</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="请输入需要计算HMAC的文本..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[120px] font-mono text-sm border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <div className="flex justify-end mt-2">
            <Button variant="outline" size="sm" onClick={handleClear}>
              <Trash2 className="w-4 h-4 mr-1" />
              清空
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button onClick={handleCompute} className="px-8">
          #️⃣ 计算 HMAC
        </Button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm">
          ❌ {error}
        </div>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">📤 输出</CardTitle>
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
        </CardHeader>
        <CardContent>
          <Textarea
            readOnly
            value={output}
            placeholder="结果将显示在这里..."
            className="min-h-[80px] font-mono text-sm bg-muted/50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {output && <div className="mt-2 text-xs text-green-500">✅ 计算完成</div>}
        </CardContent>
      </Card>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm">
        <p className="text-blue-400 font-medium mb-1">💡 提示</p>
        <p className="text-muted-foreground">
          HMAC (Hash-based Message Authentication Code) 是一种基于哈希函数和密钥的消息认证码，常用于API签名验证。
        </p>
      </div>
    </div>
  )
}
