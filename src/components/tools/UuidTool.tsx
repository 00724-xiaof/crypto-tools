import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { copyToClipboard } from '@/lib/utils'
import { Copy, Check, Fingerprint, RefreshCw, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export function UuidTool() {
  const [uuids, setUuids] = useState<string[]>([])
  const [count, setCount] = useState(5)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [allCopied, setAllCopied] = useState(false)

  const handleGenerate = () => {
    const newUuids = Array.from({ length: count }, () => uuidv4())
    setUuids(newUuids)
  }

  const handleCopy = async (uuid: string, index: number) => {
    await copyToClipboard(uuid)
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleCopyAll = async () => {
    await copyToClipboard(uuids.join('\n'))
    setAllCopied(true)
    setTimeout(() => setAllCopied(false), 2000)
  }

  const handleClear = () => {
    setUuids([])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center">
          <Fingerprint className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">UUID 生成器</h2>
          <p className="text-sm text-muted-foreground">生成符合 RFC 4122 标准的 UUID v4</p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">⚙️ 配置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-xs text-muted-foreground mb-1.5 block">生成数量</label>
              <Input
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => setCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                className="w-32"
              />
            </div>
            <div className="flex gap-2 pt-5">
              <Button onClick={handleGenerate}>
                <RefreshCw className="w-4 h-4 mr-1" />
                生成
              </Button>
              <Button variant="outline" onClick={handleClear}>
                <Trash2 className="w-4 h-4 mr-1" />
                清空
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {uuids.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">📤 生成结果 ({uuids.length})</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyAll}
                className={allCopied ? 'text-green-500' : ''}
              >
                {allCopied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {allCopied ? '已复制全部' : '复制全部'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {uuids.map((uuid, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border font-mono text-sm"
              >
                <span className="text-muted-foreground mr-2">{index + 1}.</span>
                <span className="flex-1">{uuid}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(uuid, index)}
                  className={`ml-2 ${copiedIndex === index ? 'text-green-500' : ''}`}
                >
                  {copiedIndex === index ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            ))}
            <div className="mt-2 text-xs text-green-500">✅ 生成完成</div>
          </CardContent>
        </Card>
      )}

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm">
        <p className="text-blue-400 font-medium mb-1">💡 提示</p>
        <p className="text-muted-foreground">
          UUID (Universally Unique Identifier) 是一个128位的唯一标识符，v4版本基于随机数生成，重复概率极低。
        </p>
      </div>
    </div>
  )
}
