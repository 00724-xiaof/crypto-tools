import { useState } from 'react'
import { Copy, Minimize2, Maximize2 } from 'lucide-react'

const KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'NOT', 'IN', 'LIKE', 'BETWEEN',
  'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'FULL', 'CROSS', 'ON',
  'GROUP', 'BY', 'HAVING', 'ORDER', 'ASC', 'DESC', 'LIMIT', 'OFFSET',
  'INSERT', 'INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE',
  'CREATE', 'TABLE', 'INDEX', 'VIEW', 'DROP', 'ALTER', 'ADD', 'COLUMN',
  'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE', 'DEFAULT', 'NULL',
  'AS', 'DISTINCT', 'ALL', 'UNION', 'EXCEPT', 'INTERSECT',
  'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'EXISTS', 'IS', 'TRUE', 'FALSE',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NULLIF',
]

const NEWLINE_BEFORE = ['SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'JOIN', 'LEFT', 'RIGHT', 'INNER', 'OUTER', 'GROUP', 'ORDER', 'HAVING', 'LIMIT', 'UNION', 'EXCEPT', 'INTERSECT', 'SET', 'VALUES']
const INDENT_AFTER = ['SELECT', 'FROM', 'WHERE', 'SET', 'VALUES']

function formatSql(sql: string, indent = 2): string {
  const INDENT = ' '.repeat(indent)
  let formatted = ''
  let currentIndent = 0
  let inString = false
  let stringChar = ''
  
  // 标准化空白
  sql = sql.replace(/\s+/g, ' ').trim()
  
  // 分词
  const tokens: string[] = []
  let current = ''
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]
    
    if (inString) {
      current += char
      if (char === stringChar && sql[i - 1] !== '\\') {
        inString = false
        tokens.push(current)
        current = ''
      }
      continue
    }
    
    if (char === "'" || char === '"') {
      if (current) tokens.push(current)
      current = char
      inString = true
      stringChar = char
      continue
    }
    
    if (char === ',' || char === '(' || char === ')' || char === ';') {
      if (current.trim()) tokens.push(current.trim())
      tokens.push(char)
      current = ''
      continue
    }
    
    if (char === ' ') {
      if (current.trim()) tokens.push(current.trim())
      current = ''
      continue
    }
    
    current += char
  }
  if (current.trim()) tokens.push(current.trim())
  
  // 格式化
  let prevToken = ''
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    const upperToken = token.toUpperCase()
    const isKeyword = KEYWORDS.includes(upperToken)
    
    if (NEWLINE_BEFORE.includes(upperToken) && formatted) {
      if (upperToken === 'AND' || upperToken === 'OR') {
        formatted += '\n' + INDENT.repeat(currentIndent) + '  '
      } else {
        if (INDENT_AFTER.includes(prevToken.toUpperCase())) {
          currentIndent = Math.max(0, currentIndent - 1)
        }
        formatted += '\n' + INDENT.repeat(currentIndent)
      }
    }
    
    if (token === '(') {
      formatted += token
      currentIndent++
    } else if (token === ')') {
      currentIndent = Math.max(0, currentIndent - 1)
      formatted += token
    } else if (token === ',') {
      formatted += token
    } else if (token === ';') {
      formatted += token + '\n'
      currentIndent = 0
    } else {
      if (formatted && !formatted.endsWith('\n') && !formatted.endsWith('(') && !formatted.endsWith(' ')) {
        formatted += ' '
      }
      formatted += isKeyword ? upperToken : token
    }
    
    prevToken = token
  }
  
  return formatted.trim()
}

function minifySql(sql: string): string {
  let result = ''
  let inString = false
  let stringChar = ''
  
  sql = sql.replace(/\s+/g, ' ')
  
  for (let i = 0; i < sql.length; i++) {
    const char = sql[i]
    
    if (inString) {
      result += char
      if (char === stringChar && sql[i - 1] !== '\\') {
        inString = false
      }
      continue
    }
    
    if (char === "'" || char === '"') {
      result += char
      inString = true
      stringChar = char
      continue
    }
    
    result += char
  }
  
  return result.trim()
}

export function SqlFormatTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [indentSize, setIndentSize] = useState(2)
  const [uppercase, setUppercase] = useState(true)

  const handleFormat = () => {
    let result = formatSql(input, indentSize)
    if (!uppercase) {
      KEYWORDS.forEach(kw => {
        result = result.replace(new RegExp(`\\b${kw}\\b`, 'g'), kw.toLowerCase())
      })
    }
    setOutput(result)
  }

  const handleMinify = () => {
    setOutput(minifySql(input))
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">SQL 格式化</h2>
      <p className="text-sm text-muted-foreground">
        格式化和压缩 SQL 语句，支持关键字大小写转换
      </p>

      <div className="space-y-2">
        <label className="text-sm font-medium">输入 SQL</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="SELECT * FROM users WHERE id = 1"
          className="w-full h-40 p-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-sm"
        />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <label className="text-sm">缩进:</label>
          <select
            value={indentSize}
            onChange={(e) => setIndentSize(Number(e.target.value))}
            className="px-2 py-1 rounded bg-secondary border border-border text-sm"
          >
            <option value={2}>2 空格</option>
            <option value={4}>4 空格</option>
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={uppercase}
            onChange={(e) => setUppercase(e.target.checked)}
            className="w-4 h-4 rounded"
          />
          <span className="text-sm">关键字大写</span>
        </label>
        <div className="flex gap-2 ml-auto">
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
        </div>
      </div>

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
          placeholder="格式化结果..."
          className="w-full h-48 p-3 rounded-lg bg-muted border border-border focus:outline-none resize-none font-mono text-sm"
        />
      </div>
    </div>
  )
}
