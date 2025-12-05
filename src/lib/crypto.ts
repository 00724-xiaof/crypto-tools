import CryptoJS from 'crypto-js'

// ==================== 编码/解码 ====================

export const base64 = {
  encode: (text: string): string => {
    return CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(text))
  },
  decode: (text: string): string => {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(text))
  }
}

export const url = {
  encode: (text: string): string => {
    return encodeURIComponent(text)
  },
  decode: (text: string): string => {
    return decodeURIComponent(text)
  }
}

export const hex = {
  encode: (text: string): string => {
    return CryptoJS.enc.Hex.stringify(CryptoJS.enc.Utf8.parse(text))
  },
  decode: (text: string): string => {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Hex.parse(text))
  }
}

export const unicode = {
  encode: (text: string): string => {
    return text.split('').map(char => {
      const code = char.charCodeAt(0)
      return code > 127 ? `\\u${code.toString(16).padStart(4, '0')}` : char
    }).join('')
  },
  decode: (text: string): string => {
    return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => 
      String.fromCharCode(parseInt(hex, 16))
    )
  }
}

export const html = {
  encode: (text: string): string => {
    const div = document.createElement('div')
    div.innerText = text
    return div.innerHTML
  },
  decode: (text: string): string => {
    const div = document.createElement('div')
    div.innerHTML = text
    return div.innerText
  }
}

// ==================== 哈希算法 ====================

export const hash = {
  md5: (text: string): string => {
    return CryptoJS.MD5(text).toString()
  },
  sha1: (text: string): string => {
    return CryptoJS.SHA1(text).toString()
  },
  sha256: (text: string): string => {
    return CryptoJS.SHA256(text).toString()
  },
  sha512: (text: string): string => {
    return CryptoJS.SHA512(text).toString()
  },
  sha3: (text: string): string => {
    return CryptoJS.SHA3(text).toString()
  },
  hmacMd5: (text: string, key: string): string => {
    return CryptoJS.HmacMD5(text, key).toString()
  },
  hmacSha256: (text: string, key: string): string => {
    return CryptoJS.HmacSHA256(text, key).toString()
  },
  hmacSha512: (text: string, key: string): string => {
    return CryptoJS.HmacSHA512(text, key).toString()
  }
}

// ==================== AES 加密/解密 ====================

type AESMode = 'CBC' | 'ECB' | 'CFB' | 'OFB' | 'CTR'
type AESPadding = 'Pkcs7' | 'ZeroPadding' | 'NoPadding'

interface AESOptions {
  mode: AESMode
  padding: AESPadding
  key: string
  iv?: string
  keyFormat: 'text' | 'hex' | 'base64'
  outputFormat: 'base64' | 'hex'
}

const getMode = (mode: AESMode) => {
  const modes = {
    CBC: CryptoJS.mode.CBC,
    ECB: CryptoJS.mode.ECB,
    CFB: CryptoJS.mode.CFB,
    OFB: CryptoJS.mode.OFB,
    CTR: CryptoJS.mode.CTR
  }
  return modes[mode]
}

const getPadding = (padding: AESPadding) => {
  const paddings = {
    Pkcs7: CryptoJS.pad.Pkcs7,
    ZeroPadding: CryptoJS.pad.ZeroPadding,
    NoPadding: CryptoJS.pad.NoPadding
  }
  return paddings[padding]
}

const parseKey = (key: string, format: 'text' | 'hex' | 'base64') => {
  switch (format) {
    case 'hex':
      return CryptoJS.enc.Hex.parse(key)
    case 'base64':
      return CryptoJS.enc.Base64.parse(key)
    default:
      return CryptoJS.enc.Utf8.parse(key)
  }
}

export const aes = {
  encrypt: (text: string, options: AESOptions): string => {
    const key = parseKey(options.key, options.keyFormat)
    const iv = options.iv ? parseKey(options.iv, options.keyFormat) : undefined

    const encrypted = CryptoJS.AES.encrypt(text, key, {
      mode: getMode(options.mode),
      padding: getPadding(options.padding),
      iv: iv
    })

    return options.outputFormat === 'hex' 
      ? encrypted.ciphertext.toString(CryptoJS.enc.Hex)
      : encrypted.toString()
  },

  decrypt: (ciphertext: string, options: AESOptions): string => {
    const key = parseKey(options.key, options.keyFormat)
    const iv = options.iv ? parseKey(options.iv, options.keyFormat) : undefined

    let encrypted = ciphertext
    if (options.outputFormat === 'hex') {
      encrypted = CryptoJS.enc.Base64.stringify(CryptoJS.enc.Hex.parse(ciphertext))
    }

    const decrypted = CryptoJS.AES.decrypt(encrypted, key, {
      mode: getMode(options.mode),
      padding: getPadding(options.padding),
      iv: iv
    })

    return decrypted.toString(CryptoJS.enc.Utf8)
  },

  generateKey: (length: 128 | 192 | 256 = 256): string => {
    const bytes = length / 8
    const randomWords = CryptoJS.lib.WordArray.random(bytes)
    return randomWords.toString(CryptoJS.enc.Hex)
  },

  generateIV: (): string => {
    const randomWords = CryptoJS.lib.WordArray.random(16)
    return randomWords.toString(CryptoJS.enc.Hex)
  }
}

// ==================== DES 加密/解密 ====================

export const des = {
  encrypt: (text: string, key: string, iv?: string): string => {
    const keyParsed = CryptoJS.enc.Utf8.parse(key)
    const ivParsed = iv ? CryptoJS.enc.Utf8.parse(iv) : undefined
    
    const encrypted = CryptoJS.DES.encrypt(text, keyParsed, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv: ivParsed
    })
    
    return encrypted.toString()
  },

  decrypt: (ciphertext: string, key: string, iv?: string): string => {
    const keyParsed = CryptoJS.enc.Utf8.parse(key)
    const ivParsed = iv ? CryptoJS.enc.Utf8.parse(iv) : undefined
    
    const decrypted = CryptoJS.DES.decrypt(ciphertext, keyParsed, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv: ivParsed
    })
    
    return decrypted.toString(CryptoJS.enc.Utf8)
  }
}

export const tripleDes = {
  encrypt: (text: string, key: string, iv?: string): string => {
    const keyParsed = CryptoJS.enc.Utf8.parse(key)
    const ivParsed = iv ? CryptoJS.enc.Utf8.parse(iv) : undefined
    
    const encrypted = CryptoJS.TripleDES.encrypt(text, keyParsed, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv: ivParsed
    })
    
    return encrypted.toString()
  },

  decrypt: (ciphertext: string, key: string, iv?: string): string => {
    const keyParsed = CryptoJS.enc.Utf8.parse(key)
    const ivParsed = iv ? CryptoJS.enc.Utf8.parse(iv) : undefined
    
    const decrypted = CryptoJS.TripleDES.decrypt(ciphertext, keyParsed, {
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
      iv: ivParsed
    })
    
    return decrypted.toString(CryptoJS.enc.Utf8)
  }
}
