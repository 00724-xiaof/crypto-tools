import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Activity, CheckCircle2, XCircle, AlertCircle, Timer, Search, Terminal } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ProcessInfo {
  protocol: string
  port: string
  pid: string
  command?: string
}

export function PortCheckTool() {
  const [host, setHost] = useState('localhost')
  const [port, setPort] = useState('80')
  const [result, setResult] = useState<{ status: string, time?: number } | null>(null)
  const [processInfo, setProcessInfo] = useState<ProcessInfo | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const check = async () => {
    if (!host.trim() || !port.trim()) return
    
    try {
      setLoading(true)
      setError('')
      setResult(null)
      setProcessInfo(null)
      
      const startTime = Date.now()

      // @ts-ignore
      if (!window.electronAPI) {
        setError('此功能需要在 Electron 环境下运行')
        setLoading(false)
        return
      }

      // @ts-ignore
      const res = await window.electronAPI.checkPort(host, parseInt(port))
      const time = Date.now() - startTime
      
      if (res.error) {
        setError(res.error)
      } else {
        setResult({ ...res, time })
        
        // If port is open and host is localhost, try to find process info
        if (res.status === 'open' && (host === 'localhost' || host === '127.0.0.1')) {
            try {
                // @ts-ignore
                const portsRes = await window.electronAPI.getActivePorts()
                if (portsRes.processes) {
                    const proc = portsRes.processes.find((p: ProcessInfo) => p.port === port)
                    if (proc) {
                        setProcessInfo(proc)
                    }
                }
            } catch (e) {
                // Ignore process lookup error
                console.error(e)
            }
        }
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6">
      <div className="grid grid-cols-[2fr,1fr,auto] gap-4 items-end">
        <div className="flex flex-col gap-2">
          <Label>主机 (Host)</Label>
          <Input
            className="font-mono"
            placeholder="localhost"
            value={host}
            onChange={(e) => setHost(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && check()}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>端口 (Port)</Label>
          <Input
            className="font-mono"
            placeholder="80"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && check()}
          />
        </div>
        <Button onClick={check} disabled={!host || !port || loading} size="lg">
          {loading ? <Activity className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
          开始检测
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>检测出错</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {result && (
        <div className="flex flex-col gap-4">
            <div className={`flex items-center justify-between p-6 border rounded-lg ${
                result.status === 'open' ? 'bg-green-500/10 border-green-500/20' : 
                result.status === 'timeout' ? 'bg-orange-500/10 border-orange-500/20' : 
                'bg-red-500/10 border-red-500/20'
            }`}>
                <div className="flex items-center gap-4">
                    {result.status === 'open' && <CheckCircle2 className="w-8 h-8 text-green-600" />}
                    {result.status === 'closed' && <XCircle className="w-8 h-8 text-red-600" />}
                    {result.status === 'timeout' && <Timer className="w-8 h-8 text-orange-600" />}
                    
                    <div>
                        <div className={`text-xl font-bold ${
                            result.status === 'open' ? 'text-green-700' : 
                            result.status === 'timeout' ? 'text-orange-700' : 
                            'text-red-700'
                        }`}>
                            {result.status === 'open' ? '端口开放' : 
                             result.status === 'timeout' ? '连接超时' : 
                             '端口关闭 (或拒绝连接)'}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                            {host}:{port}
                        </div>
                    </div>
                </div>
                
                <div className="text-right">
                    <div className="text-2xl font-mono font-bold">{result.time}ms</div>
                    <div className="text-xs text-muted-foreground">响应时间</div>
                </div>
            </div>

            {result.status === 'open' && processInfo && (
                <div className="border rounded-lg p-4 bg-muted/30 space-y-3">
                    <h3 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                        <Terminal className="w-4 h-4" />
                        占用进程信息 (本地)
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-background p-3 rounded border">
                            <div className="text-xs text-muted-foreground mb-1">PID</div>
                            <div className="font-mono font-bold">{processInfo.pid}</div>
                        </div>
                        <div className="bg-background p-3 rounded border">
                            <div className="text-xs text-muted-foreground mb-1">协议</div>
                            <div className="font-mono">{processInfo.protocol}</div>
                        </div>
                        {processInfo.command && (
                             <div className="bg-background p-3 rounded border col-span-2">
                                <div className="text-xs text-muted-foreground mb-1">命令/进程名</div>
                                <div className="font-mono">{processInfo.command}</div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      )}
    </div>
  )
}
