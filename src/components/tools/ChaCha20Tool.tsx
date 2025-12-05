import { useState } from 'react'
import { Copy, ArrowRightLeft, RefreshCw } from 'lucide-react'

// ChaCha20 implementation
class ChaCha20 {
  private state: Uint32Array

  constructor(key: Uint8Array, nonce: Uint8Array, counter = 0) {
    this.state = new Uint32Array(16)

    // "expand 32-byte k"
    this.state[0] = 0x61707865
    this.state[1] = 0x3320646e
    this.state[2] = 0x79622d32
    this.state[3] = 0x6b206574

    // Key
    for (let i = 0; i < 8; i++) {
      this.state[4 + i] = this.readU32(key, i * 4)
    }

    // Counter
    this.state[12] = counter

    // Nonce
    for (let i = 0; i < 3; i++) {
      this.state[13 + i] = this.readU32(nonce, i * 4)
    }
  }

  private readU32(data: Uint8Array, offset: number): number {
    return (
      (data[offset] |
        (data[offset + 1] << 8) |
        (data[offset + 2] << 16) |
        (data[offset + 3] << 24)) >>> 0
    )
  }

  private writeU32(data: Uint8Array, offset: number, value: number): void {
    data[offset] = value & 0xff
    data[offset + 1] = (value >>> 8) & 0xff
    data[offset + 2] = (value >>> 16) & 0xff
    data[offset + 3] = (value >>> 24) & 0xff
  }

  private rotl(a: number, b: number): number {
    return ((a << b) | (a >>> (32 - b))) >>> 0
  }

  private quarterRound(state: Uint32Array, a: number, b: number, c: number, d: number): void {
    state[a] = (state[a] + state[b]) >>> 0
    state[d] ^= state[a]
    state[d] = this.rotl(state[d], 16)

    state[c] = (state[c] + state[d]) >>> 0
    state[b] ^= state[c]
    state[b] = this.rotl(state[b], 12)

    state[a] = (state[a] + state[b]) >>> 0
    state[d] ^= state[a]
    state[d] = this.rotl(state[d], 8)

    state[c] = (state[c] + state[d]) >>> 0
    state[b] ^= state[c]
    state[b] = this.rotl(state[b], 7)
  }

  private block(): Uint8Array {
    const working = new Uint32Array(this.state)

    for (let i = 0; i < 10; i++) {
      // Column rounds
      this.quarterRound(working, 0, 4, 8, 12)
      this.quarterRound(working, 1, 5, 9, 13)
      this.quarterRound(working, 2, 6, 10, 14)
      this.quarterRound(working, 3, 7, 11, 15)
      // Diagonal rounds
      this.quarterRound(working, 0, 5, 10, 15)
      this.quarterRound(working, 1, 6, 11, 12)
      this.quarterRound(working, 2, 7, 8, 13)
      this.quarterRound(working, 3, 4, 9, 14)
    }

    const output = new Uint8Array(64)
    for (let i = 0; i < 16; i++) {
      this.writeU32(output, i * 4, (working[i] + this.state[i]) >>> 0)
    }

    this.state[12]++

    return output
  }

  process(data: Uint8Array): Uint8Array {
    const output = new Uint8Array(data.length)
    let keyStream: Uint8Array = new Uint8Array(0)
    let keyStreamPos = 64

    for (let i = 0; i < data.length; i++) {
      if (keyStreamPos >= 64) {
        keyStream = new Uint8Array(this.block())
        keyStreamPos = 0
      }
      output[i] = data[i] ^ keyStream[keyStreamPos++]
    }

    return output
  }
}

export function ChaCha20Tool() {
  const [input, setInput] = useState('')
  const [key, setKey] = useState('')
  const [nonce, setNonce] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')

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

  const generateRandom = (length: number): string => {
    const bytes = new Uint8Array(length)
    crypto.getRandomValues(bytes)
    return bytesToHex(bytes)
  }

  const handleConvert = () => {
    try {
      let keyBytes: Uint8Array
      if (/^[0-9a-fA-F]+$/.test(key.replace(/\s/g, ''))) {
        keyBytes = hexToBytes(key)
      } else {
        keyBytes = new TextEncoder().encode(key)
      }

      if (keyBytes.length !== 32) {
        // Pad or truncate to 32 bytes
        const newKey = new Uint8Array(32)
        newKey.set(keyBytes.slice(0, 32))
        keyBytes = newKey
      }

      let nonceBytes: Uint8Array
      if (/^[0-9a-fA-F]+$/.test(nonce.replace(/\s/g, ''))) {
        nonceBytes = hexToBytes(nonce)
      } else {
        nonceBytes = new TextEncoder().encode(nonce)
      }

      if (nonceBytes.length !== 12) {
        const newNonce = new Uint8Array(12)
        newNonce.set(nonceBytes.slice(0, 12))
        nonceBytes = newNonce
      }

      const chacha = new ChaCha20(keyBytes, nonceBytes)

      if (mode === 'encrypt') {
        const inputBytes = new TextEncoder().encode(input)
        const encrypted = chacha.process(inputBytes)
        setOutput(bytesToHex(encrypted))
      } else {
        const inputBytes = hexToBytes(input)
        const decrypted = chacha.process(inputBytes)
        setOutput(new TextDecoder().decode(decrypted))
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
        <h1 className="text-2xl font-bold">ChaCha20 加密</h1>
        <p className="text-muted-foreground mt-1">ChaCha20现代流加密算法</p>
      </div>

      <div className="flex items-center gap-4">
        <span className={mode === 'encrypt' ? 'font-medium' : 'text-muted-foreground'}>加密</span>
        <button onClick={handleSwap} className="p-2 rounded-md hover:bg-accent transition-colors">
          <ArrowRightLeft className="w-4 h-4" />
        </button>
        <span className={mode === 'decrypt' ? 'font-medium' : 'text-muted-foreground'}>解密</span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">密钥 (32字节/256位)</label>
          <button
            onClick={() => setKey(generateRandom(32))}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-3 h-3" />
            生成
          </button>
        </div>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="输入密钥 (文本或Hex)"
          className="w-full p-3 rounded-md border bg-background font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Nonce (12字节)</label>
          <button
            onClick={() => setNonce(generateRandom(12))}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="w-3 h-3" />
            生成
          </button>
        </div>
        <input
          type="text"
          value={nonce}
          onChange={(e) => setNonce(e.target.value)}
          placeholder="输入Nonce (文本或Hex)"
          className="w-full p-3 rounded-md border bg-background font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {mode === 'encrypt' ? '明文' : '密文 (Hex)'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encrypt' ? '请输入明文...' : '请输入Hex格式密文...'}
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

      <div className="p-4 bg-secondary/50 rounded-lg">
        <h3 className="font-medium mb-2">关于ChaCha20</h3>
        <p className="text-sm text-muted-foreground">
          ChaCha20是由Daniel J. Bernstein设计的流加密算法，是AES的替代方案。
          在移动设备上比AES更快，被广泛用于TLS 1.3和WireGuard VPN。
        </p>
      </div>
    </div>
  )
}
