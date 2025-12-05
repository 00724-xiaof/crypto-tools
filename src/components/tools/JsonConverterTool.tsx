import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Copy, RefreshCw, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

type TargetLanguage = 'typescript' | 'go' | 'java'

export function JsonConverterTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [language, setLanguage] = useState<TargetLanguage>('typescript')
  const [error, setError] = useState('')

  useEffect(() => {
    convert()
  }, [input, language])

  const convert = () => {
    if (!input.trim()) {
      setOutput('')
      setError('')
      return
    }

    try {
      const json = JSON.parse(input)
      setError('')
      
      switch (language) {
        case 'typescript':
          setOutput(jsonToTypescript(json))
          break
        case 'go':
          setOutput(jsonToGo(json))
          break
        case 'java':
          setOutput(jsonToJava(json))
          break
      }
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output)
  }

  return (
    <div className="h-full flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Select value={language} onValueChange={(v: TargetLanguage) => setLanguage(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="选择目标语言" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="typescript">TypeScript Interface</SelectItem>
              <SelectItem value="go">Go Struct</SelectItem>
              <SelectItem value="java">Java Class</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={convert}>
          <RefreshCw className="w-4 h-4 mr-2" />
          重新转换
        </Button>
      </div>

      <div className="flex-1 grid grid-cols-2 gap-4 min-h-0">
        <div className="flex flex-col gap-2">
          <div className="text-sm font-medium text-muted-foreground">JSON 输入</div>
          <Textarea
            className="flex-1 font-mono text-xs resize-none"
            placeholder='{"name": "John", "age": 30}'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-muted-foreground">结果输出</div>
            <Button variant="ghost" size="sm" onClick={copyToClipboard} disabled={!output}>
              <Copy className="w-4 h-4 mr-2" />
              复制
            </Button>
          </div>
          <div className="relative flex-1">
            <Textarea
              className="absolute inset-0 font-mono text-xs resize-none bg-muted/50"
              value={output}
              readOnly
            />
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>JSON 解析错误</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// 简单的转换逻辑实现
function getType(value: any): string {
  if (value === null) return 'any'
  if (Array.isArray(value)) return 'array'
  return typeof value
}

function jsonToTypescript(json: any, name: string = 'RootObject'): string {
  let result = `export interface ${name} {\n`
  const nestedInterfaces: string[] = []

  if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
    Object.entries(json).forEach(([key, value]) => {
      const type = getType(value)
      let tsType = 'any'

      if (type === 'string') tsType = 'string'
      else if (type === 'number') tsType = 'number'
      else if (type === 'boolean') tsType = 'boolean'
      else if (type === 'object') {
        const interfaceName = key.charAt(0).toUpperCase() + key.slice(1)
        tsType = interfaceName
        nestedInterfaces.push(jsonToTypescript(value, interfaceName))
      } else if (type === 'array') {
        if ((value as any[]).length > 0) {
          const itemType = getType((value as any[])[0])
          if (itemType === 'object') {
            const interfaceName = key.charAt(0).toUpperCase() + key.slice(1) + 'Item'
            tsType = `${interfaceName}[]`
            nestedInterfaces.push(jsonToTypescript((value as any[])[0], interfaceName))
          } else {
            tsType = `${itemType}[]`
          }
        } else {
          tsType = 'any[]'
        }
      }

      result += `  ${key}: ${tsType};\n`
    })
  }

  result += '}'
  
  return result + '\n\n' + nestedInterfaces.join('\n\n')
}

function jsonToGo(json: any, name: string = 'Root'): string {
  let result = `type ${name} struct {\n`
  const nestedStructs: string[] = []

  if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
    Object.entries(json).forEach(([key, value]) => {
      const fieldName = key.charAt(0).toUpperCase() + key.slice(1)
      const type = getType(value)
      let goType = 'interface{}'

      if (type === 'string') goType = 'string'
      else if (type === 'number') goType = Number.isInteger(value) ? 'int' : 'float64'
      else if (type === 'boolean') goType = 'bool'
      else if (type === 'object') {
        const structName = fieldName
        goType = structName
        nestedStructs.push(jsonToGo(value, structName))
      } else if (type === 'array') {
        if ((value as any[]).length > 0) {
          const itemType = getType((value as any[])[0])
          if (itemType === 'object') {
            const structName = fieldName + 'Item'
            goType = `[]${structName}`
            nestedStructs.push(jsonToGo((value as any[])[0], structName))
          } else if (itemType === 'number') {
            goType = Number.isInteger((value as any[])[0]) ? '[]int' : '[]float64'
          } else {
            goType = `[]${itemType}`
          }
        } else {
          goType = '[]interface{}'
        }
      }

      result += `\t${fieldName} ${goType} \`json:"${key}"\`\n`
    })
  }

  result += '}'
  
  return result + '\n\n' + nestedStructs.join('\n\n')
}

function jsonToJava(json: any, name: string = 'Root'): string {
  let result = `public class ${name} {\n`
  const nestedClasses: string[] = []

  if (typeof json === 'object' && json !== null && !Array.isArray(json)) {
    Object.entries(json).forEach(([key, value]) => {
      const type = getType(value)
      let javaType = 'Object'

      if (type === 'string') javaType = 'String'
      else if (type === 'number') javaType = Number.isInteger(value) ? 'Integer' : 'Double'
      else if (type === 'boolean') javaType = 'Boolean'
      else if (type === 'object') {
        const className = key.charAt(0).toUpperCase() + key.slice(1)
        javaType = className
        nestedClasses.push(jsonToJava(value, className))
      } else if (type === 'array') {
        if ((value as any[]).length > 0) {
          const itemType = getType((value as any[])[0])
          if (itemType === 'object') {
            const className = key.charAt(0).toUpperCase() + key.slice(1) + 'Item'
            javaType = `List<${className}>`
            nestedClasses.push(jsonToJava((value as any[])[0], className))
          } else {
            const itemJavaType = itemType === 'string' ? 'String' : itemType === 'number' ? 'Integer' : 'Object'
            javaType = `List<${itemJavaType}>`
          }
        } else {
          javaType = 'List<Object>'
        }
      }

      result += `    private ${javaType} ${key};\n`
    })

    // Add Getters/Setters placeholders or leave as fields for brevity
    result += '\n    // Getters and Setters omitted for brevity\n'
  }

  result += '}'
  
  return result + '\n\n' + nestedClasses.join('\n\n')
}
