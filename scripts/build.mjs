import { build } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)))
const reactEsm = (p) => `https://esm.sh/${p}`

await build({
  configFile: false,
  root,
  plugins: [react()],
  resolve: {
    alias: {
      react: reactEsm('react@19.1.0'),
      'react-dom': reactEsm('react-dom@19.1.0'),
      'react-dom/client': reactEsm('react-dom@19.1.0/client'),
      'react/jsx-runtime': reactEsm('react@19.1.0/jsx-runtime'),
      'react/jsx-dev-runtime': reactEsm('react@19.1.0/jsx-dev-runtime'),
    },
  },
  css: {
    postcss: {},
  },
})
