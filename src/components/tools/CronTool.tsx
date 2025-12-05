import { useState, useEffect } from 'react'
import { Copy, Clock, ArrowRight } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'

const CRON_FIELDS = [
  { name: '分钟', min: 0, max: 59, key: 'minute' },
  { name: '小时', min: 0, max: 23, key: 'hour' },
  { name: '日期', min: 1, max: 31, key: 'day' },
  { name: '月份', min: 1, max: 12, key: 'month' },
  { name: '星期', min: 0, max: 6, key: 'week' },
]

const PRESETS = [
  { label: '每分钟', cron: '* * * * *' },
  { label: '每小时', cron: '0 * * * *' },
  { label: '每天零点', cron: '0 0 * * *' },
  { label: '每天早上8点', cron: '0 8 * * *' },
  { label: '每周一早上9点', cron: '0 9 * * 1' },
  { label: '每月1号零点', cron: '0 0 1 * *' },
  { label: '工作日早上9点', cron: '0 9 * * 1-5' },
  { label: '每15分钟', cron: '*/15 * * * *' },
]

// const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']
// const MONTHS = ['', '一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

function parseCronField(field: string, min: number, max: number): number[] {
  const values: Set<number> = new Set()
  
  try {
    for (const part of field.split(',')) {
      if (part === '*') {
        for (let i = min; i <= max; i++) values.add(i)
      } else if (part.includes('/')) {
        const [range, step] = part.split('/')
        const stepNum = parseInt(step)
        const start = range === '*' ? min : parseInt(range)
        for (let i = start; i <= max; i += stepNum) values.add(i)
      } else if (part.includes('-')) {
        const [start, end] = part.split('-').map(Number)
        for (let i = start; i <= end; i++) values.add(i)
      } else if (!isNaN(parseInt(part))) {
        values.add(parseInt(part))
      }
    }
  } catch (e) {
    return []
  }
  
  return Array.from(values).sort((a, b) => a - b)
}

function describeCron(cron: string): string {
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) return '无效的 Cron 表达式'
  
  const [minute, hour, day, month, weekday] = parts
  const descriptions: string[] = []
  
  // 简单描述逻辑，实际可能更复杂
  if (cron === '* * * * *') return '每分钟'
  
  descriptions.push(minute === '*' ? '每分钟' : `分: ${minute}`)
  descriptions.push(hour === '*' ? '每小时' : `时: ${hour}`)
  if (day !== '*') descriptions.push(`日: ${day}`)
  if (month !== '*') descriptions.push(`月: ${month}`)
  if (weekday !== '*') descriptions.push(`周: ${weekday}`)
  
  return descriptions.join(', ')
}

function getNextRuns(cron: string, count: number = 5): Date[] {
  try {
    const parts = cron.trim().split(/\s+/)
    if (parts.length !== 5) return []
    
    const [minuteField, hourField, dayField, monthField, weekdayField] = parts
    const minutes = parseCronField(minuteField, 0, 59)
    const hours = parseCronField(hourField, 0, 23)
    const days = dayField === '*' || dayField === '?' ? null : parseCronField(dayField, 1, 31)
    const months = monthField === '*' ? null : parseCronField(monthField, 1, 12)
    const weekdays = weekdayField === '*' || weekdayField === '?' ? null : parseCronField(weekdayField, 0, 6)
    
    if (minutes.length === 0 || hours.length === 0) return []

    const results: Date[] = []
    const now = new Date()
    const current = new Date(now)
    current.setSeconds(0)
    current.setMilliseconds(0)
    
    // 防止死循环，限制尝试次数
    for (let i = 0; i < 20000 && results.length < count; i++) {
      current.setMinutes(current.getMinutes() + 1)
      
      if (months && !months.includes(current.getMonth() + 1)) continue
      if (days && !days.includes(current.getDate())) continue
      if (weekdays && !weekdays.includes(current.getDay())) continue
      if (!hours.includes(current.getHours())) continue
      if (!minutes.includes(current.getMinutes())) continue
      
      results.push(new Date(current))
    }
    
    return results
  } catch (e) {
    return []
  }
}

export function CronTool() {
  const [cron, setCron] = useState('0 * * * *')
  const [description, setDescription] = useState('')
  const [nextRuns, setNextRuns] = useState<Date[]>([])

  // Generator state
  const [genState, setGenState] = useState({
    minute: '*',
    hour: '*',
    day: '*',
    month: '*',
    week: '*'
  })

  useEffect(() => {
    setDescription(describeCron(cron))
    setNextRuns(getNextRuns(cron))
  }, [cron])

  useEffect(() => {
    const newCron = `${genState.minute} ${genState.hour} ${genState.day} ${genState.month} ${genState.week}`
    if (newCron !== cron) {
      // sync generator to cron input only when generator changes? 
      // or we can have a button to apply
    }
  }, [genState])

  const applyGenerator = () => {
    const newCron = `${genState.minute} ${genState.hour} ${genState.day} ${genState.month} ${genState.week}`
    setCron(newCron)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cron)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
    })
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <Tabs defaultValue="parse" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="parse">解析 / 调试</TabsTrigger>
          <TabsTrigger value="generate">生成器</TabsTrigger>
        </TabsList>

        <TabsContent value="parse" className="flex-1 space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Cron 表达式</Label>
              <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                <Copy className="w-4 h-4 mr-2" />
                复制
              </Button>
            </div>
            <Input
              value={cron}
              onChange={(e) => setCron(e.target.value)}
              className="font-mono text-lg text-center"
              placeholder="* * * * *"
            />
            <div className="flex justify-between text-xs text-muted-foreground px-4">
              <span>分钟</span>
              <span>小时</span>
              <span>日期</span>
              <span>月份</span>
              <span>星期</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            {description}
          </div>

          <div className="space-y-2">
             <Label>常用预设</Label>
             <div className="flex flex-wrap gap-2">
               {PRESETS.map((preset) => (
                 <Button
                   key={preset.cron}
                   variant={cron === preset.cron ? "default" : "secondary"}
                   size="sm"
                   onClick={() => setCron(preset.cron)}
                 >
                   {preset.label}
                 </Button>
               ))}
             </div>
          </div>

          {nextRuns.length > 0 && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                接下来 5 次执行时间
              </Label>
              <div className="space-y-1">
                {nextRuns.map((date, i) => (
                  <div key={i} className="p-2 rounded bg-secondary text-sm font-mono">
                    {formatDate(date)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="generate" className="flex-1 overflow-auto mt-4 space-y-4">
           <div className="grid gap-6">
             {CRON_FIELDS.map((field) => (
               <div key={field.key} className="space-y-2">
                 <Label>{field.name} ({field.key})</Label>
                 <div className="flex gap-2">
                    <Select 
                      value={genState[field.key as keyof typeof genState].includes('*') || genState[field.key as keyof typeof genState].includes('/') ? 'every' : 'specific'}
                      onValueChange={(v) => {
                        if (v === 'every') {
                           setGenState(prev => ({ ...prev, [field.key]: '*' }))
                        } else {
                           setGenState(prev => ({ ...prev, [field.key]: '0' }))
                        }
                      }}
                    >
                      <SelectTrigger className="w-[140px]">
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="every">每{field.name}</SelectItem>
                        <SelectItem value="specific">指定{field.name}</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      value={genState[field.key as keyof typeof genState]}
                      onChange={(e) => setGenState(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="font-mono flex-1"
                    />
                 </div>
               </div>
             ))}
           </div>
           
           <div className="pt-4 border-t">
             <Button className="w-full" onClick={applyGenerator}>
               <ArrowRight className="w-4 h-4 mr-2" />
               应用到解析器
             </Button>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

