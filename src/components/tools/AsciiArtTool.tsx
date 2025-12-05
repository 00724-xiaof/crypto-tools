import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
// import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Type, Copy, Check, RefreshCw } from 'lucide-react'

// 简化的 ASCII 艺术字体
const FONTS: Record<string, Record<string, string[]>> = {
  standard: {
    'A': ['  █  ', ' █ █ ', '█████', '█   █', '█   █'],
    'B': ['████ ', '█   █', '████ ', '█   █', '████ '],
    'C': [' ████', '█    ', '█    ', '█    ', ' ████'],
    'D': ['████ ', '█   █', '█   █', '█   █', '████ '],
    'E': ['█████', '█    ', '████ ', '█    ', '█████'],
    'F': ['█████', '█    ', '████ ', '█    ', '█    '],
    'G': [' ████', '█    ', '█  ██', '█   █', ' ████'],
    'H': ['█   █', '█   █', '█████', '█   █', '█   █'],
    'I': ['█████', '  █  ', '  █  ', '  █  ', '█████'],
    'J': ['█████', '   █ ', '   █ ', '█  █ ', ' ██  '],
    'K': ['█   █', '█  █ ', '███  ', '█  █ ', '█   █'],
    'L': ['█    ', '█    ', '█    ', '█    ', '█████'],
    'M': ['█   █', '██ ██', '█ █ █', '█   █', '█   █'],
    'N': ['█   █', '██  █', '█ █ █', '█  ██', '█   █'],
    'O': [' ███ ', '█   █', '█   █', '█   █', ' ███ '],
    'P': ['████ ', '█   █', '████ ', '█    ', '█    '],
    'Q': [' ███ ', '█   █', '█ █ █', '█  █ ', ' ██ █'],
    'R': ['████ ', '█   █', '████ ', '█  █ ', '█   █'],
    'S': [' ████', '█    ', ' ███ ', '    █', '████ '],
    'T': ['█████', '  █  ', '  █  ', '  █  ', '  █  '],
    'U': ['█   █', '█   █', '█   █', '█   █', ' ███ '],
    'V': ['█   █', '█   █', '█   █', ' █ █ ', '  █  '],
    'W': ['█   █', '█   █', '█ █ █', '██ ██', '█   █'],
    'X': ['█   █', ' █ █ ', '  █  ', ' █ █ ', '█   █'],
    'Y': ['█   █', ' █ █ ', '  █  ', '  █  ', '  █  '],
    'Z': ['█████', '   █ ', '  █  ', ' █   ', '█████'],
    '0': [' ███ ', '█  ██', '█ █ █', '██  █', ' ███ '],
    '1': ['  █  ', ' ██  ', '  █  ', '  █  ', '█████'],
    '2': [' ███ ', '█   █', '  ██ ', ' █   ', '█████'],
    '3': ['████ ', '    █', ' ███ ', '    █', '████ '],
    '4': ['█   █', '█   █', '█████', '    █', '    █'],
    '5': ['█████', '█    ', '████ ', '    █', '████ '],
    '6': [' ███ ', '█    ', '████ ', '█   █', ' ███ '],
    '7': ['█████', '    █', '   █ ', '  █  ', '  █  '],
    '8': [' ███ ', '█   █', ' ███ ', '█   █', ' ███ '],
    '9': [' ███ ', '█   █', ' ████', '    █', ' ███ '],
    ' ': ['     ', '     ', '     ', '     ', '     '],
    '!': ['  █  ', '  █  ', '  █  ', '     ', '  █  '],
    '?': [' ███ ', '█   █', '  ██ ', '     ', '  █  '],
    '.': ['     ', '     ', '     ', '     ', '  █  '],
    ',': ['     ', '     ', '     ', '  █  ', ' █   '],
    '-': ['     ', '     ', '█████', '     ', '     '],
    '+': ['     ', '  █  ', '█████', '  █  ', '     '],
    '=': ['     ', '█████', '     ', '█████', '     '],
  },
  banner: {
    'A': ['   #   ', '  # #  ', ' ##### ', '#     #', '#     #'],
    'B': ['###### ', '#     #', '###### ', '#     #', '###### '],
    'C': [' ##### ', '#      ', '#      ', '#      ', ' ##### '],
    'D': ['#####  ', '#    # ', '#    # ', '#    # ', '#####  '],
    'E': ['#######', '#      ', '####   ', '#      ', '#######'],
    'F': ['#######', '#      ', '####   ', '#      ', '#      '],
    'G': [' ##### ', '#      ', '#  ####', '#     #', ' ##### '],
    'H': ['#     #', '#     #', '#######', '#     #', '#     #'],
    'I': ['#######', '   #   ', '   #   ', '   #   ', '#######'],
    'J': ['#######', '    #  ', '    #  ', '#   #  ', ' ###   '],
    'K': ['#    # ', '#   #  ', '####   ', '#   #  ', '#    # '],
    'L': ['#      ', '#      ', '#      ', '#      ', '#######'],
    'M': ['#     #', '##   ##', '# # # #', '#     #', '#     #'],
    'N': ['#     #', '##    #', '# #   #', '#  #  #', '#   ## '],
    'O': [' ##### ', '#     #', '#     #', '#     #', ' ##### '],
    'P': ['###### ', '#     #', '###### ', '#      ', '#      '],
    'Q': [' ##### ', '#     #', '#   # #', '#    # ', ' #### #'],
    'R': ['###### ', '#     #', '###### ', '#   #  ', '#    # '],
    'S': [' ##### ', '#      ', ' ##### ', '      #', ' ##### '],
    'T': ['#######', '   #   ', '   #   ', '   #   ', '   #   '],
    'U': ['#     #', '#     #', '#     #', '#     #', ' ##### '],
    'V': ['#     #', '#     #', '#     #', ' #   # ', '  ###  '],
    'W': ['#     #', '#     #', '# # # #', '##   ##', '#     #'],
    'X': ['#     #', ' #   # ', '  ###  ', ' #   # ', '#     #'],
    'Y': ['#     #', ' #   # ', '  ###  ', '   #   ', '   #   '],
    'Z': ['#######', '    ## ', '   #   ', '  #    ', '#######'],
    ' ': ['       ', '       ', '       ', '       ', '       '],
  },
  small: {
    'A': [' _ ', '/_\\', '   '],
    'B': ['__ ', '|_)', '|_)'],
    'C': [' _ ', '/ ', '\\_'],
    'D': ['__ ', '| \\', '|_/'],
    'E': ['__ ', '|_ ', '|__'],
    'F': ['__ ', '|_ ', '|  '],
    'G': [' _ ', '/ _', '\\_|'],
    'H': ['   ', '|_|', '| |'],
    'I': ['_', '|', '|'],
    'J': [' _', ' |', '_|'],
    'K': ['   ', '|/ ', '|\\ '],
    'L': ['   ', '|  ', '|__'],
    'M': ['    ', '|\\/|', '|  |'],
    'N': ['   ', '|\\ |', '| \\|'],
    'O': [' _ ', '/ \\', '\\_/'],
    'P': ['__ ', '|_)', '|  '],
    'Q': [' _ ', '/ \\', '\\_X'],
    'R': ['__ ', '|_)', '| \\'],
    'S': [' _ ', '(_)', ' _)'],
    'T': ['___', ' | ', ' | '],
    'U': ['   ', '| |', '|_|'],
    'V': ['   ', '\\ /', ' V '],
    'W': ['    ', '|  |', '|/\\|'],
    'X': ['   ', '\\/ ', '/\\ '],
    'Y': ['   ', '\\/ ', ' | '],
    'Z': ['__', ' /', '/_'],
    ' ': ['  ', '  ', '  '],
  }
}

function textToAsciiArt(text: string, fontName: string): string {
  const font = FONTS[fontName] || FONTS.standard
  const chars = text.toUpperCase().split('')
  const height = font['A']?.length || 5
  
  const lines: string[] = Array(height).fill('')
  
  for (const char of chars) {
    const charArt = font[char] || font[' '] || Array(height).fill('     ')
    for (let i = 0; i < height; i++) {
      lines[i] += (charArt[i] || '') + ' '
    }
  }
  
  return lines.join('\n')
}

export function AsciiArtTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [font, setFont] = useState('standard')
  const [copied, setCopied] = useState(false)

  const generate = () => {
    setOutput(textToAsciiArt(input, font))
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
          <Type className="w-5 h-5" />
          ASCII 艺术字
        </h2>
        <p className="text-sm text-muted-foreground">将文本转换为 ASCII 艺术字</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-2">
          <Label>输入文本</Label>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入要转换的文本..."
            maxLength={20}
            onKeyDown={(e) => e.key === 'Enter' && generate()}
          />
          <p className="text-xs text-muted-foreground">支持字母、数字和部分符号，最多 20 个字符</p>
        </div>
        <div className="space-y-2">
          <Label>字体样式</Label>
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="standard">Standard (标准)</SelectItem>
              <SelectItem value="banner">Banner (横幅)</SelectItem>
              <SelectItem value="small">Small (小型)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={generate} disabled={!input.trim()} className="w-full">
        <RefreshCw className="w-4 h-4 mr-2" />
        生成 ASCII 艺术字
      </Button>

      {output && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>生成结果</Label>
            <Button variant="ghost" size="sm" onClick={handleCopy}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? '已复制' : '复制'}
            </Button>
          </div>
          <div className="p-4 bg-zinc-900 rounded-lg overflow-x-auto">
            <pre className="text-green-400 font-mono text-sm whitespace-pre">{output}</pre>
          </div>
        </div>
      )}

      {/* 预览示例 */}
      <div className="space-y-2">
        <Label className="text-muted-foreground">字体预览</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.keys(FONTS).map(fontName => (
            <div 
              key={fontName} 
              className="p-3 bg-zinc-900 rounded-lg cursor-pointer hover:ring-2 ring-primary transition-all"
              onClick={() => {
                setFont(fontName)
                if (input) generate()
              }}
            >
              <div className="text-xs text-zinc-500 mb-2">{fontName}</div>
              <pre className="text-green-400 font-mono text-xs whitespace-pre overflow-hidden">
                {textToAsciiArt('HI', fontName)}
              </pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
