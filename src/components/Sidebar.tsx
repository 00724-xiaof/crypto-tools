import { cn } from '@/lib/utils'
import { TOOL_GROUPS, getToolsByCategory } from '@/lib/tool-registry'

interface SidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <div className="w-52 bg-card/50 border-r h-full overflow-y-auto flex flex-col">
      <div className="py-3 flex-1">
        {TOOL_GROUPS.map((group, groupIndex) => {
          const groupTools = getToolsByCategory(group.id)
          
          // 如果该分组下没有可见工具，则不渲染该分组
          if (groupTools.length === 0) return null

          return (
            <div key={group.id} className={cn("pb-2", groupIndex !== 0 && "pt-2 border-t border-border/50 mx-3")}>
              <div className={cn("px-3 py-1.5 flex items-center gap-2 text-xs font-semibold", group.color)}>
                <group.icon className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wide">{group.title}</span>
              </div>
              <div className="mt-1 space-y-0.5">
                {groupTools.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-1.5 mx-1.5 rounded text-[13px] transition-all duration-150',
                      'hover:translate-x-0.5',
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground font-medium shadow-sm'
                        : 'hover:bg-accent/80 text-muted-foreground hover:text-foreground'
                    )}
                    style={{ width: 'calc(100% - 12px)' }}
                  >
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="px-1.5 py-0.5 text-[10px] bg-primary/20 text-primary rounded">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
