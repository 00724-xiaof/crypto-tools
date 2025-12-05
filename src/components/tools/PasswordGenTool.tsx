import { useState } from 'react'
import { Copy, RefreshCw } from 'lucide-react'

const CHAR_SETS = {
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
}

export function PasswordGenTool() {
  const [length, setLength] = useState(16)
  const [options, setOptions] = useState({
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
  })
  const [_password, setPassword] = useState('')
  const [count, setCount] = useState(1)
  const [passwords, setPasswords] = useState<string[]>([])

  const generatePassword = () => {
    let chars = ''
    if (options.lowercase) chars += CHAR_SETS.lowercase
    if (options.uppercase) chars += CHAR_SETS.uppercase
    if (options.numbers) chars += CHAR_SETS.numbers
    if (options.symbols) chars += CHAR_SETS.symbols

    if (!chars) {
      setPassword('')
      setPasswords([])
      return
    }

    const generated: string[] = []
    for (let j = 0; j < count; j++) {
      let pwd = ''
      const array = new Uint32Array(length)
      crypto.getRandomValues(array)
      for (let i = 0; i < length; i++) {
        pwd += chars[array[i] % chars.length]
      }
      generated.push(pwd)
    }
    
    setPassword(generated[0])
    setPasswords(generated)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const copyAll = () => {
    navigator.clipboard.writeText(passwords.join('\n'))
  }

  const getStrength = () => {
    let chars = 0
    if (options.lowercase) chars += 26
    if (options.uppercase) chars += 26
    if (options.numbers) chars += 10
    if (options.symbols) chars += 28
    
    const entropy = Math.log2(Math.pow(chars, length))
    if (entropy < 40) return { label: '弱', color: 'text-red-500', bg: 'bg-red-500' }
    if (entropy < 60) return { label: '中', color: 'text-yellow-500', bg: 'bg-yellow-500' }
    if (entropy < 80) return { label: '强', color: 'text-green-500', bg: 'bg-green-500' }
    return { label: '很强', color: 'text-emerald-500', bg: 'bg-emerald-500' }
  }

  const strength = getStrength()

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">密码生成器</h2>
      <p className="text-sm text-muted-foreground">
        生成安全的随机密码，使用加密安全的随机数生成器
      </p>

      <div className="space-y-4 p-4 rounded-lg bg-secondary">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">密码长度: {length}</label>
            <span className={`text-sm font-medium ${strength.color}`}>{strength.label}</span>
          </div>
          <input
            type="range"
            min="4"
            max="64"
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full"
          />
          <div className="h-1 rounded-full bg-muted overflow-hidden">
            <div 
              className={`h-full transition-all ${strength.bg}`}
              style={{ width: `${Math.min(100, (length / 64) * 100)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {Object.entries(options).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => setOptions({ ...options, [key]: e.target.checked })}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm">
                {key === 'lowercase' && '小写字母 (a-z)'}
                {key === 'uppercase' && '大写字母 (A-Z)'}
                {key === 'numbers' && '数字 (0-9)'}
                {key === 'symbols' && '特殊符号 (!@#$...)'}
              </span>
            </label>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">生成数量</label>
          <input
            type="number"
            min="1"
            max="20"
            value={count}
            onChange={(e) => setCount(Math.min(20, Math.max(1, Number(e.target.value))))}
            className="w-full p-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <button
        onClick={generatePassword}
        className="w-full py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
      >
        <RefreshCw className="w-4 h-4" />
        生成密码
      </button>

      {passwords.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">生成结果</label>
            {passwords.length > 1 && (
              <button
                onClick={copyAll}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                复制全部
              </button>
            )}
          </div>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {passwords.map((pwd, i) => (
              <div key={i} className="flex items-center gap-2 p-3 rounded-lg bg-muted">
                <code className="flex-1 font-mono text-sm break-all">{pwd}</code>
                <button
                  onClick={() => copyToClipboard(pwd)}
                  className="p-1 rounded hover:bg-secondary transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
