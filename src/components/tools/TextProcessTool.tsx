import { useState } from 'react'
import { Copy, ArrowDownUp, Trash2 } from 'lucide-react'

type ProcessType = 'dedupe' | 'sort' | 'reverse' | 'shuffle' | 'trim' | 'case'

export function TextProcessTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [caseType, setCaseType] = useState<'upper' | 'lower' | 'title' | 'sentence'>('upper')
  const [keepEmpty, setKeepEmpty] = useState(false)

  const processText = (type: ProcessType) => {
    let lines = input.split('\n')
    
    if (!keepEmpty) {
      lines = lines.filter(line => line.trim())
    }

    switch (type) {
      case 'dedupe':
        // 去重，保持顺序
        lines = [...new Set(lines)]
        break
      
      case 'sort':
        lines = lines.sort((a, b) => {
          const comparison = a.localeCompare(b, 'zh-CN')
          return sortOrder === 'asc' ? comparison : -comparison
        })
        break
      
      case 'reverse':
        lines = lines.reverse()
        break
      
      case 'shuffle':
        for (let i = lines.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[lines[i], lines[j]] = [lines[j], lines[i]]
        }
        break
      
      case 'trim':
        lines = lines.map(line => line.trim())
        break
      
      case 'case':
        lines = lines.map(line => {
          switch (caseType) {
            case 'upper': return line.toUpperCase()
            case 'lower': return line.toLowerCase()
            case 'title': return line.replace(/\b\w/g, c => c.toUpperCase())
            case 'sentence': return line.charAt(0).toUpperCase() + line.slice(1).toLowerCase()
            default: return line
          }
        })
        break
    }

    setOutput(lines.join('\n'))
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  const clearAll = () => {
    setInput('')
    setOutput('')
  }

  const swapInputOutput = () => {
    setInput(output)
    setOutput('')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">文本处理</h2>
        <div className="flex gap-2">
          <button
            onClick={swapInputOutput}
            className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
            title="交换输入输出"
          >
            <ArrowDownUp className="w-4 h-4" />
          </button>
          <button
            onClick={clearAll}
            className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors"
            title="清空"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        文本去重、排序、反转、打乱、修剪、大小写转换
      </p>

      <div className="space-y-2">
        <label className="text-sm font-medium">输入文本（每行一项）</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="每行输入一项内容..."
          className="w-full h-40 p-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={keepEmpty}
            onChange={(e) => setKeepEmpty(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm">保留空行</span>
        </label>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <button
          onClick={() => processText('dedupe')}
          className="py-2 px-3 rounded-lg bg-secondary hover:bg-accent transition-colors text-sm"
        >
          去重
        </button>
        
        <div className="flex gap-1">
          <button
            onClick={() => processText('sort')}
            className="flex-1 py-2 px-3 rounded-lg bg-secondary hover:bg-accent transition-colors text-sm"
          >
            排序
          </button>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
            className="px-2 rounded-lg bg-secondary border border-border text-sm"
          >
            <option value="asc">升序</option>
            <option value="desc">降序</option>
          </select>
        </div>
        
        <button
          onClick={() => processText('reverse')}
          className="py-2 px-3 rounded-lg bg-secondary hover:bg-accent transition-colors text-sm"
        >
          反转顺序
        </button>
        
        <button
          onClick={() => processText('shuffle')}
          className="py-2 px-3 rounded-lg bg-secondary hover:bg-accent transition-colors text-sm"
        >
          随机打乱
        </button>
        
        <button
          onClick={() => processText('trim')}
          className="py-2 px-3 rounded-lg bg-secondary hover:bg-accent transition-colors text-sm"
        >
          去除首尾空格
        </button>
        
        <div className="flex gap-1">
          <button
            onClick={() => processText('case')}
            className="flex-1 py-2 px-3 rounded-lg bg-secondary hover:bg-accent transition-colors text-sm"
          >
            大小写
          </button>
          <select
            value={caseType}
            onChange={(e) => setCaseType(e.target.value as any)}
            className="px-2 rounded-lg bg-secondary border border-border text-sm"
          >
            <option value="upper">全大写</option>
            <option value="lower">全小写</option>
            <option value="title">首字母大写</option>
            <option value="sentence">句首大写</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            处理结果 {output && `(${output.split('\n').filter(l => l).length} 行)`}
          </label>
          {output && (
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Copy className="w-4 h-4" />
              复制
            </button>
          )}
        </div>
        <textarea
          value={output}
          readOnly
          placeholder="处理结果..."
          className="w-full h-40 p-3 rounded-lg bg-muted border border-border focus:outline-none resize-none font-mono text-sm"
        />
      </div>
    </div>
  )
}
