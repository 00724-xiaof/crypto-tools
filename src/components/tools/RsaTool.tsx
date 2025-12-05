import { useState } from 'react'
import { Copy, RefreshCw } from 'lucide-react'

export function RsaTool() {
  const [publicKey, setPublicKey] = useState('')
  const [privateKey, setPrivateKey] = useState('')
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt')
  const [keySize, setKeySize] = useState<1024 | 2048 | 4096>(2048)
  const [isGenerating, setIsGenerating] = useState(false)

  // Simple RSA implementation using Web Crypto API
  const generateKeyPair = async () => {
    setIsGenerating(true)
    try {
      const keyPair = await window.crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: keySize,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256',
        },
        true,
        ['encrypt', 'decrypt']
      )

      const publicKeyData = await window.crypto.subtle.exportKey('spki', keyPair.publicKey)
      const privateKeyData = await window.crypto.subtle.exportKey('pkcs8', keyPair.privateKey)

      const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${arrayBufferToBase64(publicKeyData).match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`
      const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${arrayBufferToBase64(privateKeyData).match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`

      setPublicKey(publicKeyPem)
      setPrivateKey(privateKeyPem)
    } catch (error) {
      console.error('Key generation failed:', error)
    }
    setIsGenerating(false)
  }

  const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }

  const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }

  const importPublicKey = async (pem: string) => {
    const pemContents = pem
      .replace('-----BEGIN PUBLIC KEY-----', '')
      .replace('-----END PUBLIC KEY-----', '')
      .replace(/\s/g, '')
    const binaryDer = base64ToArrayBuffer(pemContents)
    return await window.crypto.subtle.importKey(
      'spki',
      binaryDer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['encrypt']
    )
  }

  const importPrivateKey = async (pem: string) => {
    const pemContents = pem
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '')
    const binaryDer = base64ToArrayBuffer(pemContents)
    return await window.crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['decrypt']
    )
  }

  const handleEncrypt = async () => {
    try {
      const key = await importPublicKey(publicKey)
      const encoder = new TextEncoder()
      const data = encoder.encode(input)
      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'RSA-OAEP' },
        key,
        data
      )
      setOutput(arrayBufferToBase64(encrypted))
    } catch (error) {
      setOutput('加密失败: ' + (error as Error).message)
    }
  }

  const handleDecrypt = async () => {
    try {
      const key = await importPrivateKey(privateKey)
      const data = base64ToArrayBuffer(input)
      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'RSA-OAEP' },
        key,
        data
      )
      const decoder = new TextDecoder()
      setOutput(decoder.decode(decrypted))
    } catch (error) {
      setOutput('解密失败: ' + (error as Error).message)
    }
  }

  const handleConvert = () => {
    if (mode === 'encrypt') {
      handleEncrypt()
    } else {
      handleDecrypt()
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">RSA 加密</h1>
        <p className="text-muted-foreground mt-1">RSA非对称加密与解密</p>
      </div>

      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">密钥长度:</label>
        <select
          value={keySize}
          onChange={(e) => setKeySize(Number(e.target.value) as 1024 | 2048 | 4096)}
          className="px-3 py-1.5 rounded-md border bg-background text-sm"
        >
          <option value={1024}>1024 位</option>
          <option value={2048}>2048 位</option>
          <option value={4096}>4096 位</option>
        </select>
        <button
          onClick={generateKeyPair}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-1.5 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          生成密钥对
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">公钥</label>
            <button onClick={() => copyToClipboard(publicKey)} className="p-1 hover:bg-accent rounded">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            placeholder="公钥 (PEM格式)"
            className="w-full h-32 p-3 rounded-md border bg-background resize-none font-mono text-xs"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">私钥</label>
            <button onClick={() => copyToClipboard(privateKey)} className="p-1 hover:bg-accent rounded">
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            placeholder="私钥 (PEM格式)"
            className="w-full h-32 p-3 rounded-md border bg-background resize-none font-mono text-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={mode === 'encrypt'}
            onChange={() => setMode('encrypt')}
            className="text-primary"
          />
          <span className="text-sm">加密</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            checked={mode === 'decrypt'}
            onChange={() => setMode('decrypt')}
            className="text-primary"
          />
          <span className="text-sm">解密</span>
        </label>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">
          {mode === 'encrypt' ? '明文' : '密文 (Base64)'}
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encrypt' ? '请输入要加密的文本...' : '请输入Base64格式的密文...'}
          className="w-full h-24 p-3 rounded-md border bg-background resize-none font-mono text-sm"
        />
      </div>

      <button
        onClick={handleConvert}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      >
        {mode === 'encrypt' ? '加密' : '解密'}
      </button>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">结果</label>
          <button onClick={() => copyToClipboard(output)} className="p-1.5 rounded hover:bg-accent transition-colors">
            <Copy className="w-4 h-4" />
          </button>
        </div>
        <textarea
          value={output}
          readOnly
          className="w-full h-24 p-3 rounded-md border bg-muted/50 resize-none font-mono text-sm"
        />
      </div>

      <div className="p-4 bg-secondary/50 rounded-lg">
        <h3 className="font-medium mb-2">注意事项</h3>
        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
          <li>RSA加密的数据长度受密钥长度限制</li>
          <li>2048位密钥最多加密约245字节数据</li>
          <li>实际应用中通常用RSA加密对称密钥</li>
        </ul>
      </div>
    </div>
  )
}
