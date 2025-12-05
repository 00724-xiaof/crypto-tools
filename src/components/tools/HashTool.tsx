import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { hash } from '@/lib/crypto'
import { copyToClipboard } from '@/lib/utils'
import { Copy, Check, Fingerprint, Trash2, Upload, Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react'

interface HashResult {
  name: string
  value: string
  security: 'insecure' | 'weak' | 'secure' | 'strong'
  bits: number
}

const HASH_INFO: Record<string, { security: 'insecure' | 'weak' | 'secure' | 'strong'; bits: number; description: string }> = {
  'MD5': { security: 'insecure', bits: 128, description: '已被破解，仅用于校验' },
  'SHA-1': { security: 'weak', bits: 160, description: '存在碰撞攻击，不推荐' },
  'SHA-256': { security: 'secure', bits: 256, description: '推荐使用，安全可靠' },
  'SHA-512': { security: 'strong', bits: 512, description: '高安全性，适合敏感数据' },
  'SHA-3': { security: 'strong', bits: 256, description: '最新标准，抗量子攻击' },
}

export function HashTool() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState<HashResult[]>([])
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [inputType, setInputType] = useState<'text' | 'file'>('text')
  const [fileName, setFileName] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleHash = () => {
    if (!input) return
    
    const hashResults: HashResult[] = [
      { name: 'MD5', value: hash.md5(input), ...HASH_INFO['MD5'] },
      { name: 'SHA-1', value: hash.sha1(input), ...HASH_INFO['SHA-1'] },
      { name: 'SHA-256', value: hash.sha256(input), ...HASH_INFO['SHA-256'] },
      { name: 'SHA-512', value: hash.sha512(input), ...HASH_INFO['SHA-512'] },
      { name: 'SHA-3', value: hash.sha3(input), ...HASH_INFO['SHA-3'] },
    ]
    setResults(hashResults)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setIsProcessing(true)

    try {
      const text = await file.text()
      setInput(text)
      
      // 自动计算哈希
      const hashResults: HashResult[] = [
        { name: 'MD5', value: hash.md5(text), ...HASH_INFO['MD5'] },
        { name: 'SHA-1', value: hash.sha1(text), ...HASH_INFO['SHA-1'] },
        { name: 'SHA-256', value: hash.sha256(text), ...HASH_INFO['SHA-256'] },
        { name: 'SHA-512', value: hash.sha512(text), ...HASH_INFO['SHA-512'] },
        { name: 'SHA-3', value: hash.sha3(text), ...HASH_INFO['SHA-3'] },
      ]
      setResults(hashResults)
    } catch (error) {
      console.error('文件读取失败:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleCopy = async (value: string, index: number) => {
    await copyToClipboard(value)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleCopyAll = async () => {
    const allHashes = results.map(r => `${r.name}: ${r.value}`).join('\n')
    await copyToClipboard(allHashes)
    setCopiedIndex(-1)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleClear = () => {
    setInput('')
    setResults([])
    setFileName('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const getSecurityIcon = (security: string) => {
    switch (security) {
      case 'insecure':
        return <ShieldAlert className="w-4 h-4 text-red-500" />
      case 'weak':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />
      case 'secure':
        return <Shield className="w-4 h-4 text-green-500" />
      case 'strong':
        return <ShieldCheck className="w-4 h-4 text-emerald-500" />
      default:
        return null
    }
  }

  const getSecurityBadge = (security: string) => {
    const styles: Record<string, string> = {
      insecure: 'bg-red-500/10 text-red-500 border-red-500/20',
      weak: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      secure: 'bg-green-500/10 text-green-500 border-green-500/20',
      strong: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    }
    const labels: Record<string, string> = {
      insecure: '不安全',
      weak: '较弱',
      secure: '安全',
      strong: '强',
    }
    return (
      <span className={`px-1.5 py-0.5 text-xs rounded border ${styles[security]}`}>
        {labels[security]}
      </span>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <Fingerprint className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">哈希计算 (MD5/SHA)</h2>
          <p className="text-sm text-muted-foreground">计算文本或文件的哈希值，支持多种算法</p>
        </div>
      </div>

      {/* 输入类型切换 */}
      <div className="flex gap-2">
        <button
          onClick={() => setInputType('text')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            inputType === 'text' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
          }`}
        >
          文本输入
        </button>
        <button
          onClick={() => setInputType('file')}
          className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
            inputType === 'file' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
          }`}
        >
          文件上传
        </button>
      </div>

      <div>
        {inputType === 'text' ? (
          <>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium">输入文本</label>
              <span className="text-xs text-muted-foreground">{input.length} 字符</span>
            </div>
            <Textarea 
              placeholder="请输入需要计算哈希的文本..." 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              className="min-h-[120px] font-mono text-sm" 
            />
          </>
        ) : (
          <div className="border-2 border-dashed rounded-lg p-6 text-center">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              className="hidden"
              id="hash-file-input"
            />
            <label htmlFor="hash-file-input" className="cursor-pointer">
              <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {fileName ? (
                  <span className="text-foreground font-medium">{fileName}</span>
                ) : (
                  '点击选择文件'
                )}
              </p>
            </label>
          </div>
        )}
        <div className="flex justify-end mt-2">
          <Button variant="outline" size="sm" onClick={handleClear}>
            <Trash2 className="w-4 h-4 mr-1" />清空
          </Button>
        </div>
      </div>

      <div className="flex justify-center">
        <Button onClick={handleHash} className="px-8" disabled={!input || isProcessing}>
          {isProcessing ? '处理中...' : '#️⃣ 计算哈希'}
        </Button>
      </div>

      {results.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium">哈希结果</label>
            <Button variant="ghost" size="sm" onClick={handleCopyAll}>
              {copiedIndex === -1 ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              复制全部
            </Button>
          </div>
          
          {/* 安全算法 */}
          <div className="mb-3">
            <div className="text-xs font-medium text-green-600 dark:text-green-400 mb-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              推荐使用
            </div>
            <div className="space-y-2">
              {results.filter(r => r.security === 'secure' || r.security === 'strong').map((result) => (
                <div key={result.name} className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getSecurityIcon(result.security)}
                      <span className="text-sm font-medium">{result.name}</span>
                      {getSecurityBadge(result.security)}
                      <span className="text-xs text-muted-foreground">{result.bits} bits</span>
                    </div>
                    <div className="font-mono text-xs break-all text-muted-foreground">{result.value}</div>
                    <div className="text-xs text-green-600 dark:text-green-400 mt-1">{HASH_INFO[result.name].description}</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCopy(result.value, results.indexOf(result))} 
                    className={`ml-3 shrink-0 ${copiedIndex === results.indexOf(result) ? 'text-green-500' : ''}`}
                  >
                    {copiedIndex === results.indexOf(result) ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* 不安全算法 */}
          <div>
            <div className="text-xs font-medium text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              仅供参考（存在安全风险）
            </div>
            <div className="space-y-2">
              {results.filter(r => r.security === 'insecure' || r.security === 'weak').map((result) => (
                <div key={result.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-amber-500/20">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getSecurityIcon(result.security)}
                      <span className="text-sm font-medium">{result.name}</span>
                      {getSecurityBadge(result.security)}
                      <span className="text-xs text-muted-foreground">{result.bits} bits</span>
                    </div>
                    <div className="font-mono text-xs break-all text-muted-foreground">{result.value}</div>
                    <div className="text-xs text-amber-600 dark:text-amber-400 mt-1">{HASH_INFO[result.name].description}</div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleCopy(result.value, results.indexOf(result))} 
                    className={`ml-3 shrink-0 ${copiedIndex === results.indexOf(result) ? 'text-green-500' : ''}`}
                  >
                    {copiedIndex === results.indexOf(result) ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 安全说明 */}
      <div className="p-4 bg-secondary/50 rounded-lg space-y-2">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Shield className="w-4 h-4" />
          哈希算法安全性说明
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div><strong>MD5</strong>: 已被完全破解，存在碰撞攻击，仅用于文件校验</div>
          </div>
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div><strong>SHA-1</strong>: 2017年被Google破解，不应用于安全场景</div>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
            <div><strong>SHA-256</strong>: 目前最广泛使用的安全哈希算法</div>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <div><strong>SHA-3</strong>: 2015年发布的新标准，更强的安全性</div>
          </div>
        </div>
      </div>
    </div>
  )
}
