import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import { defineConfig } from 'vite'

// 开发代理目标：容器内指向 api 服务名，本机直跑默认 127.0.0.1:8000
const proxyTarget = process.env.VITE_PROXY_TARGET ?? 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset({ target: "18" })] })
  ],
  server: {
    // Docker 挂载目录下文件系统事件可能不稳定，容器内用轮询兜底
    watch: process.env.VITE_USE_POLLING === "true" ? { usePolling: true } : undefined,
    proxy: {
      '/api': {
        target: proxyTarget,
        changeOrigin: true,
      },
      '/uploads': {
        target: proxyTarget,
        changeOrigin: true,
      },
    },
  },
})
