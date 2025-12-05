import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Folder, File, Download, RefreshCw, Wifi, WifiOff, FolderOpen } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface FtpConfig {
  host: string
  port: number
  username: string
  password: string
}

interface FtpFile {
  name: string
  type: 'file' | 'directory'
  size: number
  modifiedAt: string
}

export function FtpTool() {
  const [config, setConfig] = useState<FtpConfig>({
    host: '',
    port: 21,
    username: '',
    password: ''
  })
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [currentPath, setCurrentPath] = useState('/')
  const [files, setFiles] = useState<FtpFile[]>([])
  const [loading, setLoading] = useState(false)

  const handleConnect = async () => {
    if (!config.host || !config.username) {
      setError('请填写主机地址和用户名')
      return
    }

    setConnecting(true)
    setError('')
    
    try {
      const result = await window.electronAPI.ftpConnect(config)
      if (result.success && result.sessionId) {
        setConnected(true)
        setSessionId(result.sessionId)
        await loadFiles('/')
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
      await window.electronAPI.ftpDisconnect(sessionId)
      setConnected(false)
      setSessionId('')
      setFiles([])
      setCurrentPath('/')
    }
  }

  const loadFiles = async (path: string) => {
    if (!sessionId) return
    
    setLoading(true)
    try {
      const result = await window.electronAPI.ftpList(sessionId, path)
      if (result.success && result.files) {
        setFiles(result.files)
        setCurrentPath(path)
      } else {
        setError(result.error || '获取文件列表失败')
      }
    } catch (e: any) {
      setError(e.message || '获取文件列表失败')
    } finally {
      setLoading(false)
    }
  }

  const handleNavigate = (file: FtpFile) => {
    if (file.type === 'directory') {
      const newPath = currentPath === '/' 
        ? `/${file.name}` 
        : `${currentPath}/${file.name}`
      loadFiles(newPath)
    }
  }

  const handleGoUp = () => {
    if (currentPath === '/') return
    const parts = currentPath.split('/').filter(Boolean)
    parts.pop()
    const newPath = parts.length === 0 ? '/' : '/' + parts.join('/')
    loadFiles(newPath)
  }

  const handleDownload = async (fileName: string) => {
    if (!sessionId) return
    
    try {
      const result = await window.electronAPI.ftpDownload(sessionId, currentPath, fileName)
      if (result.success) {
        alert(`文件 ${fileName} 下载成功`)
      } else {
        setError(result.error || '下载失败')
      }
    } catch (e: any) {
      setError(e.message || '下载失败')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            FTP 客户端
          </h2>
          <p className="text-sm text-muted-foreground">连接FTP服务器进行文件管理</p>
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
              placeholder="例如: ftp.example.com"
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>端口</Label>
            <Input
              type="number"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 21 })}
            />
          </div>
          <div className="space-y-2">
            <Label>用户名</Label>
            <Input
              placeholder="FTP用户名"
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
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleGoUp} disabled={currentPath === '/'}>
                上级目录
              </Button>
              <span className="text-sm text-muted-foreground font-mono">{currentPath}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => loadFiles(currentPath)} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </Button>
          </div>

          <div className="flex-1 border rounded-lg overflow-hidden min-h-0">
            <div className="h-full overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-3 font-medium">名称</th>
                    <th className="text-left p-3 font-medium w-32">类型</th>
                    <th className="text-left p-3 font-medium w-32">大小</th>
                    <th className="text-left p-3 font-medium w-48">修改时间</th>
                    <th className="text-left p-3 font-medium w-32">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {files.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center p-8 text-muted-foreground">
                        {loading ? '加载中...' : '此目录为空'}
                      </td>
                    </tr>
                  ) : (
                    files.map((file, i) => (
                      <tr 
                        key={i} 
                        className="border-t hover:bg-muted/50 cursor-pointer"
                        onDoubleClick={() => handleNavigate(file)}
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            {file.type === 'directory' ? (
                              <Folder className="w-4 h-4 text-blue-500" />
                            ) : (
                              <File className="w-4 h-4 text-gray-500" />
                            )}
                            <span>{file.name}</span>
                          </div>
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {file.type === 'directory' ? '文件夹' : '文件'}
                        </td>
                        <td className="p-3 text-muted-foreground">
                          {file.type === 'file' ? formatFileSize(file.size) : '-'}
                        </td>
                        <td className="p-3 text-muted-foreground font-mono text-xs">
                          {file.modifiedAt}
                        </td>
                        <td className="p-3">
                          {file.type === 'file' && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDownload(file.name)
                              }}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
