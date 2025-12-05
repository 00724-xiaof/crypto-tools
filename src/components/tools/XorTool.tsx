import { useState } from 'react'
import { Copy } from 'lucide-react'

function xorEncrypt(text: string, key: string): string {
  if (!key) return text
  const result: number[] = []
  for (let i = 0; i < text.length; i++) {
    result.push(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return result.map(c => c.toString(16).padStart(2, '0')).join('')
}

function xorDecrypt(hex: string, key: string): string {
  if (!key || hex.length % 2 !== 0) return ''
  const bytes: number[] = []
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16))
  }
  return bytes.map((b, i) => String.fromCharCode(b ^ key.charCodeAt(i % key.length))).join('')
}

export function XorTool() {
  const [input, setInput] = useState('')
  const [key, setKey] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [error, setError] = useState('')

  const handleConvert = () => {
    setError('')
    if (!key) {
      setError('请输入密钥')
      return
    }
    try {
      if (mode === 'encrypt') {
        setOutput(xorEncrypt(input, key))
      } else {
        setOutput(xorDecrypt(input, key))
      }
    } catch (e) {
      setError('转换失败，请检查输入格式')
      setOutput('')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">XOR 加密/解密</h2>
      <p className="text-sm text-muted-foreground">
        XOR 是一种简单的对称加密，相同的操作可用于加密和解密
      </p>

      <div className="flex gap-2">
        <button
          onClick={() => setMode('encrypt')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mode === 'encrypt' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent'
          }`}
        >
          加密
        </button>
        <button
          onClick={() => setMode('decrypt')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mode === 'decrypt' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent'
          }`}
        >
          解密
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">密钥</label>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="输入密钥..."
          className="w-full p-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {mode === 'encrypt' ? '明文' : '密文 (Hex)'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encrypt' ? '输入要加密的文本...' : '输入十六进制密文...'}
          className="w-full h-32 p-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
        />
      </div>

      <button
        onClick={handleConvert}
        className="w-full py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
      >
        {mode === 'encrypt' ? '加密' : '解密'}
      </button>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            {mode === 'encrypt' ? '密文 (Hex)' : '明文'}
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
