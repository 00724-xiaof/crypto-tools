import { useState } from 'react'
import { Copy, ArrowRightLeft } from 'lucide-react'

// Punycode implementation
const punycode = {
  base: 36,
  tMin: 1,
  tMax: 26,
  skew: 38,
  damp: 700,
  initialBias: 72,
  initialN: 128,
  delimiter: '-',

  encode(input: string): string {
    const output: string[] = []
    const inputLength = input.length
    let n = this.initialN
    let delta = 0
    let bias = this.initialBias
    
    // Handle basic code points
    for (const char of input) {
      if (char.charCodeAt(0) < 128) {
        output.push(char)
      }
    }
    
    const basicLength = output.length
    let handledCPCount = basicLength
    
    if (basicLength > 0) {
      output.push(this.delimiter)
    }
    
    while (handledCPCount < inputLength) {
      let m = Infinity
      for (const char of input) {
        const codePoint = char.charCodeAt(0)
        if (codePoint >= n && codePoint < m) {
          m = codePoint
        }
      }
      
      delta += (m - n) * (handledCPCount + 1)
      n = m
      
      for (const char of input) {
        const codePoint = char.charCodeAt(0)
        if (codePoint < n) {
          delta++
        }
        if (codePoint === n) {
          let q = delta
          for (let k = this.base; ; k += this.base) {
            const t = k <= bias ? this.tMin : (k >= bias + this.tMax ? this.tMax : k - bias)
            if (q < t) break
            output.push(String.fromCharCode(this.digitToBasic(t + (q - t) % (this.base - t))))
            q = Math.floor((q - t) / (this.base - t))
          }
          output.push(String.fromCharCode(this.digitToBasic(q)))
          bias = this.adapt(delta, handledCPCount + 1, handledCPCount === basicLength)
          delta = 0
          handledCPCount++
        }
      }
      delta++
      n++
    }
    
    return output.join('')
  },

  decode(input: string): string {
    const output: number[] = []
    const inputLength = input.length
    let i = 0
    let n = this.initialN
    let bias = this.initialBias
    
    let basic = input.lastIndexOf(this.delimiter)
    if (basic < 0) basic = 0
    
    for (let j = 0; j < basic; j++) {
      output.push(input.charCodeAt(j))
    }
    
    let index = basic > 0 ? basic + 1 : 0
    
    while (index < inputLength) {
      const oldi = i
      let w = 1
      
      for (let k = this.base; ; k += this.base) {
        const digit = this.basicToDigit(input.charCodeAt(index++))
        i += digit * w
        const t = k <= bias ? this.tMin : (k >= bias + this.tMax ? this.tMax : k - bias)
        if (digit < t) break
        w *= this.base - t
      }
      
      const out = output.length + 1
      bias = this.adapt(i - oldi, out, oldi === 0)
      n += Math.floor(i / out)
      i %= out
      output.splice(i++, 0, n)
    }
    
    return String.fromCodePoint(...output)
  },

  digitToBasic(digit: number): number {
    return digit + 22 + 75 * (digit < 26 ? 1 : 0)
  },

  basicToDigit(codePoint: number): number {
    if (codePoint - 48 < 10) return codePoint - 22
    if (codePoint - 65 < 26) return codePoint - 65
    if (codePoint - 97 < 26) return codePoint - 97
    return this.base
  },

  adapt(delta: number, numPoints: number, firstTime: boolean): number {
    delta = firstTime ? Math.floor(delta / this.damp) : delta >> 1
    delta += Math.floor(delta / numPoints)
    let k = 0
    while (delta > ((this.base - this.tMin) * this.tMax) >> 1) {
      delta = Math.floor(delta / (this.base - this.tMin))
      k += this.base
    }
    return Math.floor(k + (this.base - this.tMin + 1) * delta / (delta + this.skew))
  }
}

export function PunycodeTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')

  const handleConvert = () => {
    try {
      if (mode === 'encode') {
        // Handle domain encoding
        const parts = input.split('.')
        const encoded = parts.map(part => {
          if (/[^\x00-\x7F]/.test(part)) {
            return 'xn--' + punycode.encode(part)
          }
          return part
        })
        setOutput(encoded.join('.'))
      } else {
        // Handle domain decoding
        const parts = input.split('.')
        const decoded = parts.map(part => {
          if (part.startsWith('xn--')) {
            return punycode.decode(part.slice(4))
          }
          return part
        })
        setOutput(decoded.join('.'))
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
        <h1 className="text-2xl font-bold">Punycode 编码</h1>
        <p className="text-muted-foreground mt-1">国际化域名(IDN)编码转换</p>
      </div>

      <div className="flex items-center gap-4">
        <span className={mode === 'encode' ? 'font-medium' : 'text-muted-foreground'}>
          Unicode → Punycode
        </span>
        <button
          onClick={handleSwap}
          className="p-2 rounded-md hover:bg-accent transition-colors"
          title="切换方向"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>
        <span className={mode === 'decode' ? 'font-medium' : 'text-muted-foreground'}>
          Punycode → Unicode
        </span>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {mode === 'encode' ? '输入域名/文本' : '输入Punycode'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? '请输入中文域名 (如: 中文.com)' : '请输入Punycode (如: xn--fiq228c.com)'}
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
        <h3 className="font-medium mb-2">示例</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
          <div>中文.com → xn--fiq228c.com</div>
          <div>日本語.jp → xn--wgv71a119e.jp</div>
          <div>münchen.de → xn--mnchen-3ya.de</div>
          <div>北京.中国 → xn--1lq90i.xn--fiqs8s</div>
        </div>
      </div>
    </div>
  )
}
