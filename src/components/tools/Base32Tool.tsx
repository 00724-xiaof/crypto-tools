import { useState } from 'react'
import { Copy, ArrowRightLeft } from 'lucide-react'

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

export function Base32Tool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const base32Encode = (str: string): string => {
    const bytes = new TextEncoder().encode(str)
    let bits = ''
    for (const byte of bytes) {
      bits += byte.toString(2).padStart(8, '0')
    }
    
    // Pad to multiple of 5
    while (bits.length % 5 !== 0) {
      bits += '0'
    }
    
    let result = ''
    for (let i = 0; i < bits.length; i += 5) {
      const chunk = bits.slice(i, i + 5)
      result += BASE32_ALPHABET[parseInt(chunk, 2)]
    }
    
    // Add padding
    const padding = [0, 6, 4, 3, 1][bytes.length % 5]
    result += '='.repeat(padding)
    
    return result
  }

  const base32Decode = (str: string): string => {
    str = str.replace(/=+$/, '').toUpperCase()
    
    let bits = ''
    for (const char of str) {
      const index = BASE32_ALPHABET.indexOf(char)
      if (index === -1) throw new Error('Invalid Base32 character')
      bits += index.toString(2).padStart(5, '0')
    }
    
    const bytes: number[] = []
    for (let i = 0; i + 8 <= bits.length; i += 8) {
      bytes.push(parseInt(bits.slice(i, i + 8), 2))
    }
    
    return new TextDecoder().decode(new Uint8Array(bytes))
  }

  const handleConvert = () => {
    try {
      if (mode === 'encode') {
        setOutput(base32Encode(input))
      } else {
        setOutput(base32Decode(input))
      }
    } catch (error) {
      setOutput('转换错误: 无效的输入')
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
        <h1 className="text-2xl font-bold">Base32 编码</h1>
        <p className="text-muted-foreground mt-1">Base32编码与解码转换</p>
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
          {mode === 'encode' ? '输入文本' : '输入Base32'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? '请输入要编码的文本...' : '请输入Base32字符串...'}
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
        <h3 className="font-medium mb-2">关于Base32</h3>
        <p className="text-sm text-muted-foreground">
          Base32使用32个字符(A-Z, 2-7)进行编码，常用于TOTP/HOTP验证码生成器。
          相比Base64，Base32不区分大小写，适合人工输入。
        </p>
      </div>
    </div>
  )
}
