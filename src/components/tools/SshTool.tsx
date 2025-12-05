import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Terminal, Wifi, WifiOff, Trash2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface SshConfig {
  host: string
  port: number
  username: string
  password: string
}

export function SshTool() {
  const [config, setConfig] = useState<SshConfig>({
    host: '',
    port: 22,
    username: '',
    password: ''
  })
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [output, setOutput] = useState<string[]>([])
  const [command, setCommand] = useState('')
  const [commandHistory, setCommandHistory] = useState<string[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [currentPath, setCurrentPath] = useState('~')
  const terminalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [output])

  const handleConnect = async () => {
    if (!config.host || !config.username || !config.password) {
      setError('请填写完整的连接信息')
      return
    }

    setConnecting(true)
    setError('')
    
    try {
      const result = await window.electronAPI.sshConnect(config)
      if (result.success && result.sessionId) {
        setConnected(true)
        setSessionId(result.sessionId)
        setOutput([`已连接到 ${config.username}@${config.host}:${config.port}`])
        
        // 获取初始路径
        const pwdResult = await window.electronAPI.sshExecute(result.sessionId, 'pwd')
        if (pwdResult.success && pwdResult.output) {
          setCurrentPath(pwdResult.output.trim())
        }
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
      try {
        await window.electronAPI.sshDisconnect(sessionId)
      } catch (e) {
        console.error('Disconnect error:', e)
      }
    }
    setConnected(false)
    setSessionId('')
    setOutput([])
    setCurrentPath('~')
  }

  const handleExecute = async () => {
    if (!command.trim() || !sessionId) return

    const cmd = command
    const prompt = `${config.username}@${config.host}:${currentPath} $`
    setOutput(prev => [...prev, `${prompt} ${cmd}`])
    setCommandHistory(prev => [...prev, cmd])
    setCommand('')
    setHistoryIndex(-1)

    try {
      // 构造带路径记忆的复合命令
      // 1. cd 到当前路径
      // 2. 执行用户命令
      // 3. 打印分隔符
      // 4. 打印最新路径
      const delimiter = '___CWD_DELIMITER___'
      const fullCmd = `cd "${currentPath}" && ${cmd}; echo "${delimiter}"; pwd`
      
      const result = await window.electronAPI.sshExecute(sessionId, fullCmd)
      
      if (result.success && result.output !== undefined) {
        // 解析输出，分离命令输出和新路径
        const parts = (result.output as string).split(delimiter)
        if (parts.length >= 2) {
          const cmdOutput = parts[0].trimEnd()
          const newPath = parts[1].trim()
          
          if (cmdOutput) {
            setOutput(prev => [...prev, cmdOutput])
          }
          if (newPath) {
            setCurrentPath(newPath)
          }
        } else {
          // 如果没有分隔符，说明可能出错了或者命令输出格式异常，直接显示全部
          setOutput(prev => [...prev, result.output as string])
        }
      } else {
        setOutput(prev => [...prev, `错误: ${result.error}`])
      }
    } catch (e: any) {
      setOutput(prev => [...prev, `错误: ${e.message}`])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleExecute()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 
          ? commandHistory.length - 1 
          : Math.max(0, historyIndex - 1)
        setHistoryIndex(newIndex)
        setCommand(commandHistory[newIndex])
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1)
          setCommand('')
        } else {
          setHistoryIndex(newIndex)
          setCommand(commandHistory[newIndex])
        }
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault()
      setOutput([])
    } else if (e.key === 'Tab') {
      e.preventDefault()
      // Tab键被禁用，因为命令自动补全需要服务器支持
      // 未来可以实现本地命令历史补全
    }
  }

  const clearOutput = () => {
    setOutput([])
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Terminal className="w-5 h-5" />
            SSH 终端
          </h2>
          <p className="text-sm text-muted-foreground">连接到远程服务器并执行命令</p>
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
              placeholder="例如: 192.168.1.100"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>端口</Label>
            <Input
              type="number"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 22 })}
            />
          </div>
          <div className="space-y-2">
            <Label>用户名</Label>
            <Input
              placeholder="例如: root"
              value={config.username}
              onChange={(e) => setConfig({ ...config, username: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>密码</Label>
            <Input
              type="password"
              value={config.password}
              onChange={(e) => setConfig({ ...config, password: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <Button onClick={handleConnect} disabled={connecting} className="w-full">
              {connecting ? '连接中...' : '连接'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-2 min-h-0">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {config.username}@{config.host}:{config.port}
            </span>
            <Button variant="ghost" size="sm" onClick={clearOutput}>
              <Trash2 className="w-4 h-4 mr-2" />
              清空
            </Button>
          </div>
          
          <div 
            ref={terminalRef}
            className="flex-1 bg-slate-900 text-slate-100 p-4 rounded-lg overflow-y-auto font-mono text-sm leading-relaxed min-h-0 border border-slate-700"
            onClick={() => document.getElementById('ssh-input')?.focus()}
          >
            {output.map((line, i) => (
              <div key={i} className="whitespace-pre-wrap break-words">
                {line}
              </div>
            ))}
            {/* 当前输入行 */}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-green-400 font-semibold whitespace-nowrap">
                {config.username}@{config.host}:{currentPath} $
              </span>
              <input
                id="ssh-input"
                type="text"
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent border-none outline-none text-slate-100 font-mono min-w-[50px]"
                placeholder=""
                autoFocus
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
