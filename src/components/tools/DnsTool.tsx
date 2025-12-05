import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Globe, Search, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function DnsTool() {
  const [domain, setDomain] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const lookup = async () => {
    if (!domain.trim()) return
    
    try {
      setLoading(true)
      setError('')
      setResult(null)
      
      // @ts-ignore
      if (!window.electronAPI) {
        setError('此功能需要在 Electron 环境下运行')
        setLoading(false)
        return
      }

      // @ts-ignore
      const res = await window.electronAPI.dnsLookup(domain)
      
      if (res.error) {
        setError(res.error)
      } else {
        setResult(res)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <Label>域名 (Domain)</Label>
        <div className="flex gap-2">
          <Input
            className="font-mono flex-1"
            placeholder="google.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && lookup()}
          />
          <Button onClick={lookup} disabled={!domain || loading}>
            <Search className="w-4 h-4 mr-2" />
            查询 A 记录
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>查询失败</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="p-4 border rounded-lg bg-muted/10">
          <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
            <Globe className="w-4 h-4" />
            查询结果
          </h4>
          <div className="space-y-1">
             {result.addresses && result.addresses.map((ip: string, i: number) => (
               <div key={i} className="font-mono text-sm bg-background p-2 border rounded">
                 {ip}
               </div>
             ))}
             {(!result.addresses || result.addresses.length === 0) && (
                <div className="text-sm text-muted-foreground">未找到记录</div>
             )}
          </div>
        </div>
      )}
    </div>
  )
}
