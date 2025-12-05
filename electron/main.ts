import { app, BrowserWindow, ipcMain, screen, shell } from 'electron'
import path from 'path'
import os from 'os'
import dns from 'dns'
import net from 'net'
import { X509Certificate } from 'crypto'
import { exec } from 'child_process'

// 禁用 GPU 硬件加速，避免某些系统上的兼容性问题
app.disableHardwareAcceleration()
app.commandLine.appendSwitch('disable-gpu')

let mainWindow: BrowserWindow | null = null

function createWindow() {
  // 获取主显示器的工作区域（排除任务栏）
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize
  const scaleFactor = primaryDisplay.scaleFactor

  // 固定窗口尺寸
  const windowWidth = Math.round(Math.min(screenWidth * 0.65, 1100))
  const windowHeight = Math.round(Math.min(screenHeight * 0.7, 720))

  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    resizable: false, // 禁用窗口大小调整
    maximizable: true, // 禁用最大化
    frame: false,
    titleBarStyle: 'hidden',
    show: false, // 先隐藏窗口，等渲染完成再显示
    center: true, // 窗口居中显示
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      zoomFactor: scaleFactor > 1.5 ? 0.9 : 1, // 高 DPI 屏幕适当缩小
    },
    icon: path.join(__dirname, '../public/icon.ico'),
    backgroundColor: '#ffffff',
  })

  // 渲染完成后显示窗口，避免白屏闪烁
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    // 开发环境自动打开 DevTools
    // mainWindow.webContents.openDevTools()
  } else {
    // 打包后 dist 和 dist-electron 在同一级
    const indexPath = path.join(__dirname, '../dist/index.html')
    console.log('Loading:', indexPath)
    mainWindow.loadFile(indexPath)
  }

  // 注册 F12 打开调试工具
  // mainWindow.webContents.on('before-input-event', (event, input) => {
  //   if (input.key === 'F12' && input.type === 'keyDown') {
  //     mainWindow?.webContents.toggleDevTools()
  //     event.preventDefault()
  //   }
  // })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// 窗口控制
ipcMain.on('window-minimize', () => {
  mainWindow?.minimize()
})

ipcMain.on('window-maximize', () => {
  if (mainWindow?.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow?.maximize()
  }
})

ipcMain.on('window-close', () => {
  mainWindow?.close()
})

ipcMain.handle('window-is-maximized', () => {
  return mainWindow?.isMaximized()
})

// 获取硬件信息
ipcMain.handle('get-hardware-info', () => {
  const cpus = os.cpus()
  const allDisplays = screen.getAllDisplays()
  const primaryDisplay = screen.getPrimaryDisplay()
  
  return {
    // 操作系统
    os: {
      platform: os.platform(),
      type: os.type(),
      release: os.release(),
      arch: os.arch(),
      hostname: os.hostname(),
      uptime: os.uptime(),
    },
    // CPU
    cpu: {
      model: cpus[0]?.model || '未知',
      cores: cpus.length,
      speed: cpus[0]?.speed || 0,
    },
    // 内存
    memory: {
      total: os.totalmem(),
      free: os.freemem(),
      used: os.totalmem() - os.freemem(),
    },
    // 所有显示器
    displays: allDisplays.map((display, index) => ({
      id: display.id,
      label: display.id === primaryDisplay.id ? '主显示器' : `副屏 ${index}`,
      isPrimary: display.id === primaryDisplay.id,
      width: display.size.width,
      height: display.size.height,
      scaleFactor: display.scaleFactor,
      colorDepth: display.colorDepth,
      workArea: display.workAreaSize,
    })),
    // 网络接口
    network: os.networkInterfaces(),
    // 用户信息
    user: {
      username: os.userInfo().username,
      homedir: os.homedir(),
      tmpdir: os.tmpdir(),
    },
  }
})

// SSL 证书解析
ipcMain.handle('ssl-decode', async (_event, certPem: string) => {
  try {
    const x509 = new X509Certificate(certPem)
    return {
      subject: x509.subject,
      issuer: x509.issuer,
      validFrom: x509.validFrom,
      validTo: x509.validTo,
      serialNumber: x509.serialNumber,
      fingerprint: x509.fingerprint,
      fingerprint256: x509.fingerprint256,
      keyUsage: x509.keyUsage,
    }
  } catch (e: any) {
    return { error: e.message }
  }
})

// DNS 查询
ipcMain.handle('dns-lookup', async (_event, domain: string) => {
  return new Promise((resolve) => {
    dns.resolve4(domain, (err, addresses) => {
      if (err) {
        resolve({ error: err.message })
      } else {
        resolve({ addresses })
      }
    })
  })
})

// 端口检测
ipcMain.handle('check-port', async (_event, host: string, port: number) => {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    const timeout = 2000
    let status = 'closed'
    
    socket.setTimeout(timeout)
    
    socket.on('connect', () => {
      status = 'open'
      socket.destroy()
    })
    
    socket.on('timeout', () => {
      status = 'timeout'
      socket.destroy()
    })
    
    socket.on('error', () => {
      status = 'closed'
    })
    
    socket.on('close', () => {
      resolve({ status })
    })
    
    socket.connect(port, host)
  })
})

// 获取活跃端口
ipcMain.handle('get-active-ports', async () => {
  return new Promise((resolve) => {
    const platform = os.platform()
    let cmd = ''
    
    if (platform === 'win32') {
      cmd = 'netstat -ano'
    } else {
      // Linux/Mac (simplified)
      cmd = 'lsof -i -P -n | grep LISTEN' 
    }
    
    exec(cmd, (error, stdout) => {
      if (error) {
        resolve({ error: error.message })
        return
      }
      
      const lines = stdout.split('\n')
      const results: any[] = []
      
      if (platform === 'win32') {
        // Skip header lines
        for (let i = 4; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue
          
          // Proto  Local Address          Foreign Address        State           PID
          // TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       988
          const parts = line.split(/\s+/)
          if (parts.length >= 5) {
            const protocol = parts[0]
            const localAddr = parts[1]
            const state = parts[3]
            const pid = parts[4]
            
            if (state === 'LISTENING') {
               const port = localAddr.split(':').pop()
               results.push({ protocol, port, pid })
            }
          }
        }
      } else {
        // lsof output parsing
        // COMMAND   PID USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME
        // node    12345 user   20u  IPv4 0x...      0t0  TCP *:3000 (LISTEN)
        lines.forEach(line => {
           const parts = line.trim().split(/\s+/)
           if (parts.length >= 9) {
             const command = parts[0]
             const pid = parts[1]
             const name = parts[8] // *:3000
             
             const port = name.split(':').pop()
             if (port && !isNaN(Number(port))) {
               results.push({ protocol: 'TCP', port, pid, command })
             }
           }
        })
      }
      
      resolve({ processes: results })
    })
  })
})

// 终止进程
ipcMain.handle('kill-process', async (_event, pid: string) => {
  return new Promise((resolve) => {
    const platform = os.platform()
    const cmd = platform === 'win32' ? `taskkill /F /PID ${pid}` : `kill -9 ${pid}`
    
    exec(cmd, (error) => {
      if (error) {
        resolve({ success: false, error: error.message })
      } else {
        resolve({ success: true })
      }
    })
  })
})

// 打开外部链接
ipcMain.handle('open-external-link', async (_event, url: string) => {
  try {
    await shell.openExternal(url)
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
})

// SSH和FTP会话管理
const sshSessions = new Map<string, any>()
const ftpSessions = new Map<string, any>()

// SSH连接 (需要安装: npm install ssh2)
ipcMain.handle('ssh-connect', async (_, config: any) => {
  try {
    const { Client } = require('ssh2')
    const conn = new Client()
    const sessionId = Math.random().toString(36).substring(7)

    return new Promise((resolve) => {
      conn.on('ready', () => {
        sshSessions.set(sessionId, conn)
        resolve({ success: true, sessionId })
      }).on('error', (err: any) => {
        resolve({ success: false, error: err.message })
      }).connect({
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password
      })
    })
  } catch (e: any) {
    return { success: false, error: e.message }
  }
})

// SSH断开连接
ipcMain.handle('ssh-disconnect', async (_, sessionId: string) => {
  const conn = sshSessions.get(sessionId)
  if (conn) {
    conn.end()
    sshSessions.delete(sessionId)
  }
  return { success: true }
})

// SSH执行命令
ipcMain.handle('ssh-execute', async (_, sessionId: string, command: string) => {
  const conn = sshSessions.get(sessionId)
  if (!conn) {
    return { success: false, error: '未找到会话' }
  }

  return new Promise((resolve) => {
    conn.exec(command, (err: any, stream: any) => {
      if (err) {
        resolve({ success: false, error: err.message })
        return
      }

      let output = ''
      stream.on('close', () => {
        resolve({ success: true, output: output || '命令执行完成' })
      }).on('data', (data: any) => {
        output += data.toString()
      }).stderr.on('data', (data: any) => {
        output += data.toString()
      })
    })
  })
})

// FTP连接 (需要安装: npm install basic-ftp)
ipcMain.handle('ftp-connect', async (_, config: any) => {
  try {
    const { Client } = require('basic-ftp')
    const client = new Client()
    const sessionId = Math.random().toString(36).substring(7)

    await client.access({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      secure: false
    })

    ftpSessions.set(sessionId, client)
    return { success: true, sessionId }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
})

// FTP断开连接
ipcMain.handle('ftp-disconnect', async (_, sessionId: string) => {
  const client = ftpSessions.get(sessionId)
  if (client) {
    client.close()
    ftpSessions.delete(sessionId)
  }
  return { success: true }
})

// FTP列出文件
ipcMain.handle('ftp-list', async (_, sessionId: string, path: string) => {
  const client = ftpSessions.get(sessionId)
  if (!client) {
    return { success: false, error: '未找到会话' }
  }

  try {
    await client.cd(path)
    const list = await client.list()
    const files = list.map((item: any) => ({
      name: item.name,
      type: item.type === 2 ? 'directory' : 'file',
      size: item.size,
      modifiedAt: item.modifiedAt ? new Date(item.modifiedAt).toLocaleString() : '-'
    }))
    return { success: true, files }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
})

// FTP下载文件
ipcMain.handle('ftp-download', async (_, sessionId: string, remotePath: string, fileName: string) => {
  const client = ftpSessions.get(sessionId)
  if (!client) {
    return { success: false, error: '未找到会话' }
  }

  try {
    const { dialog } = require('electron')
    const result = await dialog.showSaveDialog({
      defaultPath: fileName,
      filters: [{ name: 'All Files', extensions: ['*'] }]
    })

    if (result.canceled || !result.filePath) {
      return { success: false, error: '用户取消' }
    }

    await client.cd(remotePath)
    await client.downloadTo(result.filePath, fileName)
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
})

// Database & Redis Sessions
const dbSessions = new Map<string, any>()
const redisSessions = new Map<string, any>()

// Database Connect
ipcMain.handle('db-connect', async (_, config: any) => {
  try {
    const sessionId = Math.random().toString(36).substring(7)
    let client: any

    if (config.type === 'mysql') {
      const mysql = require('mysql2/promise')
      client = await mysql.createConnection({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: config.database
      })
      dbSessions.set(sessionId, { type: 'mysql', client })
    } else if (config.type === 'postgres') {
      const { Client } = require('pg')
      client = new Client({
        host: config.host,
        port: config.port,
        user: config.username,
        password: config.password,
        database: config.database
      })
      await client.connect()
      dbSessions.set(sessionId, { type: 'postgres', client })
    }

    return { success: true, sessionId }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
})

// Database Disconnect
ipcMain.handle('db-disconnect', async (_, sessionId: string) => {
  const session = dbSessions.get(sessionId)
  if (session) {
    if (session.type === 'mysql') {
      await session.client.end()
    } else {
      await session.client.end()
    }
    dbSessions.delete(sessionId)
  }
  return { success: true }
})

// Database Execute
ipcMain.handle('db-execute', async (_, sessionId: string, sql: string) => {
  const session = dbSessions.get(sessionId)
  if (!session) {
    return { success: false, error: '未找到会话' }
  }

  try {
    let data: any[]
    if (session.type === 'mysql') {
      const [rows] = await session.client.execute(sql)
      data = rows as any[]
    } else {
      const res = await session.client.query(sql)
      data = res.rows
    }
    return { success: true, data }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
})

// Redis Connect
ipcMain.handle('redis-connect', async (_, config: any) => {
  try {
    const Redis = require('ioredis')
    const sessionId = Math.random().toString(36).substring(7)
    
    const client = new Redis({
      host: config.host,
      port: config.port,
      password: config.password,
      db: config.db || 0,
      retryStrategy: (times: number) => {
        if (times > 3) return null
        return Math.min(times * 50, 2000)
      }
    })

    return new Promise((resolve) => {
      client.on('ready', () => {
        redisSessions.set(sessionId, client)
        resolve({ success: true, sessionId })
      })
      client.on('error', (err: any) => {
        // 如果连接失败，不要立即resolve，等待重试或超时
        // 但为了简化，这里捕获首次连接错误
        if (!redisSessions.has(sessionId)) {
           resolve({ success: false, error: err.message })
        }
      })
    })
  } catch (e: any) {
    return { success: false, error: e.message }
  }
})

// Redis Disconnect
ipcMain.handle('redis-disconnect', async (_, sessionId: string) => {
  const client = redisSessions.get(sessionId)
  if (client) {
    await client.quit()
    redisSessions.delete(sessionId)
  }
  return { success: true }
})

// Redis Execute
ipcMain.handle('redis-execute', async (_, sessionId: string, command: string) => {
  const client = redisSessions.get(sessionId)
  if (!client) {
    return { success: false, error: '未找到会话' }
  }

  try {
    // 解析命令字符串，简单的空格分割，支持引号
    const args = command.match(/(?:[^\s"]+|"[^"]*")+/g)?.map(arg => arg.replace(/"/g, '')) || []
    if (args.length === 0) return { success: false, error: '无效命令' }

    const cmd = args[0].toLowerCase()
    const cmdArgs = args.slice(1)

    // 使用 call 方法执行任意命令
    const result = await client.call(cmd, ...cmdArgs)
    return { success: true, data: result }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
