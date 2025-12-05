import { useState, useCallback } from 'react'
import { Copy, Upload, File, X } from 'lucide-react'
import CryptoJS from 'crypto-js'

interface HashResult {
  md5: string
  sha1: string
  sha256: string
  sha512: string
}

export function FileHashTool() {
  const [file, setFile] = useState<File | null>(null)
  const [hashes, setHashes] = useState<HashResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const calculateHashes = useCallback(async (file: File) => {
    setLoading(true)
    try {
      const arrayBuffer = await file.arrayBuffer()
      const wordArray = CryptoJS.lib.WordArray.create(arrayBuffer as any)
      
      setHashes({
        md5: CryptoJS.MD5(wordArray).toString(),
        sha1: CryptoJS.SHA1(wordArray).toString(),
        sha256: CryptoJS.SHA256(wordArray).toString(),
        sha512: CryptoJS.SHA512(wordArray).toString(),
      })
    } catch (e) {
      console.error('Hash calculation failed:', e)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      calculateHashes(selectedFile)
    }
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) {
      setFile(droppedFile)
      calculateHashes(droppedFile)
    }
  }, [calculateHashes])

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const clearFile = () => {
    setFile(null)
    setHashes(null)
  }

  const copyHash = (hash: string) => {
    navigator.clipboard.writeText(hash)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">文件哈希计算</h2>
      <p className="text-sm text-muted-foreground">
        拖拽或选择文件，计算 MD5、SHA1、SHA256、SHA512 哈希值
      </p>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        {file ? (
          <div className="flex items-center justify-center gap-3">
            <File className="w-8 h-8 text-primary" />
            <div className="text-left">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
            <button
              onClick={clearFile}
              className="p-1 rounded hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <label className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground">拖拽文件到这里，或点击选择文件</p>
            <input
              type="file"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        )}
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="mt-2 text-sm text-muted-foreground">正在计算哈希值...</p>
        </div>
      )}

      {hashes && !loading && (
        <div className="space-y-3">
          {Object.entries(hashes).map(([algo, hash]) => (
            <div key={algo} className="p-3 rounded-lg bg-secondary">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium uppercase">{algo}</span>
                <button
                  onClick={() => copyHash(hash)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  复制
                </button>
              </div>
              <p className="font-mono text-xs break-all text-muted-foreground">{hash}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
