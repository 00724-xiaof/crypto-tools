import { useState } from 'react'
import { Copy, ArrowRightLeft } from 'lucide-react'

// RC4 implementation
class RC4 {
  private S: number[] = []
  private i = 0
  private j = 0

  constructor(key: Uint8Array) {
    // Key-scheduling algorithm (KSA)
    for (let i = 0; i < 256; i++) {
      this.S[i] = i
    }

    let j = 0
    for (let i = 0; i < 256; i++) {
      j = (j + this.S[i] + key[i % key.length]) & 255
      ;[this.S[i], this.S[j]] = [this.S[j], this.S[i]]
    }
  }

  process(data: Uint8Array): Uint8Array {
    const result = new Uint8Array(data.length)

    for (let n = 0; n < data.length; n++) {
      this.i = (this.i + 1) & 255
      this.j = (this.j + this.S[this.i]) & 255
      ;[this.S[this.i], this.S[this.j]] = [this.S[this.j], this.S[this.i]]
      const K = this.S[(this.S[this.i] + this.S[this.j]) & 255]
      result[n] = data[n] ^ K
    }

    return result
  }
}

export function Rc4Tool() {
  const [input, setInput] = useState('')
  const [key, setKey] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [inputFormat, setInputFormat] = useState<'text' | 'hex'>('text')
  const [outputFormat, setOutputFormat] = useState<'hex' | 'base64'>('hex')

  const hexToBytes = (hex: string): Uint8Array => {
    hex = hex.replace(/\s/g, '')
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
    }
    return bytes
  }

  const bytesToHex = (bytes: Uint8Array): string => {
    return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
  }

  const bytesToBase64 = (bytes: Uint8Array): string => {
    let binary = ''
    for (let i = 0; i < bytes.length; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  const base64ToBytes = (base64: string): Uint8Array => {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes
  }

  const handleConvert = () => {
    try {
      if (!key) {
        setOutput('请输入密钥')
        return
      }

      const keyBytes = new TextEncoder().encode(key)
      const rc4 = new RC4(keyBytes)

      let inputBytes: Uint8Array
      if (mode === 'encrypt') {
        if (inputFormat === 'text') {
          inputBytes = new TextEncoder().encode(input)
        } else {
          inputBytes = hexToBytes(input)
        }
      } else {
        // Decryption expects hex or base64 input
        if (input.match(/^[0-9a-fA-F\s]+$/)) {
          inputBytes = hexToBytes(input)
        } else {
          inputBytes = base64ToBytes(input)
        }
      }

      const result = rc4.process(inputBytes)

      if (mode === 'encrypt') {
        if (outputFormat === 'hex') {
          setOutput(bytesToHex(result))
        } else {
          setOutput(bytesToBase64(result))
        }
      } else {
        setOutput(new TextDecoder().decode(result))
      }
    } catch (error) {
      setOutput('转换错误: ' + (error as Error).message)
    }
  }

  const handleSwap = () => {
    setMode(mode === 'encrypt' ? 'decrypt' : 'encrypt')
    setInput(output)
    setOutput(input)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">RC4 加密</h1>
        <p className="text-muted-foreground mt-1">RC4流加密算法</p>
      </div>

      <div className="flex items-center gap-4">
        <span className={mode === 'encrypt' ? 'font-medium' : 'text-muted-foreground'}>加密</span>
        <button onClick={handleSwap} className="p-2 rounded-md hover:bg-accent transition-colors">
          <ArrowRightLeft className="w-4 h-4" />
        </button>
        <span className={mode === 'decrypt' ? 'font-medium' : 'text-muted-foreground'}>解密</span>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">密钥</label>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="输入密钥"
          className="w-full p-3 rounded-md border bg-background font-mono text-sm"
        />
      </div>

      {mode === 'encrypt' && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">输入格式:</label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={inputFormat === 'text'}
              onChange={() => setInputFormat('text')}
            />
            <span className="text-sm">文本</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={inputFormat === 'hex'}
              onChange={() => setInputFormat('hex')}
            />
            <span className="text-sm">Hex</span>
          </label>
        </div>
      )}

      {mode === 'encrypt' && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium">输出格式:</label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={outputFormat === 'hex'}
              onChange={() => setOutputFormat('hex')}
            />
            <span className="text-sm">Hex</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              checked={outputFormat === 'base64'}
              onChange={() => setOutputFormat('base64')}
            />
            <span className="text-sm">Base64</span>
          </label>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {mode === 'encrypt' ? '明文' : '密文'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encrypt' ? '请输入明文...' : '请输入密文 (Hex或Base64)...'}
          className="w-full h-32 p-3 rounded-md border bg-background resize-none font-mono text-sm"
        />
      </div>

      <button
        onClick={handleConvert}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        {mode === 'encrypt' ? '加密' : '解密'}
      </button>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">结果</label>
          <button onClick={copyToClipboard} className="p-1.5 rounded hover:bg-accent transition-colors">
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <textarea
          value={output}
          readOnly
          className="w-full h-32 p-3 rounded-md border bg-muted/50 resize-none font-mono text-sm"
        />
      </div>

      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
        <h3 className="font-medium mb-2 text-amber-600 dark:text-amber-400">安全警告</h3>
        <p className="text-sm text-muted-foreground">
          RC4已被证明存在安全漏洞，不建议在生产环境使用。
          请考虑使用AES、ChaCha20等更安全的算法。
        </p>
      </div>
    </div>
  )
}
