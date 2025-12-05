import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Languages, Copy, Check } from 'lucide-react'

// 简化的拼音映射表（常用字，移除重复）
const PINYIN_MAP: Record<string, string> = {
  '啊': 'ā', '阿': 'ā', '哎': 'āi', '哀': 'āi', '爱': 'ài', '安': 'ān', '按': 'àn', '暗': 'àn',
  '八': 'bā', '把': 'bǎ', '爸': 'bà', '白': 'bái', '百': 'bǎi', '班': 'bān', '半': 'bàn', '办': 'bàn',
  '帮': 'bāng', '包': 'bāo', '保': 'bǎo', '报': 'bào', '北': 'běi', '被': 'bèi', '本': 'běn', '比': 'bǐ',
  '笔': 'bǐ', '必': 'bì', '边': 'biān', '变': 'biàn', '表': 'biǎo', '别': 'bié', '病': 'bìng', '不': 'bù',
  '步': 'bù', '部': 'bù', '才': 'cái', '菜': 'cài', '参': 'cān', '草': 'cǎo', '层': 'céng', '茶': 'chá',
  '查': 'chá', '差': 'chà', '长': 'cháng', '常': 'cháng', '场': 'chǎng', '唱': 'chàng', '车': 'chē', '成': 'chéng',
  '城': 'chéng', '吃': 'chī', '出': 'chū', '处': 'chù', '穿': 'chuān', '船': 'chuán', '窗': 'chuāng', '床': 'chuáng',
  '春': 'chūn', '词': 'cí', '次': 'cì', '从': 'cóng', '村': 'cūn', '错': 'cuò', '打': 'dǎ', '大': 'dà',
  '带': 'dài', '代': 'dài', '单': 'dān', '但': 'dàn', '当': 'dāng', '党': 'dǎng', '到': 'dào', '道': 'dào',
  '的': 'de', '得': 'de', '地': 'dì', '等': 'děng', '低': 'dī', '底': 'dǐ', '第': 'dì', '点': 'diǎn',
  '电': 'diàn', '店': 'diàn', '掉': 'diào', '调': 'diào', '定': 'dìng', '东': 'dōng', '冬': 'dōng', '懂': 'dǒng',
  '动': 'dòng', '都': 'dōu', '读': 'dú', '度': 'dù', '短': 'duǎn', '段': 'duàn', '对': 'duì', '多': 'duō',
  '儿': 'ér', '而': 'ér', '二': 'èr', '发': 'fā', '法': 'fǎ', '反': 'fǎn', '饭': 'fàn', '方': 'fāng',
  '房': 'fáng', '放': 'fàng', '非': 'fēi', '飞': 'fēi', '分': 'fēn', '风': 'fēng', '服': 'fú', '父': 'fù',
  '复': 'fù', '该': 'gāi', '改': 'gǎi', '干': 'gàn', '感': 'gǎn', '刚': 'gāng', '高': 'gāo', '告': 'gào',
  '哥': 'gē', '歌': 'gē', '个': 'gè', '给': 'gěi', '跟': 'gēn', '更': 'gèng', '工': 'gōng', '公': 'gōng',
  '共': 'gòng', '狗': 'gǒu', '够': 'gòu', '古': 'gǔ', '故': 'gù', '顾': 'gù', '瓜': 'guā', '关': 'guān',
  '管': 'guǎn', '光': 'guāng', '广': 'guǎng', '贵': 'guì', '国': 'guó', '果': 'guǒ', '过': 'guò', '还': 'hái',
  '孩': 'hái', '海': 'hǎi', '害': 'hài', '汉': 'hàn', '好': 'hǎo', '号': 'hào', '喝': 'hē', '和': 'hé',
  '河': 'hé', '黑': 'hēi', '很': 'hěn', '红': 'hóng', '后': 'hòu', '候': 'hòu', '呼': 'hū', '湖': 'hú',
  '花': 'huā', '华': 'huá', '化': 'huà', '话': 'huà', '画': 'huà', '坏': 'huài', '欢': 'huān',
  '换': 'huàn', '黄': 'huáng', '回': 'huí', '会': 'huì', '活': 'huó', '火': 'huǒ', '或': 'huò', '机': 'jī',
  '鸡': 'jī', '几': 'jǐ', '己': 'jǐ', '记': 'jì', '计': 'jì', '际': 'jì', '季': 'jì', '继': 'jì',
  '家': 'jiā', '加': 'jiā', '假': 'jiǎ', '价': 'jià', '间': 'jiān', '简': 'jiǎn', '见': 'jiàn', '件': 'jiàn',
  '建': 'jiàn', '江': 'jiāng', '将': 'jiāng', '讲': 'jiǎng', '交': 'jiāo', '教': 'jiào', '叫': 'jiào', '接': 'jiē',
  '街': 'jiē', '节': 'jié', '结': 'jié', '姐': 'jiě', '解': 'jiě', '介': 'jiè', '界': 'jiè', '今': 'jīn',
  '金': 'jīn', '近': 'jìn', '进': 'jìn', '京': 'jīng', '经': 'jīng', '精': 'jīng', '景': 'jǐng', '静': 'jìng',
  '九': 'jiǔ', '酒': 'jiǔ', '久': 'jiǔ', '就': 'jiù', '旧': 'jiù', '举': 'jǔ', '句': 'jù', '具': 'jù',
  '决': 'jué', '觉': 'jué', '军': 'jūn', '开': 'kāi', '看': 'kàn', '考': 'kǎo', '科': 'kē', '可': 'kě',
  '课': 'kè', '客': 'kè', '空': 'kōng', '口': 'kǒu', '苦': 'kǔ', '快': 'kuài', '块': 'kuài', '来': 'lái',
  '蓝': 'lán', '老': 'lǎo', '乐': 'lè', '了': 'le', '类': 'lèi', '冷': 'lěng', '离': 'lí', '里': 'lǐ',
  '理': 'lǐ', '力': 'lì', '历': 'lì', '立': 'lì', '利': 'lì', '连': 'lián', '脸': 'liǎn', '练': 'liàn',
  '两': 'liǎng', '亮': 'liàng', '量': 'liàng', '林': 'lín', '零': 'líng', '领': 'lǐng', '另': 'lìng', '六': 'liù',
  '龙': 'lóng', '楼': 'lóu', '路': 'lù', '绿': 'lǜ', '妈': 'mā', '马': 'mǎ', '吗': 'ma', '买': 'mǎi',
  '卖': 'mài', '满': 'mǎn', '慢': 'màn', '忙': 'máng', '毛': 'máo', '么': 'me', '没': 'méi', '每': 'měi',
  '美': 'měi', '门': 'mén', '们': 'men', '米': 'mǐ', '面': 'miàn', '民': 'mín', '名': 'míng', '明': 'míng',
  '母': 'mǔ', '木': 'mù', '目': 'mù', '拿': 'ná', '哪': 'nǎ', '那': 'nà', '男': 'nán', '南': 'nán',
  '难': 'nán', '脑': 'nǎo', '呢': 'ne', '内': 'nèi', '能': 'néng', '你': 'nǐ', '年': 'nián', '念': 'niàn',
  '娘': 'niáng', '鸟': 'niǎo', '您': 'nín', '牛': 'niú', '农': 'nóng', '女': 'nǚ', '怕': 'pà', '排': 'pái',
  '旁': 'páng', '跑': 'pǎo', '朋': 'péng', '皮': 'pí', '片': 'piàn', '票': 'piào', '漂': 'piào', '平': 'píng',
  '苹': 'píng', '破': 'pò', '七': 'qī', '期': 'qī', '其': 'qí', '奇': 'qí', '骑': 'qí', '起': 'qǐ',
  '气': 'qì', '汽': 'qì', '千': 'qiān', '前': 'qián', '钱': 'qián', '强': 'qiáng', '墙': 'qiáng', '桥': 'qiáo',
  '亲': 'qīn', '青': 'qīng', '轻': 'qīng', '清': 'qīng', '情': 'qíng', '请': 'qǐng', '秋': 'qiū', '球': 'qiú',
  '区': 'qū', '取': 'qǔ', '去': 'qù', '全': 'quán', '却': 'què', '然': 'rán', '让': 'ràng', '热': 'rè',
  '人': 'rén', '认': 'rèn', '日': 'rì', '容': 'róng', '肉': 'ròu', '如': 'rú', '入': 'rù', '三': 'sān',
  '色': 'sè', '山': 'shān', '上': 'shàng', '少': 'shǎo', '社': 'shè', '谁': 'shéi', '身': 'shēn', '深': 'shēn',
  '什': 'shén', '生': 'shēng', '声': 'shēng', '省': 'shěng', '师': 'shī', '十': 'shí', '时': 'shí', '识': 'shí',
  '实': 'shí', '食': 'shí', '始': 'shǐ', '使': 'shǐ', '史': 'shǐ', '是': 'shì', '事': 'shì', '市': 'shì',
  '室': 'shì', '试': 'shì', '视': 'shì', '收': 'shōu', '手': 'shǒu', '首': 'shǒu', '受': 'shòu', '书': 'shū',
  '树': 'shù', '数': 'shù', '双': 'shuāng', '水': 'shuǐ', '睡': 'shuì', '说': 'shuō', '思': 'sī', '死': 'sǐ',
  '四': 'sì', '送': 'sòng', '诉': 'sù', '算': 'suàn', '虽': 'suī', '岁': 'suì', '所': 'suǒ', '他': 'tā',
  '她': 'tā', '它': 'tā', '台': 'tái', '太': 'tài', '谈': 'tán', '特': 'tè', '疼': 'téng', '提': 'tí',
  '题': 'tí', '体': 'tǐ', '天': 'tiān', '田': 'tián', '条': 'tiáo', '铁': 'tiě', '听': 'tīng', '停': 'tíng',
  '通': 'tōng', '同': 'tóng', '头': 'tóu', '图': 'tú', '土': 'tǔ', '团': 'tuán', '推': 'tuī', '外': 'wài',
  '完': 'wán', '玩': 'wán', '晚': 'wǎn', '万': 'wàn', '王': 'wáng', '往': 'wǎng', '网': 'wǎng', '忘': 'wàng',
  '望': 'wàng', '为': 'wéi', '位': 'wèi', '文': 'wén', '问': 'wèn', '我': 'wǒ', '屋': 'wū', '五': 'wǔ',
  '午': 'wǔ', '物': 'wù', '西': 'xī', '希': 'xī', '息': 'xī', '习': 'xí', '喜': 'xǐ', '洗': 'xǐ',
  '系': 'xì', '细': 'xì', '下': 'xià', '夏': 'xià', '先': 'xiān', '现': 'xiàn', '线': 'xiàn', '相': 'xiāng',
  '香': 'xiāng', '想': 'xiǎng', '向': 'xiàng', '像': 'xiàng', '小': 'xiǎo', '笑': 'xiào', '校': 'xiào', '些': 'xiē',
  '写': 'xiě', '谢': 'xiè', '新': 'xīn', '心': 'xīn', '信': 'xìn', '星': 'xīng', '行': 'xíng', '形': 'xíng',
  '醒': 'xǐng', '姓': 'xìng', '兴': 'xìng', '性': 'xìng', '休': 'xiū', '需': 'xū', '许': 'xǔ', '学': 'xué',
  '雪': 'xuě', '呀': 'ya', '牙': 'yá', '言': 'yán', '颜': 'yán', '眼': 'yǎn', '演': 'yǎn', '验': 'yàn',
  '阳': 'yáng', '羊': 'yáng', '样': 'yàng', '要': 'yào', '药': 'yào', '爷': 'yé', '也': 'yě', '夜': 'yè',
  '叶': 'yè', '业': 'yè', '一': 'yī', '衣': 'yī', '医': 'yī', '已': 'yǐ', '以': 'yǐ', '意': 'yì',
  '义': 'yì', '艺': 'yì', '因': 'yīn', '音': 'yīn', '银': 'yín', '应': 'yīng', '英': 'yīng', '影': 'yǐng',
  '用': 'yòng', '由': 'yóu', '油': 'yóu', '游': 'yóu', '友': 'yǒu', '有': 'yǒu', '又': 'yòu', '右': 'yòu',
  '鱼': 'yú', '雨': 'yǔ', '语': 'yǔ', '育': 'yù', '元': 'yuán', '园': 'yuán', '原': 'yuán', '远': 'yuǎn',
  '院': 'yuàn', '愿': 'yuàn', '月': 'yuè', '越': 'yuè', '云': 'yún', '运': 'yùn', '在': 'zài', '再': 'zài',
  '早': 'zǎo', '怎': 'zěn', '站': 'zhàn', '张': 'zhāng', '找': 'zhǎo', '着': 'zhe', '这': 'zhè',
  '真': 'zhēn', '正': 'zhèng', '政': 'zhèng', '之': 'zhī', '知': 'zhī', '只': 'zhǐ', '纸': 'zhǐ', '指': 'zhǐ',
  '至': 'zhì', '治': 'zhì', '中': 'zhōng', '钟': 'zhōng', '种': 'zhǒng', '重': 'zhòng', '周': 'zhōu', '主': 'zhǔ',
  '住': 'zhù', '注': 'zhù', '祝': 'zhù', '著': 'zhù', '专': 'zhuān', '转': 'zhuǎn', '装': 'zhuāng', '准': 'zhǔn',
  '桌': 'zhuō', '子': 'zǐ', '字': 'zì', '自': 'zì', '总': 'zǒng', '走': 'zǒu', '租': 'zū', '足': 'zú',
  '组': 'zǔ', '嘴': 'zuǐ', '最': 'zuì', '昨': 'zuó', '左': 'zuǒ', '作': 'zuò', '做': 'zuò', '坐': 'zuò',
  ' ': ' '
}

// 无声调拼音
const PINYIN_NO_TONE: Record<string, string> = {}
Object.entries(PINYIN_MAP).forEach(([char, pinyin]) => {
  PINYIN_NO_TONE[char] = pinyin
    .replace(/[āáǎà]/g, 'a')
    .replace(/[ēéěè]/g, 'e')
    .replace(/[īíǐì]/g, 'i')
    .replace(/[ōóǒò]/g, 'o')
    .replace(/[ūúǔù]/g, 'u')
    .replace(/[ǖǘǚǜ]/g, 'v')
})

type OutputFormat = 'tone' | 'none' | 'first'

function toPinyin(text: string, format: OutputFormat, separator: string): string {
  const result: string[] = []
  
  for (const char of text) {
    if (PINYIN_MAP[char]) {
      let py = ''
      switch (format) {
        case 'tone':
          py = PINYIN_MAP[char]
          break
        case 'none':
          py = PINYIN_NO_TONE[char]
          break
        case 'first':
          py = PINYIN_NO_TONE[char][0].toUpperCase()
          break
      }
      result.push(py)
    } else if (/[\u4e00-\u9fa5]/.test(char)) {
      result.push(char)
    } else {
      result.push(char)
    }
  }
  
  return result.join(separator)
}

export function PinyinTool() {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [format, setFormat] = useState<OutputFormat>('tone')
  const [separator, setSeparator] = useState(' ')
  const [copied, setCopied] = useState(false)

  const convert = () => {
    const actualSeparator = separator === 'none' ? '' : separator
    setOutput(toPinyin(input, format, actualSeparator))
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
          <Languages className="w-5 h-5" />
          拼音转换
        </h2>
        <p className="text-sm text-muted-foreground">汉字转拼音，支持多种格式</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>输出格式</Label>
          <Select value={format} onValueChange={(v: OutputFormat) => setFormat(v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tone">带声调 (nǐ hǎo)</SelectItem>
              <SelectItem value="none">无声调 (ni hao)</SelectItem>
              <SelectItem value="first">首字母 (N H)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>分隔符</Label>
          <Select value={separator} onValueChange={setSeparator}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value=" ">空格</SelectItem>
              <SelectItem value="none">无分隔</SelectItem>
              <SelectItem value="-">连字符 (-)</SelectItem>
              <SelectItem value="_">下划线 (_)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>汉字输入</Label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="输入中文汉字..."
            className="h-[200px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>拼音输出</Label>
            <Button variant="ghost" size="sm" onClick={handleCopy} disabled={!output}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? '已复制' : '复制'}
            </Button>
          </div>
          <Textarea
            value={output}
            readOnly
            placeholder="转换结果..."
            className="h-[200px] resize-none"
          />
        </div>
      </div>

      <Button onClick={convert} disabled={!input.trim()} className="w-full">
        转换为拼音
      </Button>
    </div>
  )
}
