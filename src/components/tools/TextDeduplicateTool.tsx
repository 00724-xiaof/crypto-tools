import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ListFilter, Copy, Check, ArrowRight } from 'lucide-react'

type DedupeMode = 'line' | 'word' | 'char'
type SortMode = 'none' | 'asc' | 'desc'

export function TextDeduplicateTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<DedupeMode>('line')
  const [sortMode, setSortMode] = useState<SortMode>('none')
  const [caseSensitive, setCaseSensitive] = useState(true)
  const [trimWhitespace, setTrimWhitespace] = useState(true)
  const [copied, setCopied] = useState(false)
  const [stats, setStats] = useState({ before: 0, after: 0, removed: 0 })

  const deduplicate = () => {
    let items: string[] = []
    
    switch (mode) {
      case 'line':
        items = input.split('\n')
        break
      case 'word':
        items = input.split(/\s+/).filter(Boolean)
        break
      case 'char':
        items = input.split('')
        break
    }

    const beforeCount = items.length

    // 去重
    const seen = new Set<string>()
    const unique: string[] = []
    
    for (const item of items) {
      let processed = trimWhitespace ? item.trim() : item
      const key = caseSensitive ? processed : processed.toLowerCase()
      
      if (mode === 'line' && processed === '') {
        // 保留空行选项
        unique.push(item)
        continue
      }
      
      if (!seen.has(key)) {
        seen.add(key)
        unique.push(item)
      }
    }

    // 排序
    let result = unique
    if (sortMode !== 'none') {
      result = [...unique].sort((a, b) => {
        const aVal = caseSensitive ? a : a.toLowerCase()
        const bVal = caseSensitive ? b : b.toLowerCase()
        return sortMode === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal)
      })
    }

    // 输出
    let outputText = ''
    switch (mode) {
      case 'line':
        outputText = result.join('\n')
        break
      case 'word':
        outputText = result.join(' ')
        break
      case 'char':
        outputText = result.join('')
        break
    }

    setOutput(outputText)
    setStats({
      before: beforeCount,
      after: result.length,
      removed: beforeCount - result.length
    })
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ListFilter className="w-5 h-5" />
          文本去重
        </h2>
        <p className="text-sm text-muted-foreground">按行、单词或字符去除重复内容</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label>去重模式</Label>
          <Select value={mode} onValueChange={(v: DedupeMode) => setMode(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="line">按行去重</SelectItem>
              <SelectItem value="word">按单词去重</SelectItem>
              <SelectItem value="char">按字符去重</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>排序方式</Label>
          <Select value={sortMode} onValueChange={(v: SortMode) => setSortMode(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">保持原序</SelectItem>
              <SelectItem value="asc">升序排列</SelectItem>
              <SelectItem value="desc">降序排列</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>大小写</Label>
          <Select 
            value={caseSensitive ? 'sensitive' : 'insensitive'} 
            onValueChange={(v) => setCaseSensitive(v === 'sensitive')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sensitive">区分大小写</SelectItem>
              <SelectItem value="insensitive">忽略大小写</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>空白处理</Label>
          <Select 
            value={trimWhitespace ? 'trim' : 'keep'} 
            onValueChange={(v) => setTrimWhitespace(v === 'trim')}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trim">去除首尾空白</SelectItem>
              <SelectItem value="keep">保留空白</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>输入文本</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'line' 
              ? '每行一个内容...\n苹果\n香蕉\n苹果\n橙子' 
              : mode === 'word'
              ? '输入包含重复单词的文本...'
              : '输入包含重复字符的文本...'}
            className="h-[300px] font-mono text-sm resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>去重结果</Label>
            <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? '已复制' : '复制'}
            </Button>
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="去重后的结果..."
            className="h-[300px] font-mono text-sm resize-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button onClick={deduplicate} disabled={!input.trim()}>
          <ArrowRight className="w-4 h-4 mr-2" />
          执行去重
        </Button>
        {stats.before > 0 && (
          <div className="text-sm text-muted-foreground">
            原始: <span className="font-medium text-foreground">{stats.before}</span> 项 → 
            去重后: <span className="font-medium text-foreground">{stats.after}</span> 项
            <span className="text-green-600 ml-2">
              (移除 {stats.removed} 项重复)
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
