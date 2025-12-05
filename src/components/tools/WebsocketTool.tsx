import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Send, Trash2, Activity, Plug, Unplug } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogMessage {
  id: number
  type: 'sent' | 'received' | 'info' | 'error'
  content: string
  timestamp: number
}

export function WebsocketTool() {
  const [url, setUrl] = useState('wss://echo.websocket.org')
  const [isConnected, setIsConnected] = useState(false)
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected')
  const [messages, setMessages] = useState<LogMessage[]>([])
  const [inputMsg, setInputMsg] = useState('')
  const wsRef = useRef<WebSocket | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const addLog = (type: LogMessage['type'], content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type,
      content,
      timestamp: Date.now()
    }])
  }

  const connect = () => {
    if (isConnected) {
      wsRef.current?.close()
      return
    }

    if (!url) return

    try {
      setStatus('connecting')
      const ws = new WebSocket(url)
      wsRef.current = ws

      ws.onopen = () => {
        setIsConnected(true)
        setStatus('connected')
        addLog('info', `Connected to ${url}`)
      }

      ws.onclose = () => {
        setIsConnected(false)
        setStatus('disconnected')
        addLog('info', 'Disconnected')
        wsRef.current = null
      }

      ws.onerror = () => {
        addLog('error', 'Connection Error')
        // ws.close() automatically fires after error usually
      }

      ws.onmessage = (event) => {
        addLog('received', event.data)
      }
    } catch (e) {
      addLog('error', `Invalid URL: ${(e as Error).message}`)
      setStatus('disconnected')
    }
  }

  const sendMessage = () => {
    if (!inputMsg || !wsRef.current || !isConnected) return
    
    try {
      wsRef.current.send(inputMsg)
      addLog('sent', inputMsg)
      setInputMsg('')
    } catch (e) {
      addLog('error', `Send failed: ${(e as Error).message}`)
    }
  }

  const clearLogs = () => {
    setMessages([])
  }

  const formatTime = (ts: number) => {
    // @ts-ignore - fractionalSecondDigits is standard in newer environments but TS might complain
    return new Date(ts).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="h-full flex flex-col gap-4 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">WebSocket 测试工具</h2>
          <p className="text-sm text-muted-foreground">WebSocket 连接调试与消息收发</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors",
            status === 'connected' ? "bg-green-100 text-green-700" :
            status === 'connecting' ? "bg-yellow-100 text-yellow-700" :
            "bg-red-100 text-red-700"
          )}>
            <Activity className={cn("w-3 h-3", status === 'connecting' && "animate-spin")} />
            {status === 'connected' ? '已连接' : status === 'connecting' ? '连接中...' : '未连接'}
          </div>
        </div>
      </div>

      {/* Connection Bar */}
      <div className="flex gap-3">
        <Input 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="ws://example.com/socket"
          className="flex-1 font-mono"
          disabled={isConnected}
        />
        <Button 
          onClick={connect} 
          variant={isConnected ? "destructive" : "default"}
          className="w-32"
        >
          {isConnected ? (
            <>
              <Unplug className="w-4 h-4 mr-2" /> 断开
            </>
          ) : (
            <>
              <Plug className="w-4 h-4 mr-2" /> 连接
            </>
          )}
        </Button>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col border rounded-lg overflow-hidden bg-background shadow-sm">
        {/* Logs */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-2 bg-muted/10 font-mono text-sm scroll-smooth"
        >
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              暂无消息记录
            </div>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className="flex gap-3 group animate-in fade-in slide-in-from-bottom-1 duration-200">
              <div className="text-xs text-muted-foreground min-w-[85px] select-none pt-0.5">
                [{formatTime(msg.timestamp)}]
              </div>
              <div className={cn(
                "flex-1 break-all",
                msg.type === 'sent' ? "text-blue-600 dark:text-blue-400" :
                msg.type === 'received' ? "text-green-600 dark:text-green-400" :
                msg.type === 'error' ? "text-red-600 dark:text-red-400" :
                "text-muted-foreground italic"
              )}>
                {msg.type === 'sent' && <span className="font-bold mr-2">→ 发送:</span>}
                {msg.type === 'received' && <span className="font-bold mr-2">← 接收:</span>}
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t bg-background">
          <div className="flex gap-3">
            <Textarea 
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder="输入要发送的消息..."
              className="min-h-[80px] resize-none font-mono text-sm"
              disabled={!isConnected}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
            <div className="flex flex-col gap-2">
              <Button 
                onClick={sendMessage} 
                disabled={!isConnected || !inputMsg}
                className="h-full px-6"
              >
                <Send className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={clearLogs}
                title="清空日志"
                className="h-10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
