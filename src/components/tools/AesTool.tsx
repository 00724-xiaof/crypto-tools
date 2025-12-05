import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { aes } from '@/lib/crypto'
import { copyToClipboard } from '@/lib/utils'
import { Copy, Check, Lock, Trash2, Shuffle, Eye, EyeOff } from 'lucide-react'

type AESMode = 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR'
type AESPadding = 'Pkcs7' | 'ZeroPadding' | 'NoPadding'
type KeyFormat = 'text' | 'hex' | 'base64'
type OutputFormat = 'base64' | 'hex'

export function AesTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [key, setKey] = useState('')
  const [iv, setIv] = useState('')
  const [mode, setMode] = useState<AESMode>('CBC')
  const [padding, setPadding] = useState<AESPadding>('Pkcs7')
  const [keyFormat, setKeyFormat] = useState<KeyFormat>('hex')
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('base64')
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied] = useState(false)
  const [keyCopied, setKeyCopied] = useState(false)
  const [error, setError] = useState('')

  const needsIV = mode !== 'ECB'

  const handleEncrypt = () => {
    try {
      setError('')
      if (!key) {
        setError('请输入密钥')
        return
      }
      if (needsIV && !iv) {
        setError(`${mode}模式需要IV向量`)
        return
      }
      const result = aes.encrypt(input, {
        mode,
        padding,
        key,
        iv: needsIV ? iv : undefined,
        keyFormat,
        outputFormat
      })
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
      if (needsIV && !iv) {
        setError(`${mode}模式需要IV向量`)
        return
      }
      const result = aes.decrypt(input, {
        mode,
        padding,
        key,
        iv: needsIV ? iv : undefined,
        keyFormat,
        outputFormat
      })
      setOutput(result)
    } catch (e) {
      setError('解密失败: 密钥或IV可能不正确')
    }
  }

  const handleGenerateKey = () => {
    const newKey = aes.generateKey(256)
    setKey(newKey)
    setKeyFormat('hex')
  }

  const handleGenerateIV = () => {
    const newIV = aes.generateIV()
    setIv(newIV)
  }

  const handleCopy = async () => {
    await copyToClipboard(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCopyKey = async () => {
    await copyToClipboard(key)
    setKeyCopied(true)
    setTimeout(() => setKeyCopied(false), 2000)
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
          <Lock className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">AES 加密/解密</h2>
          <p className="text-sm text-muted-foreground">高级加密标准，支持多种模式和填充方式</p>
        </div>
      </div>

      {/* 配置区 */}
      <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
        <label className="text-sm font-medium">加密配置</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">模式</label>
              <Select value={mode} onValueChange={(v) => setMode(v as AESMode)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CBC">CBC</SelectItem>
                  <SelectItem value="ECB">ECB</SelectItem>
                  <SelectItem value="CFB">CFB</SelectItem>
                  <SelectItem value="OFB">OFB</SelectItem>
                  <SelectItem value="CTR">CTR</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">填充</label>
              <Select value={padding} onValueChange={(v) => setPadding(v as AESPadding)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Pkcs7">PKCS7</SelectItem>
                  <SelectItem value="ZeroPadding">ZeroPadding</SelectItem>
                  <SelectItem value="NoPadding">NoPadding</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">密钥格式</label>
              <Select value={keyFormat} onValueChange={(v) => setKeyFormat(v as KeyFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">文本</SelectItem>
                  <SelectItem value="hex">Hex</SelectItem>
                  <SelectItem value="base64">Base64</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">输出格式</label>
              <Select value={outputFormat} onValueChange={(v) => setOutputFormat(v as OutputFormat)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="base64">Base64</SelectItem>
                  <SelectItem value="hex">Hex</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">密钥 (Key)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type={showKey ? 'text' : 'password'}
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="输入或生成密钥..."
                  className="pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <Button variant="outline" size="icon" onClick={handleGenerateKey} title="随机生成">
                <Shuffle className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleCopyKey} title="复制密钥">
                {keyCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {needsIV && (
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">
                IV向量 <span className="text-yellow-500">(16字节)</span>
              </label>
              <div className="flex gap-2">
                <Input
                  value={iv}
                  onChange={(e) => setIv(e.target.value)}
                  placeholder="输入或生成IV..."
                  className="font-mono"
                />
                <Button variant="outline" size="icon" onClick={handleGenerateIV} title="随机生成">
                  <Shuffle className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

        {mode === 'ECB' && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-2 text-xs text-yellow-400">
            ⚠️ ECB模式存在安全风险
          </div>
        )}
      </div>

      {/* 输入区 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">输入</label>
        </div>
        <Textarea placeholder="请输入需要加密或解密的内容..." value={input} onChange={(e) => setInput(e.target.value)} className="min-h-[100px] font-mono text-sm" />
        <div className="flex justify-end mt-2">
          <Button variant="outline" size="sm" onClick={handleClear}><Trash2 className="w-4 h-4 mr-1" />清空</Button>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        <Button onClick={handleEncrypt} className="px-8">加密</Button>
        <Button onClick={handleDecrypt} variant="secondary" className="px-8">解密</Button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-500 text-sm">{error}</div>}

      {/* 输出区 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium">输出</label>
          <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output} className={copied ? 'text-green-500' : ''}>
            {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? '已复制' : '复制'}
          </Button>
        </div>
        <Textarea readOnly value={output} placeholder="结果将显示在这里..." className="min-h-[100px] font-mono text-sm bg-muted/50" />
        {output && <div className="mt-2 text-xs text-green-500">✅ 操作成功</div>}
      </div>

      <div className="text-xs text-muted-foreground border-t pt-3">
        💡 AES-256使用32字节Hex密钥，CBC等模式需要16字节IV。
      </div>
    </div>
  )
}
