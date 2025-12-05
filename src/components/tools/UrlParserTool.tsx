import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Copy, RefreshCw, Link } from 'lucide-react'

interface QueryParam {
  id: string
  key: string
  value: string
}

export function UrlParserTool() {
  const [url, setUrl] = useState('https://example.com:8080/path/to/resource?search=query&id=123#section')
  const [parsed, setParsed] = useState<{
    protocol: string
    username: string
    password: string
    hostname: string
    port: string
    pathname: string
    hash: string
  }>({
    protocol: '',
    username: '',
    password: '',
    hostname: '',
    port: '',
    pathname: '',
    hash: ''
  })
  const [queryParams, setQueryParams] = useState<QueryParam[]>([])
  const [error, setError] = useState('')

  // Parse URL when input string changes
  const parseUrl = (input: string) => {
    try {
      const u = new URL(input)
      setParsed({
        protocol: u.protocol.replace(':', ''),
        username: u.username,
        password: u.password,
        hostname: u.hostname,
        port: u.port,
        pathname: u.pathname,
        hash: u.hash
      })
      
      const params: QueryParam[] = []
      u.searchParams.forEach((value, key) => {
        params.push({ id: Math.random().toString(36).substr(2, 9), key, value })
      })
      setQueryParams(params)
      setError('')
    } catch (e) {
      // Don't clear state immediately on type error, but show indicator
      setError('Invalid URL')
    }
  }

  // Initial parse
  useEffect(() => {
    parseUrl(url)
  }, [])

  // Rebuild URL when components change
  useEffect(() => {
    if (error) return

    try {
      const u = new URL('https://placeholder')
      u.protocol = parsed.protocol
      u.username = parsed.username
      u.password = parsed.password
      u.hostname = parsed.hostname || 'example.com' // fallback
      u.port = parsed.port
      u.pathname = parsed.pathname
      u.hash = parsed.hash
      
      // Clear existing params
      // Note: We can't clear u.searchParams easily without re-creating
      // But we are building from scratch mostly. 
      // Actually new URL() defaults.
      
      // We need to respect the original base if we want to be accurate
      // But constructing from components is safer using the constructor
      
      // Let's construct string manually or use URL object carefully
      // Using URL object is better for validation
      
      // Re-add params
      // We need to clear search first if we reused object, but we created new.
      queryParams.forEach(p => {
        if (p.key) u.searchParams.append(p.key, p.value)
      })
      
      // Fix double slashes issue if protocol is empty or something
      // but URL object handles it.
      
      setUrl(u.toString())
    } catch (e) {
      // ignore build errors
    }
  }, [parsed, queryParams])

  const handleUrlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newUrl = e.target.value
    setUrl(newUrl)
    parseUrl(newUrl)
  }

  const updateParsed = (field: keyof typeof parsed, value: string) => {
    setParsed(prev => ({ ...prev, [field]: value }))
  }

  const addParam = () => {
    setQueryParams(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), key: '', value: '' }])
  }

  const removeParam = (id: string) => {
    setQueryParams(prev => prev.filter(p => p.id !== id))
  }

  const updateParam = (id: string, field: 'key' | 'value', value: string) => {
    setQueryParams(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const copyUrl = () => {
    navigator.clipboard.writeText(url)
  }

  return (
    <div className="h-full flex flex-col gap-4 p-6 bg-background overflow-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Link className="w-5 h-5" />
          URL 解析与构建
        </h2>
        <Button variant="outline" size="sm" onClick={() => parseUrl(url)}>
          <RefreshCw className="w-4 h-4 mr-2" />
          重置/重新解析
        </Button>
      </div>

      <div className="flex flex-col gap-2">
        <Label>完整 URL</Label>
        <div className="relative">
          <Textarea 
            value={url} 
            onChange={handleUrlChange} 
            className={`font-mono text-sm min-h-[80px] pr-12 ${error ? 'border-destructive focus-visible:ring-destructive' : ''}`}
          />
          <Button 
            size="icon" 
            variant="ghost" 
            className="absolute top-2 right-2"
            onClick={copyUrl}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        {error && <span className="text-xs text-destructive">{error}</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 border p-4 rounded-lg">
          <h3 className="font-medium text-sm text-muted-foreground">基本组件</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Protocol (Scheme)</Label>
              <Input 
                value={parsed.protocol} 
                onChange={e => updateParsed('protocol', e.target.value)} 
                placeholder="https"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Port</Label>
              <Input 
                value={parsed.port} 
                onChange={e => updateParsed('port', e.target.value)} 
                placeholder="443"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Hostname</Label>
            <Input 
              value={parsed.hostname} 
              onChange={e => updateParsed('hostname', e.target.value)} 
              placeholder="example.com"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Path</Label>
            <Input 
              value={parsed.pathname} 
              onChange={e => updateParsed('pathname', e.target.value)} 
              placeholder="/path"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Hash (Fragment)</Label>
            <Input 
              value={parsed.hash} 
              onChange={e => updateParsed('hash', e.target.value)} 
              placeholder="#hash"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Username</Label>
              <Input 
                value={parsed.username} 
                onChange={e => updateParsed('username', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Password</Label>
              <Input 
                value={parsed.password} 
                onChange={e => updateParsed('password', e.target.value)} 
                type="password"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4 border p-4 rounded-lg flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm text-muted-foreground">查询参数 (Query Params)</h3>
            <Button variant="ghost" size="sm" onClick={addParam} className="h-6 text-xs">
              <Plus className="w-3 h-3 mr-1" /> 添加
            </Button>
          </div>
          
          <div className="flex-1 overflow-auto space-y-2 min-h-[200px]">
            {queryParams.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-8">
                无查询参数
              </div>
            )}
            {queryParams.map(p => (
              <div key={p.id} className="flex items-center gap-2">
                <Input 
                  className="h-8 text-sm" 
                  placeholder="Key" 
                  value={p.key}
                  onChange={e => updateParam(p.id, 'key', e.target.value)}
                />
                <span className="text-muted-foreground">=</span>
                <Input 
                  className="h-8 text-sm" 
                  placeholder="Value" 
                  value={p.value}
                  onChange={e => updateParam(p.id, 'value', e.target.value)}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeParam(p.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
