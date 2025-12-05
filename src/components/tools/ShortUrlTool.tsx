import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Link2, Copy, Check, ExternalLink, Loader2, ArrowRight } from 'lucide-react'

interface ExpandResult {
  shortUrl: string
  longUrl: string
  redirectChain: string[]
}

export function ShortUrlTool() {
  const [shortUrl, setShortUrl] = useState('')
  const [expandResult, setExpandResult] = useState<ExpandResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)

  const expandUrl = async () => {
    if (!shortUrl.trim()) return
    
    setLoading(true)
    setError('')
    setExpandResult(null)

    try {
      // 确保 URL 有协议
      let url = shortUrl.trim()
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url
      }

      // 使用 fetch 跟踪重定向
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow'
      })

      const finalUrl = response.url
      
      setExpandResult({
        shortUrl: url,
        longUrl: finalUrl,
        redirectChain: [url, finalUrl]
      })
    } catch (e: any) {
      // 如果直接请求失败，尝试通过后端或显示错误
      setError('无法解析该短链接，可能是跨域限制或链接无效')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 常见短链服务
  const shortUrlServices = [
    { name: 'bit.ly', domain: 'bit.ly' },
    { name: 't.co (Twitter)', domain: 't.co' },
    { name: 'tinyurl.com', domain: 'tinyurl.com' },
    { name: 'goo.gl', domain: 'goo.gl' },
    { name: 'is.gd', domain: 'is.gd' },
    { name: 'v.gd', domain: 'v.gd' },
    { name: 'ow.ly', domain: 'ow.ly' },
    { name: 'dwz.cn (百度)', domain: 'dwz.cn' },
    { name: 'url.cn (腾讯)', domain: 'url.cn' },
    { name: 'sohu.gg (搜狐)', domain: 'sohu.gg' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          短链解析
        </h2>
        <p className="text-sm text-muted-foreground">解析短链接，查看原始目标地址</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>短链接</Label>
          <div className="flex gap-2">
            <Input
              value={shortUrl}
              onChange={(e) => setShortUrl(e.target.value)}
              placeholder="输入短链接，如 bit.ly/xxxxx"
              onKeyDown={(e) => e.key === 'Enter' && expandUrl()}
            />
            <Button onClick={expandUrl} disabled={loading || !shortUrl.trim()}>
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4 mr-2" />
              )}
              解析
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        {expandResult && (
          <div className="space-y-4 p-4 border rounded-lg">
            <div className="space-y-2">
              <Label className="text-muted-foreground">短链接</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-muted rounded text-sm break-all">
                  {expandResult.shortUrl}
                </code>
              </div>
            </div>

            <div className="flex justify-center">
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <Label className="text-green-600">原始链接</Label>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-green-500/10 border border-green-500/30 rounded text-sm break-all">
                  {expandResult.longUrl}
                </code>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleCopy(expandResult.longUrl)}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => window.open(expandResult.longUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* URL 分析 */}
            <div className="pt-4 border-t space-y-2">
              <Label className="text-muted-foreground">URL 分析</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="p-2 bg-muted rounded">
                  <span className="text-muted-foreground">协议: </span>
                  <span className="font-mono">{new URL(expandResult.longUrl).protocol.replace(':', '')}</span>
                </div>
                <div className="p-2 bg-muted rounded">
                  <span className="text-muted-foreground">域名: </span>
                  <span className="font-mono">{new URL(expandResult.longUrl).hostname}</span>
                </div>
                <div className="p-2 bg-muted rounded col-span-2">
                  <span className="text-muted-foreground">路径: </span>
                  <span className="font-mono">{new URL(expandResult.longUrl).pathname || '/'}</span>
                </div>
                {new URL(expandResult.longUrl).search && (
                  <div className="p-2 bg-muted rounded col-span-2">
                    <span className="text-muted-foreground">参数: </span>
                    <span className="font-mono">{new URL(expandResult.longUrl).search}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 常见短链服务 */}
        <div className="space-y-2">
          <Label className="text-muted-foreground">常见短链服务</Label>
          <div className="flex flex-wrap gap-2">
            {shortUrlServices.map(service => (
              <span 
                key={service.domain}
                className="px-2 py-1 bg-secondary rounded text-xs font-mono"
              >
                {service.domain}
              </span>
            ))}
          </div>
        </div>

        {/* 提示 */}
        <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
          <p className="font-medium mb-1">💡 提示</p>
          <p>• 由于浏览器安全限制，部分短链可能无法直接解析</p>
          <p>• 建议在解析前确认链接来源的可信度</p>
          <p>• 某些短链服务可能需要登录才能查看统计信息</p>
        </div>
      </div>
    </div>
  )
}
