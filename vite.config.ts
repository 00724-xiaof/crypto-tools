import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import path from 'path'
import obfuscator from 'rollup-plugin-obfuscator'

const obfuscatorOptions = {
  compact: true,
  controlFlowFlattening: false,
  deadCodeInjection: false,
  debugProtection: false,
  disableConsoleOutput: false,
  identifierNamesGenerator: 'hexadecimal' as const,
  renameGlobals: false,
  rotateStringArray: true,
  selfDefending: false,
  shuffleStringArray: true,
  splitStrings: false,
  stringArray: true,
  stringArrayThreshold: 0.5,
  transformObjectKeys: false,
  unicodeEscapeSequence: false
}

export default defineConfig({
  base: './',
  plugins: [
    react(),
    electron([
      {
        entry: 'electron/main.ts',
        vite: {
          build: {
            outDir: 'dist-electron',
            minify: 'terser',
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true
              },
              mangle: true
            },
            rollupOptions: {
              external: ['electron']
              // plugins: [obfuscator({ options: obfuscatorOptions })]
            }
          }
        }
      },
      {
        entry: 'electron/preload.ts',
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: 'dist-electron',
            minify: 'terser',
            terserOptions: {
              compress: {
                drop_console: true,
                drop_debugger: true
              },
              mangle: true
            }
            // rollupOptions: {
            //   plugins: [obfuscator({ options: obfuscatorOptions })]
            // }
          }
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      },
      mangle: {
        toplevel: true
      }
    }
    // rollupOptions: {
    //   plugins: [obfuscator({ options: obfuscatorOptions })]
    // }
  }
})
