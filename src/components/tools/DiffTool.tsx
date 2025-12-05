import { useState, useMemo } from 'react'
import { ArrowRightLeft } from 'lucide-react'

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged'
  content: string
  lineNumber: { left?: number; right?: number }
}

export function DiffTool() {
  const [leftText, setLeftText] = useState('')
  const [rightText, setRightText] = useState('')
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(false)
  const [ignoreCase, setIgnoreCase] = useState(false)

  const diff = useMemo(() => {
    const leftLines = leftText.split('\n')
    const rightLines = rightText.split('\n')

    const normalize = (line: string): string => {
      let result = line
      if (ignoreWhitespace) result = result.replace(/\s+/g, ' ').trim()
      if (ignoreCase) result = result.toLowerCase()
      return result
    }

    // Simple LCS-based diff
    const lcs = (a: string[], b: string[]): number[][] => {
      const m = a.length, n = b.length
      const dp: number[][] = Array(m + 1).fill(0).map(() => Array(n + 1).fill(0))

      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          if (normalize(a[i - 1]) === normalize(b[j - 1])) {
            dp[i][j] = dp[i - 1][j - 1] + 1
          } else {
            dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
          }
        }
      }
      return dp
    }

    const buildDiff = (a: string[], b: string[], dp: number[][]): DiffLine[] => {
      const result: DiffLine[] = []
      let i = a.length, j = b.length

      while (i > 0 || j > 0) {
        if (i > 0 && j > 0 && normalize(a[i - 1]) === normalize(b[j - 1])) {
          result.unshift({
            type: 'unchanged',
            content: a[i - 1],
            lineNumber: { left: i, right: j }
          })
          i--
          j--
        } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
          result.unshift({
            type: 'added',
            content: b[j - 1],
            lineNumber: { right: j }
          })
          j--
        } else if (i > 0) {
          result.unshift({
            type: 'removed',
            content: a[i - 1],
            lineNumber: { left: i }
          })
          i--
        }
      }
      return result
    }

    const dp = lcs(leftLines, rightLines)
    return buildDiff(leftLines, rightLines, dp)
  }, [leftText, rightText, ignoreWhitespace, ignoreCase])

  const stats = useMemo(() => {
    return {
      added: diff.filter(d => d.type === 'added').length,
      removed: diff.filter(d => d.type === 'removed').length,
      unchanged: diff.filter(d => d.type === 'unchanged').length
    }
  }, [diff])

  const swapTexts = () => {
    const temp = leftText
    setLeftText(rightText)
    setRightText(temp)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">文本对比</h1>
        <p className="text-muted-foreground mt-1">比较两段文本的差异</p>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={ignoreWhitespace}
            onChange={(e) => setIgnoreWhitespace(e.target.checked)}
          />
          忽略空白字符
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={ignoreCase}
            onChange={(e) => setIgnoreCase(e.target.checked)}
          />
          忽略大小写
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">原始文本</label>
          <textarea
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder="输入原始文本..."
            className="w-full h-48 p-3 rounded-md border bg-background resize-none font-mono text-sm"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">修改后文本</label>
            <button
              onClick={swapTexts}
              className="p-1.5 rounded hover:bg-accent transition-colors"
              title="交换"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder="输入修改后文本..."
            className="w-full h-48 p-3 rounded-md border bg-background resize-none font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex gap-4 text-sm">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-green-500/30"></span>
          新增: {stats.added}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-red-500/30"></span>
          删除: {stats.removed}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-muted"></span>
          未变: {stats.unchanged}
        </span>
      </div>

      {(leftText || rightText) && (
        <div className="space-y-2">
          <label className="text-sm font-medium">差异结果</label>
          <div className="border rounded-md overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {diff.map((line, index) => (
                <div
                  key={index}
                  className={`flex font-mono text-sm ${
                    line.type === 'added'
                      ? 'bg-green-500/20'
                      : line.type === 'removed'
                      ? 'bg-red-500/20'
                      : ''
                  }`}
                >
                  <div className="w-12 flex-shrink-0 px-2 py-1 text-right text-muted-foreground border-r bg-muted/50 select-none">
                    {line.lineNumber.left || ''}
                  </div>
                  <div className="w-12 flex-shrink-0 px-2 py-1 text-right text-muted-foreground border-r bg-muted/50 select-none">
                    {line.lineNumber.right || ''}
                  </div>
                  <div className="w-6 flex-shrink-0 px-1 py-1 text-center font-bold select-none">
                    {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ''}
                  </div>
                  <div className="flex-1 px-2 py-1 whitespace-pre overflow-x-auto">
                    {line.content || ' '}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-secondary/50 rounded-lg">
        <h3 className="font-medium mb-2">使用说明</h3>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li><span className="text-green-600">+</span> 表示新增的行</li>
          <li><span className="text-red-600">-</span> 表示删除的行</li>
          <li>无标记的行表示未修改</li>
          <li>左侧数字为原文件行号，右侧为新文件行号</li>
        </ul>
      </div>
    </div>
  )
}
