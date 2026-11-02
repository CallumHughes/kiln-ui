import { defineConfig, loadEnv } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
  plugins: [svelte()],
  server: {
    proxy: env.KILN_DEVICE_URL ? {
      '/api': {
        target: env.KILN_DEVICE_URL,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.removeHeader('if-none-match')
          })
        }
      }
    } : undefined
  },
  build: {
    sourcemap: true,
    // Emit at the output root, not assets/, so the files line up with the
    // css_url / js_url the device is configured with (http://<host>/index.css
    // and /index.js). ESPHome builds its own page and loads those two by URL.
    assetsDir: '',
    // https://github.com/vitejs/vite/issues/378#issuecomment-768816653
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`
      }
    }
  }
}})
