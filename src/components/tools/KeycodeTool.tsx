import { useState, useEffect } from 'react'
import { Copy } from 'lucide-react'

export function KeycodeTool() {
  const [event, setEvent] = useState<KeyboardEvent | null>(null)
  const [history, setHistory] = useState<KeyboardEvent[]>([])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for some keys to keep focus in window? 
      // Maybe not, user might want to test F5 or Ctrl+R
      // e.preventDefault()
      setEvent(e)
      setHistory(prev => [e, ...prev].slice(0, 10))
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // const copyToClipboard = (text: string | number) => {
  //   navigator.clipboard.writeText(String(text))
  // }

  return (
    <div className="h-full flex flex-col gap-6 p-6 bg-background overflow-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">键盘按键检测 (Keycode)</h2>
        <span className="text-sm text-muted-foreground">按下键盘上的任意键查看信息</span>
      </div>

      {!event ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl min-h-[200px] bg-muted/10">
          <span className="text-4xl mb-4">⌨️</span>
          <p className="text-lg">请按键...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {/* Main Display */}
          <div className="flex items-center justify-center gap-8 py-8 bg-primary/5 rounded-xl border border-primary/10">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-muted-foreground">event.key</span>
              <span className="text-4xl font-bold text-primary font-mono">{event.key}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-muted-foreground">event.code</span>
              <span className="text-4xl font-bold text-primary font-mono">{event.code}</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-muted-foreground">event.which</span>
              <span className="text-4xl font-bold text-primary font-mono">{event.which}</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InfoCard label="e.key" value={event.key} copy />
            <InfoCard label="e.code" value={event.code} copy />
            <InfoCard label="e.keyCode" value={event.keyCode} copy />
            <InfoCard label="e.which" value={event.which} copy />
            <InfoCard label="e.location" value={getLocationName(event.location)} />
            <InfoCard label="e.repeat" value={String(event.repeat)} />
          </div>

          {/* Modifiers */}
          <div className="p-4 bg-secondary/50 rounded-lg">
            <h3 className="text-sm font-medium mb-3">修饰键 (Modifiers)</h3>
            <div className="flex gap-4 flex-wrap">
              <ModifierBadge name="Ctrl" active={event.ctrlKey} />
              <ModifierBadge name="Shift" active={event.shiftKey} />
              <ModifierBadge name="Alt" active={event.altKey} />
              <ModifierBadge name="Meta" active={event.metaKey} />
            </div>
          </div>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-medium mb-2 text-muted-foreground">最近按键记录</h3>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2">Key</th>
                  <th className="p-2">Code</th>
                  <th className="p-2">Which</th>
                  <th className="p-2">Modifiers</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {history.map((e, i) => (
                  <tr key={i} className="bg-background hover:bg-muted/50">
                    <td className="p-2 font-mono">{e.key}</td>
                    <td className="p-2 font-mono">{e.code}</td>
                    <td className="p-2 font-mono">{e.which}</td>
                    <td className="p-2 text-xs text-muted-foreground">
                      {[
                        e.ctrlKey && 'Ctrl',
                        e.shiftKey && 'Shift',
                        e.altKey && 'Alt',
                        e.metaKey && 'Meta'
                      ].filter(Boolean).join(' + ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoCard({ label, value, copy = false }: { label: string, value: string | number, copy?: boolean }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(String(value))
  }

  return (
    <div className="p-3 rounded-lg border bg-background flex items-center justify-between group">
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className="font-mono font-medium text-lg">{String(value)}</span>
      </div>
      {copy && (
        <button 
          onClick={copyToClipboard}
          className="p-1.5 rounded-md hover:bg-secondary opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground"
          title="复制"
        >
          <Copy className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

function ModifierBadge({ name, active }: { name: string, active: boolean }) {
  return (
    <div className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
      active 
        ? 'bg-primary text-primary-foreground' 
        : 'bg-muted text-muted-foreground opacity-50'
    }`}>
      {name}
    </div>
  )
}

function getLocationName(location: number): string {
  switch (location) {
    case 0: return 'Standard (0)'
    case 1: return 'Left (1)'
    case 2: return 'Right (2)'
    case 3: return 'Numpad (3)'
    default: return `Unknown (${location})`
  }
}
