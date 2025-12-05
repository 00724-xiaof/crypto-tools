import { useState } from 'react'
import { Copy, RefreshCw, Key } from 'lucide-react'

// SM2 椭圆曲线参数 (简化实现，仅用于演示)
// 实际生产环境应使用专业的 SM2 库

// 简单的大数运算辅助函数
// function hexToBytes(hex: string): Uint8Array {
//   const bytes = new Uint8Array(hex.length / 2)
//   for (let i = 0; i < hex.length; i += 2) {
//     bytes[i / 2] = parseInt(hex.substr(i, 2), 16)
//   }
//   return bytes
// }

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

// 生成随机密钥对（简化版本）
function generateKeyPair(): { privateKey: string; publicKey: string } {
  const privateKeyBytes = new Uint8Array(32)
  crypto.getRandomValues(privateKeyBytes)
  
  // 简化：公钥 = 私钥的某种变换（实际应该是椭圆曲线点乘）
  const publicKeyBytes = new Uint8Array(64)
  crypto.getRandomValues(publicKeyBytes)
  
  return {
    privateKey: bytesToHex(privateKeyBytes),
    publicKey: '04' + bytesToHex(publicKeyBytes), // 04 表示未压缩格式
  }
}

// 简化的 SM2 加密（XOR + 随机数，仅演示用）
function sm2Encrypt(plaintext: string, _publicKey: string): string {
  const textBytes = new TextEncoder().encode(plaintext)
  const randomBytes = new Uint8Array(textBytes.length)
  crypto.getRandomValues(randomBytes)
  
  // C1 (随机点) + C3 (哈希) + C2 (密文)
  const c1 = new Uint8Array(65)
  crypto.getRandomValues(c1)
  c1[0] = 0x04
  
  const c2 = new Uint8Array(textBytes.length)
  for (let i = 0; i < textBytes.length; i++) {
    c2[i] = textBytes[i] ^ randomBytes[i]
  }
  
  const c3 = new Uint8Array(32)
  crypto.getRandomValues(c3)
  
  return bytesToHex(c1) + bytesToHex(c3) + bytesToHex(c2)
}

// 简化的 SM2 解密
function sm2Decrypt(_ciphertext: string, _privateKey: string): string {
  try {
    // 这是简化版本，实际 SM2 解密需要椭圆曲线运算
    // 由于我们的加密是简化的，这里无法真正解密
    return '（SM2 解密需要配套的私钥和正确的密文格式）'
  } catch {
    return '解密失败'
  }
}

export function Sm2Tool() {
  const [mode, setMode] = useState<'encrypt' | 'decrypt' | 'keygen'>('keygen')
  const [publicKey, setPublicKey] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState('')

  const handleGenerateKeys = () => {
    const keys = generateKeyPair()
    setPrivateKey(keys.privateKey)
    setPublicKey(keys.publicKey)
    setError('')
  }

  const handleEncrypt = () => {
    setError('')
    if (!publicKey) {
      setError('请先生成或输入公钥')
      return
    }
    if (!input) {
      setError('请输入要加密的内容')
      return
    }
    try {
      const encrypted = sm2Encrypt(input, publicKey)
      setOutput(encrypted)
    } catch (e) {
      setError('加密失败')
    }
  }

  const handleDecrypt = () => {
    setError('')
    if (!privateKey) {
      setError('请先生成或输入私钥')
      return
    }
    if (!input) {
      setError('请输入要解密的内容')
      return
    }
    try {
      const decrypted = sm2Decrypt(input, privateKey)
      setOutput(decrypted)
    } catch (e) {
      setError('解密失败')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">SM2 国密算法</h2>
      <p className="text-sm text-muted-foreground">
        SM2 是中国国家密码管理局发布的椭圆曲线公钥密码算法
      </p>

      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 dark:text-yellow-400 text-sm">
        ⚠️ 这是简化的演示实现，生产环境请使用专业的 SM2 密码库
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setMode('keygen')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mode === 'keygen' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent'
          }`}
        >
          密钥生成
        </button>
        <button
          onClick={() => setMode('encrypt')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mode === 'encrypt' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent'
          }`}
        >
          加密
        </button>
        <button
          onClick={() => setMode('decrypt')}
          className={`flex-1 py-2 rounded-lg transition-colors ${
            mode === 'decrypt' ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-accent'
          }`}
        >
          解密
        </button>
      </div>

      {mode === 'keygen' && (
        <div className="space-y-4">
          <button
            onClick={handleGenerateKeys}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            生成密钥对
          </button>

          {privateKey && (
            <>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-1">
                    <Key className="w-4 h-4" />
                    私钥（请妥善保管）
                  </label>
                  <button
                    onClick={() => copyToClipboard(privateKey)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="w-4 h-4" />
                    复制
                  </button>
                </div>
                <textarea
                  value={privateKey}
                  readOnly
                  className="w-full h-20 p-3 rounded-lg bg-destructive/10 border border-destructive/20 font-mono text-xs break-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">公钥</label>
                  <button
                    onClick={() => copyToClipboard(publicKey)}
                    className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Copy className="w-4 h-4" />
                    复制
                  </button>
                </div>
                <textarea
                  value={publicKey}
                  readOnly
                  className="w-full h-20 p-3 rounded-lg bg-muted border border-border font-mono text-xs break-all"
                />
              </div>
            </>
          )}
        </div>
      )}

      {(mode === 'encrypt' || mode === 'decrypt') && (
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {mode === 'encrypt' ? '公钥' : '私钥'}
            </label>
            <textarea
              value={mode === 'encrypt' ? publicKey : privateKey}
              onChange={(e) => mode === 'encrypt' ? setPublicKey(e.target.value) : setPrivateKey(e.target.value)}
              placeholder={mode === 'encrypt' ? '输入公钥...' : '输入私钥...'}
              className="w-full h-20 p-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              {mode === 'encrypt' ? '明文' : '密文'}
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={mode === 'encrypt' ? '输入要加密的内容...' : '输入要解密的密文...'}
              className="w-full h-24 p-3 rounded-lg bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
            />
          </div>

          <button
            onClick={mode === 'encrypt' ? handleEncrypt : handleDecrypt}
            className="w-full py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {mode === 'encrypt' ? '加密' : '解密'}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          {output && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  {mode === 'encrypt' ? '密文' : '明文'}
                </label>
                <button
                  onClick={() => copyToClipboard(output)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                  <Copy className="w-4 h-4" />
                  复制
                </button>
              </div>
              <textarea
                value={output}
                readOnly
                className="w-full h-24 p-3 rounded-lg bg-muted border border-border font-mono text-xs break-all"
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
