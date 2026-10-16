import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync(resolve(__dirname, 'package.json'), 'utf8')) as {
  version: string
}

export default defineConfig({
  base: '/alderantziz/',
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifestFilename: 'app.webmanifest',
      includeAssets: ['favicon.svg', 'favicon.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Alderantziz',
        short_name: 'Alderantziz',
        description: 'Say it backwards: record a phrase, hear it reversed, imitate it, reveal it.',
        theme_color: '#f6efe3',
        background_color: '#f6efe3',
        display: 'standalone',
        // Chrome on Android keeps an aborted install marked as installed, with no
        // way to clear it on the phone. A new id alone didn't free it, so the id,
        // start_url and manifest filename all change to look like a new app.
        id: '/alderantziz/?app=alderantziz-3',
        start_url: '/alderantziz/?utm_source=homescreen',
        scope: '/alderantziz/',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,json,svg,png,ico,woff2}'],
        // The three locales are Latin script; leave the other Rubik subsets to
        // load on demand instead of precaching them.
        globIgnores: ['**/rubik-{arabic,cyrillic,cyrillic-ext,hebrew,greek}-*.woff2'],
        navigateFallback: '/alderantziz/index.html',
      },
      devOptions: { enabled: false },
    }),
  ],
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
  build: { sourcemap: true, target: 'es2022' },
})
