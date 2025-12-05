import { useState, useEffect } from 'react'
import { Copy, RotateCcw, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Permission {
  read: boolean
  write: boolean
  execute: boolean
}

interface Permissions {
  owner: Permission
  group: Permission
  public: Permission
}

const INITIAL_PERMISSIONS: Permissions = {
  owner: { read: true, write: true, execute: true },
  group: { read: true, write: false, execute: true },
  public: { read: true, write: false, execute: true }
}

export function ChmodTool() {
  const [permissions, setPermissions] = useState<Permissions>(INITIAL_PERMISSIONS)
  const [octal, setOctal] = useState('755')
  const [symbolic, setSymbolic] = useState('-rwxr-xr-x')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    updateCalculatedValues(permissions)
  }, [permissions])

  const updateCalculatedValues = (perms: Permissions) => {
    // Calculate Octal
    const calculateDigit = (p: Permission) => {
      return (p.read ? 4 : 0) + (p.write ? 2 : 0) + (p.execute ? 1 : 0)
    }
    const newOctal = `${calculateDigit(perms.owner)}${calculateDigit(perms.group)}${calculateDigit(perms.public)}`
    
    // Calculate Symbolic
    const calculateSym = (p: Permission) => {
      return `${p.read ? 'r' : '-'}${p.write ? 'w' : '-'}${p.execute ? 'x' : '-'}`
    }
    const newSymbolic = `-${calculateSym(perms.owner)}${calculateSym(perms.group)}${calculateSym(perms.public)}`

    if (octal !== newOctal) setOctal(newOctal)
    if (symbolic !== newSymbolic) setSymbolic(newSymbolic)
  }

  const handlePermissionChange = (group: keyof Permissions, type: keyof Permission) => {
    setPermissions(prev => ({
      ...prev,
      [group]: {
        ...prev[group],
        [type]: !prev[group][type]
      }
    }))
  }

  const handleOctalChange = (value: string) => {
    // Allow only numbers, max 3 digits
    const clean = value.replace(/[^0-7]/g, '').slice(0, 3)
    setOctal(clean)

    if (clean.length === 3) {
      const nums = clean.split('').map(Number)
      const parseDigit = (num: number): Permission => ({
        read: (num & 4) !== 0,
        write: (num & 2) !== 0,
        execute: (num & 1) !== 0
      })

      setPermissions({
        owner: parseDigit(nums[0]),
        group: parseDigit(nums[1]),
        public: parseDigit(nums[2])
      })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="h-full flex flex-col gap-6 p-6 bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Linux 权限计算器 (Chmod)</h2>
          <p className="text-sm text-muted-foreground">可视化的文件权限计算与转换</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setPermissions(INITIAL_PERMISSIONS)}>
          <RotateCcw className="w-4 h-4 mr-2" />
          重置 (755)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left: Interactive Grid */}
        <div className="space-y-6 p-6 border rounded-xl bg-card shadow-sm">
          <div className="grid grid-cols-4 gap-4 text-sm font-medium text-muted-foreground border-b pb-4">
            <div>角色</div>
            <div className="text-center">读取 (Read)</div>
            <div className="text-center">写入 (Write)</div>
            <div className="text-center">执行 (Execute)</div>
          </div>

          {Object.entries(permissions).map(([group, perms]) => (
            <div key={group} className="grid grid-cols-4 gap-4 items-center">
              <div className="font-medium capitalize">
                {group === 'owner' ? '所有者 (Owner)' : group === 'group' ? '用户组 (Group)' : '其他人 (Public)'}
              </div>
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={perms.read}
                  onChange={() => handlePermissionChange(group as keyof Permissions, 'read')}
                  className="w-5 h-5 rounded border-primary text-primary focus:ring-primary cursor-pointer"
                />
              </div>
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={perms.write}
                  onChange={() => handlePermissionChange(group as keyof Permissions, 'write')}
                  className="w-5 h-5 rounded border-primary text-primary focus:ring-primary cursor-pointer"
                />
              </div>
              <div className="flex justify-center">
                <input
                  type="checkbox"
                  checked={perms.execute}
                  onChange={() => handlePermissionChange(group as keyof Permissions, 'execute')}
                  className="w-5 h-5 rounded border-primary text-primary focus:ring-primary cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Right: Results */}
        <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <Label>Octal Value (数字表示)</Label>
            <div className="flex gap-2">
              <Input
                value={octal}
                onChange={(e) => handleOctalChange(e.target.value)}
                className="font-mono text-2xl h-14 tracking-widest text-center"
                maxLength={3}
              />
              <Button 
                size="icon" 
                className="h-14 w-14 flex-shrink-0" 
                variant="secondary"
                onClick={() => copyToClipboard(octal)}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
            <div className="text-xs text-muted-foreground text-center">
              命令: <code className="bg-muted px-1 rounded">chmod {octal} filename</code>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Symbolic Value (符号表示)</Label>
            <div className="flex gap-2">
              <div className="flex-1 h-14 bg-muted rounded-md border flex items-center justify-center font-mono text-xl">
                {symbolic}
              </div>
              <Button 
                size="icon" 
                className="h-14 w-14 flex-shrink-0" 
                variant="secondary"
                onClick={() => copyToClipboard(symbolic)}
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
            <h3 className="font-medium text-sm">常用预设</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { val: '777', desc: '全部权限' },
                { val: '755', desc: '标准Web' },
                { val: '644', desc: '文件只读' },
                { val: '600', desc: '私密文件' },
                { val: '400', desc: '仅所有者读' },
              ].map(preset => (
                <Button
                  key={preset.val}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handleOctalChange(preset.val)}
                >
                  <span className="font-bold mr-1">{preset.val}</span>
                  <span className="text-muted-foreground">({preset.desc})</span>
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
