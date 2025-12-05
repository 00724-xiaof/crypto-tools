import { useState, useEffect } from 'react'
import { Copy, RefreshCw, Globe, Loader2, Wifi } from 'lucide-react'

interface PublicIpInfo {
  ip: string
  city?: string
  region?: string
  country?: string
  isp?: string
  loading: boolean
  error?: string
}

interface LocalIpInfo {
  ips: string[]
  loading: boolean
  error?: string
}

export function IpTool() {
  const [ipv4, setIpv4] = useState('')
  const [subnet, setSubnet] = useState('24')
  const [publicIp, setPublicIp] = useState<PublicIpInfo>({ ip: '', loading: true })
  const [localIp, setLocalIp] = useState<LocalIpInfo>({ ips: [], loading: true })
  const [ipInfo, setIpInfo] = useState<{
    binary: string
    decimal: string
    networkAddress: string
    broadcastAddress: string
    hostRange: string
    totalHosts: number
    subnetMask: string
    wildcardMask: string
  } | null>(null)

  const ipToBinary = (ip: string): string => {
    return ip.split('.').map(octet => 
      parseInt(octet).toString(2).padStart(8, '0')
    ).join('.')
  }

  const ipToDecimal = (ip: string): string => {
    const parts = ip.split('.').map(Number)
    const decimal = ((parts[0] << 24) >>> 0) + 
                   ((parts[1] << 16) >>> 0) + 
                   ((parts[2] << 8) >>> 0) + 
                   parts[3]
    return decimal.toString()
  }

  const calculateSubnetMask = (cidr: number): string => {
    const mask = ~(2 ** (32 - cidr) - 1) >>> 0
    return [
      (mask >>> 24) & 255,
      (mask >>> 16) & 255,
      (mask >>> 8) & 255,
      mask & 255
    ].join('.')
  }

  const calculateWildcard = (cidr: number): string => {
    const wildcard = (2 ** (32 - cidr) - 1) >>> 0
    return [
      (wildcard >>> 24) & 255,
      (wildcard >>> 16) & 255,
      (wildcard >>> 8) & 255,
      wildcard & 255
    ].join('.')
  }

  const calculateNetwork = () => {
    if (!ipv4.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
      return
    }

    const cidr = parseInt(subnet)
    const parts = ipv4.split('.').map(Number)
    
    if (parts.some(p => p > 255)) return

    const ipDecimal = ((parts[0] << 24) >>> 0) + 
                     ((parts[1] << 16) >>> 0) + 
                     ((parts[2] << 8) >>> 0) + 
                     parts[3]

    const mask = ~(2 ** (32 - cidr) - 1) >>> 0
    const network = (ipDecimal & mask) >>> 0
    const broadcast = (network | ~mask) >>> 0

    const toIp = (num: number) => [
      (num >>> 24) & 255,
      (num >>> 16) & 255,
      (num >>> 8) & 255,
      num & 255
    ].join('.')

    const firstHost = network + 1
    const lastHost = broadcast - 1
    const totalHosts = 2 ** (32 - cidr) - 2

    setIpInfo({
      binary: ipToBinary(ipv4),
      decimal: ipToDecimal(ipv4),
      networkAddress: toIp(network),
      broadcastAddress: toIp(broadcast),
      hostRange: totalHosts > 0 ? `${toIp(firstHost)} - ${toIp(lastHost)}` : 'N/A',
      totalHosts: Math.max(0, totalHosts),
      subnetMask: calculateSubnetMask(cidr),
      wildcardMask: calculateWildcard(cidr)
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const generateRandomIp = () => {
    const ip = [
      Math.floor(Math.random() * 223) + 1,
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 256),
      Math.floor(Math.random() * 254) + 1
    ].join('.')
    setIpv4(ip)
  }

  const commonSubnets = [
    { cidr: '8', name: 'A类' },
    { cidr: '16', name: 'B类' },
    { cidr: '24', name: 'C类' },
    { cidr: '25', name: '/25' },
    { cidr: '26', name: '/26' },
    { cidr: '27', name: '/27' },
    { cidr: '28', name: '/28' },
    { cidr: '30', name: '/30' },
  ]

  const fetchPublicIp = async () => {
    setPublicIp(prev => ({ ...prev, loading: true, error: undefined }))
    try {
      // 先获取 IPv4 地址
      const ipv4Response = await fetch('https://api4.ipify.org?format=json')
      const ipv4Data = await ipv4Response.json()
      const ipv4 = ipv4Data.ip
      
      // 再获取位置信息
      const geoResponse = await fetch(`https://ipapi.co/${ipv4}/json/`)
      if (geoResponse.ok) {
        const geoData = await geoResponse.json()
        setPublicIp({
          ip: ipv4,
          city: geoData.city,
          region: geoData.region,
          country: geoData.country_name,
          isp: geoData.org,
          loading: false
        })
      } else {
        setPublicIp({
          ip: ipv4,
          loading: false
        })
      }
    } catch (error) {
      // 备用方案
      try {
        const response = await fetch('https://ipv4.icanhazip.com')
        const ip = (await response.text()).trim()
        setPublicIp({
          ip: ip,
          loading: false
        })
      } catch {
        setPublicIp({
          ip: '',
          loading: false,
          error: '无法获取公网IP'
        })
      }
    }
  }

  // 使用 WebRTC 获取本地内网IP
  const fetchLocalIp = async () => {
    setLocalIp({ ips: [], loading: true })
    try {
      const ips: string[] = []
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      })
      
      pc.createDataChannel('')
      
      pc.onicecandidate = (e) => {
        if (!e.candidate) return
        const candidate = e.candidate.candidate
        const ipMatch = candidate.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/)
        if (ipMatch) {
          const ip = ipMatch[1]
          // 过滤掉 0.0.0.0 和重复的IP
          if (ip !== '0.0.0.0' && !ips.includes(ip)) {
            ips.push(ip)
            setLocalIp({ ips: [...ips], loading: false })
          }
        }
      }

      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      // 设置超时
      setTimeout(() => {
        pc.close()
        if (ips.length === 0) {
          setLocalIp({ ips: [], loading: false, error: '无法获取内网IP' })
        }
      }, 3000)
    } catch (e) {
      setLocalIp({ ips: [], loading: false, error: '获取内网IP失败' })
    }
  }

  const usePublicIp = () => {
    if (publicIp.ip) {
      setIpv4(publicIp.ip)
    }
  }

  const useLocalIp = (ip: string) => {
    setIpv4(ip)
  }

  useEffect(() => {
    fetchPublicIp()
    fetchLocalIp()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">IP 地址工具</h1>
        <p className="text-muted-foreground mt-1">IP地址转换和子网计算</p>
      </div>

      {/* IP信息区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 当前公网IP信息 */}
        <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              <h3 className="font-medium">当前公网IP</h3>
            </div>
            <button
              onClick={fetchPublicIp}
              disabled={publicIp.loading}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {publicIp.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              刷新
            </button>
          </div>
          
          {publicIp.loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              正在获取...
            </div>
          ) : publicIp.error ? (
            <div className="text-red-500 text-sm">{publicIp.error}</div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="font-mono text-xl font-bold text-primary">{publicIp.ip}</span>
                <button
                  onClick={() => copyToClipboard(publicIp.ip)}
                  className="p-1 hover:bg-accent rounded"
                  title="复制IP"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={usePublicIp}
                  className="px-2 py-1 text-xs bg-primary text-primary-foreground rounded hover:bg-primary/90"
                >
                  使用此IP
                </button>
              </div>
              {(publicIp.city || publicIp.country) && (
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  {publicIp.country && <span>国家: {publicIp.country}</span>}
                  {publicIp.region && <span>地区: {publicIp.region}</span>}
                  {publicIp.city && <span>城市: {publicIp.city}</span>}
                  {publicIp.isp && <span className="truncate">ISP: {publicIp.isp}</span>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* 当前内网IP信息 */}
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-green-500" />
              <h3 className="font-medium">当前内网IP</h3>
            </div>
            <button
              onClick={fetchLocalIp}
              disabled={localIp.loading}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              {localIp.loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              刷新
            </button>
          </div>
          
          {localIp.loading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              正在检测...
            </div>
          ) : localIp.error ? (
            <div className="text-red-500 text-sm">{localIp.error}</div>
          ) : localIp.ips.length === 0 ? (
            <div className="text-muted-foreground text-sm">未检测到内网IP</div>
          ) : (
            <div className="space-y-2">
              {localIp.ips.map((ip, index) => (
                <div key={ip} className="flex items-center gap-3">
                  <span className="font-mono text-xl font-bold text-green-600 dark:text-green-400">{ip}</span>
                  <button
                    onClick={() => copyToClipboard(ip)}
                    className="p-1 hover:bg-accent rounded"
                    title="复制IP"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => useLocalIp(ip)}
                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    使用此IP
                  </button>
                  {index === 0 && localIp.ips.length > 1 && (
                    <span className="text-xs text-muted-foreground">(主要)</span>
                  )}
                </div>
              ))}
              <div className="text-xs text-muted-foreground mt-2">
                💡 通过 WebRTC 检测到的本地网络地址
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">IPv4 地址</label>
            <button
              onClick={generateRandomIp}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-3 h-3" />
              随机
            </button>
          </div>
          <input
            type="text"
            value={ipv4}
            onChange={(e) => setIpv4(e.target.value)}
            placeholder="192.168.1.1"
            className="w-full p-3 rounded-md border bg-background font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">子网掩码 (CIDR)</label>
          <div className="flex gap-2">
            <span className="p-3 bg-muted rounded-l-md border-y border-l">/</span>
            <input
              type="number"
              min="0"
              max="32"
              value={subnet}
              onChange={(e) => setSubnet(e.target.value)}
              className="w-20 p-3 rounded-r-md border bg-background font-mono text-sm"
            />
            <div className="flex flex-wrap gap-1">
              {commonSubnets.map(s => (
                <button
                  key={s.cidr}
                  onClick={() => setSubnet(s.cidr)}
                  className={`px-2 py-1 text-xs rounded ${
                    subnet === s.cidr ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={calculateNetwork}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        计算
      </button>

      {ipInfo && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-secondary/50 rounded-lg space-y-3">
              <h3 className="font-medium">IP地址信息</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">二进制:</span>
                  <div className="flex items-center gap-1">
                    <span className="font-mono">{ipInfo.binary}</span>
                    <button onClick={() => copyToClipboard(ipInfo.binary)} className="p-0.5 hover:bg-accent rounded">
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">十进制:</span>
                  <span className="font-mono">{ipInfo.decimal}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-secondary/50 rounded-lg space-y-3">
              <h3 className="font-medium">子网信息</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">子网掩码:</span>
                  <span className="font-mono">{ipInfo.subnetMask}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">通配符:</span>
                  <span className="font-mono">{ipInfo.wildcardMask}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-secondary/50 rounded-lg space-y-3">
            <h3 className="font-medium">网络计算</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">网络地址:</span>
                <span className="font-mono">{ipInfo.networkAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">广播地址:</span>
                <span className="font-mono">{ipInfo.broadcastAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">可用主机范围:</span>
                <span className="font-mono">{ipInfo.hostRange}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">可用主机数:</span>
                <span className="font-mono">{ipInfo.totalHosts.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-secondary/50 rounded-lg">
        <h3 className="font-medium mb-2">IP地址分类</h3>
        <div className="text-sm text-muted-foreground space-y-1">
          <div><strong>A类:</strong> 1.0.0.0 - 126.255.255.255 (默认/8)</div>
          <div><strong>B类:</strong> 128.0.0.0 - 191.255.255.255 (默认/16)</div>
          <div><strong>C类:</strong> 192.0.0.0 - 223.255.255.255 (默认/24)</div>
        </div>
      </div>
    </div>
  )
}
