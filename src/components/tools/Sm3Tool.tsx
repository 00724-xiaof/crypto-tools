import { useState } from 'react'
import { Copy } from 'lucide-react'

// SM3 Constants
const T1 = 0x79cc4519
const T2 = 0x7a879d8a

const rotl = (x: number, n: number): number => ((x << n) | (x >>> (32 - n))) >>> 0

const P0 = (x: number): number => (x ^ rotl(x, 9) ^ rotl(x, 17)) >>> 0
const P1 = (x: number): number => (x ^ rotl(x, 15) ^ rotl(x, 23)) >>> 0

const FF = (j: number, x: number, y: number, z: number): number => {
  if (j < 16) return (x ^ y ^ z) >>> 0
  return ((x & y) | (x & z) | (y & z)) >>> 0
}

const GG = (j: number, x: number, y: number, z: number): number => {
  if (j < 16) return (x ^ y ^ z) >>> 0
  return ((x & y) | (~x & z)) >>> 0
}

const sm3Hash = (message: Uint8Array): string => {
  // Initial values
  let V = [
    0x7380166f, 0x4914b2b9, 0x172442d7, 0xda8a0600,
    0xa96f30bc, 0x163138aa, 0xe38dee4d, 0xb0fb0e4e
  ]

  // Padding
  const bitLen = message.length * 8
  const padLen = message.length % 64 < 56 ? 56 - message.length % 64 : 120 - message.length % 64
  const padded = new Uint8Array(message.length + padLen + 8)
  padded.set(message)
  padded[message.length] = 0x80

  // Append bit length
  const view = new DataView(padded.buffer)
  view.setUint32(padded.length - 4, bitLen, false)

  // Process blocks
  for (let i = 0; i < padded.length; i += 64) {
    const W: number[] = new Array(68)
    const W1: number[] = new Array(64)

    // Message expansion
    for (let j = 0; j < 16; j++) {
      W[j] = view.getUint32(i + j * 4, false)
    }
    for (let j = 16; j < 68; j++) {
      W[j] = (P1(W[j - 16] ^ W[j - 9] ^ rotl(W[j - 3], 15)) ^ rotl(W[j - 13], 7) ^ W[j - 6]) >>> 0
    }
    for (let j = 0; j < 64; j++) {
      W1[j] = (W[j] ^ W[j + 4]) >>> 0
    }

    // Compression
    let [A, B, C, D, E, F, G, H] = V
    for (let j = 0; j < 64; j++) {
      const T = j < 16 ? T1 : T2
      const SS1 = rotl((rotl(A, 12) + E + rotl(T, j % 32)) >>> 0, 7)
      const SS2 = (SS1 ^ rotl(A, 12)) >>> 0
      const TT1 = (FF(j, A, B, C) + D + SS2 + W1[j]) >>> 0
      const TT2 = (GG(j, E, F, G) + H + SS1 + W[j]) >>> 0
      D = C
      C = rotl(B, 9)
      B = A
      A = TT1
      H = G
      G = rotl(F, 19)
      F = E
      E = P0(TT2)
    }

    V = [
      (V[0] ^ A) >>> 0, (V[1] ^ B) >>> 0, (V[2] ^ C) >>> 0, (V[3] ^ D) >>> 0,
      (V[4] ^ E) >>> 0, (V[5] ^ F) >>> 0, (V[6] ^ G) >>> 0, (V[7] ^ H) >>> 0
    ]
  }

  return V.map(v => v.toString(16).padStart(8, '0')).join('')
}

export function Sm3Tool() {
  const [input, setInput] = useState('')
  const [inputType, setInputType] = useState<'text' | 'hex' | 'file'>('text')
  const [output, setOutput] = useState('')

  const hexToBytes = (hex: string): Uint8Array => {
    hex = hex.replace(/\s/g, '')
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
    }
    return bytes
  }

  const handleHash = () => {
    try {
      let data: Uint8Array
      if (inputType === 'hex') {
        data = hexToBytes(input)
      } else {
        data = new TextEncoder().encode(input)
      }
      setOutput(sm3Hash(data))
    } catch (error) {
      setOutput('计算错误: ' + (error as Error).message)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer)
      setOutput(sm3Hash(data))
    }
    reader.readAsArrayBuffer(file)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">SM3 哈希</h1>
        <p className="text-muted-foreground mt-1">国密SM3密码杂凑算法</p>
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">输入类型:</label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={inputType === 'text'}
            onChange={() => setInputType('text')}
          />
          <span className="text-sm">文本</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={inputType === 'hex'}
            onChange={() => setInputType('hex')}
          />
          <span className="text-sm">Hex</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={inputType === 'file'}
            onChange={() => setInputType('file')}
          />
          <span className="text-sm">文件</span>
        </label>
      </div>

      {inputType !== 'file' ? (
        <div className="space-y-2">
          <label className="text-sm font-medium">输入</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={inputType === 'text' ? '请输入文本...' : '请输入Hex数据...'}
            className="w-full h-32 p-3 rounded-md border bg-background resize-none font-mono text-sm"
          />
        </div>
      ) : (
        <div className="space-y-2">
          <label className="text-sm font-medium">选择文件</label>
          <input
            type="file"
            onChange={handleFileSelect}
            className="w-full p-3 rounded-md border bg-background text-sm"
          />
        </div>
      )}

      {inputType !== 'file' && (
        <button
          onClick={handleHash}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          计算哈希
        </button>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">SM3 (256位)</label>
          <button onClick={copyToClipboard} className="p-1.5 rounded hover:bg-accent transition-colors">
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <input
          type="text"
          value={output}
          readOnly
          className="w-full p-3 rounded-md border bg-muted/50 font-mono text-sm"
        />
      </div>

      <div className="p-4 bg-secondary/50 rounded-lg">
        <h3 className="font-medium mb-2">关于SM3</h3>
        <p className="text-sm text-muted-foreground">
          SM3是中国国家密码局发布的密码杂凑算法，输出256位摘要值，
          安全性与SHA-256相当，广泛应用于数字签名和验证。
        </p>
      </div>
    </div>
  )
}
