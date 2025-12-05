import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Database, Wifi, WifiOff, Trash2, Play } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface RedisConfig {
  host: string
  port: number
  password?: string
  db?: number
}

export function RedisTool() {
  const [config, setConfig] = useState<RedisConfig>({
    host: 'localhost',
    port: 6379,
    password: '',
    db: 0
  })
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [command, setCommand] = useState('')
  const [history, setHistory] = useState<{cmd: string, res: string, time: string}[]>([])
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [history])

  const handleConnect = async () => {
    if (!config.host) {
      setError('请填写主机地址')
      return
    }

    setConnecting(true)
    setError('')
    
    try {
      const result = await window.electronAPI.redisConnect(config)
      if (result.success && result.sessionId) {
        setConnected(true)
        setSessionId(result.sessionId)
        setHistory([{
          cmd: 'System', 
          res: `Connected to ${config.host}:${config.port}`,
          time: new Date().toLocaleTimeString()
        }])
      } else {
        setError(result.error || '连接失败')
      }
    } catch (e: any) {
      setError(e.message || '连接失败')
    } finally {
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    if (sessionId) {
      await window.electronAPI.redisDisconnect(sessionId)
      setConnected(false)
      setSessionId('')
      setHistory([])
    }
  }

  const handleExecute = async () => {
    if (!command.trim() || !sessionId) return
    
    const cmd = command
    setCommand('')
    setLoading(true)

    try {
      const result = await window.electronAPI.redisExecute(sessionId, cmd)
      setHistory(prev => [...prev, {
        cmd,
        res: result.success ? JSON.stringify(result.data, null, 2) : `Error: ${result.error}`,
        time: new Date().toLocaleTimeString()
      }])
    } catch (e: any) {
      setHistory(prev => [...prev, {
        cmd,
        res: `Error: ${e.message}`,
        time: new Date().toLocaleTimeString()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => {
    setHistory([])
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Database className="w-5 h-5" />
            Redis 终端
          </h2>
          <p className="text-sm text-muted-foreground">Redis键值数据库管理</p>
        </div>
        {connected && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-green-600">
              <Wifi className="w-4 h-4" />
              <span>已连接</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleDisconnect}>
              <WifiOff className="w-4 h-4 mr-2" />
              断开连接
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!connected ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>主机地址</Label>
            <Input
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>端口</Label>
            <Input
              type="number"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 6379 })}
            />
          </div>
          <div className="space-y-2">
            <Label>密码 (可选)</Label>
            <Input
              type="password"
              value={config.password}
              onChange={(e) => setConfig({ ...config, password: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>数据库索引</Label>
            <Input
              type="number"
              value={config.db}
              onChange={(e) => setConfig({ ...config, db: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="col-span-2">
            <Button onClick={handleConnect} disabled={connecting} className="w-full">
              {connecting ? '连接中...' : '连接'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div 
            ref={scrollRef}
            className="flex-1 bg-slate-900 text-slate-100 p-4 rounded-lg overflow-y-auto font-mono text-sm border border-slate-700"
          >
            {history.map((item, i) => (
              <div key={i} className="mb-4 last:mb-0">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span>{item.time}</span>
                  <span className="text-green-400">$ {item.cmd}</span>
                </div>
                <pre className="whitespace-pre-wrap break-words text-slate-300">
                  {item.res}
                </pre>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleExecute()}
              placeholder="输入Redis命令 (例如: SET key value, GET key)"
              className="font-mono"
              autoFocus
            />
            <Button onClick={handleExecute} disabled={loading || !command.trim()}>
              <Play className="w-4 h-4 mr-2" />
              执行
            </Button>
            <Button variant="outline" onClick={handleClear}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
