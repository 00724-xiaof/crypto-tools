import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Radio, Copy, Check, ArrowLeftRight, Volume2 } from 'lucide-react'

const MORSE_CODE: Record<string, string> = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..',
  '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
  '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', "'": '.----.', '!': '-.-.--',
  '/': '-..-.', '(': '-.--.', ')': '-.--.-', '&': '.-...', ':': '---...',
  ';': '-.-.-.', '=': '-...-', '+': '.-.-.', '-': '-....-', '_': '..--.-',
  '"': '.-..-.', '$': '...-..-', '@': '.--.-.', ' ': '/'
}

const REVERSE_MORSE: Record<string, string> = {}
Object.entries(MORSE_CODE).forEach(([char, code]) => {
  REVERSE_MORSE[code] = char
})

function textToMorse(text: string): string {
  return text.toUpperCase().split('').map(char => {
    return MORSE_CODE[char] || char
  }).join(' ')
}

function morseToText(morse: string): string {
  return morse.split(' ').map(code => {
    if (code === '/') return ' '
    return REVERSE_MORSE[code] || code
  }).join('')
}

export function MorseCodeTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encode' | 'decode'>('encode')
  const [copied, setCopied] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)

  const convert = () => {
    if (mode === 'encode') {
      setOutput(textToMorse(input))
    } else {
      setOutput(morseToText(input))
    }
  }

  const swap = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode')
    setInput(output)
    setOutput(input)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // 播放摩斯电码音频
  const playMorse = async () => {
    const morseCode = mode === 'encode' ? output : textToMorse(input)
    if (!morseCode || isPlaying) return

    setIsPlaying(true)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const dotDuration = 0.1 // 点的持续时间（秒）
    const dashDuration = dotDuration * 3 // 划的持续时间
    const symbolGap = dotDuration // 符号间隔
    const letterGap = dotDuration * 3 // 字母间隔
    const wordGap = dotDuration * 7 // 单词间隔

    let currentTime = audioContext.currentTime

    for (const symbol of morseCode) {
      if (symbol === '.') {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.frequency.value = 600
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.3, currentTime)
        oscillator.start(currentTime)
        oscillator.stop(currentTime + dotDuration)
        currentTime += dotDuration + symbolGap
      } else if (symbol === '-') {
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)
        oscillator.frequency.value = 600
        oscillator.type = 'sine'
        gainNode.gain.setValueAtTime(0.3, currentTime)
        oscillator.start(currentTime)
        oscillator.stop(currentTime + dashDuration)
        currentTime += dashDuration + symbolGap
      } else if (symbol === ' ') {
        currentTime += letterGap
      } else if (symbol === '/') {
        currentTime += wordGap
      }
    }

    // 等待播放完成
    setTimeout(() => {
      setIsPlaying(false)
      audioContext.close()
    }, (currentTime - audioContext.currentTime) * 1000 + 100)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Radio className="w-5 h-5" />
          摩斯电码
        </h2>
        <p className="text-sm text-muted-foreground">文本与摩斯电码互转</p>
      </div>

      <div className="flex items-center justify-center gap-4">
        <span className={`text-sm font-medium ${mode === 'encode' ? 'text-primary' : 'text-muted-foreground'}`}>
          文本
        </span>
        <Button variant="outline" size="sm" onClick={swap}>
          <ArrowLeftRight className="w-4 h-4" />
        </Button>
        <span className={`text-sm font-medium ${mode === 'decode' ? 'text-primary' : 'text-muted-foreground'}`}>
          摩斯电码
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{mode === 'encode' ? '文本输入' : '摩斯电码输入'}</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={mode === 'encode' ? '输入要转换的文本...' : '输入摩斯电码（用空格分隔）...'}
            className="h-[200px] font-mono resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>{mode === 'encode' ? '摩斯电码' : '文本输出'}</Label>
            <div className="flex gap-1">
              {mode === 'encode' && output && (
                <Button variant="ghost" size="sm" onClick={playMorse} disabled={isPlaying}>
                  <Volume2 className={`w-4 h-4 mr-1 ${isPlaying ? 'animate-pulse' : ''}`} />
                  {isPlaying ? '播放中...' : '播放'}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output}>
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? '已复制' : '复制'}
              </Button>
            </div>
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="转换结果..."
            className="h-[200px] font-mono resize-none"
          />
        </div>
      </div>

      <Button onClick={convert} disabled={!input.trim()} className="w-full">
        {mode === 'encode' ? '转换为摩斯电码' : '转换为文本'}
      </Button>

      {/* 摩斯电码表 */}
      <div className="space-y-2">
        <Label className="text-muted-foreground">摩斯电码对照表</Label>
        <div className="grid grid-cols-6 sm:grid-cols-9 gap-2 text-sm">
          {Object.entries(MORSE_CODE).slice(0, 36).map(([char, code]) => (
            <div key={char} className="p-2 bg-muted rounded text-center">
              <div className="font-bold">{char === ' ' ? '空格' : char}</div>
              <div className="font-mono text-xs text-muted-foreground">{code}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-xs text-muted-foreground p-3 bg-muted/50 rounded-lg">
        <p className="font-medium mb-1">📡 摩斯电码规则</p>
        <p>• 点 (.) 表示短信号，划 (-) 表示长信号</p>
        <p>• 字母之间用空格分隔，单词之间用 / 分隔</p>
        <p>• 划的长度是点的 3 倍</p>
      </div>
    </div>
  )
}
