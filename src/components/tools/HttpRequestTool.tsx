import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, Loader2, Send, XCircle, AlignLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS'

interface KeyValue {
  id: string
  key: string
  value: string
  enabled: boolean
}

// const METHOD_COLORS: Record<HttpMethod, string> = {
//   GET: 'text-blue-500',
//   POST: 'text-green-500',
//   PUT: 'text-orange-500',
//   DELETE: 'text-red-500',
//   PATCH: 'text-purple-500',
//   HEAD: 'text-gray-500',
//   OPTIONS: 'text-pink-500',
// }

export function HttpRequestTool() {
  const [url, setUrl] = useState('')
  const [method, setMethod] = useState<HttpMethod>('GET')
  const [loading, setLoading] = useState(false)
  
  const [params, setParams] = useState<KeyValue[]>([{ id: '1', key: '', value: '', enabled: true }])
  const [headers, setHeaders] = useState<KeyValue[]>([{ id: '1', key: '', value: '', enabled: true }])
  const [bodyType, setBodyType] = useState<'none' | 'json' | 'form'>('none')
  const [jsonBody, setJsonBody] = useState('')
  
  const [response, setResponse] = useState<{
    status?: number
    statusText?: string
    headers?: Record<string, string>
    data?: any
    time?: number
    size?: number
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const addKeyValue = (setter: React.Dispatch<React.SetStateAction<KeyValue[]>>) => {
    setter(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), key: '', value: '', enabled: true }])
  }

  const removeKeyValue = (id: string, setter: React.Dispatch<React.SetStateAction<KeyValue[]>>) => {
    setter(prev => {
      if (prev.length === 1) return [{ id: Math.random().toString(36).substr(2, 9), key: '', value: '', enabled: true }]
      return prev.filter(item => item.id !== id)
    })
  }

  const updateKeyValue = (id: string, field: 'key' | 'value' | 'enabled', value: any, setter: React.Dispatch<React.SetStateAction<KeyValue[]>>) => {
    setter(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item))
  }

  const handleSend = async () => {
    if (!url) return
    
    setLoading(true)
    setError(null)
    setResponse(null)
    
    const startTime = Date.now()
    
    try {
      // Construct URL with params
      const urlObj = new URL(url)
      params.forEach(p => {
        if (p.key && p.enabled) urlObj.searchParams.append(p.key, p.value)
      })

      // Construct headers
      const headersObj: Record<string, string> = {}
      headers.forEach(h => {
        if (h.key && h.enabled) headersObj[h.key] = h.value
      })

      const options: RequestInit = {
        method,
        headers: headersObj,
      }

      if (method !== 'GET' && method !== 'HEAD') {
        if (bodyType === 'json' && jsonBody) {
          headersObj['Content-Type'] = 'application/json'
          options.body = jsonBody
        }
        // TODO: Implement form data
      }

      const res = await fetch(urlObj.toString(), options)
      const endTime = Date.now()
      
      const resHeaders: Record<string, string> = {}
      res.headers.forEach((val, key) => {
        resHeaders[key] = val
      })

      let data
      const contentType = res.headers.get('content-type')
      const size = Number(res.headers.get('content-length')) || 0 // approximate

      if (contentType && contentType.includes('application/json')) {
        data = await res.json()
      } else {
        data = await res.text()
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
        data,
        time: endTime - startTime,
        size
      })
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-background">
      {/* Request Bar */}
      <div className="flex items-center gap-2 p-4 border-b bg-muted/10">
        <div className="flex-1 flex items-center gap-2 bg-background border rounded-md p-1 focus-within:ring-2 focus-within:ring-ring shadow-sm">
          <Select value={method} onValueChange={(v: HttpMethod) => setMethod(v)}>
            <SelectTrigger className="w-[110px] font-bold border-0 focus:ring-0 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GET" className="font-bold text-blue-500">GET</SelectItem>
              <SelectItem value="POST" className="font-bold text-green-500">POST</SelectItem>
              <SelectItem value="PUT" className="font-bold text-orange-500">PUT</SelectItem>
              <SelectItem value="DELETE" className="font-bold text-red-500">DELETE</SelectItem>
              <SelectItem value="PATCH" className="font-bold text-purple-500">PATCH</SelectItem>
              <SelectItem value="HEAD" className="font-bold text-gray-500">HEAD</SelectItem>
              <SelectItem value="OPTIONS" className="font-bold text-pink-500">OPTIONS</SelectItem>
            </SelectContent>
          </Select>
          <div className="w-px h-6 bg-border" />
          <Input 
            placeholder="输入请求 URL (例如: https://api.example.com/v1/users)" 
            value={url} 
            onChange={e => setUrl(e.target.value)}
            className="flex-1 font-mono border-0 focus-visible:ring-0 h-9 text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
        </div>
        <Button onClick={handleSend} disabled={loading || !url} className="h-[46px] px-6 shadow-sm" size="lg">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
          发送请求
        </Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-0 divide-y">
        {/* Top: Request Config */}
        <div className="h-[45%] flex flex-col min-h-0 bg-background/50">
          <Tabs defaultValue="params" className="flex-1 flex flex-col">
            <div className="px-4 border-b">
              <TabsList className="h-10 w-full justify-start bg-transparent p-0 gap-2">
                <TabsTrigger 
                  value="params" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-4"
                >
                  Params
                </TabsTrigger>
                <TabsTrigger 
                  value="headers" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-4"
                >
                  Headers
                </TabsTrigger>
                <TabsTrigger 
                  value="body" 
                  className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-4"
                >
                  Body
                  {bodyType !== 'none' && <span className="ml-2 w-1.5 h-1.5 rounded-full bg-primary" />}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="params" className="flex-1 overflow-auto p-4 m-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">Query Parameters</h3>
                </div>
                <KeyValueEditor items={params} setItems={setParams} onAdd={() => addKeyValue(setParams)} onRemove={(id) => removeKeyValue(id, setParams)} onUpdate={(id, f, v) => updateKeyValue(id, f, v, setParams)} />
              </div>
            </TabsContent>
            
            <TabsContent value="headers" className="flex-1 overflow-auto p-4 m-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">Request Headers</h3>
                </div>
                <KeyValueEditor items={headers} setItems={setHeaders} onAdd={() => addKeyValue(setHeaders)} onRemove={(id) => removeKeyValue(id, setHeaders)} onUpdate={(id, f, v) => updateKeyValue(id, f, v, setHeaders)} />
              </div>
            </TabsContent>
            
            <TabsContent value="body" className="flex-1 flex flex-col p-4 m-0 gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    id="body-none" 
                    name="body-type" 
                    checked={bodyType === 'none'} 
                    onChange={() => setBodyType('none')}
                    className="text-primary"
                  />
                  <label htmlFor="body-none" className="text-sm cursor-pointer">None</label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    id="body-json" 
                    name="body-type" 
                    checked={bodyType === 'json'} 
                    onChange={() => setBodyType('json')}
                    className="text-primary"
                  />
                  <label htmlFor="body-json" className="text-sm cursor-pointer">JSON</label>
                </div>
              </div>
              
              {bodyType === 'json' && (
                <div className="flex-1 relative border rounded-md overflow-hidden bg-muted/30 focus-within:bg-background focus-within:ring-1 focus-within:ring-primary transition-colors">
                  <Textarea 
                    className="absolute inset-0 font-mono text-sm resize-none border-0 focus-visible:ring-0 p-4"
                    placeholder="{ ... }"
                    value={jsonBody}
                    onChange={e => setJsonBody(e.target.value)}
                  />
                </div>
              )}
              {bodyType === 'none' && (
                <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-2 bg-muted/10 rounded-lg border border-dashed m-4">
                  <AlignLeft className="w-8 h-8 opacity-20" />
                  <span className="text-sm">此请求没有 Body 内容</span>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Bottom: Response */}
        <div className="flex-1 flex flex-col min-w-0 bg-muted/5">
          {error ? (
             <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-4">
               <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                 <XCircle className="w-6 h-6" />
               </div>
               <div className="space-y-1">
                 <h3 className="font-semibold">请求失败</h3>
                 <p className="text-sm text-muted-foreground max-w-xs break-words">{error}</p>
               </div>
             </div>
          ) : response ? (
            <Tabs defaultValue="body" className="flex-1 flex flex-col">
               <div className="px-4 py-2 border-b bg-background flex items-center justify-between shadow-sm z-10">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold",
                    response.status! >= 200 && response.status! < 300 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}>
                    <span className="w-2 h-2 rounded-full bg-current" />
                    {response.status} {response.statusText}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                     <span>Time: <span className="font-mono text-foreground">{response.time}ms</span></span>
                     <span>Size: <span className="font-mono text-foreground">{response.size ? (response.size / 1024).toFixed(2) + ' KB' : 'Unknown'}</span></span>
                  </div>
                </div>
              </div>

              <div className="border-b bg-background/50 px-4">
                <TabsList className="h-10 w-full justify-start bg-transparent p-0 gap-2">
                  <TabsTrigger 
                    value="body" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-4"
                  >
                    Body
                  </TabsTrigger>
                  <TabsTrigger 
                    value="headers" 
                    className="data-[state=active]:bg-background data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-10 px-4"
                  >
                    Headers
                    <span className="ml-2 text-xs bg-muted px-1.5 rounded-full">{Object.keys(response.headers || {}).length}</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="body" className="flex-1 p-0 m-0 relative bg-background">
                <div className="absolute inset-0 overflow-auto">
                   <div className="min-h-full flex flex-col">
                     <div className="flex-1 relative">
                       <Textarea 
                         readOnly
                         className="absolute inset-0 font-mono text-xs resize-none border-0 focus-visible:ring-0 p-4 bg-transparent"
                         value={typeof response.data === 'object' ? JSON.stringify(response.data, null, 2) : response.data}
                       />
                     </div>
                   </div>
                </div>
              </TabsContent>
              <TabsContent value="headers" className="flex-1 overflow-auto p-0 m-0 bg-background">
                 <div className="grid grid-cols-[auto,1fr] gap-x-8 gap-y-2 p-4 text-sm font-mono">
                   {Object.entries(response.headers || {}).map(([k, v]) => (
                     <React.Fragment key={k}>
                       <div className="text-muted-foreground font-medium text-right select-none">{k}</div>
                       <div className="break-all select-text text-foreground">{v}</div>
                     </React.Fragment>
                   ))}
                 </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4 p-8 text-center opacity-50">
              <Send className="w-12 h-12" />
              <div className="space-y-1">
                <p className="font-medium">准备就绪</p>
                <p className="text-sm">输入 URL 并点击发送以查看响应</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function KeyValueEditor({ 
  items, 
  setItems: _setItems, 
  onAdd, 
  onRemove, 
  onUpdate 
}: { 
  items: KeyValue[], 
  setItems: React.Dispatch<React.SetStateAction<KeyValue[]>>,
  onAdd: () => void,
  onRemove: (id: string) => void,
  onUpdate: (id: string, field: 'key' | 'value' | 'enabled', value: any) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground px-2 mb-1">
        <div className="w-8 text-center">启用</div>
        <div className="flex-1">Key</div>
        <div className="flex-1">Value</div>
        <div className="w-8"></div>
      </div>
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-2 group">
           <div className="w-8 flex justify-center">
             <input 
               type="checkbox" 
               checked={item.enabled} 
               onChange={(e) => onUpdate(item.id, 'enabled', e.target.checked)}
               className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
             />
           </div>
           <Input 
             className="h-9 text-sm font-mono flex-1" 
             placeholder="Key"
             value={item.key}
             onChange={(e) => onUpdate(item.id, 'key', e.target.value)}
           />
           <Input 
             className="h-9 text-sm font-mono flex-1" 
             placeholder="Value"
             value={item.value}
             onChange={(e) => onUpdate(item.id, 'value', e.target.value)}
           />
           <div className="w-8 flex justify-center">
             <Button 
               variant="ghost" 
               size="icon" 
               className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
               onClick={() => onRemove(item.id)}
             >
               <Trash2 className="h-4 w-4" />
             </Button>
           </div>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={onAdd} className="self-start mt-2 ml-10 text-xs">
        <Plus className="h-3 w-3 mr-1" /> 添加参数
      </Button>
    </div>
  )
}
