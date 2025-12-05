import { useState } from 'react'
import { Copy, ArrowRight } from 'lucide-react'

type UnitCategory = 'storage' | 'time' | 'length' | 'weight' | 'temperature'

interface UnitDef {
  name: string
  toBase: (v: number) => number
  fromBase: (v: number) => number
}

const UNITS: Record<UnitCategory, { name: string; base: string; units: Record<string, UnitDef> }> = {
  storage: {
    name: '存储容量',
    base: 'bytes',
    units: {
      b: { name: 'Bits', toBase: v => v / 8, fromBase: v => v * 8 },
      B: { name: 'Bytes', toBase: v => v, fromBase: v => v },
      KB: { name: 'KB', toBase: v => v * 1024, fromBase: v => v / 1024 },
      MB: { name: 'MB', toBase: v => v * 1024 ** 2, fromBase: v => v / 1024 ** 2 },
      GB: { name: 'GB', toBase: v => v * 1024 ** 3, fromBase: v => v / 1024 ** 3 },
      TB: { name: 'TB', toBase: v => v * 1024 ** 4, fromBase: v => v / 1024 ** 4 },
      PB: { name: 'PB', toBase: v => v * 1024 ** 5, fromBase: v => v / 1024 ** 5 },
      KiB: { name: 'KiB (1000)', toBase: v => v * 1000, fromBase: v => v / 1000 },
      MiB: { name: 'MiB (1000²)', toBase: v => v * 1000 ** 2, fromBase: v => v / 1000 ** 2 },
      GiB: { name: 'GiB (1000³)', toBase: v => v * 1000 ** 3, fromBase: v => v / 1000 ** 3 },
    }
  },
  time: {
    name: '时间',
    base: 'seconds',
    units: {
      ms: { name: '毫秒', toBase: v => v / 1000, fromBase: v => v * 1000 },
      s: { name: '秒', toBase: v => v, fromBase: v => v },
      min: { name: '分钟', toBase: v => v * 60, fromBase: v => v / 60 },
      h: { name: '小时', toBase: v => v * 3600, fromBase: v => v / 3600 },
      d: { name: '天', toBase: v => v * 86400, fromBase: v => v / 86400 },
      w: { name: '周', toBase: v => v * 604800, fromBase: v => v / 604800 },
      mo: { name: '月 (30天)', toBase: v => v * 2592000, fromBase: v => v / 2592000 },
      y: { name: '年 (365天)', toBase: v => v * 31536000, fromBase: v => v / 31536000 },
    }
  },
  length: {
    name: '长度',
    base: 'meters',
    units: {
      mm: { name: '毫米', toBase: v => v / 1000, fromBase: v => v * 1000 },
      cm: { name: '厘米', toBase: v => v / 100, fromBase: v => v * 100 },
      m: { name: '米', toBase: v => v, fromBase: v => v },
      km: { name: '千米', toBase: v => v * 1000, fromBase: v => v / 1000 },
      in: { name: '英寸', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
      ft: { name: '英尺', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
      yd: { name: '码', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
      mi: { name: '英里', toBase: v => v * 1609.344, fromBase: v => v / 1609.344 },
    }
  },
  weight: {
    name: '重量',
    base: 'grams',
    units: {
      mg: { name: '毫克', toBase: v => v / 1000, fromBase: v => v * 1000 },
      g: { name: '克', toBase: v => v, fromBase: v => v },
      kg: { name: '千克', toBase: v => v * 1000, fromBase: v => v / 1000 },
      t: { name: '吨', toBase: v => v * 1000000, fromBase: v => v / 1000000 },
      oz: { name: '盎司', toBase: v => v * 28.3495, fromBase: v => v / 28.3495 },
      lb: { name: '磅', toBase: v => v * 453.592, fromBase: v => v / 453.592 },
    }
  },
  temperature: {
    name: '温度',
    base: 'celsius',
    units: {
      C: { name: '摄氏度 °C', toBase: v => v, fromBase: v => v },
      F: { name: '华氏度 °F', toBase: v => (v - 32) * 5 / 9, fromBase: v => v * 9 / 5 + 32 },
      K: { name: '开尔文 K', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    }
  }
}

export function UnitConverterTool() {
  const [category, setCategory] = useState<UnitCategory>('storage')
  const [fromUnit, setFromUnit] = useState('MB')
  const [toUnit, setToUnit] = useState('GB')
  const [inputValue, setInputValue] = useState('')
  const [result, setResult] = useState('')

  const currentUnits = UNITS[category].units

  const handleConvert = () => {
    const value = parseFloat(inputValue)
    if (isNaN(value)) {
      setResult('')
      return
    }

    const baseValue = currentUnits[fromUnit].toBase(value)
    const converted = currentUnits[toUnit].fromBase(baseValue)
    
    // 格式化结果
    if (Math.abs(converted) < 0.000001 || Math.abs(converted) > 999999999) {
      setResult(converted.toExponential(6))
    } else {
      setResult(converted.toLocaleString('en-US', { maximumFractionDigits: 10 }))
    }
  }

  const handleCategoryChange = (newCategory: UnitCategory) => {
    setCategory(newCategory)
    const units = Object.keys(UNITS[newCategory].units)
    setFromUnit(units[0])
    setToUnit(units[1] || units[0])
    setResult('')
  }

  const swapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
    setResult('')
  }

  const copyResult = () => {
    navigator.clipboard.writeText(result)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">单位换算</h2>
      <p className="text-sm text-muted-foreground">
        存储容量、时间、长度、重量、温度单位转换
      </p>

      <div className="flex flex-wrap gap-2">
        {Object.entries(UNITS).map(([key, { name }]) => (
          <button
            key={key}
            onClick={() => handleCategoryChange(key as UnitCategory)}
            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
              category === key
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary hover:bg-accent'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr,auto,1fr] gap-4 items-end">
        <div className="space-y-2">
          <label className="text-sm font-medium">从</label>
          <select
            value={fromUnit}
            onChange={(e) => { setFromUnit(e.target.value); setResult('') }}
            className="w-full p-2 rounded-lg bg-secondary border border-border"
          >
            {Object.entries(currentUnits).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入数值"
            className="w-full p-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary font-mono"
          />
        </div>

        <button
          onClick={swapUnits}
          className="p-2 rounded-lg bg-secondary hover:bg-accent transition-colors mb-3"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <label className="text-sm font-medium">到</label>
          <select
            value={toUnit}
            onChange={(e) => { setToUnit(e.target.value); setResult('') }}
            className="w-full p-2 rounded-lg bg-secondary border border-border"
          >
            {Object.entries(currentUnits).map(([key, { name }]) => (
              <option key={key} value={key}>{name}</option>
            ))}
          </select>
          <div className="relative">
            <input
              type="text"
              value={result}
              readOnly
              placeholder="结果"
              className="w-full p-3 rounded-lg bg-muted border border-border font-mono pr-10"
            />
            {result && (
              <button
                onClick={copyResult}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-secondary rounded"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={handleConvert}
        className="w-full py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
      >
        转换
      </button>
    </div>
  )
}
