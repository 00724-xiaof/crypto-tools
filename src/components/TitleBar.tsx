import { useState, useEffect } from 'react'
import { Minus, Square, X, Copy, RefreshCw, Sparkles, Github } from 'lucide-react'

declare global {
  interface Window {
    electronAPI: {
      minimize: () => void
      maximize: () => void
      close: () => void
      isMaximized: () => Promise<boolean>
      getHardwareInfo: () => Promise<unknown>
      openExternalLink: (url: string) => Promise<{ success: boolean; error?: string }>
      // SSH
      sshConnect: (config: any) => Promise<{ success: boolean; sessionId?: string; error?: string }>
      sshDisconnect: (sessionId: string) => Promise<{ success: boolean }>
      sshExecute: (sessionId: string, command: string) => Promise<{ success: boolean; output?: string; error?: string }>
      // FTP
      ftpConnect: (config: any) => Promise<{ success: boolean; sessionId?: string; error?: string }>
      ftpDisconnect: (sessionId: string) => Promise<{ success: boolean }>
      ftpList: (sessionId: string, path: string) => Promise<{ success: boolean; files?: any[]; error?: string }>
      ftpDownload: (sessionId: string, remotePath: string, fileName: string) => Promise<{ success: boolean; error?: string }>
      // Database
      dbConnect: (config: any) => Promise<{ success: boolean; sessionId?: string; error?: string }>
      dbDisconnect: (sessionId: string) => Promise<{ success: boolean }>
      dbExecute: (sessionId: string, sql: string) => Promise<{ success: boolean; data?: any[]; error?: string }>
      // Redis
      redisConnect: (config: any) => Promise<{ success: boolean; sessionId?: string; error?: string }>
      redisDisconnect: (sessionId: string) => Promise<{ success: boolean }>
      redisExecute: (sessionId: string, command: string) => Promise<{ success: boolean; data?: any; error?: string }>
    }
  }
}

interface Hitokoto {
  hitokoto: string
  from: string
  from_who: string | null
}

// 默认名言，加载时显示
const DEFAULT_QUOTES: Hitokoto[] = [
  { hitokoto: '代码如诗，安全如山', from: 'CipherLab', from_who: null },
  { hitokoto: '加密守护数据，解密开启智慧', from: 'CipherLab', from_who: null },
  { hitokoto: '在代码的世界里，每一个字符都有意义', from: 'CipherLab', from_who: null },
]

interface TitleBarProps {
  onAiClick?: () => void
  onHomeClick?: () => void
}

export function TitleBar({ onAiClick, onHomeClick }: TitleBarProps) {
  const [isMaximized, setIsMaximized] = useState(false)
  // 初始化时随机选择一条默认名言
  const [quote, setQuote] = useState<Hitokoto>(() => 
    DEFAULT_QUOTES[Math.floor(Math.random() * DEFAULT_QUOTES.length)]
  )
  const [isLoading, setIsLoading] = useState(true)

  // 获取一言
  const fetchQuote = async () => {
    setIsLoading(true)
    try {
      // 使用一言API，c=k表示哲学类，c=d表示文学类，c=i表示诗词
      const res = await fetch('https://v1.hitokoto.cn/?c=d&c=i&c=k&c=e&c=j&c=h&encode=json')
      const data = await res.json()
      setQuote(data)
    } catch (e) {
      console.error('获取一言失败:', e)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const checkMaximized = async () => {
      if (window.electronAPI) {
        const maximized = await window.electronAPI.isMaximized()
        setIsMaximized(maximized)
      }
    }
    checkMaximized()
    // 启动时获取一言
    fetchQuote()
    
    // 每30秒自动更换一言
    const interval = setInterval(() => {
      fetchQuote()
    }, 1500000)
    
    return () => clearInterval(interval)
  }, [])

  const handleMinimize = () => {
    window.electronAPI?.minimize()
  }

  const handleMaximize = () => {
    window.electronAPI?.maximize()
    setIsMaximized(!isMaximized)
  }

  const handleClose = () => {
    window.electronAPI?.close()
  }

  return (
    <div className="h-10 bg-background border-b flex items-center justify-between px-4 drag-region no-select">
      <button 
        onClick={onHomeClick}
        className="flex items-center gap-3 no-drag hover:opacity-80 transition-opacity cursor-pointer"
        title="返回首页"
      >
        <svg width="28" height="28" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 1L29.5 8.5V23.5L16 31L2.5 23.5V8.5L16 1Z" fill="url(#tb-bg)"/>
          <path d="M16 1L29.5 8.5V23.5L16 31L2.5 23.5V8.5L16 1Z" fill="url(#tb-glow)" opacity="0.6"/>
          <path d="M16 5L24 10V22L16 27L8 22V10L16 5Z" fill="url(#tb-inner)" opacity="0.3"/>
          <circle cx="16" cy="14" r="5" stroke="white" strokeWidth="1.5" fill="none" opacity="0.9"/>
          <rect x="15" y="18" width="2" height="8" rx="1" fill="white" opacity="0.9"/>
          <rect x="17" y="21" width="3" height="1.5" rx="0.5" fill="white" opacity="0.9"/>
          <rect x="17" y="24" width="2" height="1.5" rx="0.5" fill="white" opacity="0.9"/>
          <circle cx="16" cy="14" r="2" fill="url(#tb-center)"/>
          <defs>
            <linearGradient id="tb-bg" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1e1b4b"/><stop offset="0.5" stopColor="#312e81"/><stop offset="1" stopColor="#4c1d95"/>
            </linearGradient>
            <radialGradient id="tb-glow" cx="16" cy="16" r="16" gradientUnits="userSpaceOnUse">
              <stop stopColor="#818cf8" stopOpacity="0.5"/><stop offset="1" stopColor="#818cf8" stopOpacity="0"/>
            </radialGradient>
            <linearGradient id="tb-inner" x1="8" y1="5" x2="24" y2="27" gradientUnits="userSpaceOnUse">
              <stop stopColor="#c4b5fd"/><stop offset="1" stopColor="#8b5cf6"/>
            </linearGradient>
            <radialGradient id="tb-center" cx="16" cy="14" r="2" gradientUnits="userSpaceOnUse">
              <stop stopColor="#ffffff"/><stop offset="0.5" stopColor="#a5b4fc"/><stop offset="1" stopColor="#6366f1"/>
            </radialGradient>
          </defs>
        </svg>
        <div>
          <span className="font-semibold text-sm bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">CipherLab</span>
          <span className="text-xs text-muted-foreground ml-2">密码工坊</span>
          <span className="text-[12px] text-muted-foreground/60 ml-2">by 00724</span>
        </div>
      </button>

      {/* 每日一言 */}
      <div className="flex-1 flex items-center justify-center px-4 min-w-0">
        <div className="flex items-center gap-2 max-w-lg truncate no-drag group">
          <Sparkles className={`w-3 h-3 shrink-0 ${isLoading ? 'text-amber-500/50 animate-pulse' : 'text-amber-500'}`} />
          <span className={`text-xs text-muted-foreground truncate italic transition-opacity ${isLoading ? 'opacity-60' : 'opacity-100'}`}>
            "{quote.hitokoto}"
            {quote.from && (
              <span className="text-xs text-muted-foreground/60 ml-1">
                —— {quote.from_who ? `${quote.from_who}《${quote.from}》` : `《${quote.from}》`}
              </span>
            )}
          </span>
          <button 
            onClick={fetchQuote}
            disabled={isLoading}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-accent rounded shrink-0"
            title="换一句"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      <div className="flex items-center no-drag">
        {/* GitHub 链接 */}
        <button
          onClick={() => window.electronAPI.openExternalLink('https://github.com')}
          className="h-7 px-2.5 mr-1.5 flex items-center gap-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-all text-xs font-medium"
          title="访问 GitHub"
        >
          <Github className="w-3.5 h-3.5" />
        </button>
        
        {/* CSDN 链接 */}
        <button
          onClick={() => window.electronAPI.openExternalLink('https://blog.csdn.net')}
          className="h-7 px-3 mr-1.5 flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-md transition-all text-xs font-medium"
          title="访问 CSDN"
        >
          <span>CSDN</span>
        </button>
        
        {/* AI 助手按钮 */}
        <button
          onClick={onAiClick}
          className="h-7 px-3 mr-2 flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-md transition-all text-xs font-medium shadow-sm hover:shadow-md"
          title="AI 助手"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a2 2 0 012 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 017 7h1a1 1 0 110 2h-1.07A7 7 0 0113 22h-2a7 7 0 01-6.93-6H3a1 1 0 110-2h1a7 7 0 017-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 012-2z" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="9" cy="13" r="1" fill="currentColor"/>
            <circle cx="15" cy="13" r="1" fill="currentColor"/>
            <path d="M9 17h6" strokeLinecap="round"/>
          </svg>
          <span>AI</span>
        </button>
        
        <div className="w-px h-5 bg-border mx-1" />
        <button
          onClick={handleMinimize}
          className="w-10 h-10 flex items-center justify-center hover:bg-accent transition-colors"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleMaximize}
          className="w-10 h-10 flex items-center justify-center hover:bg-accent transition-colors"
        >
          {isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={handleClose}
          className="w-10 h-10 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
