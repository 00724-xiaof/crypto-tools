import { useState } from 'react'
import { Copy, Check, X } from 'lucide-react'
import CryptoJS from 'crypto-js'

// 简化的 bcrypt 风格哈希（使用 PBKDF2 模拟，因为纯 JS 实现 bcrypt 较复杂）
// 实际生产环境应使用 bcryptjs 或后端 bcrypt

function generateSalt(rounds: number = 10): string {
  const saltBytes = new Uint8Array(16)
  crypto.getRandomValues(saltBytes)
  const saltHex = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('')
  return `$2a$${rounds.toString().padStart(2, '0')}$${saltHex}`
}

function hashPassword(password: string, salt: string): string {
  // 使用 PBKDF2 模拟 bcrypt 的迭代哈希
  const rounds = parseInt(salt.split('$')[2]) || 10
  const iterations = Math.pow(2, rounds)
  const saltValue = salt.split('$')[3] || ''
  
  const hash = CryptoJS.PBKDF2(password, saltValue, {
    keySize: 256 / 32,
    iterations: Math.min(iterations, 100000), // 限制最大迭代次数
    hasher: CryptoJS.algo.SHA256
  })
  
  return salt + hash.toString().substring(0, 31)
}

function verifyPassword(password: string, hash: string): boolean {
  try {
    const parts = hash.split('$')
    if (parts.length < 4) return false
    
    const salt = `$${parts[1]}$${parts[2]}$${parts[3]}`
    const newHash = hashPassword(password, salt)
    
    return newHash === hash
  } catch {
    return false
  }
}

// Scrypt 风格哈希（简化实现）
function scryptHash(password: string, salt: string, n: number = 16384, r: number = 8, p: number = 1): string {
  // 使用 PBKDF2 模拟 scrypt
  const hash = CryptoJS.PBKDF2(password, salt, {
    keySize: 256 / 32,
    iterations: n,
    hasher: CryptoJS.algo.SHA256
  })
  
  return `$scrypt$n=${n},r=${r},p=${p}$${salt}$${hash.toString()}`
}

export function BcryptTool() {
  const [mode, setMode] = useState<'hash' | 'verify'>('hash')
  const [algorithm, setAlgorithm] = useState<'bcrypt' | 'scrypt'>('bcrypt')
  const [password, setPassword] = useState('')
  const [hashToVerify, setHashToVerify] = useState('')
  const [output, setOutput] = useState('')
  const [rounds, setRounds] = useState(10)
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)

  const handleHash = async () => {
    if (!password) return
    
    setLoading(true)
    setOutput('')
    
    // 使用 setTimeout 让 UI 有机会更新
    setTimeout(() => {
      try {
        if (algorithm === 'bcrypt') {
          const salt = generateSalt(rounds)
          const hash = hashPassword(password, salt)
          setOutput(hash)
        } else {
          const saltBytes = new Uint8Array(16)
          crypto.getRandomValues(saltBytes)
          const salt = Array.from(saltBytes).map(b => b.toString(16).padStart(2, '0')).join('')
          const hash = scryptHash(password, salt, Math.pow(2, rounds))
          setOutput(hash)
        }
      } catch (e) {
        setOutput('哈希生成失败')
      }
      setLoading(false)
    }, 10)
  }

  const handleVerify = () => {
    if (!password || !hashToVerify) return
    
    setLoading(true)
    setVerifyResult(null)
    
    setTimeout(() => {
      try {
        if (hashToVerify.startsWith('$scrypt$')) {
          // Scrypt 验证
          const parts = hashToVerify.split('$')
          const params = parts[2]
          const salt = parts[3]
          const n = parseInt(params.match(/n=(\d+)/)?.[1] || '16384')
          const newHash = scryptHash(password, salt, n)
          setVerifyResult(newHash === hashToVerify)
        } else {
          // Bcrypt 验证
          setVerifyResult(verifyPassword(password, hashToVerify))
        }
      } catch {
        setVerifyResult(false)
      }
      setLoading(false)
    }, 10)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">密码哈希 (Bcrypt/Scrypt)</h2>
      <p className="text-sm text-muted-foreground">
        安全的密码哈希算法，适用于存储用户密码
      </p>

      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm">
        ℹ️ 这是基于 PBKDF2 的简化实现，生产环境建议使用 bcryptjs 库
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { setMode('hash'); setVerifyResult(null) }}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mode === 'hash' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent'
          }`}
        >
          生成哈希
        </button>
        <button
          onClick={() => { setMode('verify'); setOutput('') }}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mode === 'verify' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent'
          }`}
        >
          验证密码
        </button>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setAlgorithm('bcrypt')}
          className={`flex-1 py-1.5 rounded-lg text-sm transition-colors ${
            algorithm === 'bcrypt' ? 'bg-secondary ring-2 ring-primary' : 'bg-secondary hover:bg-accent'
          }`}
        >
          Bcrypt
        </button>
        <button
          onClick={() => setAlgorithm('scrypt')}
          className={`flex-1 py-1.5 rounded-lg text-sm transition-colors ${
            algorithm === 'scrypt' ? 'bg-secondary ring-2 ring-primary' : 'bg-secondary hover:bg-accent'
          }`}
        >
          Scrypt
        </button>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">密码</label>
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="输入密码..."
          className="w-full p-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {mode === 'hash' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Cost Factor (轮数): {rounds} 
            <span className="text-muted-foreground ml-2">
              (迭代 {algorithm === 'bcrypt' ? Math.pow(2, rounds).toLocaleString() : Math.pow(2, rounds).toLocaleString()} 次)
            </span>
          </label>
          <input
            type="range"
            min="4"
            max="14"
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            值越大越安全，但计算时间越长。推荐值: 10-12
          </p>
        </div>
      )}

      {mode === 'verify' && (
        <div className="space-y-2">
          <label className="text-sm font-medium">哈希值</label>
          <textarea
            value={hashToVerify}
            onChange={(e) => setHashToVerify(e.target.value)}
            placeholder="输入要验证的哈希值..."
            className="w-full h-24 p-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
          />
        </div>
      )}

      <button
        onClick={mode === 'hash' ? handleHash : handleVerify}
        disabled={loading}
        className="w-full py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? '计算中...' : mode === 'hash' ? '生成哈希' : '验证密码'}
      </button>

      {mode === 'hash' && output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">哈希结果</label>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <Copy className="w-4 h-4" />
              复制
            </button>
          </div>
          <textarea
            value={output}
            readOnly
            className="w-full h-24 p-3 rounded-lg bg-muted border border-border font-mono text-sm break-all"
          />
        </div>
      )}

      {mode === 'verify' && verifyResult !== null && (
        <div className={`p-4 rounded-lg flex items-center gap-3 ${
          verifyResult 
            ? 'bg-green-500/10 border border-green-500/20' 
            : 'bg-red-500/10 border border-red-500/20'
        }`}>
          {verifyResult ? (
            <>
              <Check className="w-6 h-6 text-green-500" />
              <span className="text-green-600 dark:text-green-400 font-medium">密码匹配！</span>
            </>
          ) : (
            <>
              <X className="w-6 h-6 text-red-500" />
              <span className="text-red-600 dark:text-red-400 font-medium">密码不匹配</span>
            </>
          )}
        </div>
      )}
    </div>
  )
}
