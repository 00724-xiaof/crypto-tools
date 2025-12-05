import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { EyeOff, Copy, Check, ArrowRight } from 'lucide-react'

interface MaskRule {
  id: string
  name: string
  pattern: RegExp
  mask: (match: string) => string
  enabled: boolean
}

const DEFAULT_RULES: MaskRule[] = [
  {
    id: 'phone',
    name: '手机号码',
    pattern: /1[3-9]\d{9}/g,
    mask: (m) => m.slice(0, 3) + '****' + m.slice(7),
    enabled: true
  },
  {
    id: 'idcard',
    name: '身份证号',
    pattern: /\d{17}[\dXx]/g,
    mask: (m) => m.slice(0, 6) + '********' + m.slice(14),
    enabled: true
  },
  {
    id: 'email',
    name: '邮箱地址',
    pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    mask: (m) => {
      const [local, domain] = m.split('@')
      const maskedLocal = local.length > 2 
        ? local[0] + '***' + local[local.length - 1]
        : '***'
      return maskedLocal + '@' + domain
    },
    enabled: true
  },
  {
    id: 'bankcard',
    name: '银行卡号',
    pattern: /\d{16,19}/g,
    mask: (m) => m.slice(0, 4) + ' **** **** ' + m.slice(-4),
    enabled: true
  },
  {
    id: 'name',
    name: '中文姓名',
    pattern: /[\u4e00-\u9fa5]{2,4}/g,
    mask: (m) => m[0] + '*'.repeat(m.length - 1),
    enabled: false
  },
  {
    id: 'ip',
    name: 'IP地址',
    pattern: /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g,
    mask: (m) => {
      const parts = m.split('.')
      return parts[0] + '.***.***.' + parts[3]
    },
    enabled: true
  },
  {
    id: 'address',
    name: '详细地址',
    pattern: /([\u4e00-\u9fa5]+(?:省|市|区|县|镇|村|路|街|号|栋|单元|室|楼)[\u4e00-\u9fa5\d]*)/g,
    mask: (m) => m.slice(0, Math.min(6, m.length)) + '****',
    enabled: false
  }
]

export function DataMaskTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [rules, setRules] = useState<MaskRule[]>(DEFAULT_RULES)
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState<Record<string, number>>({})

  const toggleRule = (id: string) => {
    setRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r))
  }

  const maskData = () => {
    let result = input
    const newStats: Record<string, number> = {}

    rules.filter(r => r.enabled).forEach(rule => {
      const matches = result.match(rule.pattern)
      if (matches) {
        newStats[rule.id] = matches.length
        result = result.replace(rule.pattern, rule.mask)
      }
    })

    setOutput(result)
    setStats(newStats)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalMasked = Object.values(stats).reduce((a, b) => a + b, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <EyeOff className="w-5 h-5" />
          敏感信息脱敏
        </h2>
        <p className="text-sm text-muted-foreground">自动识别并脱敏敏感数据</p>
      </div>

      {/* 规则选择 */}
      <div className="space-y-2">
        <Label>脱敏规则</Label>
        <div className="flex flex-wrap gap-2">
          {rules.map(rule => (
            <button
              key={rule.id}
              onClick={() => toggleRule(rule.id)}
              className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                rule.enabled 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
              }`}
            >
              {rule.name}
              {stats[rule.id] && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                  {stats[rule.id]}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 输入 */}
        <div className="space-y-2">
          <Label>原始数据</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`粘贴包含敏感信息的文本...

示例：
用户张三，手机号13812345678，
身份证号110101199001011234，
邮箱zhangsan@example.com`}
            className="h-[300px] font-mono text-sm resize-none"
          />
        </div>

        {/* 输出 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>脱敏结果</Label>
            <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? '已复制' : '复制'}
            </Button>
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="脱敏后的数据将显示在这里..."
            className="h-[300px] font-mono text-sm resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={maskData} disabled={!input.trim()}>
          <ArrowRight className="w-4 h-4 mr-2" />
          执行脱敏
        </Button>
        {totalMasked > 0 && (
          <span className="text-sm text-muted-foreground">
            共脱敏 <span className="font-medium text-foreground">{totalMasked}</span> 处敏感信息
          </span>
        )}
      </div>

      {/* 规则说明 */}
      <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg space-y-1">
        <p className="font-medium">脱敏规则说明：</p>
        <p>• 手机号：保留前3后4位，如 138****5678</p>
        <p>• 身份证：保留前6后4位，如 110101********1234</p>
        <p>• 邮箱：用户名脱敏，如 z***n@example.com</p>
        <p>• 银行卡：保留前4后4位，如 6222 **** **** 1234</p>
        <p>• IP地址：保留首尾段，如 192.***.***. 1</p>
      </div>
    </div>
  )
}
