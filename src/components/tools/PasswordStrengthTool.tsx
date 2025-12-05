import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShieldCheck, Eye, EyeOff, Check, X, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

// 常见弱密码列表
const COMMON_PASSWORDS = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', 'master',
  'dragon', '111111', 'baseball', 'iloveyou', 'trustno1', 'sunshine', 'princess',
  'admin', 'welcome', 'shadow', 'superman', 'michael', 'football', 'password1',
  '123456789', '12345', '1234567', 'letmein', '1234567890', '000000', 'passw0rd'
]

// 键盘序列
const KEYBOARD_PATTERNS = [
  'qwerty', 'qwertyuiop', 'asdfgh', 'asdfghjkl', 'zxcvbn', 'zxcvbnm',
  '1234567890', '0987654321', 'qazwsx', 'wsxedc'
]

interface StrengthResult {
  score: number // 0-100
  level: 'weak' | 'fair' | 'good' | 'strong' | 'excellent'
  label: string
  color: string
  suggestions: string[]
  checks: {
    length: boolean
    lowercase: boolean
    uppercase: boolean
    numbers: boolean
    symbols: boolean
    noCommon: boolean
    noRepeats: boolean
    noSequence: boolean
  }
  crackTime: string
}

function analyzePassword(password: string): StrengthResult {
  const checks = {
    length: password.length >= 8,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    numbers: /[0-9]/.test(password),
    symbols: /[^a-zA-Z0-9]/.test(password),
    noCommon: !COMMON_PASSWORDS.includes(password.toLowerCase()),
    noRepeats: !/(.)\1{2,}/.test(password),
    noSequence: !KEYBOARD_PATTERNS.some(p => password.toLowerCase().includes(p))
  }

  let score = 0
  const suggestions: string[] = []

  // 长度评分
  if (password.length === 0) {
    return {
      score: 0,
      level: 'weak',
      label: '请输入密码',
      color: 'bg-gray-300',
      suggestions: [],
      checks,
      crackTime: '-'
    }
  }

  if (password.length >= 8) score += 15
  else suggestions.push('密码长度至少 8 位')
  
  if (password.length >= 12) score += 10
  if (password.length >= 16) score += 10

  // 字符类型评分
  if (checks.lowercase) score += 10
  else suggestions.push('添加小写字母')
  
  if (checks.uppercase) score += 10
  else suggestions.push('添加大写字母')
  
  if (checks.numbers) score += 10
  else suggestions.push('添加数字')
  
  if (checks.symbols) score += 15
  else suggestions.push('添加特殊符号 (!@#$%^&*)')

  // 安全性评分
  if (checks.noCommon) score += 10
  else suggestions.push('避免使用常见密码')
  
  if (checks.noRepeats) score += 5
  else suggestions.push('避免连续重复字符')
  
  if (checks.noSequence) score += 5
  else suggestions.push('避免键盘序列')

  // 额外复杂度
  const uniqueChars = new Set(password).size
  if (uniqueChars >= password.length * 0.7) score += 5

  score = Math.min(100, score)

  // 计算破解时间估算
  let charset = 0
  if (checks.lowercase) charset += 26
  if (checks.uppercase) charset += 26
  if (checks.numbers) charset += 10
  if (checks.symbols) charset += 32

  const combinations = Math.pow(charset || 1, password.length)
  const guessesPerSecond = 10000000000 // 10 billion (假设高性能攻击)
  const seconds = combinations / guessesPerSecond

  let crackTime: string
  if (seconds < 1) crackTime = '瞬间'
  else if (seconds < 60) crackTime = `${Math.round(seconds)} 秒`
  else if (seconds < 3600) crackTime = `${Math.round(seconds / 60)} 分钟`
  else if (seconds < 86400) crackTime = `${Math.round(seconds / 3600)} 小时`
  else if (seconds < 31536000) crackTime = `${Math.round(seconds / 86400)} 天`
  else if (seconds < 31536000 * 100) crackTime = `${Math.round(seconds / 31536000)} 年`
  else if (seconds < 31536000 * 1000000) crackTime = `${Math.round(seconds / 31536000 / 1000)} 千年`
  else crackTime = '数百万年+'

  // 确定等级
  let level: StrengthResult['level']
  let label: string
  let color: string

  if (score < 20) {
    level = 'weak'; label = '非常弱'; color = 'bg-red-500'
  } else if (score < 40) {
    level = 'fair'; label = '较弱'; color = 'bg-orange-500'
  } else if (score < 60) {
    level = 'good'; label = '一般'; color = 'bg-yellow-500'
  } else if (score < 80) {
    level = 'strong'; label = '较强'; color = 'bg-lime-500'
  } else {
    level = 'excellent'; label = '非常强'; color = 'bg-green-500'
  }

  return { score, level, label, color, suggestions, checks, crackTime }
}

export function PasswordStrengthTool() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const result = useMemo(() => analyzePassword(password), [password])

  const checkItems = [
    { key: 'length', label: '至少 8 个字符' },
    { key: 'lowercase', label: '包含小写字母 (a-z)' },
    { key: 'uppercase', label: '包含大写字母 (A-Z)' },
    { key: 'numbers', label: '包含数字 (0-9)' },
    { key: 'symbols', label: '包含特殊符号' },
    { key: 'noCommon', label: '非常见密码' },
    { key: 'noRepeats', label: '无连续重复字符' },
    { key: 'noSequence', label: '无键盘序列' },
  ] as const

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ShieldCheck className="w-5 h-5" />
          密码强度检测
        </h2>
        <p className="text-sm text-muted-foreground">检测密码安全性，提供改进建议</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>输入密码</Label>
          <div className="relative">
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="输入要检测的密码..."
              className="pr-10 font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 强度条 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>密码强度</span>
            <span className={cn(
              "font-medium",
              result.level === 'weak' && "text-red-500",
              result.level === 'fair' && "text-orange-500",
              result.level === 'good' && "text-yellow-500",
              result.level === 'strong' && "text-lime-500",
              result.level === 'excellent' && "text-green-500",
            )}>
              {result.label}
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className={cn("h-full transition-all duration-300", result.color)}
              style={{ width: `${result.score}%` }}
            />
          </div>
        </div>

        {/* 破解时间 */}
        {password && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">暴力破解预估时间</div>
            <div className="text-2xl font-bold">{result.crackTime}</div>
            <div className="text-xs text-muted-foreground mt-1">
              基于每秒 100 亿次猜测计算
            </div>
          </div>
        )}

        {/* 检查项 */}
        <div className="grid grid-cols-2 gap-2">
          {checkItems.map(item => (
            <div 
              key={item.key}
              className={cn(
                "flex items-center gap-2 p-2 rounded text-sm",
                result.checks[item.key] ? "text-green-600" : "text-muted-foreground"
              )}
            >
              {result.checks[item.key] ? (
                <Check className="w-4 h-4" />
              ) : (
                <X className="w-4 h-4" />
              )}
              {item.label}
            </div>
          ))}
        </div>

        {/* 改进建议 */}
        {result.suggestions.length > 0 && (
          <div className="p-4 border border-yellow-500/30 bg-yellow-500/10 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-600 font-medium mb-2">
              <AlertTriangle className="w-4 h-4" />
              改进建议
            </div>
            <ul className="space-y-1 text-sm">
              {result.suggestions.map((s, i) => (
                <li key={i} className="text-muted-foreground">• {s}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
