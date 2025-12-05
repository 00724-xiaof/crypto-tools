import { useState, useCallback } from 'react'
import { Copy, Upload, X, Download } from 'lucide-react'

export function ImageBase64Tool() {
  const [mode, setMode] = useState<'toBase64' | 'toImage'>('toBase64')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState('')
  const [base64Input, setBase64Input] = useState('')
  const [base64Output, setBase64Output] = useState('')
  const [decodedImage, setDecodedImage] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [includePrefix, setIncludePrefix] = useState(true)

  const handleFileSelect = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }
    
    setImageFile(file)
    
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setImagePreview(result)
      setBase64Output(includePrefix ? result : result.split(',')[1])
    }
    reader.readAsDataURL(file)
  }, [includePrefix])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFileSelect(file)
  }, [handleFileSelect])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFileSelect(file)
  }

  const handleBase64ToImage = () => {
    let base64 = base64Input.trim()
    
    // 如果没有前缀，尝试添加
    if (!base64.startsWith('data:')) {
      base64 = `data:image/png;base64,${base64}`
    }
    
    setDecodedImage(base64)
  }

  const clearImage = () => {
    setImageFile(null)
    setImagePreview('')
    setBase64Output('')
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const downloadImage = () => {
    if (!decodedImage) return
    
    const link = document.createElement('a')
    link.href = decodedImage
    link.download = 'image.png'
    link.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">图片 Base64 转换</h2>
      
      <div className="flex gap-2">
        <button
          onClick={() => setMode('toBase64')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mode === 'toBase64' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent'
          }`}
        >
          图片 → Base64
        </button>
        <button
          onClick={() => setMode('toImage')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mode === 'toImage' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent'
          }`}
        >
          Base64 → 图片
        </button>
      </div>

      {mode === 'toBase64' ? (
        <>
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
                    alt="Preview" 
                    className="max-h-48 max-w-full mx-auto rounded"
                  />
                  <button
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-destructive text-destructive-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {imageFile && (
                  <p className="text-sm text-muted-foreground">
                    {imageFile.name} ({formatFileSize(imageFile.size)})
                  </p>
                )}
              </div>
            ) : (
              <label className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">拖拽图片到这里，或点击选择</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={includePrefix}
              onChange={(e) => {
                setIncludePrefix(e.target.checked)
                if (imagePreview) {
                  setBase64Output(e.target.checked ? imagePreview : imagePreview.split(',')[1])
                }
              }}
              className="w-4 h-4 rounded"
            />
            <span className="text-sm">包含 Data URL 前缀</span>
          </label>

          {base64Output && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Base64 结果</label>
                <button
                  onClick={() => copyToClipboard(base64Output)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  复制
                </button>
              </div>
              <textarea
                value={base64Output}
                readOnly
                className="w-full h-32 p-3 rounded-lg bg-muted border border-border focus:outline-none resize-none font-mono text-xs break-all"
              />
              <p className="text-xs text-muted-foreground">
                长度: {base64Output.length.toLocaleString()} 字符
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">Base64 字符串</label>
            <textarea
              value={base64Input}
              onChange={(e) => setBase64Input(e.target.value)}
              placeholder="粘贴 Base64 编码的图片数据..."
              className="w-full h-32 p-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none font-mono text-xs"
            />
          </div>

          <button
            onClick={handleBase64ToImage}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            转换为图片
          </button>

          {decodedImage && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">图片预览</label>
                <button
                  onClick={downloadImage}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Download className="w-4 h-4" />
                  下载
                </button>
              </div>
              <div className="p-4 rounded-lg bg-muted flex items-center justify-center">
                <img 
                  src={decodedImage} 
                  alt="Decoded" 
                  className="max-h-64 max-w-full rounded"
                  onError={() => setDecodedImage('')}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
