import { lazy } from 'react'
import { 
  Code2, 
  Lock, 
  Wrench,
  ArrowLeftRight,
  ShieldCheck,
  Database,
  Server,
  Globe,
  FileJson,
  Type,
  LucideIcon 
} from 'lucide-react'

export type ToolCategory = 
  | 'encoding' 
  | 'encryption' 
  | 'hashing' 
  | 'format' 
  | 'dev' 
  | 'network' 
  | 'server' 
  | 'database' 
  | 'text' 
  | 'other' 
  | 'ai'

export interface ToolGroup {
  id: ToolCategory
  title: string
  icon: LucideIcon
  color: string
}

export interface ToolItem {
  id: string
  name: string
  category: ToolCategory
  component: React.LazyExoticComponent<React.ComponentType<any>>
  badge?: string
  hideInMenu?: boolean
  fullScreen?: boolean
}

export const TOOL_GROUPS: ToolGroup[] = [
  { id: 'encoding', title: '编码转换', icon: ArrowLeftRight, color: 'text-blue-500' },
  { id: 'encryption', title: '加密解密', icon: Lock, color: 'text-purple-500' },
  { id: 'hashing', title: '哈希校验', icon: ShieldCheck, color: 'text-green-500' },
  { id: 'format', title: '格式转换', icon: FileJson, color: 'text-amber-500' },
  { id: 'dev', title: '开发辅助', icon: Code2, color: 'text-orange-500' },
  { id: 'network', title: '网络工具', icon: Globe, color: 'text-sky-500' },
  { id: 'server', title: '服务器连接', icon: Server, color: 'text-indigo-500' },
  { id: 'database', title: '数据库终端', icon: Database, color: 'text-cyan-500' },
  { id: 'text', title: '文本处理', icon: Type, color: 'text-pink-500' },
  { id: 'other', title: '其他工具', icon: Wrench, color: 'text-gray-500' },
]

export const TOOLS: ToolItem[] = [
  // ========== 编码转换 ==========
  { 
    id: 'base64', 
    name: 'Base64', 
    category: 'encoding', 
    component: lazy(() => import('@/components/tools/Base64Tool').then(m => ({ default: m.Base64Tool }))) 
  },
  { 
    id: 'base58', 
    name: 'Base58', 
    category: 'encoding', 
    component: lazy(() => import('@/components/tools/Base58Tool').then(m => ({ default: m.Base58Tool }))) 
  },
  { 
    id: 'base32', 
    name: 'Base32', 
    category: 'encoding', 
    component: lazy(() => import('@/components/tools/Base32Tool').then(m => ({ default: m.Base32Tool }))) 
  },
  { 
    id: 'url', 
    name: 'URL编码', 
    category: 'encoding', 
    component: lazy(() => import('@/components/tools/UrlTool').then(m => ({ default: m.UrlTool }))) 
  },
  { 
    id: 'hex', 
    name: 'Hex十六进制', 
    category: 'encoding', 
    component: lazy(() => import('@/components/tools/HexTool').then(m => ({ default: m.HexTool }))) 
  },
  { 
    id: 'unicode', 
    name: 'Unicode', 
    category: 'encoding', 
    component: lazy(() => import('@/components/tools/UnicodeTool').then(m => ({ default: m.UnicodeTool }))) 
  },
  { 
    id: 'ascii-binary', 
    name: 'ASCII/Binary', 
    category: 'encoding', 
    component: lazy(() => import('@/components/tools/AsciiBinaryTool').then(m => ({ default: m.AsciiBinaryTool }))) 
  },
  { 
    id: 'html-entity', 
    name: 'HTML实体', 
    category: 'encoding', 
    component: lazy(() => import('@/components/tools/HtmlEntityTool').then(m => ({ default: m.HtmlEntityTool }))) 
  },
  { 
    id: 'punycode', 
    name: 'Punycode', 
    category: 'encoding', 
    component: lazy(() => import('@/components/tools/PunycodeTool').then(m => ({ default: m.PunycodeTool }))) 
  },
  { 
    id: 'escape', 
    name: '转义工具', 
    category: 'encoding', 
    component: lazy(() => import('@/components/tools/EscapeTool').then(m => ({ default: m.EscapeTool }))) 
  },
  { 
    id: 'image-base64', 
    name: '图片Base64', 
    category: 'encoding', 
    component: lazy(() => import('@/components/tools/ImageBase64Tool').then(m => ({ default: m.ImageBase64Tool }))) 
  },

  // ========== 加密解密 ==========
  { 
    id: 'aes', 
    name: 'AES', 
    category: 'encryption', 
    badge: '推荐',
    component: lazy(() => import('@/components/tools/AesTool').then(m => ({ default: m.AesTool }))) 
  },
  { 
    id: 'des', 
    name: 'DES/3DES', 
    category: 'encryption', 
    component: lazy(() => import('@/components/tools/DesTool').then(m => ({ default: m.DesTool }))) 
  },
  { 
    id: 'rsa', 
    name: 'RSA非对称', 
    category: 'encryption', 
    component: lazy(() => import('@/components/tools/RsaTool').then(m => ({ default: m.RsaTool }))) 
  },
  { 
    id: 'sm2', 
    name: 'SM2国密', 
    category: 'encryption', 
    component: lazy(() => import('@/components/tools/Sm2Tool').then(m => ({ default: m.Sm2Tool }))) 
  },
  { 
    id: 'sm4', 
    name: 'SM4国密', 
    category: 'encryption', 
    component: lazy(() => import('@/components/tools/Sm4Tool').then(m => ({ default: m.Sm4Tool }))) 
  },
  { 
    id: 'chacha20', 
    name: 'ChaCha20', 
    category: 'encryption', 
    component: lazy(() => import('@/components/tools/ChaCha20Tool').then(m => ({ default: m.ChaCha20Tool }))) 
  },
  { 
    id: 'rc4', 
    name: 'RC4', 
    category: 'encryption', 
    component: lazy(() => import('@/components/tools/Rc4Tool').then(m => ({ default: m.Rc4Tool }))) 
  },
  { 
    id: 'xor', 
    name: 'XOR加密', 
    category: 'encryption', 
    component: lazy(() => import('@/components/tools/XorTool').then(m => ({ default: m.XorTool }))) 
  },

  // ========== 哈希校验 ==========
  { 
    id: 'hash', 
    name: 'MD5/SHA系列', 
    category: 'hashing', 
    component: lazy(() => import('@/components/tools/HashTool').then(m => ({ default: m.HashTool }))) 
  },
  { 
    id: 'hmac', 
    name: 'HMAC签名', 
    category: 'hashing', 
    component: lazy(() => import('@/components/tools/HmacTool').then(m => ({ default: m.HmacTool }))) 
  },
  { 
    id: 'sm3', 
    name: 'SM3国密', 
    category: 'hashing', 
    component: lazy(() => import('@/components/tools/Sm3Tool').then(m => ({ default: m.Sm3Tool }))) 
  },
  { 
    id: 'blake2', 
    name: 'BLAKE2', 
    category: 'hashing', 
    component: lazy(() => import('@/components/tools/Blake2Tool').then(m => ({ default: m.Blake2Tool }))) 
  },
  { 
    id: 'crc32', 
    name: 'CRC校验', 
    category: 'hashing', 
    component: lazy(() => import('@/components/tools/Crc32Tool').then(m => ({ default: m.Crc32Tool }))) 
  },
  { 
    id: 'bcrypt', 
    name: 'Bcrypt/Scrypt', 
    category: 'hashing', 
    component: lazy(() => import('@/components/tools/BcryptTool').then(m => ({ default: m.BcryptTool }))) 
  },
  { 
    id: 'file-hash', 
    name: '文件哈希', 
    category: 'hashing', 
    component: lazy(() => import('@/components/tools/FileHashTool').then(m => ({ default: m.FileHashTool }))) 
  },

  // ========== 格式转换 ==========
  { 
    id: 'json', 
    name: 'JSON格式化', 
    category: 'format', 
    component: lazy(() => import('@/components/tools/JsonTool').then(m => ({ default: m.JsonTool }))) 
  },
  { 
    id: 'json-converter', 
    name: 'JSON转代码', 
    category: 'format', 
    component: lazy(() => import('@/components/tools/JsonConverterTool').then(m => ({ default: m.JsonConverterTool }))) 
  },
  { 
    id: 'yaml-json', 
    name: 'YAML/JSON', 
    category: 'format', 
    component: lazy(() => import('@/components/tools/YamlJsonTool').then(m => ({ default: m.YamlJsonTool }))) 
  },
  { 
    id: 'xml', 
    name: 'XML工具', 
    category: 'format', 
    component: lazy(() => import('@/components/tools/XmlTool').then(m => ({ default: m.XmlTool }))) 
  },
  { 
    id: 'sql-format', 
    name: 'SQL格式化', 
    category: 'format', 
    component: lazy(() => import('@/components/tools/SqlFormatTool').then(m => ({ default: m.SqlFormatTool }))) 
  },
  { 
    id: 'markdown', 
    name: 'Markdown', 
    category: 'format', 
    component: lazy(() => import('@/components/tools/MarkdownTool').then(m => ({ default: m.MarkdownTool }))) 
  },

  // ========== 开发辅助 ==========
  { 
    id: 'regex', 
    name: '正则测试', 
    category: 'dev', 
    component: lazy(() => import('@/components/tools/RegexTool').then(m => ({ default: m.RegexTool }))) 
  },
  { 
    id: 'jwt', 
    name: 'JWT解析', 
    category: 'dev', 
    component: lazy(() => import('@/components/tools/JwtTool').then(m => ({ default: m.JwtTool }))) 
  },
  { 
    id: 'timestamp', 
    name: '时间戳转换', 
    category: 'dev', 
    component: lazy(() => import('@/components/tools/TimestampTool').then(m => ({ default: m.TimestampTool }))) 
  },
  { 
    id: 'cron', 
    name: 'Cron解析', 
    category: 'dev', 
    component: lazy(() => import('@/components/tools/CronTool').then(m => ({ default: m.CronTool }))) 
  },
  { 
    id: 'uuid', 
    name: 'UUID生成', 
    category: 'dev', 
    component: lazy(() => import('@/components/tools/UuidTool').then(m => ({ default: m.UuidTool }))) 
  },
  { 
    id: 'password-gen', 
    name: '密码生成', 
    category: 'dev', 
    component: lazy(() => import('@/components/tools/PasswordGenTool').then(m => ({ default: m.PasswordGenTool }))) 
  },
  { 
    id: 'base-converter', 
    name: '进制转换', 
    category: 'dev', 
    component: lazy(() => import('@/components/tools/BaseConverterTool').then(m => ({ default: m.BaseConverterTool }))) 
  },
  { 
    id: 'keycode', 
    name: 'Keycode检测', 
    category: 'dev', 
    component: lazy(() => import('@/components/tools/KeycodeTool').then(m => ({ default: m.KeycodeTool }))) 
  },
  { 
    id: 'chmod', 
    name: 'Chmod计算', 
    category: 'dev', 
    component: lazy(() => import('@/components/tools/ChmodTool').then(m => ({ default: m.ChmodTool }))) 
  },
  { 
    id: 'diff', 
    name: '文本对比', 
    category: 'dev', 
    component: lazy(() => import('@/components/tools/DiffTool').then(m => ({ default: m.DiffTool }))) 
  },
  { 
    id: 'lorem-ipsum', 
    name: 'Lorem Ipsum', 
    category: 'dev', 
    component: lazy(() => import('@/components/tools/LoremIpsumTool').then(m => ({ default: m.LoremIpsumTool }))) 
  },

  // ========== 网络工具 ==========
  { 
    id: 'http-request', 
    name: 'HTTP请求', 
    category: 'network', 
    component: lazy(() => import('@/components/tools/HttpRequestTool').then(m => ({ default: m.HttpRequestTool }))) 
  },
  { 
    id: 'curl-converter', 
    name: 'Curl转换', 
    category: 'network', 
    component: lazy(() => import('@/components/tools/CurlConverterTool').then(m => ({ default: m.CurlConverterTool }))) 
  },
  { 
    id: 'websocket', 
    name: 'WebSocket', 
    category: 'network', 
    component: lazy(() => import('@/components/tools/WebsocketTool').then(m => ({ default: m.WebsocketTool }))) 
  },
  { 
    id: 'url-parser', 
    name: 'URL解析', 
    category: 'network', 
    component: lazy(() => import('@/components/tools/UrlParserTool').then(m => ({ default: m.UrlParserTool }))) 
  },
  { 
    id: 'dns-lookup', 
    name: 'DNS查询', 
    category: 'network', 
    component: lazy(() => import('@/components/tools/DnsTool').then(m => ({ default: m.DnsTool }))) 
  },
  { 
    id: 'ssl-cert', 
    name: 'SSL证书', 
    category: 'network', 
    component: lazy(() => import('@/components/tools/SslCertTool').then(m => ({ default: m.SslCertTool }))) 
  },
  { 
    id: 'port-check', 
    name: '端口检测', 
    category: 'network', 
    component: lazy(() => import('@/components/tools/PortCheckTool').then(m => ({ default: m.PortCheckTool }))) 
  },
  { 
    id: 'port-manager', 
    name: '端口管理', 
    category: 'network', 
    component: lazy(() => import('@/components/tools/PortManagerTool').then(m => ({ default: m.PortManagerTool }))) 
  },
  { 
    id: 'ip', 
    name: 'IP地址工具', 
    category: 'network', 
    component: lazy(() => import('@/components/tools/IpTool').then(m => ({ default: m.IpTool }))) 
  },
  { 
    id: 'user-agent', 
    name: 'UA解析', 
    category: 'network', 
    component: lazy(() => import('@/components/tools/UserAgentTool').then(m => ({ default: m.UserAgentTool }))) 
  },

  // ========== 服务器连接 ==========
  { 
    id: 'ssh', 
    name: 'SSH终端', 
    category: 'server', 
    fullScreen: true,
    component: lazy(() => import('@/components/tools/SshTool').then(m => ({ default: m.SshTool }))) 
  },
  { 
    id: 'ftp', 
    name: 'FTP客户端', 
    category: 'server', 
    fullScreen: true,
    component: lazy(() => import('@/components/tools/FtpTool').then(m => ({ default: m.FtpTool }))) 
  },

  // ========== 数据库终端 ==========
  { 
    id: 'database', 
    name: '数据库客户端', 
    category: 'database', 
    fullScreen: true,
    component: lazy(() => import('@/components/tools/DatabaseTool').then(m => ({ default: m.DatabaseTool }))) 
  },
  { 
    id: 'redis', 
    name: 'Redis客户端', 
    category: 'database', 
    fullScreen: true,
    component: lazy(() => import('@/components/tools/RedisTool').then(m => ({ default: m.RedisTool }))) 
  },

  // ========== 文本处理 ==========
  { 
    id: 'text-process', 
    name: '文本处理', 
    category: 'text', 
    component: lazy(() => import('@/components/tools/TextProcessTool').then(m => ({ default: m.TextProcessTool }))) 
  },
  { 
    id: 'text-stats', 
    name: '字符统计', 
    category: 'text', 
    component: lazy(() => import('@/components/tools/TextStatsTool').then(m => ({ default: m.TextStatsTool }))) 
  },
  { 
    id: 'text-deduplicate', 
    name: '文本去重', 
    category: 'text', 
    component: lazy(() => import('@/components/tools/TextDeduplicateTool').then(m => ({ default: m.TextDeduplicateTool }))) 
  },
  { 
    id: 'chinese-convert', 
    name: '繁简转换', 
    category: 'text', 
    component: lazy(() => import('@/components/tools/ChineseConvertTool').then(m => ({ default: m.ChineseConvertTool }))) 
  },
  { 
    id: 'pinyin', 
    name: '拼音转换', 
    category: 'text', 
    component: lazy(() => import('@/components/tools/PinyinTool').then(m => ({ default: m.PinyinTool }))) 
  },

  // ========== 其他工具 ==========
  { 
    id: 'mock-data', 
    name: 'Mock数据', 
    category: 'other', 
    component: lazy(() => import('@/components/tools/MockDataTool').then(m => ({ default: m.MockDataTool }))) 
  },
  { 
    id: 'totp', 
    name: 'TOTP验证码', 
    category: 'other', 
    component: lazy(() => import('@/components/tools/TotpTool').then(m => ({ default: m.TotpTool }))) 
  },
  { 
    id: 'password-strength', 
    name: '密码强度检测', 
    category: 'other', 
    component: lazy(() => import('@/components/tools/PasswordStrengthTool').then(m => ({ default: m.PasswordStrengthTool }))) 
  },
  { 
    id: 'data-mask', 
    name: '数据脱敏', 
    category: 'other', 
    component: lazy(() => import('@/components/tools/DataMaskTool').then(m => ({ default: m.DataMaskTool }))) 
  },
  { 
    id: 'short-url', 
    name: '短链解析', 
    category: 'other', 
    component: lazy(() => import('@/components/tools/ShortUrlTool').then(m => ({ default: m.ShortUrlTool }))) 
  },
  { 
    id: 'emoji', 
    name: 'Emoji表情', 
    category: 'other', 
    component: lazy(() => import('@/components/tools/EmojiTool').then(m => ({ default: m.EmojiTool }))) 
  },
  { 
    id: 'morse-code', 
    name: '摩斯电码', 
    category: 'other', 
    component: lazy(() => import('@/components/tools/MorseCodeTool').then(m => ({ default: m.MorseCodeTool }))) 
  },
  { 
    id: 'roman-numeral', 
    name: '罗马数字', 
    category: 'other', 
    component: lazy(() => import('@/components/tools/RomanNumeralTool').then(m => ({ default: m.RomanNumeralTool }))) 
  },
  { 
    id: 'ascii-art', 
    name: 'ASCII艺术字', 
    category: 'other', 
    component: lazy(() => import('@/components/tools/AsciiArtTool').then(m => ({ default: m.AsciiArtTool }))) 
  },
  { 
    id: 'color', 
    name: '颜色转换', 
    category: 'other', 
    component: lazy(() => import('@/components/tools/ColorTool').then(m => ({ default: m.ColorTool }))) 
  },
  { 
    id: 'qrcode', 
    name: '二维码生成', 
    category: 'other', 
    component: lazy(() => import('@/components/tools/QrCodeTool').then(m => ({ default: m.QrCodeTool }))) 
  },
  { 
    id: 'qr-scan', 
    name: '二维码识别', 
    category: 'other', 
    component: lazy(() => import('@/components/tools/QrScanTool').then(m => ({ default: m.QrScanTool }))) 
  },
  { 
    id: 'unit-converter', 
    name: '单位换算', 
    category: 'other', 
    component: lazy(() => import('@/components/tools/UnitConverterTool').then(m => ({ default: m.UnitConverterTool }))) 
  },
  { 
    id: 'hardware', 
    name: '硬件配置', 
    category: 'other', 
    component: lazy(() => import('@/components/tools/HardwareTool').then(m => ({ default: m.HardwareTool }))) 
  },

  // ========== AI Chat (Hidden) ==========
  { 
    id: 'ai-chat', 
    name: 'AI 助手', 
    category: 'ai', 
    component: lazy(() => import('@/components/tools/AiChatTool').then(m => ({ default: m.AiChatTool }))),
    hideInMenu: true
  }
]

// 辅助函数：获取分类下的所有工具
export function getToolsByCategory(category: ToolCategory) {
  return TOOLS.filter(tool => tool.category === category && !tool.hideInMenu)
}

// 辅助函数：根据ID获取工具
export function getToolById(id: string) {
  return TOOLS.find(tool => tool.id === id)
}
