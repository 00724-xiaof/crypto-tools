import { useState } from 'react'
import { Copy } from 'lucide-react'

// BLAKE2s implementation (simplified for browser)
const BLAKE2S_IV = [
  0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
  0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
]

const BLAKE2S_SIGMA = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
  [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
  [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
  [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
  [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
  [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
  [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
  [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
  [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0]
]

const rotr32 = (x: number, n: number): number => ((x >>> n) | (x << (32 - n))) >>> 0

const G = (v: number[], a: number, b: number, c: number, d: number, x: number, y: number): void => {
  v[a] = (v[a] + v[b] + x) >>> 0
  v[d] = rotr32(v[d] ^ v[a], 16)
  v[c] = (v[c] + v[d]) >>> 0
  v[b] = rotr32(v[b] ^ v[c], 12)
  v[a] = (v[a] + v[b] + y) >>> 0
  v[d] = rotr32(v[d] ^ v[a], 8)
  v[c] = (v[c] + v[d]) >>> 0
  v[b] = rotr32(v[b] ^ v[c], 7)
}

const blake2s = (data: Uint8Array, digestLength: number = 32): string => {
  const h = [...BLAKE2S_IV]
  h[0] ^= 0x01010000 ^ digestLength

  let t = 0
  const blocks = Math.ceil(data.length / 64) || 1
  
  for (let i = 0; i < blocks; i++) {
    const block = new Uint8Array(64)
    const start = i * 64
    const end = Math.min(start + 64, data.length)
    block.set(data.slice(start, end))
    
    t += end - start
    const isLast = i === blocks - 1
    
    // Compress
    const v = [...h, ...BLAKE2S_IV]
    v[12] ^= t
    if (isLast) v[14] = ~v[14]
    
    const m: number[] = []
    const view = new DataView(block.buffer)
    for (let j = 0; j < 16; j++) {
      m[j] = view.getUint32(j * 4, true)
    }
    
    for (let round = 0; round < 10; round++) {
      const s = BLAKE2S_SIGMA[round]
      G(v, 0, 4, 8, 12, m[s[0]], m[s[1]])
      G(v, 1, 5, 9, 13, m[s[2]], m[s[3]])
      G(v, 2, 6, 10, 14, m[s[4]], m[s[5]])
      G(v, 3, 7, 11, 15, m[s[6]], m[s[7]])
      G(v, 0, 5, 10, 15, m[s[8]], m[s[9]])
      G(v, 1, 6, 11, 12, m[s[10]], m[s[11]])
      G(v, 2, 7, 8, 13, m[s[12]], m[s[13]])
      G(v, 3, 4, 9, 14, m[s[14]], m[s[15]])
    }
    
    for (let j = 0; j < 8; j++) {
      h[j] = (h[j] ^ v[j] ^ v[j + 8]) >>> 0
    }
  }
  
  // Output
  const result = new Uint8Array(digestLength)
  const resultView = new DataView(result.buffer)
  for (let i = 0; i < digestLength / 4; i++) {
    resultView.setUint32(i * 4, h[i], true)
  }
  
  return Array.from(result.slice(0, digestLength)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export function Blake2Tool() {
  const [input, setInput] = useState('')
  const [inputType, setInputType] = useState<'text' | 'hex'>('text')
  const [digestLength, setDigestLength] = useState(32)
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
      setOutput(blake2s(data, digestLength))
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
      setOutput(blake2s(data, digestLength))
    }
    reader.readAsArrayBuffer(file)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">BLAKE2 哈希</h1>
        <p className="text-muted-foreground mt-1">BLAKE2s高性能密码哈希</p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
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
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">输出长度:</label>
        <select
          value={digestLength}
          onChange={(e) => setDigestLength(Number(e.target.value))}
          className="px-3 py-1.5 rounded-md border bg-background text-sm"
        >
          <option value={16}>128位 (16字节)</option>
          <option value={20}>160位 (20字节)</option>
          <option value={28}>224位 (28字节)</option>
          <option value={32}>256位 (32字节)</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">输入</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={inputType === 'text' ? '请输入文本...' : '请输入Hex数据...'}
          className="w-full h-32 p-3 rounded-md border bg-background resize-none font-mono text-sm"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleHash}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          计算哈希
        </button>
        <label className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors cursor-pointer">
          <input type="file" onChange={handleFileSelect} className="hidden" />
          选择文件
        </label>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">BLAKE2s-{digestLength * 8}</label>
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
        <h3 className="font-medium mb-2">关于BLAKE2</h3>
        <p className="text-sm text-muted-foreground">
          BLAKE2是一种快速的密码哈希函数，比MD5和SHA-2更快，安全性更高。
          BLAKE2s针对32位平台优化，广泛用于文件校验和密码哈希。
        </p>
      </div>
    </div>
  )
}
