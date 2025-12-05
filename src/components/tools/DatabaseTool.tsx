import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Database, Play, Trash2, Wifi, WifiOff, ChevronRight, ChevronDown, 
  Table2, Columns, RefreshCw, FolderOpen, Loader2, Plus, X, Key, Hash, Pencil, Save
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

const COMMON_TYPES = [
  "INT", "BIGINT", "TINYINT", "SMALLINT", "FLOAT", "DOUBLE", 
  "DECIMAL(10,2)", 
  "VARCHAR(50)", "VARCHAR(100)", "VARCHAR(255)", "VARCHAR(500)", 
  "TEXT", "LONGTEXT", 
  "DATETIME", "DATE", "TIME", "TIMESTAMP", 
  "BOOLEAN", "BLOB", "JSON"
]

interface DbConfig {
  type: 'mysql' | 'postgres' | 'hive' | 'hbase'
  host: string
  port: number
  username: string
  password: string
  database: string
}

interface TableInfo {
  name: string
  columns?: ColumnInfo[]
  expanded?: boolean
  loading?: boolean
}

interface ColumnInfo {
  name: string
  type: string
  nullable: boolean
  key?: string
}

interface DatabaseInfo {
  name: string
  tables: TableInfo[]
  expanded?: boolean
  loading?: boolean
}

interface NewColumnDef {
  name: string
  type: string
  nullable: boolean
  isPrimary: boolean
  autoIncrement: boolean
}

interface EditColumnDef {
  originalName: string
  name: string
  type: string
  nullable: boolean
  isPrimary: boolean
  autoIncrement: boolean
  isNew?: boolean
  toDelete?: boolean
}

interface ForeignKey {
  fromTable: string
  fromColumn: string
  toTable: string
  toColumn: string
}

type ViewMode = 'sql' | 'er'

export function DatabaseTool() {
  const getDefaultPort = (type: DbConfig['type']) => {
    switch (type) {
      case 'mysql': return 3306
      case 'postgres': return 5432
      case 'hive': return 10000
      case 'hbase': return 9090
      default: return 3306
    }
  }

  const [config, setConfig] = useState<DbConfig>({
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    username: 'root',
    password: '',
    database: ''
  })


  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [sql, setSql] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [databases, setDatabases] = useState<DatabaseInfo[]>([])
  const [loadingDbs, setLoadingDbs] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('sql')
  const [selectedDb, setSelectedDb] = useState<string>('')
  const resultsEndRef = useRef<HTMLDivElement>(null)

  // 焦点控制 Refs
  const fieldNameRefs = useRef<(HTMLInputElement | null)[]>([])
  const editFieldNameRefs = useRef<(HTMLInputElement | null)[]>([])
  const shouldFocusCreate = useRef(false)
  const shouldFocusEdit = useRef(false)

  useEffect(() => {
    if (resultsEndRef.current) {
      resultsEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [results])
  
  // 监听新建表列变化，自动聚焦新行
  // useEffect moved down
  
  // 监听编辑表列变化，自动聚焦新行
  // useEffect moved down

  // 创建数据库对话框
  const [showCreateDb, setShowCreateDb] = useState(false)
  const [newDbName, setNewDbName] = useState('')
  const [creatingDb, setCreatingDb] = useState(false)
  
  // 创建表对话框
  const [showCreateTable, setShowCreateTable] = useState(false)
  const [newTableName, setNewTableName] = useState('')
  const [newTableDb, setNewTableDb] = useState('')
  const [newColumns, setNewColumns] = useState<NewColumnDef[]>([
    { name: 'id', type: 'INT', nullable: false, isPrimary: true, autoIncrement: true }
  ])
  const [creatingTable, setCreatingTable] = useState(false)
  
  // 编辑表结构对话框
  const [showEditTable, setShowEditTable] = useState(false)
  const [editTableDb, setEditTableDb] = useState('')
  const [editTableName, setEditTableName] = useState('')
  const [editColumns, setEditColumns] = useState<EditColumnDef[]>([])
  const [savingTable, setSavingTable] = useState(false)
  const [loadingER, setLoadingER] = useState(false)
  const [relationships, setRelationships] = useState<ForeignKey[]>([])

  // 监听新建表列变化，自动聚焦新行
  useEffect(() => {
    if (shouldFocusCreate.current && newColumns.length > 0) {
      const lastIndex = newColumns.length - 1
      // 确保 ref 存在
      if (fieldNameRefs.current[lastIndex]) {
        fieldNameRefs.current[lastIndex]?.focus()
      }
      shouldFocusCreate.current = false
    }
  }, [newColumns])

  // 监听编辑表列变化，自动聚焦新行
  useEffect(() => {
    if (shouldFocusEdit.current && editColumns.length > 0) {
      const lastIndex = editColumns.length - 1
      if (editFieldNameRefs.current[lastIndex]) {
        editFieldNameRefs.current[lastIndex]?.focus()
      }
      shouldFocusEdit.current = false
    }
  }, [editColumns])

  const handleConnect = async () => {
    if (!config.host) {
      setError('请填写主机地址')
      return
    }
    setConnecting(true)
    setError('')
    try {
      const result = await window.electronAPI.dbConnect(config)
      if (result.success && result.sessionId) {
        setConnected(true)
        setSessionId(result.sessionId)
        loadDatabases(result.sessionId)
      } else {
        setError(result.error || '连接失败')
      }
    } catch (e: any) {
      setError(e.message || '连接失败')
    } finally {
      setConnecting(false)
    }
  }

  const loadDatabases = async (sid: string) => {
    setLoadingDbs(true)
    try {
      const result = await window.electronAPI.dbExecute(sid, 
        config.type === 'postgres' ? 'SELECT datname as name FROM pg_database WHERE datistemplate = false' :
        config.type === 'hive' ? 'SHOW DATABASES' : 'SHOW DATABASES'
      )
      if (result.success && result.data) {
        const dbList = result.data.map((row: any) => ({
          name: row.name || row.Database || row.database_name || Object.values(row)[0],
          tables: [],
          expanded: false
        }))
        setDatabases(dbList)
      }
    } catch (e) {
      console.error('Failed to load databases:', e)
    } finally {
      setLoadingDbs(false)
    }
  }

  const loadTables = async (dbName: string) => {
    const dbIndex = databases.findIndex(d => d.name === dbName)
    if (dbIndex === -1) return
    setDatabases(prev => prev.map((db, i) => i === dbIndex ? { ...db, loading: true } : db))
    try {
      await window.electronAPI.dbExecute(sessionId, `USE \`${dbName}\``)
      const result = await window.electronAPI.dbExecute(sessionId, 
        config.type === 'postgres' ? `SELECT tablename as name FROM pg_tables WHERE schemaname = 'public'` :
        config.type === 'hive' ? 'SHOW TABLES' : `SHOW TABLES FROM \`${dbName}\``
      )
      if (result.success && result.data && Array.isArray(result.data)) {
        const tableList = result.data.map((row: any) => ({
          name: String(Object.values(row)[0] || ''),
          columns: [],
          expanded: false
        }))
        setDatabases(prev => prev.map((db, i) => 
          i === dbIndex ? { ...db, tables: tableList, loading: false, expanded: true } : db
        ))
      } else {
        setDatabases(prev => prev.map((db, i) => 
          i === dbIndex ? { ...db, tables: [], loading: false, expanded: true } : db
        ))
      }
    } catch (e) {
      console.error('Failed to load tables:', e)
      setDatabases(prev => prev.map((db, i) => i === dbIndex ? { ...db, loading: false, expanded: true } : db))
    }
  }


  const fetchTableColumns = async (dbName: string, tableName: string) => {
    try {
       // 确保切换到正确的数据库，或者使用全限定名
       const query = config.type === 'postgres' 
          ? `SELECT column_name as name, data_type as type, is_nullable as nullable FROM information_schema.columns WHERE table_name = '${tableName}' AND table_catalog = '${dbName}'`
          : `DESCRIBE \`${dbName}\`.\`${tableName}\``
       
       const result = await window.electronAPI.dbExecute(sessionId, query)
       if (result.success && result.data) {
          return result.data.map((row: any) => {
            const values = Object.values(row)
            return {
              name: String(row.Field || row.name || values[0] || ''),
              type: String(row.Type || row.type || values[1] || '').toUpperCase(),
              nullable: row.Null !== 'NO' && row.nullable !== 'NO',
              key: String(row.Key || row.key || '')
            }
          })
       }
    } catch (e) {
      console.error(`Failed to fetch columns for ${tableName}:`, e)
    }
    return null
  }

  const loadColumns = async (dbName: string, tableName: string) => {
    const dbIndex = databases.findIndex(d => d.name === dbName)
    if (dbIndex === -1) return
    const tableIndex = databases[dbIndex].tables.findIndex(t => t.name === tableName)
    if (tableIndex === -1) return

    setDatabases(prev => prev.map((db, i) => 
      i === dbIndex ? { ...db, tables: db.tables.map((t, j) => j === tableIndex ? { ...t, loading: true } : t) } : db
    ))

    const columns = await fetchTableColumns(dbName, tableName)
    
    if (columns) {
        setDatabases(prev => prev.map((db, i) => 
          i === dbIndex ? { ...db, tables: db.tables.map((t, j) => j === tableIndex ? { ...t, columns, loading: false, expanded: true } : t) } : db
        ))
    } else {
        setDatabases(prev => prev.map((db, i) => 
          i === dbIndex ? { ...db, tables: db.tables.map((t, j) => j === tableIndex ? { ...t, loading: false, expanded: true } : t) } : db
        ))
    }
  }

  const toggleDatabase = (dbName: string) => {
    const db = databases.find(d => d.name === dbName)
    if (!db) return
    if (!db.expanded && db.tables.length === 0) {
      loadTables(dbName)
    } else {
      setDatabases(prev => prev.map(d => d.name === dbName ? { ...d, expanded: !d.expanded } : d))
    }
  }

  const toggleTable = (dbName: string, tableName: string) => {
    const db = databases.find(d => d.name === dbName)
    if (!db) return
    const table = db.tables.find(t => t.name === tableName)
    if (!table) return
    if (!table.expanded && (!table.columns || table.columns.length === 0)) {
      loadColumns(dbName, tableName)
    } else {
      setDatabases(prev => prev.map(d => 
        d.name === dbName ? { ...d, tables: d.tables.map(t => t.name === tableName ? { ...t, expanded: !t.expanded } : t) } : d
      ))
    }
  }

  const handleDisconnect = async () => {
    if (sessionId) {
      await window.electronAPI.dbDisconnect(sessionId)
      setConnected(false)
      setSessionId('')
      setResults([])
      setSql('')
      setDatabases([])
      setSelectedDb('')
    }
  }

  const handleExecute = async (sqlQuery?: string) => {
    const queryToExecute = sqlQuery || sql
    if (!queryToExecute.trim() || !sessionId) return
    setLoading(true)
    setError('')
    // 如果是传入的查询，同时也更新编辑器内容
    if (sqlQuery) {
      setSql(sqlQuery)
    }
    try {
      const result = await window.electronAPI.dbExecute(sessionId, queryToExecute)
      const newResult = { 
        id: Date.now() + Math.random(), 
        type: result.success && result.data ? 'success' : 'error',
        sql: queryToExecute,
        data: result.success ? result.data : undefined,
        error: !result.success ? result.error : undefined,
        time: new Date().toLocaleTimeString() 
      }
      
      setResults([newResult])

      if (result.success && /^(CREATE|DROP|ALTER)/i.test(queryToExecute.trim())) {
        loadDatabases(sessionId)
      }
    } catch (e: any) {
      const errorResult = {
        id: Date.now() + Math.random(),
        type: 'error',
        sql: queryToExecute,
        error: e.message,
        time: new Date().toLocaleTimeString()
      }
      setResults([errorResult])
    } finally {
      setLoading(false)
    }
  }

  const handleClear = () => setResults([])

  const insertTableQuery = (dbName: string, tableName: string) => {
    const query = `SELECT * FROM \`${dbName}\`.\`${tableName}\` LIMIT 100`
    setSql(query)
    setViewMode('sql')
    handleExecute(query)
  }


  // 创建数据库
  const handleCreateDatabase = async () => {
    if (!newDbName.trim()) return
    setCreatingDb(true)
    try {
      const result = await window.electronAPI.dbExecute(sessionId, `CREATE DATABASE \`${newDbName}\``)
      if (result.success) {
        setShowCreateDb(false)
        setNewDbName('')
        loadDatabases(sessionId)
      } else {
        setError(result.error || '创建数据库失败')
      }
    } catch (e: any) {
      setError(e.message || '创建数据库失败')
    } finally {
      setCreatingDb(false)
    }
  }

  // 创建表
  const handleCreateTable = async () => {
    if (!newTableName.trim() || !newTableDb || newColumns.length === 0) return
    setCreatingTable(true)
    
    const columnDefs = newColumns.map(col => {
      let def = `\`${col.name}\` ${col.type}`
      if (!col.nullable) def += ' NOT NULL'
      if (col.autoIncrement) def += ' AUTO_INCREMENT'
      return def
    }).join(', ')
    
    const primaryKeys = newColumns.filter(c => c.isPrimary).map(c => `\`${c.name}\``).join(', ')
    const pkDef = primaryKeys ? `, PRIMARY KEY (${primaryKeys})` : ''
    
    const sql = `CREATE TABLE \`${newTableDb}\`.\`${newTableName}\` (${columnDefs}${pkDef})`
    
    try {
      const result = await window.electronAPI.dbExecute(sessionId, sql)
      if (result.success) {
        setShowCreateTable(false)
        setNewTableName('')
        setNewColumns([{ name: 'id', type: 'INT', nullable: false, isPrimary: true, autoIncrement: true }])
        // 刷新该数据库的表列表
        const dbIndex = databases.findIndex(d => d.name === newTableDb)
        if (dbIndex !== -1) {
          setDatabases(prev => prev.map((db, i) => i === dbIndex ? { ...db, tables: [], expanded: false } : db))
          loadTables(newTableDb)
        }
      } else {
        setError(result.error || '创建表失败')
      }
    } catch (e: any) {
      setError(e.message || '创建表失败')
    } finally {
      setCreatingTable(false)
    }
  }

  const addColumn = () => {
    setNewColumns([...newColumns, { name: '', type: 'VARCHAR(255)', nullable: true, isPrimary: false, autoIncrement: false }])
    shouldFocusCreate.current = true
  }

  const removeColumn = (index: number) => {
    setNewColumns(newColumns.filter((_, i) => i !== index))
  }

  const updateColumn = (index: number, field: keyof NewColumnDef, value: any) => {
    setNewColumns(newColumns.map((col, i) => i === index ? { ...col, [field]: value } : col))
  }

  // 打开编辑表结构对话框
  const openEditTable = async (dbName: string, tableName: string) => {
    setEditTableDb(dbName)
    setEditTableName(tableName)
    setError('')
    
    // 获取表结构
    try {
      // 尝试切换数据库，但主要依赖下方带库名的查询
      await window.electronAPI.dbExecute(sessionId, `USE \`${dbName}\``).catch(console.error)
      
      const query = config.type === 'postgres'
        ? `SELECT column_name as "Field", data_type as "Type", is_nullable as "Null" FROM information_schema.columns WHERE table_name = '${tableName}' AND table_catalog = '${dbName}'`
        : `DESCRIBE \`${dbName}\`.\`${tableName}\``

      const result = await window.electronAPI.dbExecute(sessionId, query)
      if (result.success && result.data) {
        const columns: EditColumnDef[] = result.data.map((row: any) => ({
          originalName: String(row.Field || row.name || ''),
          name: String(row.Field || row.name || ''),
          type: String(row.Type || row.type || '').toUpperCase(),
          nullable: row.Null !== 'NO' && row.Null !== 'No' && row.is_nullable !== 'NO',
          isPrimary: row.Key === 'PRI',
          autoIncrement: String(row.Extra || '').includes('auto_increment'),
          isNew: false,
          toDelete: false
        }))
        setEditColumns(columns)
        setShowEditTable(true)
      } else {
        setError(result.error || '获取表结构失败')
      }
    } catch (e: any) {
      console.error('Failed to get table structure:', e)
      setError(e.message || '获取表结构失败')
    }
  }

  // 添加新字段（编辑模式）
  const addEditColumn = () => {
    setEditColumns([...editColumns, { 
      originalName: '', 
      name: '', 
      type: 'VARCHAR(255)', 
      nullable: true, 
      isPrimary: false, 
      autoIncrement: false,
      isNew: true 
    }])
    shouldFocusEdit.current = true
  }

  // 标记删除字段
  const toggleDeleteColumn = (index: number) => {
    setEditColumns(editColumns.map((col, i) => {
      if (i === index) {
        if (col.isNew) {
          return null as any // 新字段直接删除
        }
        return { ...col, toDelete: !col.toDelete }
      }
      return col
    }).filter(Boolean))
  }

  // 更新编辑字段
  const updateEditColumn = (index: number, field: keyof EditColumnDef, value: any) => {
    setEditColumns(editColumns.map((col, i) => i === index ? { ...col, [field]: value } : col))
  }

  // 保存表结构修改
  const handleSaveTableStructure = async () => {
    setSavingTable(true)
    const alterStatements: string[] = []
    
    try {
      await window.electronAPI.dbExecute(sessionId, `USE \`${editTableDb}\``)
      
      for (const col of editColumns) {
        if (col.toDelete && !col.isNew) {
          // 删除字段
          alterStatements.push(`ALTER TABLE \`${editTableName}\` DROP COLUMN \`${col.originalName}\``)
        } else if (col.isNew && !col.toDelete) {
          // 添加新字段
          let def = `\`${col.name}\` ${col.type}`
          if (!col.nullable) def += ' NOT NULL'
          if (col.autoIncrement) def += ' AUTO_INCREMENT'
          alterStatements.push(`ALTER TABLE \`${editTableName}\` ADD COLUMN ${def}`)
        } else if (!col.isNew && !col.toDelete && (col.name !== col.originalName || col.type)) {
          // 修改字段
          let def = `\`${col.name}\` ${col.type}`
          if (!col.nullable) def += ' NOT NULL'
          if (col.autoIncrement) def += ' AUTO_INCREMENT'
          if (col.name !== col.originalName) {
            alterStatements.push(`ALTER TABLE \`${editTableName}\` CHANGE COLUMN \`${col.originalName}\` ${def}`)
          } else {
            alterStatements.push(`ALTER TABLE \`${editTableName}\` MODIFY COLUMN ${def}`)
          }
        }
      }
      
      // 执行所有 ALTER 语句
      for (const stmt of alterStatements) {
        const result = await window.electronAPI.dbExecute(sessionId, stmt)
        if (!result.success) {
          setError(result.error || '修改表结构失败')
          setSavingTable(false)
          return
        }
      }
      
      setShowEditTable(false)
      // 刷新表结构
      const db = databases.find(d => d.name === editTableDb)
      if (db) {
        const tableIndex = db.tables.findIndex(t => t.name === editTableName)
        if (tableIndex !== -1) {
          setDatabases(prev => prev.map(d => 
            d.name === editTableDb ? { 
              ...d, 
              tables: d.tables.map((t, i) => i === tableIndex ? { ...t, columns: [], expanded: false } : t) 
            } : d
          ))
        }
      }
    } catch (e: any) {
      setError(e.message || '修改表结构失败')
    } finally {
      setSavingTable(false)
    }
  }

  // 加载数据库所有表的列信息（用于ER图）
  const loadAllTablesColumns = async (dbName: string, tablesToLoad?: TableInfo[]) => {
    setLoadingER(true)
    try {
      const db = databases.find(d => d.name === dbName)
      if (!db && !tablesToLoad) {
        setLoadingER(false)
        return
      }
      
      const tables = tablesToLoad || db!.tables
      if (!tables || tables.length === 0) {
        setLoadingER(false)
        return
      }

      // 克隆表列表以便更新
      const newTables = [...tables]
      let hasUpdates = false

      // 串行加载所有表的列信息
      for (let i = 0; i < newTables.length; i++) {
        const table = newTables[i]
        if (!table.columns || table.columns.length === 0) {
          const columns = await fetchTableColumns(dbName, table.name)
          if (columns) {
             newTables[i] = { ...table, columns, loading: false }
             hasUpdates = true
          }
        }
      }

      // 统一更新状态
      if (hasUpdates) {
        setDatabases(prev => prev.map(d => 
          d.name === dbName ? { ...d, tables: newTables } : d
        ))
      }
    } finally {
      setLoadingER(false)
    }
  }

  const loadRelationships = async (dbName: string) => {
    try {
      // 暂时只支持 MySQL 的外键查询
      if (config.type !== 'mysql') return

      const query = `
        SELECT 
          TABLE_NAME as fromTable,
          COLUMN_NAME as fromColumn,
          REFERENCED_TABLE_NAME as toTable,
          REFERENCED_COLUMN_NAME as toColumn
        FROM
          INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE
          REFERENCED_TABLE_SCHEMA = '${dbName}' AND
          REFERENCED_TABLE_NAME IS NOT NULL;
      `
      const result = await window.electronAPI.dbExecute(sessionId, query)
      if (result.success && result.data) {
        setRelationships(result.data)
      }
    } catch (e) {
      console.error('Failed to load relationships:', e)
    }
  }

  // 选择数据库查看ER图
  const selectDbForER = async (dbName: string) => {
    setSelectedDb(dbName)
    setViewMode('er')
    setLoadingER(true)
    setRelationships([]) // 清空旧关系
    
    try {
      // 先检查是否需要加载表列表
      let db = databases.find(d => d.name === dbName)
      let currentTables = db?.tables || []

      if (!db || currentTables.length === 0) {
        // 需要重新加载表
        const dbIndex = databases.findIndex(d => d.name === dbName)
        if (dbIndex !== -1) {
            setDatabases(prev => prev.map((db, i) => i === dbIndex ? { ...db, loading: true } : db))
        }

        await window.electronAPI.dbExecute(sessionId, `USE \`${dbName}\``).catch(console.error)
        const result = await window.electronAPI.dbExecute(sessionId, 
          config.type === 'postgres' ? `SELECT tablename as name FROM pg_tables WHERE schemaname = 'public'` :
          config.type === 'hive' ? 'SHOW TABLES' : `SHOW TABLES FROM \`${dbName}\``
        )

        if (result.success && result.data && Array.isArray(result.data)) {
          const tableList = result.data.map((row: any) => ({
            name: String(Object.values(row)[0] || ''),
            columns: [],
            expanded: false
          }))
          
          // 更新数据库状态
          setDatabases(prev => prev.map((d) => 
            d.name === dbName ? { ...d, tables: tableList, loading: false, expanded: true } : d
          ))
          
          currentTables = tableList
        } else {
          // 加载失败或为空
           setDatabases(prev => prev.map((d) => 
            d.name === dbName ? { ...d, tables: [], loading: false, expanded: true } : d
          ))
          setLoadingER(false)
          return
        }
      }
      
      // 直接使用当前的 tables 列表加载列信息
      await loadAllTablesColumns(dbName, currentTables)
      // 加载外键关系
      await loadRelationships(dbName)
    } catch (e) {
      console.error('Failed to load ER data:', e)
      setLoadingER(false)
    }
  }

  // ER图组件
  const ERDiagram = ({ dbName }: { dbName: string }) => {
    const db = databases.find(d => d.name === dbName)
    const [tablePositions, setTablePositions] = useState<Record<string, {x: number, y: number}>>({})
    const [canvasOffset, setCanvasOffset] = useState({x: 0, y: 0})
    const [scale, setScale] = useState(1)
    const [dragging, setDragging] = useState<{
      type: 'table' | 'canvas',
      id?: string,
      startX: number,
      startY: number,
      initialX: number,
      initialY: number
    } | null>(null)
    
    
    const containerRef = useRef<HTMLDivElement>(null)
    // 存储每个表卡片的尺寸，用于计算连线端点
    const tableDimensions = useRef<Map<string, {width: number, height: number}>>(new Map())
    const lastLayoutHash = useRef("")

    // 初始化布局
    useEffect(() => {
      if (db?.tables && db.tables.length > 0) {
        // 使用 hash 避免因引用变化导致的重复布局，仅当表结构或关系数量变化时重排
        const currentHash = db.tables.map(t => t.name).sort().join(',') + '|' + relationships.length
        
        if (currentHash !== lastLayoutHash.current) {
          lastLayoutHash.current = currentHash
          
          const newPositions: Record<string, {x: number, y: number}> = {}
          const spacingX = 350
          const spacingY = 300 
          
          // 构建依赖图
          const adj: Record<string, string[]> = {}
          const inDegree: Record<string, number> = {}
          
          db.tables.forEach(t => {
            adj[t.name] = []
            inDegree[t.name] = 0
          })

          relationships.forEach(rel => {
            if (adj[rel.toTable] && !adj[rel.toTable].includes(rel.fromTable)) {
              adj[rel.toTable].push(rel.fromTable)
              inDegree[rel.fromTable] = (inDegree[rel.fromTable] || 0) + 1
            }
          })

          // 拓扑排序/分层
          const queue: string[] = []
          const ranks: Record<string, number> = {}
          
          // 入度为0的节点（基础表）作为第一层
          Object.keys(inDegree).forEach(node => {
            if (inDegree[node] === 0) {
              queue.push(node)
              ranks[node] = 0
            }
          })

          const layers: Record<number, string[]> = {}
          
          while (queue.length > 0) {
            const node = queue.shift()!
            const rank = ranks[node]
            
            if (!layers[rank]) layers[rank] = []
            layers[rank].push(node)

            if (adj[node]) {
              adj[node].forEach(neighbor => {
                inDegree[neighbor]--
                if (inDegree[neighbor] === 0) {
                  ranks[neighbor] = rank + 1
                  queue.push(neighbor)
                }
              })
            }
          }

          // 处理环或未访问的节点
          Object.keys(inDegree).forEach(node => {
             if (ranks[node] === undefined) {
                const maxRank = Math.max(-1, ...Object.keys(layers).map(Number))
                const targetRank = maxRank + 1
                ranks[node] = targetRank
                if (!layers[targetRank]) layers[targetRank] = []
                layers[targetRank].push(node)
             }
          })

          // 赋予坐标，保留旧位置如果存在且不在本次重排范围内(虽然这里是全量重排)
          // 如果想要保留用户拖拽的位置，需要更复杂的逻辑。这里暂且在数据变化时重置位置以适应新结构。
          Object.keys(layers).forEach(rankStr => {
            const rank = parseInt(rankStr)
            const nodes = layers[rank]
            nodes.forEach((node, index) => {
              newPositions[node] = {
                x: rank * spacingX + 50,
                y: index * spacingY + 50
              }
            })
          })

          setTablePositions(prev => ({ ...prev, ...newPositions }))
        }
      }
    }, [db?.tables, relationships])

    const handleMouseDown = (e: React.MouseEvent, type: 'table' | 'canvas', id?: string) => {
      e.stopPropagation()
      const startX = e.clientX
      const startY = e.clientY
      
      if (type === 'table' && id) {
        setDragging({
          type: 'table',
          id,
          startX,
          startY,
          initialX: tablePositions[id]?.x || 0,
          initialY: tablePositions[id]?.y || 0
        })
      } else if (type === 'canvas') {
        setDragging({
          type: 'canvas',
          startX,
          startY,
          initialX: canvasOffset.x,
          initialY: canvasOffset.y
        })
      }
    }

    const handleMouseMove = (e: React.MouseEvent) => {
      if (!dragging) return
      
      const dx = (e.clientX - dragging.startX) / scale
      const dy = (e.clientY - dragging.startY) / scale

      if (dragging.type === 'table' && dragging.id) {
        setTablePositions(prev => ({
          ...prev,
          [dragging.id!]: {
            x: dragging.initialX + dx,
            y: dragging.initialY + dy
          }
        }))
      } else if (dragging.type === 'canvas') {
        setCanvasOffset({
          x: dragging.initialX + (e.clientX - dragging.startX), // 画布移动不需要除以 scale
          y: dragging.initialY + (e.clientY - dragging.startY)
        })
      }
    }

    const handleMouseUp = () => {
      setDragging(null)
    }

    const handleWheel = (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault()
        const zoomSensitivity = 0.001
        const delta = -e.deltaY * zoomSensitivity
        const newScale = Math.min(Math.max(0.1, scale + delta), 3)
        setScale(newScale)
      }
    }

    // 计算连接点
    const getConnectionPoint = (from: string, to: string) => {
      const posFrom = tablePositions[from]
      const posTo = tablePositions[to]
      if (!posFrom || !posTo) return null

      const dimFrom = tableDimensions.current.get(from) || { width: 240, height: 100 }
      const dimTo = tableDimensions.current.get(to) || { width: 240, height: 100 }

      const centerFrom = { x: posFrom.x + dimFrom.width / 2, y: posFrom.y + dimFrom.height / 2 }
      const centerTo = { x: posTo.x + dimTo.width / 2, y: posTo.y + dimTo.height / 2 }

      // 简单的方向判断
      const dx = centerTo.x - centerFrom.x
      const dy = centerTo.y - centerFrom.y

      let start = { x: 0, y: 0 }
      let end = { x: 0, y: 0 }

      // 确定起点
      if (Math.abs(dx) > Math.abs(dy)) {
        start = dx > 0 
          ? { x: posFrom.x + dimFrom.width, y: centerFrom.y } // Right
          : { x: posFrom.x, y: centerFrom.y } // Left
      } else {
        start = dy > 0
          ? { x: centerFrom.x, y: posFrom.y + dimFrom.height } // Bottom
          : { x: centerFrom.x, y: posFrom.y } // Top
      }

      // 确定终点
      if (Math.abs(dx) > Math.abs(dy)) {
        end = dx > 0
          ? { x: posTo.x, y: centerTo.y } // Left
          : { x: posTo.x + dimTo.width, y: centerTo.y } // Right
      } else {
        end = dy > 0
          ? { x: centerTo.x, y: posTo.y } // Top
          : { x: centerTo.x, y: posTo.y + dimTo.height } // Bottom
      }

      return { start, end }
    }

    if (!db) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Database className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg">请选择数据库</p>
          <p className="text-sm mt-2">点击左侧数据库旁的 <Table2 className="w-3 h-3 inline mx-1" /> 图标查看 ER 图</p>
        </div>
      )
    }
    if (loadingER) {
       return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mb-2" />
          <p>正在加载表结构...</p>
        </div>
      )
    }

    if (db.tables.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Table2 className="w-8 h-8 mb-2 opacity-20" />
              <p>该数据库没有表</p>
            </div>
        )
    }
    
    const tablesWithColumns = db.tables.filter(t => t.columns && t.columns.length > 0)
    
    if (tablesWithColumns.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <p>未能加载表结构信息</p>
        </div>
      )
    }

    return (
      <div 
        className="relative w-full h-full overflow-hidden bg-slate-50 dark:bg-slate-950 select-none" 
        ref={containerRef}
        onMouseDown={(e) => handleMouseDown(e, 'canvas')}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* 背景网格 */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundPosition: `${canvasOffset.x}px ${canvasOffset.y}px`
          }}
        />

        <div 
          className="absolute origin-top-left transition-transform duration-75"
          style={{
            transform: `translate(${canvasOffset.x}px, ${canvasOffset.y}px) scale(${scale})`
          }}
        >
          {/* 连线层 */}
          <svg className="absolute top-0 left-0 w-[5000px] h-[5000px] pointer-events-none z-0" style={{ overflow: 'visible' }}>
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
              </marker>
            </defs>
            {relationships.map((rel, index) => {
              const points = getConnectionPoint(rel.fromTable, rel.toTable)
              if (!points) return null
              
              const { start, end } = points
              // 计算控制点
              const dx = Math.abs(end.x - start.x)
              const dy = Math.abs(end.y - start.y)
              
              let path = ''
              // 根据相对位置决定曲线走向
              if (dx > dy) {
                 const curvature = Math.min(dx * 0.5, 100)
                 path = `M ${start.x} ${start.y} C ${start.x + curvature} ${start.y}, ${end.x - curvature} ${end.y}, ${end.x} ${end.y}`
              } else {
                 const curvature = Math.min(dy * 0.5, 100)
                 path = `M ${start.x} ${start.y} C ${start.x} ${start.y + curvature}, ${end.x} ${end.y - curvature}, ${end.x} ${end.y}`
              }

              return (
                <g key={`${rel.fromTable}-${rel.toTable}-${index}`}>
                  <path 
                    d={path}
                    stroke="#94a3b8"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                    className="hover:stroke-primary transition-colors cursor-pointer"
                  />
                  <title>{`${rel.fromTable}.${rel.fromColumn} -> ${rel.toTable}.${rel.toColumn}`}</title>
                </g>
              )
            })}
          </svg>

          {/* 节点层 */}
          {tablesWithColumns.map(table => {
            const pos = tablePositions[table.name] || { x: 0, y: 0 }
            return (
              <div 
                key={table.name} 
                className={cn(
                  "absolute border rounded-lg shadow-sm bg-card w-[240px] flex flex-col",
                  dragging?.type === 'table' && dragging?.id === table.name ? "shadow-lg ring-2 ring-primary/50 z-50" : "z-10"
                )}
                style={{
                  left: pos.x,
                  top: pos.y,
                }}
                ref={el => {
                  if (el) {
                    tableDimensions.current.set(table.name, {
                      width: el.offsetWidth,
                      height: el.offsetHeight
                    })
                  }
                }}
              >
                <div 
                  className="bg-primary text-primary-foreground px-3 py-2 rounded-t-lg font-medium flex items-center gap-2 cursor-move"
                  onMouseDown={(e) => handleMouseDown(e, 'table', table.name)}
                >
                  <Table2 className="w-4 h-4 pointer-events-none" />
                  <span className="truncate pointer-events-none" title={table.name}>{table.name}</span>
                </div>
                <div className="divide-y max-h-[300px] overflow-y-auto custom-scrollbar">
                  {table.columns?.map(col => (
                    <div key={col.name} className="px-3 py-2 text-sm flex items-center gap-2 group hover:bg-muted/50">
                      {col.key === 'PRI' ? (
                        <Key className="w-3.5 h-3.5 text-yellow-500 shrink-0" />
                      ) : col.key === 'MUL' ? (
                        <Hash className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      ) : (
                        <span className="w-3.5 shrink-0" />
                      )}
                      <span className={cn("font-mono truncate flex-1", col.key === 'PRI' && "font-semibold")}>{col.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0">{col.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* 操作提示 */}
        <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur p-2 rounded border text-xs text-muted-foreground">
          <p>拖动卡片标题移动表</p>
          <p>拖动空白处移动画布</p>
          <p>Ctrl + 滚轮缩放</p>
        </div>
      </div>
    )
  }


  return (
    <div className="h-full flex flex-col gap-3 overflow-hidden p-4" style={{ height: '100%', minHeight: 0 }}>
      {/* Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Database className="w-5 h-5" />
            SQL 终端
          </h2>
          <p className="text-sm text-muted-foreground">连接数据库并执行SQL查询</p>
        </div>
        {connected && (
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1.5 text-green-600">
              <Wifi className="w-4 h-4" />
              <span>已连接 {config.host}:{config.port}</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleDisconnect}>
              <WifiOff className="w-4 h-4 mr-2" />
              断开
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="flex-shrink-0">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!connected ? (
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-2">
              <Label>数据库类型</Label>
              <Select value={config.type} onValueChange={(v: any) => setConfig({ ...config, type: v, port: getDefaultPort(v) })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="postgres">PostgreSQL</SelectItem>
                  <SelectItem value="hive">Hive</SelectItem>
                  <SelectItem value="hbase">HBase</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>主机地址</Label>
              <Input value={config.host} onChange={(e) => setConfig({ ...config, host: e.target.value })} placeholder="localhost" />
            </div>
            <div className="space-y-2">
              <Label>端口</Label>
              <Input type="number" value={config.port} onChange={(e) => setConfig({ ...config, port: Number(e.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label>用户名</Label>
              <Input value={config.username} onChange={(e) => setConfig({ ...config, username: e.target.value })} placeholder="root" />
            </div>
            <div className="space-y-2">
              <Label>密码</Label>
              <Input type="password" value={config.password} onChange={(e) => setConfig({ ...config, password: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>数据库名称（可选）</Label>
              <Input value={config.database} onChange={(e) => setConfig({ ...config, database: e.target.value })} placeholder="留空则连接后选择" />
            </div>
            <div className="col-span-2">
              <Button onClick={handleConnect} disabled={connecting} className="w-full">
                {connecting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wifi className="w-4 h-4 mr-2" />}
                连接数据库
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex gap-3 overflow-hidden h-full">
          {/* 左侧数据库结构树 */}
          <div className="w-56 flex-shrink-0 border rounded-lg bg-card/50 flex flex-col h-full">
            <div className="p-2 border-b flex items-center justify-between">
              <span className="text-sm font-medium">数据库结构</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCreateDb(true)} title="新建数据库">
                  <Plus className="w-3.5 h-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => loadDatabases(sessionId)}>
                  <RefreshCw className={cn("w-3.5 h-3.5", loadingDbs && "animate-spin")} />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2 text-sm custom-scrollbar">
              {loadingDbs ? (
                <div className="flex items-center justify-center py-4 text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />加载中...
                </div>
              ) : databases.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">暂无数据库</div>
              ) : (
                databases.map(db => (
                  // ... database list item ...
                  <div key={db.name}>
                    <div className="flex items-center gap-1 py-1 px-1 hover:bg-accent rounded cursor-pointer group">
                      <div className="flex items-center gap-1 flex-1" onClick={() => toggleDatabase(db.name)}>
                        {db.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : db.expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                        <FolderOpen className="w-3.5 h-3.5 text-yellow-500" />
                        <span className="truncate">{db.name}</span>
                      </div>
                      <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => selectDbForER(db.name)} title="查看ER图">
                        <Table2 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={() => { setNewTableDb(db.name); setShowCreateTable(true) }} title="新建表">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    {db.expanded && (
                      <div className="ml-4">
                        {db.tables.length === 0 ? (
                          <div className="text-xs text-muted-foreground py-1 px-1">暂无表</div>
                        ) : db.tables.map(table => (
                          <div key={table.name}>
                            <div className="flex items-center gap-1 py-1 px-1 hover:bg-accent rounded cursor-pointer group">
                              <div className="flex items-center gap-1 flex-1" onClick={() => toggleTable(db.name, table.name)} onDoubleClick={() => insertTableQuery(db.name, table.name)}>
                                {table.loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : table.expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                <Table2 className="w-3.5 h-3.5 text-blue-500" />
                                <span className="truncate flex-1">{table.name}</span>
                              </div>
                              <Button variant="ghost" size="icon" className="h-5 w-5 opacity-0 group-hover:opacity-100" onClick={(e) => { e.stopPropagation(); openEditTable(db.name, table.name) }} title="编辑表结构">
                                <Pencil className="w-3 h-3" />
                              </Button>
                            </div>
                            {table.expanded && table.columns && (
                              <div className="ml-4">
                                {table.columns.map(col => (
                                  <div key={col.name} className="flex items-center gap-1 py-0.5 px-1 text-xs text-muted-foreground">
                                    {col.key === 'PRI' ? <Key className="w-3 h-3 text-yellow-500" /> : <Columns className="w-3 h-3" />}
                                    <span className="truncate">{col.name}</span>
                                    <span className="text-[10px] opacity-60">{col.type}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>


          {/* 右侧内容区域 */}
          <div className="flex-1 border rounded-lg bg-card/50 flex flex-col overflow-hidden h-full">
            {/* 视图切换 */}
            <div className="p-2 border-b flex gap-2 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <Button variant={viewMode === 'sql' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('sql')}>
                <Play className="w-4 h-4 mr-1" /> SQL查询
              </Button>
              <Button variant={viewMode === 'er' ? 'default' : 'outline'} size="sm" onClick={() => setViewMode('er')}>
                <Table2 className="w-4 h-4 mr-1" /> ER图
              </Button>
              {viewMode === 'er' && selectedDb && (
                <span className="text-sm text-muted-foreground ml-2 self-center">当前: {selectedDb}</span>
              )}
            </div>

            {viewMode === 'sql' ? (
              <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                {/* SQL编辑区 */}
                <div className="p-4 border-b shrink-0">
                  <div className="flex gap-2">
                    <Textarea value={sql} onChange={(e) => setSql(e.target.value)} placeholder="输入SQL语句... (Ctrl+Enter 执行)" className="flex-1 font-mono resize-none h-24"
                      onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) handleExecute() }} />
                    <div className="flex flex-col gap-2">
                      <Button onClick={() => handleExecute()} disabled={loading || !sql.trim()} size="sm">
                        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}执行
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleClear}><Trash2 className="w-4 h-4 mr-2" />清空</Button>
                    </div>
                  </div>
                </div>
                {/* 结果区域 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <Database className="w-12 h-12 mb-2 opacity-20" />
                      <p>执行SQL查询后结果将显示在这里</p>
                      <p className="text-xs mt-1">双击左侧表名可快速生成查询语句</p>
                    </div>
                  ) : (
                    <>
                      {results.map((res) => (
                        <div key={res.id} className="space-y-2 border rounded-lg p-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-mono bg-muted px-1.5 py-0.5 rounded">{res.time}</span>
                            <span className="font-mono flex-1 truncate">{res.sql}</span>
                          </div>
                          {res.type === 'error' ? (
                            <div className="text-red-500 text-sm p-2 bg-red-500/10 rounded font-mono">{res.error}</div>
                          ) : (
                            <div className="border rounded-md flex flex-col bg-card w-full max-w-full">
                              {res.data && res.data.length > 0 ? (
                                <>
                                  <div className="overflow-x-auto overflow-y-auto w-full" style={{ maxHeight: '500px' }}>
                                    <table className="text-sm w-max min-w-full border-collapse">
                                      <thead className="sticky top-0 bg-muted z-10 shadow-sm">
                                        <tr>
                                          {Object.keys(res.data[0]).map(key => (
                                            <th key={key} className="border-b border-r last:border-r-0 p-2 px-3 text-left font-medium whitespace-nowrap bg-muted min-w-[50px]">
                                              {key}
                                            </th>
                                          ))}
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {res.data.map((row: any, rIndex: number) => (
                                          <tr key={rIndex} className="hover:bg-muted/50 group">
                                            {Object.values(row).map((val: any, cIndex: number) => (
                                              <td 
                                                key={cIndex} 
                                                className="border-b border-r last:border-r-0 p-2 px-3 font-mono whitespace-nowrap" 
                                                title={val === null ? 'NULL' : String(val)}
                                              >
                                                {val === null ? <span className="text-muted-foreground/50 italic">NULL</span> : String(val)}
                                              </td>
                                            ))}
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                  <div className="bg-muted/30 border-t px-3 py-1.5 text-xs text-muted-foreground flex justify-between items-center">
                                    <span>{res.data.length} 行结果</span>
                                    <span>{res.time}</span>
                                  </div>
                                </>
                              ) : (
                                <div className="p-8 text-center text-muted-foreground flex flex-col items-center gap-2">
                                  <Database className="w-8 h-8 opacity-20" />
                                  <p>查询结果为空</p>
                                  <span className="text-xs opacity-50">{res.time}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                      <div ref={resultsEndRef} />
                    </>
                  )}
                </div>
              </div>
            ) : (
              <ERDiagram dbName={selectedDb} />
            )}
          </div>
        </div>
      )}


      {/* 创建数据库对话框 */}
      <Dialog open={showCreateDb} onOpenChange={setShowCreateDb}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>新建数据库</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>数据库名称</Label>
              <Input value={newDbName} onChange={(e) => setNewDbName(e.target.value)} placeholder="输入数据库名称" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDb(false)}>取消</Button>
            <Button onClick={handleCreateDatabase} disabled={creatingDb || !newDbName.trim()}>
              {creatingDb ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 创建表对话框 */}
      <Dialog open={showCreateTable} onOpenChange={setShowCreateTable}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>新建表 - {newTableDb}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>表名称</Label>
              <Input value={newTableName} onChange={(e) => setNewTableName(e.target.value)} placeholder="输入表名称" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>字段定义</Label>
                <Button variant="outline" size="sm" onClick={addColumn}><Plus className="w-4 h-4 mr-1" />添加字段</Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left">字段名</th>
                      <th className="p-2 text-left">类型</th>
                      <th className="p-2 text-center w-20">主键</th>
                      <th className="p-2 text-center w-20">非空</th>
                      <th className="p-2 text-center w-20">自增</th>
                      <th className="p-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {newColumns.map((col, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">
                          <Input 
                            ref={el => fieldNameRefs.current[i] = el}
                            value={col.name} 
                            onChange={(e) => updateColumn(i, 'name', e.target.value)} 
                            placeholder="字段名" 
                            className="h-8" 
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addColumn()
                              }
                            }}
                          />
                        </td>
                        <td className="p-2">
                          <Select value={col.type} onValueChange={(v) => updateColumn(i, 'type', v)}>
                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {!COMMON_TYPES.includes(col.type) && <SelectItem value={col.type}>{col.type}</SelectItem>}
                              {COMMON_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2 text-center"><input type="checkbox" checked={col.isPrimary} onChange={(e) => updateColumn(i, 'isPrimary', e.target.checked)} /></td>
                        <td className="p-2 text-center"><input type="checkbox" checked={!col.nullable} onChange={(e) => updateColumn(i, 'nullable', !e.target.checked)} /></td>
                        <td className="p-2 text-center">
                          <input 
                            type="checkbox" 
                            checked={col.autoIncrement} 
                            onChange={(e) => updateColumn(i, 'autoIncrement', e.target.checked)}
                            onKeyDown={(e) => {
                              if (e.key === 'Tab' && !e.shiftKey) {
                                e.preventDefault()
                                if (i === newColumns.length - 1) {
                                  addColumn()
                                } else {
                                  fieldNameRefs.current[i + 1]?.focus()
                                }
                              }
                            }} 
                          />
                        </td>
                        <td className="p-2"><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeColumn(i)}><X className="w-4 h-4" /></Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateTable(false)}>取消</Button>
            <Button onClick={handleCreateTable} disabled={creatingTable || !newTableName.trim() || newColumns.length === 0}>
              {creatingTable ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑表结构对话框 */}
      <Dialog open={showEditTable} onOpenChange={setShowEditTable}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>编辑表结构 - {editTableDb}.{editTableName}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto py-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>字段列表</Label>
                <Button variant="outline" size="sm" onClick={addEditColumn}><Plus className="w-4 h-4 mr-1" />添加字段</Button>
              </div>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr>
                      <th className="p-2 text-left w-8"></th>
                      <th className="p-2 text-left">字段名</th>
                      <th className="p-2 text-left">类型</th>
                      <th className="p-2 text-center w-16">主键</th>
                      <th className="p-2 text-center w-16">非空</th>
                      <th className="p-2 text-center w-16">自增</th>
                      <th className="p-2 w-16">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {editColumns.map((col, i) => (
                      <tr key={i} className={cn("border-t", col.toDelete && "bg-red-50 dark:bg-red-950/20 opacity-50", col.isNew && "bg-green-50 dark:bg-green-950/20")}>
                        <td className="p-2 text-center">
                          {col.isNew ? <span className="text-green-600 text-xs">新</span> : col.toDelete ? <span className="text-red-600 text-xs">删</span> : null}
                        </td>
                        <td className="p-2">
                          <Input 
                            ref={el => editFieldNameRefs.current[i] = el}
                            value={col.name} 
                            onChange={(e) => updateEditColumn(i, 'name', e.target.value)} 
                            placeholder="字段名" 
                            className="h-8" 
                            disabled={col.toDelete}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault()
                                addEditColumn()
                              }
                            }}
                          />
                        </td>
                        <td className="p-2">
                          <Select value={col.type} onValueChange={(v) => updateEditColumn(i, 'type', v)} disabled={col.toDelete}>
                            <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {!COMMON_TYPES.includes(col.type) && <SelectItem value={col.type}>{col.type}</SelectItem>}
                              {COMMON_TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2 text-center"><input type="checkbox" checked={col.isPrimary} onChange={(e) => updateEditColumn(i, 'isPrimary', e.target.checked)} disabled={col.toDelete} /></td>
                        <td className="p-2 text-center"><input type="checkbox" checked={!col.nullable} onChange={(e) => updateEditColumn(i, 'nullable', !e.target.checked)} disabled={col.toDelete} /></td>
                        <td className="p-2 text-center">
                          <input 
                            type="checkbox" 
                            checked={col.autoIncrement} 
                            onChange={(e) => updateEditColumn(i, 'autoIncrement', e.target.checked)} 
                            disabled={col.toDelete} 
                            onKeyDown={(e) => {
                              if (e.key === 'Tab' && !e.shiftKey) {
                                e.preventDefault()
                                if (i === editColumns.length - 1) {
                                  addEditColumn()
                                } else {
                                  editFieldNameRefs.current[i + 1]?.focus()
                                }
                              }
                            }}
                          />
                        </td>
                        <td className="p-2 text-center">
                          <Button variant={col.toDelete ? "outline" : "ghost"} size="icon" className="h-6 w-6" onClick={() => toggleDeleteColumn(i)} title={col.toDelete ? "撤销删除" : "删除字段"}>
                            {col.toDelete ? <RefreshCw className="w-4 h-4" /> : <Trash2 className="w-4 h-4 text-red-500" />}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground">提示：修改字段名或类型会执行 ALTER TABLE 语句，请谨慎操作</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditTable(false)}>取消</Button>
            <Button onClick={handleSaveTableStructure} disabled={savingTable}>
              {savingTable ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}保存修改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
