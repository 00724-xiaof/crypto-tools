import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { des, tripleDes } from '@/lib/crypto'
import { copyToClipboard } from '@/lib/utils'
import { Copy, Check, Key, Trash2 } from 'lucide-react'

type DesType = 'des' | '3des'

export function DesTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [key, setKey] = useState('')
  const [iv, setIv] = useState('')
  const [desType, setDesType] = useState<DesType>('des')
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleEncrypt = () => {
    try {
      setError('')
      if (!key) {
        setError('请输入密钥')
        return
      }
      const crypto = desType === 'des' ? des : tripleDes
      const result = crypto.encrypt(input, key, iv || undefined)
      setOutput(result)
    } catch (e) {
      setError('加密失败: ' + (e as Error).message)
    }
  }

  const handleDecrypt = () => {
    try {
      setError('')
      if (!key) {
        setError('请输入密钥')
        return
      }
      const crypto = desType === 'des' ? des : tripleDes
      const result = crypto.decrypt(input, key, iv || undefined)
      setOutput(result)
    } catch (e) {
      setError('解密失败: 密钥或IV可能不正确')
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
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
          <Key className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">DES / 3DES 加密/解密</h2>
          <p className="text-sm text-muted-foreground">数据加密标准算法</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">⚙️ 配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">算法</label>
              <Select value={desType} onValueChange={(v) => setDesType(v as DesType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="des">DES</SelectItem>
                  <SelectItem value="3des">3DES (Triple DES)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                密钥 ({desType === 'des' ? '8字节' : '24字节'})
              </label>
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="输入密钥..."
                className="font-mono"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">IV向量 (8字节, 可选)</label>
              <Input
                value={iv}
                onChange={(e) => setIv(e.target.value)}
                placeholder="输入IV..."
                className="font-mono"
              />
            </div>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 text-xs text-yellow-400">
            ⚠️ DES 已被认为不安全，仅建议用于兼容旧系统。新项目请使用 AES。
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">📝 输入</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="请输入需要加密或解密的内容..."
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

      <div className="flex justify-center gap-3">
        <Button onClick={handleEncrypt} className="px-6">
          🔒 加密
        </Button>
        <Button onClick={handleDecrypt} variant="secondary" className="px-6">
          🔓 解密
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
            className="min-h-[120px] font-mono text-sm bg-muted/50 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {output && <div className="mt-2 text-xs text-green-500">✅ 操作成功</div>}
        </CardContent>
      </Card>
    </div>
  )
}
