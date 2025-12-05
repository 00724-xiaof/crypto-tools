import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Database, Copy, Check, RefreshCw, Plus, X } from 'lucide-react'

// 中文姓名库
const SURNAMES = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗']
const NAMES = ['伟', '芳', '娜', '秀英', '敏', '静', '丽', '强', '磊', '军', '洋', '勇', '艳', '杰', '娟', '涛', '明', '超', '秀兰', '霞']

// 英文名库
const EN_FIRST_NAMES = ['James', 'John', 'Robert', 'Michael', 'William', 'David', 'Mary', 'Patricia', 'Jennifer', 'Linda', 'Emma', 'Olivia']
const EN_LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Wilson', 'Anderson']

// 地址库
const PROVINCES = ['北京市', '上海市', '广东省', '江苏省', '浙江省', '四川省', '湖北省', '山东省', '河南省', '福建省']
const CITIES = ['深圳市', '广州市', '杭州市', '南京市', '成都市', '武汉市', '青岛市', '郑州市', '厦门市', '苏州市']
const DISTRICTS = ['朝阳区', '海淀区', '浦东新区', '南山区', '福田区', '西湖区', '江干区', '武侯区', '锦江区', '天河区']
const STREETS = ['中山路', '人民路', '解放路', '建设路', '和平路', '文化路', '科技路', '创业路', '金融街', '商业街']

// 公司名库
const COMPANY_PREFIX = ['华', '中', '东', '西', '南', '北', '新', '大', '金', '银', '盛', '恒', '永', '鑫', '瑞']
const COMPANY_MIDDLE = ['科', '信', '达', '通', '联', '创', '智', '云', '数', '网']
const COMPANY_SUFFIX = ['科技', '信息', '网络', '软件', '电子', '通信', '数据', '智能', '云计算', '互联网']
const COMPANY_TYPE = ['有限公司', '股份有限公司', '集团', '有限责任公司']

// 域名后缀
const DOMAINS = ['gmail.com', 'outlook.com', 'qq.com', '163.com', 'sina.com', 'hotmail.com', 'yahoo.com', 'icloud.com']

interface FieldConfig {
  id: string
  name: string
  type: string
}

const FIELD_TYPES = [
  { value: 'name_cn', label: '中文姓名' },
  { value: 'name_en', label: '英文姓名' },
  { value: 'email', label: '邮箱地址' },
  { value: 'phone', label: '手机号码' },
  { value: 'id_card', label: '身份证号' },
  { value: 'address', label: '详细地址' },
  { value: 'company', label: '公司名称' },
  { value: 'ip', label: 'IP地址' },
  { value: 'url', label: '网址URL' },
  { value: 'date', label: '日期' },
  { value: 'datetime', label: '日期时间' },
  { value: 'number', label: '随机数字' },
  { value: 'uuid', label: 'UUID' },
  { value: 'boolean', label: '布尔值' },
  { value: 'province', label: '省份' },
  { value: 'city', label: '城市' },
  { value: 'paragraph', label: '段落文本' },
]

function random<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateValue(type: string): string | number | boolean {
  switch (type) {
    case 'name_cn':
      return random(SURNAMES) + random(NAMES) + (Math.random() > 0.5 ? random(NAMES).charAt(0) : '')
    case 'name_en':
      return `${random(EN_FIRST_NAMES)} ${random(EN_LAST_NAMES)}`
    case 'email': {
      const name = random(EN_FIRST_NAMES).toLowerCase() + randomInt(1, 999)
      return `${name}@${random(DOMAINS)}`
    }
    case 'phone':
      return `1${random(['3', '5', '7', '8', '9'])}${Array(9).fill(0).map(() => randomInt(0, 9)).join('')}`
    case 'id_card': {
      const area = randomInt(110000, 659000).toString()
      const year = randomInt(1970, 2005)
      const month = randomInt(1, 12).toString().padStart(2, '0')
      const day = randomInt(1, 28).toString().padStart(2, '0')
      const seq = randomInt(100, 999).toString()
      const checkCode = random(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'X'])
      return `${area}${year}${month}${day}${seq}${checkCode}`
    }
    case 'address':
      return `${random(PROVINCES)}${random(CITIES)}${random(DISTRICTS)}${random(STREETS)}${randomInt(1, 999)}号`
    case 'company':
      return `${random(COMPANY_PREFIX)}${random(COMPANY_MIDDLE)}${random(COMPANY_SUFFIX)}${random(COMPANY_TYPE)}`
    case 'ip':
      return `${randomInt(1, 255)}.${randomInt(0, 255)}.${randomInt(0, 255)}.${randomInt(1, 254)}`
    case 'url':
      return `https://www.${random(EN_LAST_NAMES).toLowerCase()}${randomInt(1, 99)}.com/${random(['home', 'about', 'products', 'contact', 'blog'])}`
    case 'date': {
      const d = new Date(Date.now() - randomInt(0, 365 * 5) * 24 * 60 * 60 * 1000)
      return d.toISOString().split('T')[0]
    }
    case 'datetime': {
      const d = new Date(Date.now() - randomInt(0, 365 * 5) * 24 * 60 * 60 * 1000)
      return d.toISOString().replace('T', ' ').substring(0, 19)
    }
    case 'number':
      return randomInt(1, 10000)
    case 'uuid':
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
      })
    case 'boolean':
      return Math.random() > 0.5
    case 'province':
      return random(PROVINCES)
    case 'city':
      return random(CITIES)
    case 'paragraph':
      return '这是一段随机生成的测试文本，用于模拟真实的内容数据。在实际开发中，我们经常需要使用这样的假数据来测试界面显示效果。'
    default:
      return ''
  }
}

export function MockDataTool() {
  const [fields, setFields] = useState<FieldConfig[]>([
    { id: '1', name: 'name', type: 'name_cn' },
    { id: '2', name: 'email', type: 'email' },
    { id: '3', name: 'phone', type: 'phone' },
  ])
  const [count, setCount] = useState(10)
  const [output, setOutput] = useState('')
  const [outputFormat, setOutputFormat] = useState<'json' | 'sql' | 'csv'>('json')
  const [tableName, setTableName] = useState('users')
  const [copied, setCopied] = useState(false)

  const addField = () => {
    setFields([...fields, { id: Date.now().toString(), name: '', type: 'name_cn' }])
  }

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id))
  }

  const updateField = (id: string, key: keyof FieldConfig, value: string) => {
    setFields(fields.map(f => f.id === id ? { ...f, [key]: value } : f))
  }

  const generate = () => {
    const data: Record<string, any>[] = []
    for (let i = 0; i < count; i++) {
      const row: Record<string, any> = {}
      fields.forEach(f => {
        if (f.name) {
          row[f.name] = generateValue(f.type)
        }
      })
      data.push(row)
    }

    if (outputFormat === 'json') {
      setOutput(JSON.stringify(data, null, 2))
    } else if (outputFormat === 'csv') {
      const headers = fields.filter(f => f.name).map(f => f.name)
      const rows = data.map(row => headers.map(h => {
        const val = row[h]
        return typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      }).join(','))
      setOutput([headers.join(','), ...rows].join('\n'))
    } else if (outputFormat === 'sql') {
      const cols = fields.filter(f => f.name).map(f => f.name)
      const values = data.map(row => {
        const vals = cols.map(c => {
          const v = row[c]
          return typeof v === 'string' ? `'${v}'` : v
        })
        return `(${vals.join(', ')})`
      })
      setOutput(`INSERT INTO ${tableName} (${cols.join(', ')}) VALUES\n${values.join(',\n')};`)
    }
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Database className="w-5 h-5" />
          Mock 数据生成
        </h2>
        <p className="text-sm text-muted-foreground">生成测试用的假数据，支持多种字段类型</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 配置区 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>字段配置</Label>
            <Button variant="outline" size="sm" onClick={addField}>
              <Plus className="w-4 h-4 mr-1" />添加字段
            </Button>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {fields.map((field) => (
              <div key={field.id} className="flex gap-2 items-center">
                <Input
                  value={field.name}
                  onChange={(e) => updateField(field.id, 'name', e.target.value)}
                  placeholder="字段名"
                  className="w-32"
                />
                <Select value={field.type} onValueChange={(v) => updateField(field.id, 'type', v)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="ghost" size="icon" onClick={() => removeField(field.id)} disabled={fields.length <= 1}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>生成数量</Label>
              <Input
                type="number"
                value={count}
                onChange={(e) => setCount(Math.min(1000, Math.max(1, Number(e.target.value))))}
                min={1}
                max={1000}
              />
            </div>
            <div className="space-y-2">
              <Label>输出格式</Label>
              <Select value={outputFormat} onValueChange={(v: any) => setOutputFormat(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="sql">SQL INSERT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {outputFormat === 'sql' && (
            <div className="space-y-2">
              <Label>表名</Label>
              <Input value={tableName} onChange={(e) => setTableName(e.target.value)} placeholder="users" />
            </div>
          )}

          <Button onClick={generate} className="w-full">
            <RefreshCw className="w-4 h-4 mr-2" />
            生成数据
          </Button>
        </div>

        {/* 输出区 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>生成结果</Label>
            <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? '已复制' : '复制'}
            </Button>
          </div>
          <Textarea
            value={output}
            readOnly
            className="font-mono text-sm h-[400px] resize-none"
            placeholder="点击生成按钮生成数据..."
          />
        </div>
      </div>
    </div>
  )
}
