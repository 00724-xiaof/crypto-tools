import { useState, useMemo } from 'react'
import { Copy, AlertCircle, CheckCircle } from 'lucide-react'

export function RegexTool() {
  const [pattern, setPattern] = useState('')
  const [flags, setFlags] = useState('g')
  const [testString, setTestString] = useState('')
  const [replaceWith, setReplaceWith] = useState('')

  const regexResult = useMemo(() => {
    if (!pattern) return { valid: true, matches: [], replaced: testString, error: '' }

    try {
      const regex = new RegExp(pattern, flags)
      const matches: { match: string; index: number; groups: string[] }[] = []

      if (flags.includes('g')) {
        let match
        while ((match = regex.exec(testString)) !== null) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          })
          if (!match[0]) break // Prevent infinite loop for empty matches
        }
      } else {
        const match = regex.exec(testString)
        if (match) {
          matches.push({
            match: match[0],
            index: match.index,
            groups: match.slice(1)
          })
        }
      }

      const replaced = testString.replace(regex, replaceWith)

      return { valid: true, matches, replaced, error: '' }
    } catch (e) {
      return { valid: false, matches: [], replaced: testString, error: (e as Error).message }
    }
  }, [pattern, flags, testString, replaceWith])

  const highlightedText = useMemo(() => {
    if (!pattern || !regexResult.valid || regexResult.matches.length === 0) {
      return testString
    }

    try {
      const regex = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g')
      return testString.replace(regex, (match) => `【${match}】`)
    } catch {
      return testString
    }
  }, [pattern, flags, testString, regexResult])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const commonPatterns = [
    { name: '邮箱', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
    { name: '手机号', pattern: '1[3-9]\\d{9}' },
    { name: 'URL', pattern: 'https?://[\\w\\-._~:/?#[\\]@!$&\'()*+,;=%]+' },
    { name: 'IP地址', pattern: '\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}' },
    { name: '身份证', pattern: '\\d{17}[\\dXx]' },
    { name: '日期', pattern: '\\d{4}[-/]\\d{1,2}[-/]\\d{1,2}' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">正则表达式测试</h1>
        <p className="text-muted-foreground mt-1">在线正则表达式匹配和替换测试</p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">正则表达式</label>
          <div className="flex items-center gap-2">
            {regexResult.valid ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-500" />
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <span className="px-3 py-2 bg-muted rounded-l-md border-y border-l text-muted-foreground">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="输入正则表达式"
            className="flex-1 p-2 border-y bg-background font-mono text-sm"
          />
          <span className="px-3 py-2 bg-muted border-y text-muted-foreground">/</span>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            placeholder="flags"
            className="w-16 p-2 rounded-r-md border bg-background font-mono text-sm text-center"
          />
        </div>
        {!regexResult.valid && (
          <p className="text-sm text-red-500">{regexResult.error}</p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">常用:</span>
        {commonPatterns.map((p) => (
          <button
            key={p.name}
            onClick={() => setPattern(p.pattern)}
            className="px-2 py-1 text-xs bg-secondary rounded hover:bg-secondary/80 transition-colors"
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={flags.includes('g')}
            onChange={(e) => setFlags(e.target.checked ? flags + 'g' : flags.replace('g', ''))}
          />
          全局(g)
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={flags.includes('i')}
            onChange={(e) => setFlags(e.target.checked ? flags + 'i' : flags.replace('i', ''))}
          />
          忽略大小写(i)
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={flags.includes('m')}
            onChange={(e) => setFlags(e.target.checked ? flags + 'm' : flags.replace('m', ''))}
          />
          多行(m)
        </label>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={flags.includes('s')}
            onChange={(e) => setFlags(e.target.checked ? flags + 's' : flags.replace('s', ''))}
          />
          点匹配换行(s)
        </label>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">测试字符串</label>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="输入要测试的字符串..."
          className="w-full h-32 p-3 rounded-md border bg-background resize-none font-mono text-sm"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          匹配结果 ({regexResult.matches.length} 个匹配)
        </label>
        <div className="p-3 rounded-md border bg-muted/50 font-mono text-sm whitespace-pre-wrap min-h-[80px]">
          {highlightedText || <span className="text-muted-foreground">无匹配结果</span>}
        </div>
      </div>

      {regexResult.matches.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium">匹配详情</label>
          <div className="max-h-48 overflow-y-auto border rounded-md">
            <table className="w-full text-sm">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">匹配内容</th>
                  <th className="px-3 py-2 text-left">位置</th>
                  <th className="px-3 py-2 text-left">分组</th>
                </tr>
              </thead>
              <tbody>
                {regexResult.matches.map((m, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2 font-mono">{m.match}</td>
                    <td className="px-3 py-2">{m.index}</td>
                    <td className="px-3 py-2 font-mono">{m.groups.join(', ') || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-sm font-medium">替换</label>
        <input
          type="text"
          value={replaceWith}
          onChange={(e) => setReplaceWith(e.target.value)}
          placeholder="替换为..."
          className="w-full p-3 rounded-md border bg-background font-mono text-sm"
        />
      </div>

      {replaceWith && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">替换结果</label>
            <button onClick={() => copyToClipboard(regexResult.replaced)} className="p-1 hover:bg-accent rounded">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={regexResult.replaced}
            readOnly
            className="w-full h-24 p-3 rounded-md border bg-muted/50 resize-none font-mono text-sm"
          />
        </div>
      )}
    </div>
  )
}
