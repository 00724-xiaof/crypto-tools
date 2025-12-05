import { useState, useMemo } from 'react'
import { Copy } from 'lucide-react'

interface TextStats {
  characters: number
  charactersNoSpaces: number
  words: number
  lines: number
  paragraphs: number
  sentences: number
  chineseChars: number
  englishWords: number
  numbers: number
  spaces: number
  punctuation: number
  bytes: number
}

function analyzeText(text: string): TextStats {
  const chineseRegex = /[\u4e00-\u9fa5]/g
  const englishWordRegex = /[a-zA-Z]+/g
  const numberRegex = /\d+/g
  const punctuationRegex = /[.,!?;:'"()[\]{}，。！？；：""''（）【】《》]/g
  const sentenceRegex = /[.!?。！？]+/g
  
  const chineseChars = (text.match(chineseRegex) || []).length
  const englishWords = (text.match(englishWordRegex) || []).length
  const numbers = (text.match(numberRegex) || []).length
  const spaces = (text.match(/\s/g) || []).length
  const punctuation = (text.match(punctuationRegex) || []).length
  
  const lines = text ? text.split('\n').length : 0
  const paragraphs = text ? text.split(/\n\s*\n/).filter(p => p.trim()).length : 0
  const sentences = (text.match(sentenceRegex) || []).length || (text.trim() ? 1 : 0)
  
  // 计算总词数（中文字符 + 英文单词）
  const words = chineseChars + englishWords
  
  return {
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    words,
    lines,
    paragraphs,
    sentences,
    chineseChars,
    englishWords,
    numbers,
    spaces,
    punctuation,
    bytes: new TextEncoder().encode(text).length,
  }
}

export function TextStatsTool() {
  const [text, setText] = useState('')
  
  const stats = useMemo(() => analyzeText(text), [text])

  const statItems = [
    { label: '总字符数', value: stats.characters },
    { label: '字符数（不含空格）', value: stats.charactersNoSpaces },
    { label: '总词数', value: stats.words },
    { label: '行数', value: stats.lines },
    { label: '段落数', value: stats.paragraphs },
    { label: '句子数', value: stats.sentences },
    { label: '中文字符', value: stats.chineseChars },
    { label: '英文单词', value: stats.englishWords },
    { label: '数字', value: stats.numbers },
    { label: '空白字符', value: stats.spaces },
    { label: '标点符号', value: stats.punctuation },
    { label: '字节数', value: stats.bytes },
  ]

  const copyStats = () => {
    const statsText = statItems.map(s => `${s.label}: ${s.value}`).join('\n')
    navigator.clipboard.writeText(statsText)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">字符统计</h2>
        <button
          onClick={copyStats}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Copy className="w-4 h-4" />
          复制统计
        </button>
      </div>
      <p className="text-sm text-muted-foreground">
        统计文本的字符数、词数、行数等信息
      </p>

      <div className="space-y-2">
        <label className="text-sm font-medium">输入文本</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="在此输入或粘贴文本..."
          className="w-full h-48 p-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {statItems.map((item) => (
          <div key={item.label} className="p-3 rounded-lg bg-secondary">
            <p className="text-2xl font-bold text-primary">{item.value.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </div>
        ))}
      </div>

      {text && (
        <div className="p-4 rounded-lg bg-muted">
          <p className="text-sm text-muted-foreground">
            预计阅读时间: <span className="text-foreground font-medium">
              {Math.max(1, Math.ceil(stats.words / 200))} 分钟
            </span>
            （按每分钟 200 词计算）
          </p>
        </div>
      )}
    </div>
  )
}
