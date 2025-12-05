import { useState } from 'react'
import { Copy } from 'lucide-react'

// CRC32 lookup table
const makeCRCTable = (): number[] => {
  const table: number[] = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[n] = c >>> 0
  }
  return table
}

const CRC_TABLE = makeCRCTable()

const crc32 = (data: Uint8Array): number => {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ data[i]) & 0xff]
  }
  return (crc ^ 0xffffffff) >>> 0
}

// CRC16 variations
const crc16CCITT = (data: Uint8Array): number => {
  let crc = 0xffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i] << 8
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = (crc << 1) ^ 0x1021
      } else {
        crc <<= 1
      }
    }
  }
  return crc & 0xffff
}

const crc16Modbus = (data: Uint8Array): number => {
  let crc = 0xffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) {
      if (crc & 0x0001) {
        crc = (crc >>> 1) ^ 0xa001
      } else {
        crc >>>= 1
      }
    }
  }
  return crc & 0xffff
}

export function Crc32Tool() {
  const [input, setInput] = useState('')
  const [inputType, setInputType] = useState<'text' | 'hex'>('text')
  const [results, setResults] = useState({
    crc32: '',
    crc16ccitt: '',
    crc16modbus: ''
  })

  const hexToBytes = (hex: string): Uint8Array => {
    hex = hex.replace(/\s/g, '')
    const bytes = new Uint8Array(hex.length / 2)
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(hex.substr(i * 2, 2), 16)
    }
    return bytes
  }

  const handleCalculate = () => {
    try {
      let data: Uint8Array
      if (inputType === 'hex') {
        data = hexToBytes(input)
      } else {
        data = new TextEncoder().encode(input)
      }

      setResults({
        crc32: crc32(data).toString(16).toUpperCase().padStart(8, '0'),
        crc16ccitt: crc16CCITT(data).toString(16).toUpperCase().padStart(4, '0'),
        crc16modbus: crc16Modbus(data).toString(16).toUpperCase().padStart(4, '0')
      })
    } catch (error) {
      setResults({
        crc32: '计算错误',
        crc16ccitt: '计算错误',
        crc16modbus: '计算错误'
      })
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const data = new Uint8Array(reader.result as ArrayBuffer)
      setResults({
        crc32: crc32(data).toString(16).toUpperCase().padStart(8, '0'),
        crc16ccitt: crc16CCITT(data).toString(16).toUpperCase().padStart(4, '0'),
        crc16modbus: crc16Modbus(data).toString(16).toUpperCase().padStart(4, '0')
      })
    }
    reader.readAsArrayBuffer(file)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">CRC 校验</h1>
        <p className="text-muted-foreground mt-1">循环冗余校验计算</p>
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">输入类型:</label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={inputType === 'text'}
            onChange={() => setInputType('text')}
          />
          <span className="text-sm">文本</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={inputType === 'hex'}
            onChange={() => setInputType('hex')}
          />
          <span className="text-sm">Hex</span>
        </label>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">输入</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={inputType === 'text' ? '请输入文本...' : '请输入Hex数据...'}
          className="w-full h-32 p-3 rounded-md border bg-background resize-none font-mono text-sm"
        />
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleCalculate}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          计算CRC
        </button>
        <label className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors cursor-pointer">
          <input type="file" onChange={handleFileSelect} className="hidden" />
          选择文件
        </label>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">CRC-32</label>
            <button onClick={() => copyToClipboard(results.crc32)} className="p-1 hover:bg-accent rounded">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={results.crc32}
            readOnly
            placeholder="结果"
            className="w-full p-3 rounded-md border bg-muted/50 font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">CRC-16/CCITT</label>
            <button onClick={() => copyToClipboard(results.crc16ccitt)} className="p-1 hover:bg-accent rounded">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={results.crc16ccitt}
            readOnly
            placeholder="结果"
            className="w-full p-3 rounded-md border bg-muted/50 font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">CRC-16/Modbus</label>
            <button onClick={() => copyToClipboard(results.crc16modbus)} className="p-1 hover:bg-accent rounded">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={results.crc16modbus}
            readOnly
            placeholder="结果"
            className="w-full p-3 rounded-md border bg-muted/50 font-mono text-sm"
          />
        </div>
      </div>

      <div className="p-4 bg-secondary/50 rounded-lg">
        <h3 className="font-medium mb-2">关于CRC</h3>
        <p className="text-sm text-muted-foreground">
          CRC是一种数据校验方法，常用于检测数据传输或存储中的错误。
          CRC-32用于ZIP、PNG等格式，CRC-16 Modbus用于工业通信协议。
        </p>
      </div>
    </div>
  )
}
