import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Lock, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function SslCertTool() {
  const [pem, setPem] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const parseCert = async () => {
    if (!pem.trim()) return
    
    try {
      setError('')
      setResult(null)
      
      // @ts-ignore
      if (!window.electronAPI) {
        setError('此功能需要在 Electron 环境下运行')
        return
      }

      // @ts-ignore
      const res = await window.electronAPI.sslDecode(pem)
      
      if (res.error) {
        setError(res.error)
      } else {
        setResult(res)
      }
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="flex flex-col gap-2">
        <Label>SSL 证书内容 (PEM 格式)</Label>
        <Textarea
          className="font-mono text-xs h-32"
          placeholder="-----BEGIN CERTIFICATE-----..."
          value={pem}
          onChange={(e) => setPem(e.target.value)}
        />
        <Button onClick={parseCert} disabled={!pem}>
          <Lock className="w-4 h-4 mr-2" />
          解析证书
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>解析失败</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="flex-1 overflow-auto space-y-4 border rounded-lg p-4 bg-muted/10">
          <div className="grid grid-cols-1 gap-4">
            <Section title="颁发给 (Subject)" data={result.subject} />
            <Section title="颁发者 (Issuer)" data={result.issuer} />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">有效期开始</h4>
                <div className="text-sm font-mono">{result.validFrom}</div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">有效期结束</h4>
                <div className="text-sm font-mono">{result.validTo}</div>
              </div>
            </div>
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">指纹 (SHA-1)</h4>
                <div className="text-sm font-mono break-all">{result.fingerprint}</div>
            </div>
            <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">指纹 (SHA-256)</h4>
                <div className="text-sm font-mono break-all">{result.fingerprint256}</div>
            </div>
             <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">序列号</h4>
                <div className="text-sm font-mono break-all">{result.serialNumber}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Section({ title, data }: { title: string, data: string }) {
  if (!data) return null
  
  // Parse key=value pairs roughly for better display
  // e.g. CN=example.com\nO=Org
  const lines = data.split('\n').map(line => {
    const eq = line.indexOf('=')
    if (eq === -1) return { k: '', v: line }
    return { k: line.substring(0, eq), v: line.substring(eq + 1) }
  })

  return (
    <div>
      <h4 className="text-sm font-medium text-muted-foreground mb-1">{title}</h4>
      <div className="text-sm font-mono bg-background border rounded p-2 space-y-1">
        {lines.length > 1 ? (
          lines.map((line, i) => (
             <div key={i} className="flex gap-2">
               {line.k && <span className="text-muted-foreground w-8 text-right">{line.k}:</span>}
               <span>{line.v}</span>
             </div>
          ))
        ) : (
           <div>{data}</div>
        )}
      </div>
    </div>
  )
}
