import { useState } from 'react'
import { Copy } from 'lucide-react'

export function BaseConverterTool() {
  const [decimal, setDecimal] = useState('')
  const [binary, setBinary] = useState('')
  const [octal, setOctal] = useState('')
  const [hex, setHex] = useState('')

  const isValidNumber = (value: string, base: number): boolean => {
    if (!value) return true
    const chars = '0123456789abcdef'.slice(0, base)
    return value.toLowerCase().split('').every(c => chars.includes(c))
  }

  const updateFromDecimal = (value: string) => {
    setDecimal(value)
    if (!value || isNaN(Number(value))) {
      setBinary('')
      setOctal('')
      setHex('')
      return
    }
    const num = BigInt(value)
    setBinary(num.toString(2))
    setOctal(num.toString(8))
    setHex(num.toString(16).toUpperCase())
  }

  const updateFromBinary = (value: string) => {
    setBinary(value)
    if (!value || !isValidNumber(value, 2)) {
      setDecimal('')
      setOctal('')
      setHex('')
      return
    }
    const num = BigInt('0b' + value)
    setDecimal(num.toString())
    setOctal(num.toString(8))
    setHex(num.toString(16).toUpperCase())
  }

  const updateFromOctal = (value: string) => {
    setOctal(value)
    if (!value || !isValidNumber(value, 8)) {
      setDecimal('')
      setBinary('')
      setHex('')
      return
    }
    const num = BigInt('0o' + value)
    setDecimal(num.toString())
    setBinary(num.toString(2))
    setHex(num.toString(16).toUpperCase())
  }

  const updateFromHex = (value: string) => {
    setHex(value.toUpperCase())
    if (!value || !isValidNumber(value, 16)) {
      setDecimal('')
      setBinary('')
      setOctal('')
      return
    }
    const num = BigInt('0x' + value)
    setDecimal(num.toString())
    setBinary(num.toString(2))
    setOctal(num.toString(8))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatBinary = (bin: string): string => {
    if (!bin) return ''
    // Add spaces every 4 bits for readability
    const padded = bin.padStart(Math.ceil(bin.length / 4) * 4, '0')
    return padded.match(/.{1,4}/g)?.join(' ') || bin
  }

  const presets = [
    { label: '255', value: '255' },
    { label: '1024', value: '1024' },
    { label: '65535', value: '65535' },
    { label: '16777215', value: '16777215' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">进制转换</h1>
        <p className="text-muted-foreground mt-1">二进制、八进制、十进制、十六进制互转</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">常用:</span>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => updateFromDecimal(p.value)}
            className="px-2 py-1 text-xs bg-secondary rounded hover:bg-secondary/80 transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              十进制 <span className="text-muted-foreground">(Decimal)</span>
            </label>
            <button onClick={() => copyToClipboard(decimal)} className="p-1 hover:bg-accent rounded">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={decimal}
            onChange={(e) => updateFromDecimal(e.target.value.replace(/[^0-9-]/g, ''))}
            placeholder="输入十进制数..."
            className="w-full p-3 rounded-md border bg-background font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              二进制 <span className="text-muted-foreground">(Binary)</span>
            </label>
            <button onClick={() => copyToClipboard(binary)} className="p-1 hover:bg-accent rounded">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={binary}
            onChange={(e) => updateFromBinary(e.target.value.replace(/[^01]/g, ''))}
            placeholder="输入二进制数..."
            className="w-full p-3 rounded-md border bg-background font-mono text-sm"
          />
          {binary && (
            <div className="text-xs text-muted-foreground font-mono">
              格式化: {formatBinary(binary)}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              八进制 <span className="text-muted-foreground">(Octal)</span>
            </label>
            <button onClick={() => copyToClipboard(octal)} className="p-1 hover:bg-accent rounded">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={octal}
            onChange={(e) => updateFromOctal(e.target.value.replace(/[^0-7]/g, ''))}
            placeholder="输入八进制数..."
            className="w-full p-3 rounded-md border bg-background font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              十六进制 <span className="text-muted-foreground">(Hexadecimal)</span>
            </label>
            <button onClick={() => copyToClipboard(hex)} className="p-1 hover:bg-accent rounded">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={hex}
            onChange={(e) => updateFromHex(e.target.value.replace(/[^0-9a-fA-F]/g, ''))}
            placeholder="输入十六进制数..."
            className="w-full p-3 rounded-md border bg-background font-mono text-sm"
          />
          {hex && (
            <div className="text-xs text-muted-foreground font-mono">
              前缀形式: 0x{hex}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-secondary/50 rounded-lg">
        <h3 className="font-medium mb-2">进制对照表</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted-foreground">
                <th className="pr-4">十进制</th>
                <th className="pr-4">二进制</th>
                <th className="pr-4">八进制</th>
                <th>十六进制</th>
              </tr>
            </thead>
            <tbody className="font-mono">
              {[0, 1, 2, 8, 10, 15, 16].map(n => (
                <tr key={n}>
                  <td className="pr-4">{n}</td>
                  <td className="pr-4">{n.toString(2)}</td>
                  <td className="pr-4">{n.toString(8)}</td>
                  <td>{n.toString(16).toUpperCase()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
