import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, Trash2, RefreshCw, Search } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ProcessInfo {
  protocol: string
  port: string
  pid: string
  command?: string
}

export function PortManagerTool() {
  const [processes, setProcesses] = useState<ProcessInfo[]>([])
  const [filteredProcesses, setFilteredProcesses] = useState<ProcessInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    scanPorts()
  }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFilteredProcesses(processes)
    } else {
      setFilteredProcesses(processes.filter(p => 
        p.port.includes(search) || 
        p.pid.includes(search) || 
        p.protocol.toLowerCase().includes(search.toLowerCase())
      ))
    }
  }, [search, processes])

  const scanPorts = async () => {
    try {
      setLoading(true)
      setError('')
      
      // @ts-ignore
      if (!window.electronAPI) {
        setError('此功能需要在 Electron 环境下运行')
        setLoading(false)
        return
      }

      // @ts-ignore
      const res = await window.electronAPI.getActivePorts()
      
      if (res.error) {
        setError(res.error)
      } else {
        setProcesses(res.processes || [])
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const killProcess = async (pid: string) => {
    if (!confirm(`确定要结束进程 PID: ${pid} 吗？`)) return
    
    try {
      // @ts-ignore
      const res = await window.electronAPI.killProcess(pid)
      
      if (res.error) {
        alert(`操作失败: ${res.error}`)
      } else {
        // Refresh list
        scanPorts()
      }
    } catch (e: any) {
      alert(`操作失败: ${e.message}`)
    }
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center gap-2 bg-secondary/50 rounded-md px-3 py-1">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input 
            className="flex-1 bg-transparent border-0 focus:outline-none text-sm"
            placeholder="搜索端口或 PID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button onClick={scanPorts} disabled={loading} variant="outline" size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          刷新
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>扫描出错</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex-1 overflow-auto border rounded-lg">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted sticky top-0 z-10">
            <tr>
              <th className="p-3 font-medium text-muted-foreground">端口</th>
              <th className="p-3 font-medium text-muted-foreground">PID</th>
              <th className="p-3 font-medium text-muted-foreground">协议</th>
              <th className="p-3 font-medium text-muted-foreground text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredProcesses.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-muted-foreground">
                  {loading ? '扫描中...' : '未找到活跃端口'}
                </td>
              </tr>
            ) : (
              filteredProcesses.map((p, i) => (
                <tr key={i} className="hover:bg-muted/50 transition-colors">
                  <td className="p-3 font-mono font-medium text-primary">{p.port}</td>
                  <td className="p-3 font-mono text-muted-foreground">{p.pid}</td>
                  <td className="p-3 text-muted-foreground">{p.protocol}</td>
                  <td className="p-3 text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => killProcess(p.pid)}
                      title="结束进程"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      <div className="text-xs text-muted-foreground text-center">
        共找到 {filteredProcesses.length} 个监听端口
      </div>
    </div>
  )
}
