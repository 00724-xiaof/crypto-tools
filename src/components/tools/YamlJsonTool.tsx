import { useState } from 'react'
import { Copy, ArrowLeftRight } from 'lucide-react'

// 简单的 YAML 解析器
function parseYaml(yaml: string): any {
  const lines = yaml.split('\n')
  const result: any = {}
  const stack: { indent: number; obj: any; key?: string }[] = [{ indent: -1, obj: result }]
  
  for (let line of lines) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    
    const indent = line.search(/\S/)
    const content = line.trim()
    
    // 处理数组项
    if (content.startsWith('- ')) {
      const value = content.slice(2).trim()
      while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
        stack.pop()
      }
      const parent = stack[stack.length - 1]
      if (parent.key) {
        if (!Array.isArray(parent.obj[parent.key])) {
          parent.obj[parent.key] = []
        }
        parent.obj[parent.key].push(parseValue(value))
      }
      continue
    }
    
    const colonIndex = content.indexOf(':')
    if (colonIndex === -1) continue
    
    const key = content.slice(0, colonIndex).trim()
    const value = content.slice(colonIndex + 1).trim()
    
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }
    
    const parent = stack[stack.length - 1].obj
    
    if (value === '' || value === '|' || value === '>') {
      parent[key] = {}
      stack.push({ indent, obj: parent, key })
    } else {
      parent[key] = parseValue(value)
    }
  }
  
  return result
}

function parseValue(value: string): any {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null' || value === '~') return null
  if (/^-?\d+$/.test(value)) return parseInt(value)
  if (/^-?\d+\.\d+$/.test(value)) return parseFloat(value)
  if ((value.startsWith('"') && value.endsWith('"')) || 
      (value.startsWith("'") && value.endsWith("'"))) {
    return value.slice(1, -1)
  }
  return value
}

// 简单的 JSON 转 YAML
function jsonToYaml(obj: any, indent = 0): string {
  const spaces = '  '.repeat(indent)
  let result = ''
  
  if (Array.isArray(obj)) {
    for (const item of obj) {
      if (typeof item === 'object' && item !== null) {
        result += `${spaces}- \n${jsonToYaml(item, indent + 1)}`
      } else {
        result += `${spaces}- ${formatValue(item)}\n`
      }
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        result += `${spaces}${key}:\n${jsonToYaml(value, indent + 1)}`
      } else {
        result += `${spaces}${key}: ${formatValue(value)}\n`
      }
    }
  }
  
  return result
}

function formatValue(value: any): string {
  if (value === null) return 'null'
  if (typeof value === 'string') {
    if (value.includes('\n') || value.includes(':') || value.includes('#')) {
      return `"${value.replace(/"/g, '\\"')}"`
    }
    return value
  }
  return String(value)
}

export function YamlJsonTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'yaml2json' | 'json2yaml'>('yaml2json')
  const [error, setError] = useState('')

  const handleConvert = () => {
    setError('')
    try {
      if (mode === 'yaml2json') {
        const parsed = parseYaml(input)
        setOutput(JSON.stringify(parsed, null, 2))
      } else {
        const parsed = JSON.parse(input)
        setOutput(jsonToYaml(parsed))
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
      setOutput('')
    }
  }

  const handleSwap = () => {
    setMode(mode === 'yaml2json' ? 'json2yaml' : 'yaml2json')
    setInput(output)
    setOutput('')
    setError('')
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">YAML ↔ JSON 转换</h2>
        <button
          onClick={handleSwap}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary hover:bg-accent transition-colors text-sm"
        >
          <ArrowLeftRight className="w-4 h-4" />
          切换方向
        </button>
      </div>

      <p className="text-sm text-muted-foreground">
        {mode === 'yaml2json' ? 'YAML 转换为 JSON' : 'JSON 转换为 YAML'}
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">
            {mode === 'yaml2json' ? 'YAML' : 'JSON'}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'yaml2json' ? '输入 YAML...' : '输入 JSON...'}
            className="w-full h-64 p-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">
              {mode === 'yaml2json' ? 'JSON' : 'YAML'}
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
            placeholder="转换结果..."
            className="w-full h-64 p-3 rounded-lg bg-muted border border-border focus:outline-none resize-none font-mono text-sm"
          />
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <button
        onClick={handleConvert}
        className="w-full py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
      >
        转换
      </button>
    </div>
  )
}
