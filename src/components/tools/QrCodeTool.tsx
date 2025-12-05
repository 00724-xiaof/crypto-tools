import { useState, useRef, useEffect } from 'react'
import { Copy, Download, CheckCircle } from 'lucide-react'
import QRCode from 'qrcode'

type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

export function QrCodeTool() {
  const [text, setText] = useState('https://example.com')
  const [size, setSize] = useState(256)
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [errorLevel, setErrorLevel] = useState<ErrorCorrectionLevel>('M')
  const [margin, setMargin] = useState(2)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copied, setCopied] = useState(false)

  const generateQrCode = async () => {
    const canvas = canvasRef.current
    if (!canvas || !text.trim()) return

    try {
      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin: margin,
        color: {
          dark: fgColor,
          light: bgColor
        },
        errorCorrectionLevel: errorLevel
      })
    } catch (error) {
      console.error('QR Code generation failed:', error)
    }
  }

  useEffect(() => {
    generateQrCode()
  }, [text, size, fgColor, bgColor, errorLevel, margin])

  const downloadQrCode = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const link = document.createElement('a')
    link.download = 'qrcode.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const copyDataUrl = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    try {
      // 尝试复制图片到剪贴板
      canvas.toBlob(async (blob) => {
        if (blob) {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ])
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
      })
    } catch {
      // 降级为复制 DataURL
      navigator.clipboard.writeText(canvas.toDataURL('image/png'))
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">二维码生成</h1>
        <p className="text-muted-foreground mt-1">生成可扫描的标准二维码</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">内容</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="输入要编码的内容..."
              className="w-full h-32 p-3 rounded-md border bg-background resize-none font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">尺寸</label>
              <select
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full p-2 rounded-md border bg-background text-sm"
              >
                <option value={128}>128 x 128</option>
                <option value={256}>256 x 256</option>
                <option value={384}>384 x 384</option>
                <option value={512}>512 x 512</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">容错率</label>
              <select
                value={errorLevel}
                onChange={(e) => setErrorLevel(e.target.value as ErrorCorrectionLevel)}
                className="w-full p-2 rounded-md border bg-background text-sm"
              >
                <option value="L">L - 7% (低)</option>
                <option value="M">M - 15% (中)</option>
                <option value="Q">Q - 25% (较高)</option>
                <option value="H">H - 30% (高)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">边距</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="6"
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-8 text-center text-sm">{margin}</span>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">前景色</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 p-2 rounded-md border bg-background font-mono text-sm"
                />
              </div>
            </div>

            <div className="space-y-2 col-span-2">
              <label className="text-sm font-medium">背景色</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 p-2 rounded-md border bg-background font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center p-4 bg-white rounded-lg border">
            <canvas
              ref={canvasRef}
              width={size}
              height={size}
              className="max-w-full"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={downloadQrCode}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <Download className="w-4 h-4" />
              下载PNG
            </button>
            <button
              onClick={copyDataUrl}
              className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? '已复制' : '复制'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
          <h3 className="font-medium text-green-600 dark:text-green-400">标准二维码</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          使用专业的 QRCode 库生成标准二维码，可被所有二维码扫描器正确识别。支持自定义容错率、边距和颜色。
        </p>
      </div>
    </div>
  )
}
