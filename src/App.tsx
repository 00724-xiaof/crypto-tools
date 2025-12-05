import { useState, useEffect, Suspense } from 'react'
import { TitleBar } from './components/TitleBar'
import { Sidebar } from './components/Sidebar'
import { TOOLS, getToolById } from './lib/tool-registry'
import { Sun, Moon, Loader2 } from 'lucide-react'

function App() {
  const [activeTab, setActiveTab] = useState('hardware')
  const [isDark, setIsDark] = useState(false)
  const [loadedTools, setLoadedTools] = useState<Set<string>>(new Set(['hardware']))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // 当切换到新工具时，标记为已加载
  useEffect(() => {
    if (!loadedTools.has(activeTab)) {
      setLoadedTools(prev => new Set([...prev, activeTab]))
    }
  }, [activeTab, loadedTools])

  const currentTool = getToolById(activeTab)
  const isFullScreen = activeTab === 'ai-chat' || currentTool?.fullScreen

  const renderTool = () => {
    return (
      <>
        {TOOLS.map(tool => {
          const Component = tool.component
          const isActive = activeTab === tool.id
          const shouldLoad = loadedTools.has(tool.id)
          
          // 只渲染已经加载过的工具
          if (!shouldLoad) return null
          
          return (
            <div 
              key={tool.id} 
              className={`${isActive ? '' : 'hidden'} h-full`}
            >
              <Suspense 
                fallback={
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                    <Loader2 className="w-8 h-8 animate-spin" />
                    <p>正在加载组件资源...</p>
                  </div>
                }
              >
                <Component />
              </Suspense>
            </div>
          )
        })}
      </>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <TitleBar onAiClick={() => setActiveTab('ai-chat')} onHomeClick={() => setActiveTab('hardware')} />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <main className={`flex-1 overflow-hidden ${isFullScreen ? '' : 'p-6 overflow-y-auto'}`}>
          <div className={isFullScreen ? 'h-full' : 'max-w-4xl mx-auto'}>
            {renderTool()}
          </div>
        </main>
        {/* 主题切换按钮 */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="fixed bottom-4 right-4 w-10 h-10 rounded-full bg-secondary border flex items-center justify-center hover:bg-accent transition-colors"
          title={isDark ? '切换到浅色模式' : '切换到深色模式'}
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </div>
  )
}

export default App
