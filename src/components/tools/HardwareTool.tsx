import { useState, useEffect } from 'react'
import { Cpu, HardDrive, Monitor, Network, User, RefreshCw, Clock } from 'lucide-react'

interface DisplayInfo {
  id: number
  label: string
  isPrimary: boolean
  width: number
  height: number
  scaleFactor: number
  colorDepth: number
  workArea: { width: number; height: number }
}

interface HardwareInfo {
  os: {
    platform: string
    type: string
    release: string
    arch: string
    hostname: string
    uptime: number
  }
  cpu: {
    model: string
    cores: number
    speed: number
  }
  memory: {
    total: number
    free: number
    used: number
  }
  displays: DisplayInfo[]
  network: Record<string, Array<{ address: string; family: string; mac: string }>>
  user: {
    username: string
    homedir: string
    tmpdir: string
  }
}

function formatBytes(bytes: number): string {
  const gb = bytes / (1024 * 1024 * 1024)
  return gb.toFixed(2) + ' GB'
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  return `${days}天 ${hours}小时 ${mins}分钟`
}

function getPlatformName(platform: string): string {
  const names: Record<string, string> = {
    win32: 'Windows',
    darwin: 'macOS',
    linux: 'Linux',
  }
  return names[platform] || platform
}

export function HardwareTool() {
  const [info, setInfo] = useState<HardwareInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchInfo = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    try {
      // 添加最小延迟让动画效果更明显
      const [data] = await Promise.all([
        (window.electronAPI as { getHardwareInfo: () => Promise<HardwareInfo> }).getHardwareInfo(),
        isRefresh ? new Promise(r => setTimeout(r, 500)) : Promise.resolve()
      ])
      setInfo(data)
    } catch (e) {
      console.error('获取硬件信息失败:', e)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchInfo()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!info) {
    return <div className="text-center text-muted-foreground">无法获取硬件信息</div>
  }

  const memoryPercent = ((info.memory.used / info.memory.total) * 100).toFixed(1)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">本机硬件配置</h2>
        <button
          onClick={() => fetchInfo(true)}
          disabled={refreshing}
          className="flex items-center gap-1 px-2 py-1 text-sm bg-secondary hover:bg-accent rounded transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? '刷新中...' : '刷新'}
        </button>
      </div>

      <div className={`grid grid-cols-2 gap-2 transition-opacity duration-300 ${refreshing ? 'opacity-50' : 'opacity-100'}`}>
        {/* 操作系统 */}
        <div className="p-3 bg-card rounded-lg border">
          <div className="flex items-center gap-1.5 mb-2">
            <Monitor className="w-4 h-4 text-blue-500" />
            <h3 className="font-medium text-sm">操作系统</h3>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
            <div className="text-muted-foreground">系统</div>
            <div>{getPlatformName(info.os.platform)} {info.os.release}</div>
            <div className="text-muted-foreground">架构</div>
            <div>{info.os.arch}</div>
            <div className="text-muted-foreground">主机名</div>
            <div>{info.os.hostname}</div>
            <div className="text-muted-foreground">运行时间</div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatUptime(info.os.uptime)}
            </div>
          </div>
        </div>

        {/* CPU */}
        <div className="p-3 bg-card rounded-lg border">
          <div className="flex items-center gap-1.5 mb-2">
            <Cpu className="w-4 h-4 text-orange-500" />
            <h3 className="font-medium text-sm">处理器 (CPU)</h3>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
            <div className="text-muted-foreground">型号</div>
            <div className="truncate" title={info.cpu.model}>{info.cpu.model}</div>
            <div className="text-muted-foreground">核心数</div>
            <div>{info.cpu.cores} 核</div>
            <div className="text-muted-foreground">主频</div>
            <div>{info.cpu.speed} MHz</div>
          </div>
        </div>

        {/* 内存 */}
        <div className="p-3 bg-card rounded-lg border">
          <div className="flex items-center gap-1.5 mb-2">
            <HardDrive className="w-4 h-4 text-green-500" />
            <h3 className="font-medium text-sm">内存 (RAM)</h3>
          </div>
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">已使用</span>
              <span>{formatBytes(info.memory.used)} / {formatBytes(info.memory.total)}</span>
            </div>
            <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-500 transition-all"
                style={{ width: `${memoryPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>使用率: {memoryPercent}%</span>
              <span>可用: {formatBytes(info.memory.free)}</span>
            </div>
          </div>
        </div>

        {/* 显示器 - 每个显示器一个卡片 */}
        {info.displays.map((display) => (
          <div key={display.id} className="p-3 bg-card rounded-lg border">
            <div className="flex items-center gap-1.5 mb-2">
              <Monitor className="w-4 h-4 text-purple-500" />
              <h3 className="font-medium text-sm">{display.label}</h3>
              {display.isPrimary && (
                <span className="px-1 py-0.5 text-[10px] bg-purple-500/20 text-purple-600 rounded">主</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
              <div className="text-muted-foreground">分辨率</div>
              <div>{display.width} × {display.height}</div>
              <div className="text-muted-foreground">工作区域</div>
              <div>{display.workArea.width} × {display.workArea.height}</div>
              <div className="text-muted-foreground">缩放比例</div>
              <div>{(display.scaleFactor * 100).toFixed(0)}%</div>
              <div className="text-muted-foreground">色深</div>
              <div>{display.colorDepth} bit</div>
            </div>
          </div>
        ))}

        {/* 网络 */}
        <div className="p-3 bg-card rounded-lg border">
          <div className="flex items-center gap-1.5 mb-2">
            <Network className="w-4 h-4 text-cyan-500" />
            <h3 className="font-medium text-sm">网络接口</h3>
          </div>
          <div className="space-y-1 text-xs max-h-20 overflow-y-auto">
            {Object.entries(info.network).map(([name, interfaces]) => (
              interfaces?.filter(i => i.family === 'IPv4' && !i.address.startsWith('127.')).map((iface, idx) => (
                <div key={`${name}-${idx}`} className="flex justify-between">
                  <span className="text-muted-foreground">{name}</span>
                  <span className="font-mono text-[10px]">{iface.address}</span>
                </div>
              ))
            ))}
          </div>
        </div>

        {/* 用户 */}
        <div className="p-3 bg-card rounded-lg border">
          <div className="flex items-center gap-1.5 mb-2">
            <User className="w-4 h-4 text-pink-500" />
            <h3 className="font-medium text-sm">用户信息</h3>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
            <div className="text-muted-foreground">用户名</div>
            <div>{info.user.username}</div>
            <div className="text-muted-foreground">主目录</div>
            <div className="truncate" title={info.user.homedir}>{info.user.homedir}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

