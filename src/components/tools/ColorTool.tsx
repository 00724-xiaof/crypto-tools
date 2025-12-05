import { useState } from 'react'
import { Copy } from 'lucide-react'

interface ColorValues {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  hsv: { h: number; s: number; v: number }
  cmyk: { c: number; m: number; y: number; k: number }
}

export function ColorTool() {
  const [color, setColor] = useState<ColorValues>({
    hex: '#6366f1',
    rgb: { r: 99, g: 102, b: 241 },
    hsl: { h: 239, s: 84, l: 67 },
    hsv: { h: 239, s: 59, v: 95 },
    cmyk: { c: 59, m: 58, y: 0, k: 5 }
  })

  const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')
  }

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0, s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }

  const rgbToHsv = (r: number, g: number, b: number): { h: number; s: number; v: number } => {
    r /= 255; g /= 255; b /= 255
    const max = Math.max(r, g, b), min = Math.min(r, g, b)
    let h = 0
    const v = max
    const d = max - min
    const s = max === 0 ? 0 : d / max

    if (max !== min) {
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
        case g: h = ((b - r) / d + 2) / 6; break
        case b: h = ((r - g) / d + 4) / 6; break
      }
    }

    return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) }
  }

  const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
    if (r === 0 && g === 0 && b === 0) {
      return { c: 0, m: 0, y: 0, k: 100 }
    }
    
    const c = 1 - r / 255
    const m = 1 - g / 255
    const y = 1 - b / 255
    const k = Math.min(c, m, y)

    return {
      c: Math.round(((c - k) / (1 - k)) * 100),
      m: Math.round(((m - k) / (1 - k)) * 100),
      y: Math.round(((y - k) / (1 - k)) * 100),
      k: Math.round(k * 100)
    }
  }

  const updateFromHex = (hex: string) => {
    const rgb = hexToRgb(hex)
    if (rgb) {
      setColor({
        hex,
        rgb,
        hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
        hsv: rgbToHsv(rgb.r, rgb.g, rgb.b),
        cmyk: rgbToCmyk(rgb.r, rgb.g, rgb.b)
      })
    }
  }

  const updateFromRgb = (r: number, g: number, b: number) => {
    setColor({
      hex: rgbToHex(r, g, b),
      rgb: { r, g, b },
      hsl: rgbToHsl(r, g, b),
      hsv: rgbToHsv(r, g, b),
      cmyk: rgbToCmyk(r, g, b)
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const presetColors = [
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6',
    '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#64748b'
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">颜色转换</h1>
        <p className="text-muted-foreground mt-1">HEX、RGB、HSL、HSV、CMYK 颜色格式互转</p>
      </div>

      <div className="flex items-center gap-4">
        <div
          className="w-24 h-24 rounded-lg border shadow-inner"
          style={{ backgroundColor: color.hex }}
        />
        <input
          type="color"
          value={color.hex}
          onChange={(e) => updateFromHex(e.target.value)}
          className="w-16 h-16 rounded cursor-pointer"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {presetColors.map((c) => (
          <button
            key={c}
            onClick={() => updateFromHex(c)}
            className="w-8 h-8 rounded border hover:scale-110 transition-transform"
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">HEX</label>
            <button onClick={() => copyToClipboard(color.hex)} className="p-1 hover:bg-accent rounded">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={color.hex}
            onChange={(e) => updateFromHex(e.target.value)}
            className="w-full p-3 rounded-md border bg-background font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">RGB</label>
            <button 
              onClick={() => copyToClipboard(`rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`)} 
              className="p-1 hover:bg-accent rounded"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              max="255"
              value={color.rgb.r}
              onChange={(e) => updateFromRgb(Number(e.target.value), color.rgb.g, color.rgb.b)}
              className="w-full p-3 rounded-md border bg-background font-mono text-sm"
              placeholder="R"
            />
            <input
              type="number"
              min="0"
              max="255"
              value={color.rgb.g}
              onChange={(e) => updateFromRgb(color.rgb.r, Number(e.target.value), color.rgb.b)}
              className="w-full p-3 rounded-md border bg-background font-mono text-sm"
              placeholder="G"
            />
            <input
              type="number"
              min="0"
              max="255"
              value={color.rgb.b}
              onChange={(e) => updateFromRgb(color.rgb.r, color.rgb.g, Number(e.target.value))}
              className="w-full p-3 rounded-md border bg-background font-mono text-sm"
              placeholder="B"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">HSL</label>
            <button 
              onClick={() => copyToClipboard(`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`)} 
              className="p-1 hover:bg-accent rounded"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={`hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`}
            readOnly
            className="w-full p-3 rounded-md border bg-muted/50 font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">HSV</label>
            <button 
              onClick={() => copyToClipboard(`hsv(${color.hsv.h}, ${color.hsv.s}%, ${color.hsv.v}%)`)} 
              className="p-1 hover:bg-accent rounded"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={`hsv(${color.hsv.h}, ${color.hsv.s}%, ${color.hsv.v}%)`}
            readOnly
            className="w-full p-3 rounded-md border bg-muted/50 font-mono text-sm"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">CMYK</label>
            <button 
              onClick={() => copyToClipboard(`cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`)} 
              className="p-1 hover:bg-accent rounded"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            value={`cmyk(${color.cmyk.c}%, ${color.cmyk.m}%, ${color.cmyk.y}%, ${color.cmyk.k}%)`}
            readOnly
            className="w-full p-3 rounded-md border bg-muted/50 font-mono text-sm"
          />
        </div>
      </div>

      <div className="p-4 bg-secondary/50 rounded-lg">
        <h3 className="font-medium mb-2">CSS 代码</h3>
        <pre className="text-sm font-mono text-muted-foreground">
{`background-color: ${color.hex};
color: rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b});
border-color: hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%);`}
        </pre>
      </div>
    </div>
  )
}
