import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Copy, RefreshCw, Check } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function LoremIpsumTool() {
  const [count, setCount] = useState(3)
  const [unit, setUnit] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs')
  const [output, setOutput] = useState('')
  const [copied, setCopied] = useState(false)

  const generate = () => {
    const words = [
      'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
      'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
      'magna', 'aliqua', 'ut', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
      'exercitation', 'ullamco', 'laboris', 'nisi', 'ut', 'aliquip', 'ex', 'ea',
      'commodo', 'consequat', 'duis', 'aute', 'irure', 'dolor', 'in', 'reprehenderit',
      'in', 'voluptate', 'velit', 'esse', 'cillum', 'dolore', 'eu', 'fugiat', 'nulla',
      'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident',
      'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
    ]

    const generateSentence = () => {
      const len = Math.floor(Math.random() * 10) + 8
      const sentenceWords = []
      for (let i = 0; i < len; i++) {
        sentenceWords.push(words[Math.floor(Math.random() * words.length)])
      }
      const s = sentenceWords.join(' ')
      return s.charAt(0).toUpperCase() + s.slice(1) + '.'
    }

    const generateParagraph = () => {
      const len = Math.floor(Math.random() * 5) + 3
      const sentences = []
      for (let i = 0; i < len; i++) {
        sentences.push(generateSentence())
      }
      return sentences.join(' ')
    }

    let result = ''
    if (unit === 'words') {
      const w = []
      for (let i = 0; i < count; i++) {
        w.push(words[Math.floor(Math.random() * words.length)])
      }
      result = w.join(' ')
    } else if (unit === 'sentences') {
      const s = []
      for (let i = 0; i < count; i++) {
        s.push(generateSentence())
      }
      result = s.join(' ')
    } else {
      const p = []
      for (let i = 0; i < count; i++) {
        p.push(generateParagraph())
      }
      result = p.join('\n\n')
    }

    setOutput(result)
  }

  // Generate initial text
  useEffect(() => {
    generate()
  }, [])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Lorem Ipsum 生成器</h2>
          <p className="text-sm text-muted-foreground">生成占位文本</p>
        </div>
      </div>

      <div className="flex gap-4 items-end">
        <div className="flex flex-col gap-2">
          <Label>数量</Label>
          <Input 
            type="number" 
            min="1" 
            max="100" 
            value={count} 
            onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-24"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label>单位</Label>
          <Select value={unit} onValueChange={(v: any) => setUnit(v)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="paragraphs">段落</SelectItem>
              <SelectItem value="sentences">句子</SelectItem>
              <SelectItem value="words">单词</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={generate}>
          <RefreshCw className="w-4 h-4 mr-2" />
          重新生成
        </Button>
      </div>

      <div className="flex-1 relative border rounded-lg overflow-hidden bg-muted/10 min-h-[400px]">
        <div className="absolute top-2 right-2 z-10">
          <Button variant="secondary" size="sm" onClick={copyToClipboard}>
            {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
            {copied ? '已复制' : '复制'}
          </Button>
        </div>
        <Textarea 
          value={output}
          readOnly
          className="absolute inset-0 w-full h-full resize-none border-0 p-4 pr-24 text-base leading-relaxed"
        />
      </div>
    </div>
  )
}
