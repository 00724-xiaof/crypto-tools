import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Hash, Copy, Check } from 'lucide-react'

const ROMAN_VALUES: [string, number][] = [
  ['M', 1000], ['CM', 900], ['D', 500], ['CD', 400],
  ['C', 100], ['XC', 90], ['L', 50], ['XL', 40],
  ['X', 10], ['IX', 9], ['V', 5], ['IV', 4], ['I', 1]
]

function toRoman(num: number): string {
  if (num <= 0 || num > 3999) return '超出范围 (1-3999)'
  let result = ''
  for (const [roman, value] of ROMAN_VALUES) {
    while (num >= value) {
      result += roman
      num -= value
    }
  }
  return result
}

function fromRoman(roman: string): number | string {
  const input = roman.toUpperCase().trim()
  if (!input) return ''
  if (!/^[MDCLXVI]+$/.test(input)) return '无效的罗马数字'
  
  let result = 0
  let i = 0
  
  for (const [romanStr, value] of ROMAN_VALUES) {
    while (input.substring(i, i + romanStr.length) === romanStr) {
      result += value
      i += romanStr.length
    }
  }
  
  // 验证转换是否正确
  if (toRoman(result) !== input) {
    return '无效的罗马数字格式'
  }
  
  return result
}

export function RomanNumeralTool() {
  const [arabicInput, setArabicInput] = useState('')
  const [romanInput, setRomanInput] = useState('')
  const [arabicOutput, setArabicOutput] = useState('')
  const [romanOutput, setRomanOutput] = useState('')
  const [copied, setCopied] = useState<'arabic' | 'roman' | null>(null)

  const convertToRoman = () => {
    const num = parseInt(arabicInput)
    if (isNaN(num)) {
      setRomanOutput('请输入有效数字')
      return
    }
    setRomanOutput(toRoman(num))
  }

  const convertToArabic = () => {
    const result = fromRoman(romanInput)
    setArabicOutput(String(result))
  }

  const handleCopy = async (text: string, type: 'arabic' | 'roman') => {
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  // 示例数据
  const examples = [
    { arabic: 1, roman: 'I' },
    { arabic: 4, roman: 'IV' },
    { arabic: 5, roman: 'V' },
    { arabic: 9, roman: 'IX' },
    { arabic: 10, roman: 'X' },
    { arabic: 40, roman: 'XL' },
    { arabic: 50, roman: 'L' },
    { arabic: 90, roman: 'XC' },
    { arabic: 100, roman: 'C' },
    { arabic: 400, roman: 'CD' },
    { arabic: 500, roman: 'D' },
    { arabic: 900, roman: 'CM' },
    { arabic: 1000, roman: 'M' },
    { arabic: 2024, roman: 'MMXXIV' },
    { arabic: 3999, roman: 'MMMCMXCIX' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Hash className="w-5 h-5" />
          罗马数字转换
        </h2>
        <p className="text-sm text-muted-foreground">阿拉伯数字与罗马数字互转</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 阿拉伯数字转罗马数字 */}
        <div className="space-y-4 p-4 border rounded-lg">
          <Label className="text-base font-medium">阿拉伯数字 → 罗马数字</Label>
          <div className="space-y-2">
            <Input
              type="number"
              value={arabicInput}
              onChange={(e) => setArabicInput(e.target.value)}
              placeholder="输入阿拉伯数字 (1-3999)"
              min={1}
              max={3999}
              onKeyDown={(e) => e.key === 'Enter' && convertToRoman()}
            />
            <Button onClick={convertToRoman} className="w-full" disabled={!arabicInput}>
              转换
            </Button>
          </div>
          {romanOutput && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="flex-1 font-mono text-xl font-bold">{romanOutput}</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleCopy(romanOutput, 'roman')}
              >
                {copied === 'roman' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>

        {/* 罗马数字转阿拉伯数字 */}
        <div className="space-y-4 p-4 border rounded-lg">
          <Label className="text-base font-medium">罗马数字 → 阿拉伯数字</Label>
          <div className="space-y-2">
            <Input
              value={romanInput}
              onChange={(e) => setRomanInput(e.target.value.toUpperCase())}
              placeholder="输入罗马数字 (如 MMXXIV)"
              className="font-mono uppercase"
              onKeyDown={(e) => e.key === 'Enter' && convertToArabic()}
            />
            <Button onClick={convertToArabic} className="w-full" disabled={!romanInput}>
              转换
            </Button>
          </div>
          {arabicOutput && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <span className="flex-1 font-mono text-xl font-bold">{arabicOutput}</span>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => handleCopy(arabicOutput, 'arabic')}
              >
                {copied === 'arabic' ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 对照表 */}
      <div className="space-y-2">
        <Label className="text-muted-foreground">常用对照表</Label>
        <div className="grid grid-cols-5 sm:grid-cols-8 lg:grid-cols-15 gap-2">
          {examples.map(({ arabic, roman }) => (
            <div 
              key={arabic} 
              className="p-2 bg-muted rounded text-center cursor-pointer hover:bg-accent transition-colors"
              onClick={() => {
                setArabicInput(String(arabic))
                setRomanOutput(roman)
              }}
            >
              <div className="font-mono font-bold">{roman}</div>
              <div className="text-xs text-muted-foreground">{arabic}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 规则说明 */}
      <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg space-y-1">
        <p className="font-medium">📜 罗马数字规则</p>
        <p>• I=1, V=5, X=10, L=50, C=100, D=500, M=1000</p>
        <p>• 小数字在大数字左边表示减法：IV=4, IX=9, XL=40, XC=90, CD=400, CM=900</p>
        <p>• 同一数字最多连续出现 3 次</p>
        <p>• 有效范围：1 - 3999</p>
      </div>
    </div>
  )
}
