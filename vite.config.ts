import react from '@vitejs/plugin-react'
import { readFileSync } from 'node:fs'
import { configDefaults, defineConfig } from 'vitest/config'

const { version } = JSON.parse(readFileSync('package.json', 'utf8')) as { version: string }

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Version from package.json, shown in the footer.
  define: { __APP_VERSION__: JSON.stringify(version) },
  // tmp/ holds local scratch scripts (not versioned); the gate runs only versioned tests.
  test: { exclude: [...configDefaults.exclude, 'tmp/**'] },
})
