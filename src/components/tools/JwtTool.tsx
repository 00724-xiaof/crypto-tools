import { useState, useMemo } from 'react'
import { Copy, AlertCircle, CheckCircle } from 'lucide-react'

interface JwtPayload {
  [key: string]: unknown
  iat?: number
  exp?: number
  nbf?: number
}

export function JwtTool() {
  const [token, setToken] = useState('')

  const decoded = useMemo(() => {
    if (!token.trim()) return null

    try {
      const parts = token.split('.')
      if (parts.length !== 3) {
        return { error: 'Invalid JWT format: must have 3 parts' }
      }

      const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')))
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))) as JwtPayload
      const signature = parts[2]

      // Check expiration
      const now = Math.floor(Date.now() / 1000)
      let status = 'valid'
      if (payload.exp && payload.exp < now) {
        status = 'expired'
      } else if (payload.nbf && payload.nbf > now) {
        status = 'not_yet_valid'
      }

      return { header, payload, signature, status }
    } catch (e) {
      return { error: 'Failed to decode: ' + (e as Error).message }
    }
  }, [token])

  const formatTimestamp = (ts: number | undefined): string => {
    if (!ts) return '-'
    const date = new Date(ts * 1000)
    return date.toLocaleString('zh-CN')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const sampleTokens = [
    {
      name: 'Sample JWT',
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">JWT 解析</h1>
        <p className="text-muted-foreground mt-1">解析和验证 JSON Web Token</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="text-sm text-muted-foreground">示例:</span>
        {sampleTokens.map((s) => (
          <button
            key={s.name}
            onClick={() => setToken(s.token)}
            className="px-2 py-1 text-xs bg-secondary rounded hover:bg-secondary/80 transition-colors"
          >
            {s.name}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">JWT Token</label>
        <textarea
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="粘贴 JWT token..."
          className="w-full h-32 p-3 rounded-md border bg-background resize-none font-mono text-sm break-all"
        />
      </div>

      {decoded && !('error' in decoded) && (
        <>
          <div className="flex items-center gap-2">
            {decoded.status === 'valid' ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-green-600 dark:text-green-400">Token 有效</span>
              </>
            ) : decoded.status === 'expired' ? (
              <>
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-red-600 dark:text-red-400">Token 已过期</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-500" />
                <span className="text-yellow-600 dark:text-yellow-400">Token 尚未生效</span>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-red-500">Header</label>
                <button 
                  onClick={() => copyToClipboard(JSON.stringify(decoded.header, null, 2))}
                  className="p-1 hover:bg-accent rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="p-3 rounded-md border bg-red-500/10 text-sm font-mono overflow-x-auto">
                {JSON.stringify(decoded.header, null, 2)}
              </pre>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-purple-500">Payload</label>
                <button 
                  onClick={() => copyToClipboard(JSON.stringify(decoded.payload, null, 2))}
                  className="p-1 hover:bg-accent rounded"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              <pre className="p-3 rounded-md border bg-purple-500/10 text-sm font-mono overflow-x-auto">
                {JSON.stringify(decoded.payload, null, 2)}
              </pre>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-blue-500">Signature</label>
              <div className="p-3 rounded-md border bg-blue-500/10 text-sm font-mono break-all">
                {decoded.signature}
              </div>
            </div>

            {(decoded.payload.iat || decoded.payload.exp || decoded.payload.nbf) && (
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h3 className="font-medium mb-3">时间信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">签发时间 (iat):</span>
                    <div className="font-mono">{formatTimestamp(decoded.payload.iat)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">过期时间 (exp):</span>
                    <div className="font-mono">{formatTimestamp(decoded.payload.exp)}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">生效时间 (nbf):</span>
                    <div className="font-mono">{formatTimestamp(decoded.payload.nbf)}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {decoded && 'error' in decoded && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertCircle className="w-5 h-5" />
            <span>{decoded.error}</span>
          </div>
        </div>
      )}

      <div className="p-4 bg-secondary/50 rounded-lg">
        <h3 className="font-medium mb-2">关于JWT</h3>
        <p className="text-sm text-muted-foreground">
          JWT (JSON Web Token) 是一种开放标准，用于在各方之间安全地传输信息。
          它由三部分组成：Header（算法和类型）、Payload（数据）和 Signature（签名）。
        </p>
      </div>
    </div>
  )
}
