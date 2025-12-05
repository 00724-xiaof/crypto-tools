import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  Send, Bot, User, Loader2, Trash2, Sparkles, Plus, X, Check,
  MessageSquare, Settings2, Copy, CheckCheck, History, Clock
} from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
}

interface ModelConfig {
  id: string
  name: string
}

interface Provider {
  id: string
  name: string
  baseUrl: string
  apiKey: string
  models: ModelConfig[]
}

const PRESET_PROVIDERS: Omit<Provider, 'apiKey'>[] = [
  { id: 'openai', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1/chat/completions', models: [
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' }, { id: 'gpt-4', name: 'GPT-4' }, { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' }, { id: 'gpt-4o', name: 'GPT-4o' }, { id: 'gpt-4o-mini', name: 'GPT-4o Mini' }
  ]},
  { id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1/chat/completions', models: [
    { id: 'deepseek-chat', name: 'DeepSeek Chat' }, { id: 'deepseek-coder', name: 'DeepSeek Coder' }
  ]},
  { id: 'doubao', name: '豆包 (字节)', baseUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', models: [] },
  { id: 'qianwen', name: '通义千问', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', models: [
    { id: 'qwen-turbo', name: 'Qwen Turbo' }, { id: 'qwen-plus', name: 'Qwen Plus' }, { id: 'qwen-max', name: 'Qwen Max' }
  ]},
  { id: 'moonshot', name: 'Moonshot', baseUrl: 'https://api.moonshot.cn/v1/chat/completions', models: [
    { id: 'moonshot-v1-8k', name: 'Moonshot 8K' }, { id: 'moonshot-v1-32k', name: 'Moonshot 32K' }, { id: 'moonshot-v1-128k', name: 'Moonshot 128K' }
  ]},
  { id: 'zhipu', name: '智谱 AI', baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions', models: [
    { id: 'glm-4', name: 'GLM-4' }, { id: 'glm-4-flash', name: 'GLM-4 Flash' }, { id: 'glm-3-turbo', name: 'GLM-3 Turbo' }
  ]},
  { id: 'gemini', name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', models: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' }, { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' }, { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash' }
  ]},
  { id: 'custom', name: '自定义', baseUrl: '', models: [] }
]

function AiIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v2m0 8v2M6 12h2m8 0h2" strokeLinecap="round" />
      <circle cx="12" cy="12" r="4" className="fill-current opacity-20" />
    </svg>
  )
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="relative group my-2 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-700">
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 text-zinc-400 text-xs border-b border-zinc-700">
        <span className="font-mono">{language || 'code'}</span>
        <button onClick={handleCopy} className="flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-700 transition-colors">
          {copied ? <><CheckCheck className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">已复制</span></> : <><Copy className="w-3.5 h-3.5" /><span>复制</span></>}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm text-zinc-100"><code className="font-mono leading-relaxed">{code}</code></pre>
    </div>
  )
}

function MessageContent({ content }: { content: string }) {
  const parts: { type: 'text' | 'code'; content: string; language?: string }[] = []
  const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g
  let lastIndex = 0
  let match
  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) parts.push({ type: 'text', content: content.slice(lastIndex, match.index) })
    parts.push({ type: 'code', content: match[2].trim(), language: match[1] || 'code' })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < content.length) parts.push({ type: 'text', content: content.slice(lastIndex) })
  if (parts.length === 0) return <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
  return (
    <div className="text-sm">
      {parts.map((part, i) => part.type === 'code' 
        ? <CodeBlock key={i} code={part.content} language={part.language || ''} />
        : <p key={i} className="whitespace-pre-wrap leading-relaxed">{part.content}</p>
      )}
    </div>
  )
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - timestamp
  if (diff < 60000) return '刚刚'
  if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`
  if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`
  if (date.toDateString() === now.toDateString()) return '今天'
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return '昨天'
  return `${date.getMonth() + 1}/${date.getDate()}`
}

export function AiChatTool() {
  const [activeTab, setActiveTab] = useState<'chat' | 'settings'>('chat')
  
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    const saved = localStorage.getItem('ai_chat_sessions')
    return saved ? JSON.parse(saved) : []
  })
  const [activeSessionId, setActiveSessionId] = useState<string>(() => {
    const saved = localStorage.getItem('ai_active_session')
    return saved || ''
  })
  
  const activeSession = sessions.find(s => s.id === activeSessionId)
  const messages = activeSession?.messages || []
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const [providers, setProviders] = useState<Provider[]>(() => {
    const saved = localStorage.getItem('ai_providers_v2')
    return saved ? JSON.parse(saved) : []
  })
  const [activeProviderId, setActiveProviderId] = useState<string>(() => localStorage.getItem('ai_active_provider') || '')
  const [activeModelId, setActiveModelId] = useState<string>(() => localStorage.getItem('ai_active_model') || '')

  const [showAddProvider, setShowAddProvider] = useState(false)
  const [newProvider, setNewProvider] = useState<Provider>({ id: '', name: '', baseUrl: '', apiKey: '', models: [] })
  const [selectedPreset, setSelectedPreset] = useState('')
  const [newModelId, setNewModelId] = useState('')
  const [newModelDisplayName, setNewModelDisplayName] = useState('')
  const [editingProvider, setEditingProvider] = useState<string | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const activeProvider = providers.find(p => p.id === activeProviderId)
  const activeModelConfig = activeProvider?.models.find(m => m.id === activeModelId)

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
  useEffect(() => { localStorage.setItem('ai_providers_v2', JSON.stringify(providers)) }, [providers])
  useEffect(() => { localStorage.setItem('ai_active_provider', activeProviderId) }, [activeProviderId])
  useEffect(() => { localStorage.setItem('ai_active_model', activeModelId) }, [activeModelId])
  useEffect(() => { localStorage.setItem('ai_chat_sessions', JSON.stringify(sessions)) }, [sessions])
  useEffect(() => { localStorage.setItem('ai_active_session', activeSessionId) }, [activeSessionId])

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: '新对话',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    setSessions(prev => [newSession, ...prev])
    setActiveSessionId(newSession.id)
  }

  const deleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSessions(prev => prev.filter(s => s.id !== sessionId))
    if (activeSessionId === sessionId) {
      const remaining = sessions.filter(s => s.id !== sessionId)
      setActiveSessionId(remaining[0]?.id || '')
    }
  }

  const clearCurrentSession = () => {
    if (!activeSessionId) return
    setSessions(prev => prev.map(s => 
      s.id === activeSessionId ? { ...s, messages: [], title: '新对话', updatedAt: Date.now() } : s
    ))
  }

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId)
    const preset = PRESET_PROVIDERS.find(p => p.id === presetId)
    if (preset) setNewProvider({ id: `${preset.id}_${Date.now()}`, name: preset.name, baseUrl: preset.baseUrl, apiKey: '', models: [...preset.models] })
  }

  const addProvider = () => {
    if (!newProvider.name || !newProvider.baseUrl || !newProvider.apiKey || newProvider.models.length === 0) return
    const cleanApiKey = newProvider.apiKey.trim().replace(/[^\x00-\x7F]/g, '')
    const provider = { ...newProvider, apiKey: cleanApiKey, id: newProvider.id || `custom_${Date.now()}` }
    setProviders(prev => [...prev, provider])
    setActiveProviderId(provider.id)
    setActiveModelId(provider.models[0].id)
    setShowAddProvider(false)
    setNewProvider({ id: '', name: '', baseUrl: '', apiKey: '', models: [] })
    setSelectedPreset('')
  }

  const removeProvider = (id: string) => {
    setProviders(prev => prev.filter(p => p.id !== id))
    if (activeProviderId === id) {
      const remaining = providers.filter(p => p.id !== id)
      setActiveProviderId(remaining[0]?.id || '')
      setActiveModelId(remaining[0]?.models[0]?.id || '')
    }
  }

  const addModelToProvider = (providerId: string) => {
    if (!newModelId.trim()) return
    const modelConfig: ModelConfig = { id: newModelId.trim(), name: newModelDisplayName.trim() || newModelId.trim() }
    setProviders(prev => prev.map(p => p.id === providerId ? { ...p, models: [...p.models, modelConfig] } : p))
    setActiveModelId(modelConfig.id)
    setNewModelId('')
    setNewModelDisplayName('')
    setEditingProvider(null)
  }

  const removeModelFromProvider = (providerId: string, modelIndex: number) => {
    setProviders(prev => prev.map(p => {
      if (p.id !== providerId) return p
      const removedModel = p.models[modelIndex]
      const newModels = p.models.filter((_, i) => i !== modelIndex)
      if (activeModelId === removedModel.id && newModels.length > 0) setActiveModelId(newModels[0].id)
      return { ...p, models: newModels }
    }))
  }

  const addNewModel = () => {
    if (!newModelId.trim()) return
    setNewProvider(prev => ({ ...prev, models: [...prev.models, { id: newModelId.trim(), name: newModelDisplayName.trim() || newModelId.trim() }] }))
    setNewModelId('')
    setNewModelDisplayName('')
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading || !activeProvider || !activeModelId) return
    
    let currentSessionId = activeSessionId
    if (!currentSessionId) {
      const newSession: ChatSession = {
        id: `session_${Date.now()}`,
        title: input.trim().slice(0, 20) + (input.trim().length > 20 ? '...' : ''),
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
      setSessions(prev => [newSession, ...prev])
      setActiveSessionId(newSession.id)
      currentSessionId = newSession.id
    }
    
    const userMessage: Message = { role: 'user', content: input.trim() }
    const currentMessages = sessions.find(s => s.id === currentSessionId)?.messages || []
    const newMessages = [...currentMessages, userMessage]
    
    setSessions(prev => prev.map(s => {
      if (s.id !== currentSessionId) return s
      const title = s.title === '新对话' ? userMessage.content.slice(0, 20) + (userMessage.content.length > 20 ? '...' : '') : s.title
      return { ...s, messages: newMessages, title, updatedAt: Date.now() }
    }))
    
    setInput('')
    setIsLoading(true)

    try {
      const cleanApiKey = activeProvider.apiKey.trim().replace(/[^\x00-\x7F]/g, '')
      const isGemini = activeProvider.id.startsWith('gemini')
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      headers[isGemini ? 'x-goog-api-key' : 'Authorization'] = isGemini ? cleanApiKey : `Bearer ${cleanApiKey}`

      const response = await fetch(activeProvider.baseUrl, {
        method: 'POST', headers,
        body: JSON.stringify({ model: activeModelId, messages: newMessages.map(m => ({ role: m.role, content: m.content })), temperature: 0.7, max_tokens: 4000 })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || error.message || '请求失败')
      }
      const data = await response.json()
      const assistantMessage: Message = { role: 'assistant', content: data.choices[0]?.message?.content || '无响应' }
      
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, messages: [...newMessages, assistantMessage], updatedAt: Date.now() } : s
      ))
    } catch (error) {
      const errorMessage: Message = { role: 'assistant', content: `错误: ${error instanceof Error ? error.message : '请求失败'}` }
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId ? { ...s, messages: [...newMessages, errorMessage], updatedAt: Date.now() } : s
      ))
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden p-4" style={{ height: '100%', minHeight: 0 }}>
      {/* 头部 */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <AiIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI 助手</h1>
            <p className="text-sm text-muted-foreground">
              {activeProvider && activeModelConfig ? `${activeProvider.name} - ${activeModelConfig.name}` : '请先配置 AI 服务'}
            </p>
          </div>
        </div>
        <div className="flex bg-secondary rounded-lg p-1">
          <button onClick={() => setActiveTab('chat')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${activeTab === 'chat' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}>
            <MessageSquare className="w-4 h-4" />对话
          </button>
          <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${activeTab === 'settings' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}>
            <Settings2 className="w-4 h-4" />配置
          </button>
        </div>
      </div>

      {activeTab === 'chat' ? (
        <div className="flex-1 min-h-0 flex gap-3 overflow-hidden h-full">
          {/* 历史会话列表 */}
          <div className="w-56 flex-shrink-0 border rounded-lg bg-card/50 flex flex-col h-full">
            <div className="p-3 border-b flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2 text-sm font-medium">
                <History className="w-4 h-4" />
                历史记录
              </div>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={createNewSession} title="新建对话">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {sessions.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm">
                  <MessageSquare className="w-8 h-8 mb-2 opacity-30" />
                  <p>暂无历史记录</p>
                  <p className="text-xs mt-1">开始新对话吧</p>
                </div>
              ) : (
                sessions.map(session => (
                  <div
                    key={session.id}
                    onClick={() => setActiveSessionId(session.id)}
                    className={`group p-2.5 rounded-lg cursor-pointer transition-colors ${
                      activeSessionId === session.id 
                        ? 'bg-primary/10 border border-primary/30' 
                        : 'hover:bg-accent/50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{session.title}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTime(session.updatedAt)}</span>
                          <span className="mx-1">·</span>
                          <span>{session.messages.length} 条消息</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => deleteSession(session.id, e)}
                        title="删除对话"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* 聊天主区域 */}
          <div className="flex-1 border rounded-lg bg-card/50 flex flex-col overflow-hidden h-full">
            {activeProvider && (
              <div className="p-3 border-b flex items-center justify-between flex-shrink-0">
                <select
                  value={activeModelId}
                  onChange={(e) => setActiveModelId(e.target.value)}
                  className="h-8 px-2 rounded-md border bg-background text-sm"
                >
                  {activeProvider.models.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <Button variant="ghost" size="sm" onClick={clearCurrentSession} disabled={messages.length === 0}>
                  <Trash2 className="w-4 h-4 mr-1" />清空
                </Button>
              </div>
            )}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <Sparkles className="w-12 h-12 mb-4 opacity-50" />
                  <p className="text-lg font-medium">开始与 AI 对话</p>
                  <p className="text-sm">{activeProvider ? '输入消息开始聊天' : '请先在配置中添加 AI 服务'}</p>
                </div>
              ) : messages.map((msg, i) => (
                <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role === 'assistant' && <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center flex-shrink-0"><Bot className="w-5 h-5 text-white" /></div>}
                  <div className={`max-w-[85%] px-4 py-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md'}`}>
                    {msg.role === 'user' ? <p className="whitespace-pre-wrap text-sm">{msg.content}</p> : <MessageContent content={msg.content} />}
                  </div>
                  {msg.role === 'user' && <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0"><User className="w-5 h-5" /></div>}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center"><Bot className="w-5 h-5 text-white" /></div>
                  <div className="bg-muted px-4 py-3 rounded-2xl rounded-bl-md"><Loader2 className="w-5 h-5 animate-spin" /></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t flex-shrink-0">
              <div className="flex gap-2">
                <Textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={activeProvider ? "输入消息... (Enter 发送, Shift+Enter 换行)" : "请先配置 AI 服务"} className="min-h-[44px] max-h-32 resize-none" rows={1} disabled={!activeProvider} />
                <Button onClick={sendMessage} disabled={!input.trim() || isLoading || !activeProvider} className="px-4">
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 custom-scrollbar">
          {providers.length > 0 && (
            <div className="space-y-3">
              <label className="text-sm font-medium">已配置的服务</label>
              {providers.map(provider => (
                <div 
                  key={provider.id} 
                  className={`p-3 border rounded-lg transition-colors cursor-pointer ${activeProviderId === provider.id ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'}`}
                  onClick={() => { setActiveProviderId(provider.id); if (provider.models.length > 0 && !provider.models.find(m => m.id === activeModelId)) setActiveModelId(provider.models[0].id) }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {activeProviderId === provider.id && <Check className="w-4 h-4 text-primary" />}
                      <span className="font-medium">{provider.name}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); removeProvider(provider.id) }}><X className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {provider.models.map((model, i) => (
                      <span key={i} className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs cursor-pointer ${activeProviderId === provider.id && activeModelId === model.id ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}
                        onClick={(e) => { e.stopPropagation(); setActiveProviderId(provider.id); setActiveModelId(model.id) }} title={`ID: ${model.id}`}>
                        {model.name}
                        <X className="w-3 h-3 opacity-60 hover:opacity-100" onClick={(e) => { e.stopPropagation(); removeModelFromProvider(provider.id, i) }} />
                      </span>
                    ))}
                    {editingProvider === provider.id ? (
                      <div className="flex items-center gap-1 flex-wrap" onClick={e => e.stopPropagation()}>
                        <Input value={newModelDisplayName} onChange={(e) => setNewModelDisplayName(e.target.value)} placeholder="显示名称" className="h-6 w-24 text-xs" />
                        <Input value={newModelId} onChange={(e) => setNewModelId(e.target.value)} placeholder="模型ID" className="h-6 w-32 text-xs"
                          onKeyDown={(e) => { if (e.key === 'Enter') addModelToProvider(provider.id); if (e.key === 'Escape') { setEditingProvider(null); setNewModelId(''); setNewModelDisplayName('') } }} />
                        <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => addModelToProvider(provider.id)}><Check className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="sm" className="h-6 px-1" onClick={() => { setEditingProvider(null); setNewModelId(''); setNewModelDisplayName('') }}><X className="w-3 h-3" /></Button>
                      </div>
                    ) : (
                      <button className="px-2 py-1 rounded text-xs bg-secondary/50 hover:bg-secondary flex items-center gap-1" onClick={(e) => { e.stopPropagation(); setEditingProvider(provider.id) }}>
                        <Plus className="w-3 h-3" />添加模型
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showAddProvider ? (
            <Button variant="outline" className="w-full" onClick={() => setShowAddProvider(true)}>
              <Plus className="w-4 h-4 mr-2" />添加 AI 服务
            </Button>
          ) : (
            <div className="p-4 border rounded-lg bg-accent/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-medium">添加新服务</span>
                <Button variant="ghost" size="sm" onClick={() => { setShowAddProvider(false); setSelectedPreset(''); setNewProvider({ id: '', name: '', baseUrl: '', apiKey: '', models: [] }) }}><X className="w-4 h-4" /></Button>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">选择预设</label>
                <select value={selectedPreset} onChange={(e) => handlePresetChange(e.target.value)} className="w-full h-9 px-3 rounded-md border bg-background text-sm">
                  <option value="">-- 选择厂商 --</option>
                  {PRESET_PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              {selectedPreset === 'custom' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">服务名称</label>
                    <Input value={newProvider.name} onChange={(e) => setNewProvider(prev => ({ ...prev, name: e.target.value }))} placeholder="例如: 我的AI服务" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API 地址</label>
                    <Input value={newProvider.baseUrl} onChange={(e) => setNewProvider(prev => ({ ...prev, baseUrl: e.target.value }))} placeholder="https://api.example.com/v1/chat/completions" />
                  </div>
                </>
              )}
              {selectedPreset && (selectedPreset === 'custom' || selectedPreset === 'doubao' || newProvider.models.length === 0) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">添加模型</label>
                  <div className="flex gap-2">
                    <Input value={newModelDisplayName} onChange={(e) => setNewModelDisplayName(e.target.value)} placeholder="显示名称" className="flex-1" />
                    <Input value={newModelId} onChange={(e) => setNewModelId(e.target.value)} placeholder={selectedPreset === 'doubao' ? 'Endpoint ID' : '模型ID'} className="flex-1" onKeyDown={(e) => { if (e.key === 'Enter') addNewModel() }} />
                    <Button size="sm" onClick={addNewModel}>添加</Button>
                  </div>
                  {newProvider.models.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {newProvider.models.map((m, i) => (
                        <span key={i} className="px-2 py-1 text-xs bg-secondary rounded flex items-center gap-1" title={`ID: ${m.id}`}>
                          {m.name}<X className="w-3 h-3 cursor-pointer hover:text-destructive" onClick={() => setNewProvider(prev => ({ ...prev, models: prev.models.filter((_, idx) => idx !== i) }))} />
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {selectedPreset && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">API Key</label>
                  <Input type="password" value={newProvider.apiKey} onChange={(e) => setNewProvider(prev => ({ ...prev, apiKey: e.target.value }))} placeholder="输入 API Key" />
                </div>
              )}
              <Button className="w-full" onClick={addProvider} disabled={!newProvider.name || !newProvider.baseUrl || !newProvider.apiKey || newProvider.models.length === 0}>
                <Check className="w-4 h-4 mr-2" />保存配置
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
