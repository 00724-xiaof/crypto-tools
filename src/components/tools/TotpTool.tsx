import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Shield, Copy, Check, Loader2 } from 'lucide-react'

export function TotpTool() {
  const [secret, setSecret] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const getCode = async () => {
    if (!secret.trim()) return
    
    setLoading(true)
    setError('')
    setResult('')

    try {
      const cleanSecret = secret.trim().replace(/\s/g, '').toUpperCase()
      const response = await fetch(`https://2fa.cn/codes/${cleanSecret}`)
      
      if (!response.ok) {
        throw new Error('请求失败')
      }
      
      const data = await response.json()
      setResult(`${data.ostring}| ${data.code}`)
    } catch (e: any) {
      setError(e.message || '获取验证码失败')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Shield className="w-5 h-5" />
          2FA 验证码
        </h2>
        <p className="text-sm text-muted-foreground">获取两步验证码</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>2FA Secret</Label>
          <Textarea
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            placeholder="输入 2FA 密钥..."
            className="font-mono resize-none h-24"
          />
        </div>

        <Button onClick={getCode} disabled={loading || !secret.trim()}>
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Submit
        </Button>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label>2FA Code</Label>
          <Textarea
            value={result}
            readOnly
            placeholder="验证码将显示在这里..."
            className="font-mono resize-none h-24"
          />
        </div>

        <Button onClick={handleCopy} disabled={!result}>
          {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
    </div>
  )
}
