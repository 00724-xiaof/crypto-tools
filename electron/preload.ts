import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  minimize: () => ipcRenderer.send('window-minimize'),
  maximize: () => ipcRenderer.send('window-maximize'),
  close: () => ipcRenderer.send('window-close'),
  isMaximized: () => ipcRenderer.invoke('window-is-maximized'),
  getHardwareInfo: () => ipcRenderer.invoke('get-hardware-info'),
  sslDecode: (cert: string) => ipcRenderer.invoke('ssl-decode', cert),
  dnsLookup: (domain: string) => ipcRenderer.invoke('dns-lookup', domain),
  checkPort: (host: string, port: number) => ipcRenderer.invoke('check-port', host, port),
  getActivePorts: () => ipcRenderer.invoke('get-active-ports'),
  killProcess: (pid: string) => ipcRenderer.invoke('kill-process', pid),
  openExternalLink: (url: string) => ipcRenderer.invoke('open-external-link', url),
  // SSH
  sshConnect: (config: any) => ipcRenderer.invoke('ssh-connect', config),
  sshDisconnect: (sessionId: string) => ipcRenderer.invoke('ssh-disconnect', sessionId),
  sshExecute: (sessionId: string, command: string) => ipcRenderer.invoke('ssh-execute', sessionId, command),
  // FTP
  ftpConnect: (config: any) => ipcRenderer.invoke('ftp-connect', config),
  ftpDisconnect: (sessionId: string) => ipcRenderer.invoke('ftp-disconnect', sessionId),
  ftpList: (sessionId: string, path: string) => ipcRenderer.invoke('ftp-list', sessionId, path),
  ftpDownload: (sessionId: string, remotePath: string, fileName: string) => ipcRenderer.invoke('ftp-download', sessionId, remotePath, fileName),
  // Database
  dbConnect: (config: any) => ipcRenderer.invoke('db-connect', config),
  dbDisconnect: (sessionId: string) => ipcRenderer.invoke('db-disconnect', sessionId),
  dbExecute: (sessionId: string, sql: string) => ipcRenderer.invoke('db-execute', sessionId, sql),
  // Redis
  redisConnect: (config: any) => ipcRenderer.invoke('redis-connect', config),
  redisDisconnect: (sessionId: string) => ipcRenderer.invoke('redis-disconnect', sessionId),
  redisExecute: (sessionId: string, command: string) => ipcRenderer.invoke('redis-execute', sessionId, command),
})
