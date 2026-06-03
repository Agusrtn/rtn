import { preview } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

const server = await preview({
  configFile: false,
  root,
  plugins: [react()],
})

server.printUrls()
