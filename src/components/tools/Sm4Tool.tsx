import { useState } from 'react'
import { Copy, ArrowRightLeft } from 'lucide-react'

// SM4 S-Box
const SBOX = [
  0xd6, 0x90, 0xe9, 0xfe, 0xcc, 0xe1, 0x3d, 0xb7, 0x16, 0xb6, 0x14, 0xc2, 0x28, 0xfb, 0x2c, 0x05,
  0x2b, 0x67, 0x9a, 0x76, 0x2a, 0xbe, 0x04, 0xc3, 0xaa, 0x44, 0x13, 0x26, 0x49, 0x86, 0x06, 0x99,
  0x9c, 0x42, 0x50, 0xf4, 0x91, 0xef, 0x98, 0x7a, 0x33, 0x54, 0x0b, 0x43, 0xed, 0xcf, 0xac, 0x62,
  0xe4, 0xb3, 0x1c, 0xa9, 0xc9, 0x08, 0xe8, 0x95, 0x80, 0xdf, 0x94, 0xfa, 0x75, 0x8f, 0x3f, 0xa6,
  0x47, 0x07, 0xa7, 0xfc, 0xf3, 0x73, 0x17, 0xba, 0x83, 0x59, 0x3c, 0x19, 0xe6, 0x85, 0x4f, 0xa8,
  0x68, 0x6b, 0x81, 0xb2, 0x71, 0x64, 0xda, 0x8b, 0xf8, 0xeb, 0x0f, 0x4b, 0x70, 0x56, 0x9d, 0x35,
  0x1e, 0x24, 0x0e, 0x5e, 0x63, 0x58, 0xd1, 0xa2, 0x25, 0x22, 0x7c, 0x3b, 0x01, 0x21, 0x78, 0x87,
  0xd4, 0x00, 0x46, 0x57, 0x9f, 0xd3, 0x27, 0x52, 0x4c, 0x36, 0x02, 0xe7, 0xa0, 0xc4, 0xc8, 0x9e,
  0xea, 0xbf, 0x8a, 0xd2, 0x40, 0xc7, 0x38, 0xb5, 0xa3, 0xf7, 0xf2, 0xce, 0xf9, 0x61, 0x15, 0xa1,
  0xe0, 0xae, 0x5d, 0xa4, 0x9b, 0x34, 0x1a, 0x55, 0xad, 0x93, 0x32, 0x30, 0xf5, 0x8c, 0xb1, 0xe3,
  0x1d, 0xf6, 0xe2, 0x2e, 0x82, 0x66, 0xca, 0x60, 0xc0, 0x29, 0x23, 0xab, 0x0d, 0x53, 0x4e, 0x6f,
  0xd5, 0xdb, 0x37, 0x45, 0xde, 0xfd, 0x8e, 0x2f, 0x03, 0xff, 0x6a, 0x72, 0x6d, 0x6c, 0x5b, 0x51,
  0x8d, 0x1b, 0xaf, 0x92, 0xbb, 0xdd, 0xbc, 0x7f, 0x11, 0xd9, 0x5c, 0x41, 0x1f, 0x10, 0x5a, 0xd8,
  0x0a, 0xc1, 0x31, 0x88, 0xa5, 0xcd, 0x7b, 0xbd, 0x2d, 0x74, 0xd0, 0x12, 0xb8, 0xe5, 0xb4, 0xb0,
  0x89, 0x69, 0x97, 0x4a, 0x0c, 0x96, 0x77, 0x7e, 0x65, 0xb9, 0xf1, 0x09, 0xc5, 0x6e, 0xc6, 0x84,
  0x18, 0xf0, 0x7d, 0xec, 0x3a, 0xdc, 0x4d, 0x20, 0x79, 0xee, 0x5f, 0x3e, 0xd7, 0xcb, 0x39, 0x48,
]

const CK = [
  0x00070e15, 0x1c232a31, 0x383f464d, 0x545b6269,
  0x70777e85, 0x8c939aa1, 0xa8afb6bd, 0xc4cbd2d9,
  0xe0e7eef5, 0xfc030a11, 0x181f262d, 0x343b4249,
  0x50575e65, 0x6c737a81, 0x888f969d, 0xa4abb2b9,
  0xc0c7ced5, 0xdce3eaf1, 0xf8ff060d, 0x141b2229,
  0x30373e45, 0x4c535a61, 0x686f767d, 0x848b9299,
  0xa0a7aeb5, 0xbcc3cad1, 0xd8dfe6ed, 0xf4fb0209,
  0x10171e25, 0x2c333a41, 0x484f565d, 0x646b7279,
]

const FK = [0xa3b1bac6, 0x56aa3350, 0x677d9197, 0xb27022dc]

const rotl = (x: number, n: number): number => ((x << n) | (x >>> (32 - n))) >>> 0

const tau = (a: number): number => {
  return ((SBOX[(a >>> 24) & 0xff] << 24) |
    (SBOX[(a >>> 16) & 0xff] << 16) |
    (SBOX[(a >>> 8) & 0xff] << 8) |
    SBOX[a & 0xff]) >>> 0
}

const L = (b: number): number => (b ^ rotl(b, 2) ^ rotl(b, 10) ^ rotl(b, 18) ^ rotl(b, 24)) >>> 0
const L2 = (b: number): number => (b ^ rotl(b, 13) ^ rotl(b, 23)) >>> 0

const T = (a: number): number => L(tau(a))
const T2 = (a: number): number => L2(tau(a))

class SM4 {
  private rk: number[] = []

  constructor(key: Uint8Array) {
    this.keyExpansion(key)
  }

  private keyExpansion(key: Uint8Array) {
    const K: number[] = []
    for (let i = 0; i < 4; i++) {
      K[i] = ((key[i * 4] << 24) | (key[i * 4 + 1] << 16) | (key[i * 4 + 2] << 8) | key[i * 4 + 3]) >>> 0
      K[i] = (K[i] ^ FK[i]) >>> 0
    }

    for (let i = 0; i < 32; i++) {
      K[i + 4] = (K[i] ^ T2(K[i + 1] ^ K[i + 2] ^ K[i + 3] ^ CK[i])) >>> 0
      this.rk[i] = K[i + 4]
    }
  }

  encrypt(block: Uint8Array): Uint8Array {
    return this.process(block, false)
  }

  decrypt(block: Uint8Array): Uint8Array {
    return this.process(block, true)
  }

  private process(block: Uint8Array, decrypt: boolean): Uint8Array {
    const X: number[] = []
    for (let i = 0; i < 4; i++) {
      X[i] = ((block[i * 4] << 24) | (block[i * 4 + 1] << 16) | (block[i * 4 + 2] << 8) | block[i * 4 + 3]) >>> 0
    }

    for (let i = 0; i < 32; i++) {
      const rkIndex = decrypt ? 31 - i : i
      X[i + 4] = (X[i] ^ T(X[i + 1] ^ X[i + 2] ^ X[i + 3] ^ this.rk[rkIndex])) >>> 0
    }

    const result = new Uint8Array(16)
    for (let i = 0; i < 4; i++) {
      const val = X[35 - i]
      result[i * 4] = (val >>> 24) & 0xff
      result[i * 4 + 1] = (val >>> 16) & 0xff
      result[i * 4 + 2] = (val >>> 8) & 0xff
      result[i * 4 + 3] = val & 0xff
    }
    return result
  }
}

export function Sm4Tool() {
  const [input, setInput] = useState('')
  const [key, setKey] = useState('')
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

  const pkcs7Pad = (data: Uint8Array): Uint8Array => {
    const padding = 16 - (data.length % 16)
    const result = new Uint8Array(data.length + padding)
    result.set(data)
    result.fill(padding, data.length)
    return result
  }

  const pkcs7Unpad = (data: Uint8Array): Uint8Array => {
    const padding = data[data.length - 1]
    return data.slice(0, data.length - padding)
  }

  const handleConvert = () => {
    try {
      let keyBytes: Uint8Array
      if (/^[0-9a-fA-F]+$/.test(key.replace(/\s/g, ''))) {
        keyBytes = hexToBytes(key)
      } else {
        keyBytes = new TextEncoder().encode(key)
      }

      if (keyBytes.length !== 16) {
        setOutput('密钥长度必须为16字节')
        return
      }

      const sm4 = new SM4(keyBytes)

      if (mode === 'encrypt') {
        const inputBytes = new TextEncoder().encode(input)
        const padded = pkcs7Pad(inputBytes)
        const encrypted = new Uint8Array(padded.length)

        for (let i = 0; i < padded.length; i += 16) {
          const block = padded.slice(i, i + 16)
          const encBlock = sm4.encrypt(block)
          encrypted.set(encBlock, i)
        }

        setOutput(bytesToHex(encrypted))
      } else {
        const inputBytes = hexToBytes(input)
        const decrypted = new Uint8Array(inputBytes.length)

        for (let i = 0; i < inputBytes.length; i += 16) {
          const block = inputBytes.slice(i, i + 16)
          const decBlock = sm4.decrypt(block)
          decrypted.set(decBlock, i)
        }

        const unpadded = pkcs7Unpad(decrypted)
        setOutput(new TextDecoder().decode(unpadded))
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
        <h1 className="text-2xl font-bold">SM4 加密</h1>
        <p className="text-muted-foreground mt-1">国密SM4对称加密算法 (ECB模式)</p>
      </div>

      <div className="flex items-center gap-4">
        <span className={mode === 'encrypt' ? 'font-medium' : 'text-muted-foreground'}>加密</span>
        <button onClick={handleSwap} className="p-2 rounded-md hover:bg-accent transition-colors">
          <ArrowRightLeft className="w-4 h-4" />
        </button>
        <span className={mode === 'decrypt' ? 'font-medium' : 'text-muted-foreground'}>解密</span>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">密钥 (16字节/128位)</label>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="输入密钥 (文本或Hex)"
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
        <h3 className="font-medium mb-2">关于SM4</h3>
        <p className="text-sm text-muted-foreground">
          SM4是中国国家密码局发布的分组加密算法，密钥长度和分组长度均为128位，
          广泛用于无线局域网、VPN等场景。
        </p>
      </div>
    </div>
  )
}
