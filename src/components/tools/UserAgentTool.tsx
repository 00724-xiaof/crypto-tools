import { useState, useEffect } from 'react'
import { Copy, RefreshCw } from 'lucide-react'

interface UAInfo {
  browser: { name: string; version: string }
  os: { name: string; version: string }
  device: { type: string; vendor?: string; model?: string }
  engine: { name: string; version: string }
  cpu?: string
  isMobile: boolean
  isBot: boolean
}

function parseUserAgent(ua: string): UAInfo {
  const info: UAInfo = {
    browser: { name: '未知', version: '' },
    os: { name: '未知', version: '' },
    device: { type: '桌面设备' },
    engine: { name: '未知', version: '' },
    isMobile: false,
    isBot: false,
  }

  // 检测机器人
  if (/bot|crawler|spider|crawling/i.test(ua)) {
    info.isBot = true
    info.device.type = '机器人'
  }

  // 检测移动设备
  if (/Mobile|Android|iPhone|iPad|iPod|webOS|BlackBerry|Opera Mini|IEMobile/i.test(ua)) {
    info.isMobile = true
    info.device.type = '移动设备'
  }

  // 检测平板
  if (/iPad|Android(?!.*Mobile)|Tablet/i.test(ua)) {
    info.device.type = '平板设备'
  }

  // 浏览器检测
  const browserPatterns: [RegExp, string][] = [
    [/Edg(?:e|A|iOS)?\/(\d+[\d.]*)/, 'Microsoft Edge'],
    [/OPR\/(\d+[\d.]*)/, 'Opera'],
    [/Chrome\/(\d+[\d.]*)/, 'Chrome'],
    [/Firefox\/(\d+[\d.]*)/, 'Firefox'],
    [/Safari\/(\d+[\d.]*)/, 'Safari'],
    [/MSIE (\d+[\d.]*)/, 'Internet Explorer'],
    [/Trident.*rv:(\d+[\d.]*)/, 'Internet Explorer'],
  ]

  for (const [pattern, name] of browserPatterns) {
    const match = ua.match(pattern)
    if (match) {
      info.browser = { name, version: match[1] || '' }
      break
    }
  }

  // Safari 特殊处理
  if (info.browser.name === 'Safari' && /Chrome/.test(ua)) {
    // 实际上是 Chrome
  } else if (info.browser.name === 'Safari') {
    const versionMatch = ua.match(/Version\/(\d+[\d.]*)/)
    if (versionMatch) info.browser.version = versionMatch[1]
  }

  // 操作系统检测
  const osPatterns: [RegExp, string, number?][] = [
    [/Windows NT 10\.0/, 'Windows 10/11'],
    [/Windows NT 6\.3/, 'Windows 8.1'],
    [/Windows NT 6\.2/, 'Windows 8'],
    [/Windows NT 6\.1/, 'Windows 7'],
    [/Windows NT 6\.0/, 'Windows Vista'],
    [/Windows NT 5\.1/, 'Windows XP'],
    [/Mac OS X (\d+[._]\d+)/, 'macOS', 1],
    [/Android (\d+[\d.]*)/, 'Android', 1],
    [/iPhone OS (\d+[._]\d+)/, 'iOS', 1],
    [/iPad.*OS (\d+[._]\d+)/, 'iPadOS', 1],
    [/Linux/, 'Linux'],
    [/Ubuntu/, 'Ubuntu'],
    [/CrOS/, 'Chrome OS'],
  ]

  for (const [pattern, name, versionGroup] of osPatterns) {
    const match = ua.match(pattern)
    if (match) {
      info.os = { 
        name, 
        version: versionGroup ? (match[versionGroup] || '').replace(/_/g, '.') : '' 
      }
      break
    }
  }

  // 渲染引擎检测
  const enginePatterns: [RegExp, string][] = [
    [/AppleWebKit\/(\d+[\d.]*)/, 'WebKit'],
    [/Gecko\/(\d+)/, 'Gecko'],
    [/Trident\/(\d+[\d.]*)/, 'Trident'],
    [/Presto\/(\d+[\d.]*)/, 'Presto'],
  ]

  for (const [pattern, name] of enginePatterns) {
    const match = ua.match(pattern)
    if (match) {
      info.engine = { name, version: match[1] || '' }
      break
    }
  }

  // CPU 架构
  if (/x64|x86_64|Win64|WOW64|amd64/i.test(ua)) {
    info.cpu = 'x64'
  } else if (/arm64|aarch64/i.test(ua)) {
    info.cpu = 'ARM64'
  } else if (/arm/i.test(ua)) {
    info.cpu = 'ARM'
  } else if (/i[3-6]86|x86/i.test(ua)) {
    info.cpu = 'x86'
  }

  // 设备厂商和型号
  if (/iPhone/.test(ua)) {
    info.device.vendor = 'Apple'
    info.device.model = 'iPhone'
  } else if (/iPad/.test(ua)) {
    info.device.vendor = 'Apple'
    info.device.model = 'iPad'
  } else if (/Macintosh/.test(ua)) {
    info.device.vendor = 'Apple'
    info.device.model = 'Mac'
  }

  const samsungMatch = ua.match(/SM-([A-Z]\d+)/)
  if (samsungMatch) {
    info.device.vendor = 'Samsung'
    info.device.model = samsungMatch[1]
  }

  return info
}

export function UserAgentTool() {
  const [userAgent, setUserAgent] = useState('')
  const [info, setInfo] = useState<UAInfo | null>(null)

  useEffect(() => {
    setUserAgent(navigator.userAgent)
  }, [])

  useEffect(() => {
    if (userAgent) {
      setInfo(parseUserAgent(userAgent))
    }
  }, [userAgent])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(userAgent)
  }

  const useCurrentUA = () => {
    setUserAgent(navigator.userAgent)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">User-Agent 解析</h2>
      <p className="text-sm text-muted-foreground">
        解析 User-Agent 字符串，识别浏览器、操作系统、设备信息
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">User-Agent</label>
          <div className="flex gap-2">
            <button
              onClick={useCurrentUA}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              当前浏览器
            </button>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="w-4 h-4" />
              复制
            </button>
          </div>
        </div>
        <textarea
          value={userAgent}
          onChange={(e) => setUserAgent(e.target.value)}
          placeholder="输入 User-Agent 字符串..."
          className="w-full h-24 p-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
        />
      </div>

      {info && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg bg-secondary space-y-2">
            <h3 className="font-medium text-primary">浏览器</h3>
            <p className="text-lg">{info.browser.name}</p>
            {info.browser.version && (
              <p className="text-sm text-muted-foreground">版本: {info.browser.version}</p>
            )}
          </div>

          <div className="p-4 rounded-lg bg-secondary space-y-2">
            <h3 className="font-medium text-primary">操作系统</h3>
            <p className="text-lg">{info.os.name}</p>
            {info.os.version && (
              <p className="text-sm text-muted-foreground">版本: {info.os.version}</p>
            )}
          </div>

          <div className="p-4 rounded-lg bg-secondary space-y-2">
            <h3 className="font-medium text-primary">设备</h3>
            <p className="text-lg">{info.device.type}</p>
            {info.device.vendor && (
              <p className="text-sm text-muted-foreground">
                {info.device.vendor} {info.device.model}
              </p>
            )}
          </div>

          <div className="p-4 rounded-lg bg-secondary space-y-2">
            <h3 className="font-medium text-primary">渲染引擎</h3>
            <p className="text-lg">{info.engine.name}</p>
            {info.engine.version && (
              <p className="text-sm text-muted-foreground">版本: {info.engine.version}</p>
            )}
          </div>

          {info.cpu && (
            <div className="p-4 rounded-lg bg-secondary space-y-2">
              <h3 className="font-medium text-primary">CPU 架构</h3>
              <p className="text-lg">{info.cpu}</p>
            </div>
          )}

          <div className="p-4 rounded-lg bg-secondary space-y-2">
            <h3 className="font-medium text-primary">特征</h3>
            <div className="flex flex-wrap gap-2">
              <span className={`px-2 py-1 rounded text-xs ${info.isMobile ? 'bg-blue-500/20 text-blue-500' : 'bg-muted text-muted-foreground'}`}>
                {info.isMobile ? '移动端' : '桌面端'}
              </span>
              {info.isBot && (
                <span className="px-2 py-1 rounded text-xs bg-yellow-500/20 text-yellow-500">
                  机器人
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
