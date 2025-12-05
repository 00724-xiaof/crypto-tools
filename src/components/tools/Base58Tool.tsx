import { useState } from 'react'
import { Copy, ArrowDownUp } from 'lucide-react'

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'

function encodeBase58(input: string): string {
  const bytes = new TextEncoder().encode(input)
  
  if (bytes.length === 0) return ''
  
  // Count leading zeros
  let zeros = 0
  for (const byte of bytes) {
    if (byte === 0) zeros++
    else break
  }
  
  // Convert to base58
  const digits = [0]
  for (const byte of bytes) {
    let carry = byte
    for (let i = 0; i < digits.length; i++) {
      carry += digits[i] << 8
      digits[i] = carry % 58
      carry = Math.floor(carry / 58)
    }
    while (carry > 0) {
      digits.push(carry % 58)
      carry = Math.floor(carry / 58)
    }
  }
  
  // Add leading '1's for each leading zero byte
  let result = '1'.repeat(zeros)
  for (let i = digits.length - 1; i >= 0; i--) {
    result += ALPHABET[digits[i]]
  }
  
  return result
}

function decodeBase58(input: string): string {
  if (input.length === 0) return ''
  
  // Count leading '1's
  let zeros = 0
  for (const char of input) {
    if (char === '1') zeros++
    else break
  }
  
  // Convert from base58
  const bytes = [0]
  for (const char of input) {
    const value = ALPHABET.indexOf(char)
    if (value === -1) throw new Error(`Invalid Base58 character: ${char}`)
    
    let carry = value
    for (let i = 0; i < bytes.length; i++) {
      carry += bytes[i] * 58
      bytes[i] = carry & 0xff
      carry >>= 8
    }
    while (carry > 0) {
      bytes.push(carry & 0xff)
      carry >>= 8
    }
  }
  
  // Add leading zeros
  for (let i = 0; i < zeros; i++) {
    bytes.push(0)
  }
  
  bytes.reverse()
  return new TextDecoder().decode(new Uint8Array(bytes))
}

export function Base58Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [error, setError] = useState('')

  const handleConvert = () => {
    setError('')
    try {
      if (mode === 'encode') {
        setOutput(encodeBase58(input))
      } else {
        setOutput(decodeBase58(input))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
      setOutput('')
    }
  }

  const handleSwap = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode')
    setInput(output)
    setOutput('')
    setError('')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Base58 编码/解码</h2>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${mode === 'encode' ? 'text-primary' : 'text-muted-foreground'}`}>编码</span>
          <button
            onClick={handleSwap}
            className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
            title="切换模式"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
          <span className={`text-sm ${mode === 'decode' ? 'text-primary' : 'text-muted-foreground'}`}>解码</span>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Base58 常用于比特币地址、IPFS 哈希等场景，不包含易混淆字符（0, O, I, l）
      </p>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {mode === 'encode' ? '原始文本' : 'Base58 字符串'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? '输入要编码的文本...' : '输入 Base58 字符串...'}
          className="w-full h-32 p-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
        />
      </div>

      <button
        onClick={handleConvert}
        className="w-full py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
      >
        {mode === 'encode' ? '编码' : '解码'}
      </button>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            {mode === 'encode' ? 'Base58 结果' : '解码结果'}
          </label>
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
          placeholder="结果将显示在这里..."
          className="w-full h-32 p-3 rounded-lg bg-muted border border-border focus:outline-none resize-none font-mono text-sm"
        />
      </div>
    </div>
  )
}
