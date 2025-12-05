import { useState } from 'react'
import { Copy, Minimize2, Maximize2 } from 'lucide-react'

function formatXml(xml: string, indent = 2): string {
  const PADDING = ' '.repeat(indent)
  let formatted = ''
  let pad = 0
  
  // 移除现有的空白
  xml = xml.replace(/(>)(<)(\/*)/g, '$1\n$2$3')
  
  xml.split('\n').forEach(node => {
    node = node.trim()
    if (!node) return
    
    let indentLevel = 0
    if (node.match(/^<\/\w/)) {
      pad -= 1
    } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
      indentLevel = 1
    }
    
    formatted += PADDING.repeat(pad) + node + '\n'
    pad += indentLevel
  })
  
  return formatted.trim()
}

function minifyXml(xml: string): string {
  return xml
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .replace(/>\s+/g, '>')
    .replace(/\s+</g, '<')
    .trim()
}

function validateXml(xml: string): { valid: boolean; error?: string } {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'application/xml')
    const parseError = doc.querySelector('parsererror')
    if (parseError) {
      return { valid: false, error: parseError.textContent || 'XML 解析错误' }
    }
    return { valid: true }
  } catch (e) {
    return { valid: false, error: e instanceof Error ? e.message : '验证失败' }
  }
}

function xmlToJson(xml: string): any {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')
  
  function nodeToJson(node: Element): any {
    const obj: any = {}
    
    // 处理属性
    if (node.attributes.length > 0) {
      obj['@attributes'] = {}
      for (const attr of Array.from(node.attributes)) {
        obj['@attributes'][attr.name] = attr.value
      }
    }
    
    // 处理子节点
    for (const child of Array.from(node.children)) {
      const childObj = nodeToJson(child)
      if (obj[child.tagName]) {
        if (!Array.isArray(obj[child.tagName])) {
          obj[child.tagName] = [obj[child.tagName]]
        }
        obj[child.tagName].push(childObj)
      } else {
        obj[child.tagName] = childObj
      }
    }
    
    // 处理文本内容
    if (node.children.length === 0 && node.textContent) {
      return node.textContent.trim()
    }
    
    return obj
  }
  
  const root = doc.documentElement
  return { [root.tagName]: nodeToJson(root) }
}

export function XmlTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')
  const [indentSize, setIndentSize] = useState(2)

  const handleFormat = () => {
    setError('')
    const validation = validateXml(input)
    if (!validation.valid) {
      setError(validation.error || 'XML 格式错误')
      return
    }
    setOutput(formatXml(input, indentSize))
  }

  const handleMinify = () => {
    setError('')
    const validation = validateXml(input)
    if (!validation.valid) {
      setError(validation.error || 'XML 格式错误')
      return
    }
    setOutput(minifyXml(input))
  }

  const handleToJson = () => {
    setError('')
    try {
      const validation = validateXml(input)
      if (!validation.valid) {
        setError(validation.error || 'XML 格式错误')
        return
      }
      const json = xmlToJson(input)
      setOutput(JSON.stringify(json, null, 2))
    } catch (e) {
      setError(e instanceof Error ? e.message : '转换失败')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">XML 工具</h2>
      <p className="text-sm text-muted-foreground">
        XML 格式化、压缩、验证和转换为 JSON
      </p>

      <div className="space-y-2">
        <label className="text-sm font-medium">输入 XML</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="输入 XML..."
          className="w-full h-48 p-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <label className="text-sm">缩进:</label>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="px-2 py-1 rounded bg-secondary border border-border text-sm"
          >
            <option value={2}>2 空格</option>
            <option value={4}>4 空格</option>
            <option value={1}>Tab</option>
          </select>
        </div>
        <button
          onClick={handleFormat}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity text-sm"
        >
          <Maximize2 className="w-4 h-4" />
          格式化
        </button>
        <button
          onClick={handleMinify}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary hover:bg-accent transition-colors text-sm"
        >
          <Minimize2 className="w-4 h-4" />
          压缩
        </button>
        <button
          onClick={handleToJson}
          className="px-3 py-1.5 rounded-lg bg-secondary hover:bg-accent transition-colors text-sm"
        >
          转 JSON
        </button>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">输出结果</label>
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
          placeholder="结果将显示在这里..."
          className="w-full h-48 p-3 rounded-lg bg-muted border border-border focus:outline-none resize-none font-mono text-sm"
        />
      </div>
    </div>
  )
}
