import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { copyToClipboard } from '@/lib/utils'
import { Copy, Check, Timer, RefreshCw } from 'lucide-react'
import dayjs from 'dayjs'

export function TimestampTool() {
  const [currentTime, setCurrentTime] = useState(dayjs())
  const [timestamp, setTimestamp] = useState('')
  const [dateStr, setDateStr] = useState('')
  const [convertedDate, setConvertedDate] = useState('')
  const [convertedTimestamp, setConvertedTimestamp] = useState('')
  const [copied, setCopied] = useState<string | null>(null)
  const [seconds, setSeconds] = useState('')
  const [milliseconds, setMilliseconds] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleTimestampToDate = () => {
    try {
      const ts = parseInt(timestamp)
      // 判断是秒还是毫秒
      const date = ts > 9999999999 ? dayjs(ts) : dayjs.unix(ts)
      setConvertedDate(date.format('YYYY-MM-DD HH:mm:ss'))
    } catch {
      setConvertedDate('无效的时间戳')
    }
  }

  const handleDateToTimestamp = () => {
    try {
      const date = dayjs(dateStr)
      if (date.isValid()) {
        setConvertedTimestamp(date.unix().toString())
      } else {
        setConvertedTimestamp('无效的日期格式')
      }
    } catch {
      setConvertedTimestamp('无效的日期格式')
    }
  }

  const handleCopy = async (text: string, key: string) => {
    await copyToClipboard(text)
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const setNow = (type: 'timestamp' | 'date') => {
    if (type === 'timestamp') {
      setTimestamp(dayjs().unix().toString())
    } else {
      setDateStr(dayjs().format('YYYY-MM-DD HH:mm:ss'))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
          <Timer className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">时间戳转换</h2>
          <p className="text-sm text-muted-foreground">Unix时间戳与日期时间互转</p>
        </div>
      </div>

      {/* 当前时间 */}
      <Card className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
        <CardContent className="pt-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground mb-2">当前时间</div>
            <div className="text-3xl font-mono font-bold text-primary">
              {currentTime.format('YYYY-MM-DD HH:mm:ss')}
            </div>
            <div className="mt-2 flex items-center justify-center gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground">秒: </span>
                <span className="font-mono">{currentTime.unix()}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-6 w-6 p-0"
                  onClick={() => handleCopy(currentTime.unix().toString(), 'current-s')}
                >
                  {copied === 'current-s' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">毫秒: </span>
                <span className="font-mono">{currentTime.valueOf()}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-6 w-6 p-0"
                  onClick={() => handleCopy(currentTime.valueOf().toString(), 'current-ms')}
                >
                  {copied === 'current-ms' ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 时间戳转日期 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">🔢 时间戳 → 日期</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                placeholder="输入时间戳 (秒/毫秒)"
                className="font-mono"
              />
              <Button variant="outline" size="icon" onClick={() => setNow('timestamp')}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={handleTimestampToDate} className="w-full">
              转换为日期
            </Button>
            {convertedDate && (
              <div className="p-3 rounded-lg bg-muted/50 border flex items-center justify-between">
                <span className="font-mono">{convertedDate}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(convertedDate, 'date')}
                >
                  {copied === 'date' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 日期转时间戳 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">📅 日期 → 时间戳</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                placeholder="YYYY-MM-DD HH:mm:ss"
                className="font-mono"
              />
              <Button variant="outline" size="icon" onClick={() => setNow('date')}>
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>
            <Button onClick={handleDateToTimestamp} className="w-full">
              转换为时间戳
            </Button>
            {convertedTimestamp && (
              <div className="p-3 rounded-lg bg-muted/50 border flex items-center justify-between">
                <span className="font-mono">{convertedTimestamp}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(convertedTimestamp, 'ts')}
                >
                  {copied === 'ts' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 秒与毫秒互转 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">⏱️ 秒 ↔ 毫秒 互转</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">秒 (s)</label>
              <div className="flex gap-2">
                <Input
                  value={seconds}
                  onChange={(e) => {
                    setSeconds(e.target.value)
                    const num = parseFloat(e.target.value)
                    if (!isNaN(num)) setMilliseconds((num * 1000).toString())
                  }}
                  placeholder="输入秒数"
                  className="font-mono"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(seconds, 'seconds')}
                  disabled={!seconds}
                >
                  {copied === 'seconds' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">毫秒 (ms)</label>
              <div className="flex gap-2">
                <Input
                  value={milliseconds}
                  onChange={(e) => {
                    setMilliseconds(e.target.value)
                    const num = parseFloat(e.target.value)
                    if (!isNaN(num)) setSeconds((num / 1000).toString())
                  }}
                  placeholder="输入毫秒数"
                  className="font-mono"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCopy(milliseconds, 'milliseconds')}
                  disabled={!milliseconds}
                >
                  {copied === 'milliseconds' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => { setSeconds(currentTime.unix().toString()); setMilliseconds(currentTime.valueOf().toString()) }}>
              <RefreshCw className="w-4 h-4 mr-1" />使用当前时间
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setSeconds(''); setMilliseconds('') }}>
              清空
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 text-sm">
        <p className="text-blue-400 font-medium mb-1">💡 提示</p>
        <p className="text-muted-foreground">
          支持秒级(10位)和毫秒级(13位)时间戳自动识别。日期格式支持多种形式，如 "2024-01-01" 或 "2024-01-01 12:00:00"。1秒 = 1000毫秒。
        </p>
      </div>
    </div>
  )
}
