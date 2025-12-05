import { useState, useRef, useCallback } from 'react'
import { Copy, Upload, X, Image } from 'lucide-react'
import jsQR from 'jsqr'

interface QRResult {
  text: string
  type: string
}

function detectType(text: string): string {
  if (/^https?:\/\//i.test(text)) return 'URL'
  if (/^mailto:/i.test(text)) return '邮箱'
  if (/^tel:/i.test(text)) return '电话'
  if (/^sms:/i.test(text)) return '短信'
  if (/^wifi:/i.test(text)) return 'WiFi'
  if (/^BEGIN:VCARD/i.test(text)) return '名片'
  if (/^BEGIN:VEVENT/i.test(text)) return '日历事件'
  if (/^\d+$/.test(text)) return '数字'
  return '文本'
}

export function QrScanTool() {
  const [result, setResult] = useState<QRResult | null>(null)
  const [error, setError] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [scanning, setScanning] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const processImage = useCallback(async (file: File) => {
    setError('')
    setResult(null)
    setScanning(true)

    try {
      const img = new window.Image()
      img.src = URL.createObjectURL(file)
      
      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      setImagePreview(img.src)

      const canvas = canvasRef.current
      if (!canvas) {
        setError('Canvas 初始化失败')
        return
      }

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        setError('无法获取 Canvas 上下文')
        return
      }

      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      
      if (code) {
        setResult({ 
          text: code.data, 
          type: detectType(code.data) 
        })
      } else {
        setError('未能识别二维码，请确保图片清晰且包含有效的二维码')
      }

    } catch (e) {
      setError('图片处理失败')
    } finally {
      setScanning(false)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('请选择图片文件')
        return
      }
      processImage(file)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('请选择图片文件')
        return
      }
      processImage(file)
    }
  }, [processImage])

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile()
        if (file) {
          processImage(file)
          break
        }
      }
    }
  }, [processImage])

  const clearImage = () => {
    setImagePreview('')
    setResult(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const copyResult = () => {
    if (result) {
      navigator.clipboard.writeText(result.text)
    }
  }

  const openUrl = () => {
    if (result && result.type === 'URL') {
      window.open(result.text, '_blank')
    }
  }

  return (
    <div className="space-y-4" onPaste={handlePaste}>
      <h2 className="text-xl font-semibold">二维码识别</h2>
      <p className="text-sm text-muted-foreground">
        上传或粘贴二维码图片进行识别
      </p>

      <canvas ref={canvasRef} className="hidden" />

      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        {imagePreview ? (
          <div className="space-y-4">
            <div className="relative inline-block">
              <img 
                src={imagePreview} 
                alt="QR Code" 
                className="max-h-64 max-w-full mx-auto rounded"
              />
              <button
                onClick={clearImage}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            {scanning && (
              <p className="text-sm text-muted-foreground">正在识别...</p>
            )}
          </div>
        ) : (
          <label className="cursor-pointer">
            <div className="flex flex-col items-center gap-3">
              <div className="flex gap-4">
                <Upload className="w-10 h-10 text-muted-foreground" />
                <Image className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground">拖拽图片到这里，或点击选择</p>
                <p className="text-sm text-muted-foreground mt-1">也可以直接粘贴图片 (Ctrl+V)</p>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">识别结果</span>
              <span className="px-2 py-0.5 rounded text-xs bg-primary/10 text-primary">
                {result.type}
              </span>
            </div>
            <div className="flex gap-2">
              {result.type === 'URL' && (
                <button
                  onClick={openUrl}
                  className="text-sm text-primary hover:underline"
                >
                  打开链接
                </button>
              )}
              <button
                onClick={copyResult}
                className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
              >
                <Copy className="w-4 h-4" />
                复制
              </button>
            </div>
          </div>
          <div className="p-4 rounded-lg bg-muted border border-border">
            <p className="font-mono text-sm break-all">{result.text}</p>
          </div>
        </div>
      )}

      <div className="p-4 rounded-lg bg-muted text-sm space-y-2">
        <p className="font-medium">使用说明</p>
        <ul className="list-disc list-inside text-muted-foreground space-y-1">
          <li>支持拖拽上传图片</li>
          <li>支持从剪贴板粘贴图片 (Ctrl+V)</li>
          <li>支持 PNG、JPG、GIF 等常见格式</li>
          <li>建议使用清晰的二维码图片</li>
        </ul>
      </div>
    </div>
  )
}
