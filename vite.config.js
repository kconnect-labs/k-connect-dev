import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import { resolve } from 'path';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import viteCompression from 'vite-plugin-compression';
import { createHtmlPlugin } from 'vite-plugin-html';
import terser from '@rollup/plugin-terser';
import { VitePWA } from 'vite-plugin-pwa';
import imagemin from 'vite-plugin-imagemin';

// [INFO] Проект переведён на rolldown-vite вместо vite. Конфиг совместим с rolldown-vite.

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    base: '/',
    publicDir: 'public',
    plugins: [
      react({
        babel: {
          plugins: [
            ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }]
          ],
          presets: [
            ['@babel/preset-react', {
              runtime: 'automatic',
              development: !isProduction,
              importSource: 'react'
            }]
          ]
        },
        include: "**/*.{jsx,js,tsx,ts}",
        fastRefresh: true,
      }),
      svgr({ 
        svgrOptions: {
          exportType: 'named',
          ref: true,
          svgo: false,
          titleProp: true,
        },
        include: "**/*.svg"
      }),
      wasm(),
      topLevelAwait(),
      isProduction && viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        filter: /\.(js|css|html)$/,
        threshold: 1024,
        deleteOriginFile: false,
        compressionOptions: {
          level: 9,
        },
        success: (file) => {
          console.log(`✅ Gzip compressed: ${file}`);
        },
        error: (err) => {
          console.warn(`⚠️ Gzip compression failed: ${err.message}`);
        },
      }),
      createHtmlPlugin({
        minify: isProduction,
        inject: {
          data: {
            title: 'K-Connect',
            description: 'K-Connect Social Network',
          },
          tags: [
            // Удалён тег script для push.js, теперь push через кастомный sw
          ],
        },
      }),
      imagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false,
        },
        optipng: {
          optimizationLevel: 7,
        },
        mozjpeg: {
          quality: 80,
        },
        pngquant: {
          quality: [0.8, 0.9],
          speed: 4,
        },
        svgo: {
          plugins: [
            { name: 'removeViewBox' },
            { name: 'removeEmptyAttrs', active: false },
          ],
        },
      }),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'K-Connect',
          short_name: 'K-Connect',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            // Светлая тема (по умолчанию)
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            },
            // Тёмная тема
            {
              src: '/icon192d.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable',
              media: '(prefers-color-scheme: dark)'
            },
            {
              src: '/icon-512d.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable',
              media: '(prefers-color-scheme: dark)'
            },
            // iOS иконки
            {
              src: '/icon-180.png',
              sizes: '180x180',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icon-180d.png',
              sizes: '180x180',
              type: 'image/png',
              purpose: 'any',
              media: '(prefers-color-scheme: dark)'
            },
            // Android иконки
            {
              src: '/icon-167.png',
              sizes: '167x167',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icon-167d.png',
              sizes: '167x167',
              type: 'image/png',
              purpose: 'any',
              media: '(prefers-color-scheme: dark)'
            },
            {
              src: '/icon-152.png',
              sizes: '152x152',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icon-152d.png',
              sizes: '152x152',
              type: 'image/png',
              purpose: 'any',
              media: '(prefers-color-scheme: dark)'
            }
          ],
          // Динамические цвета для тем
          theme_color_light: '#ffffff',
          theme_color_dark: '#1a1a1a',
          background_color_light: '#ffffff',
          background_color_dark: '#1a1a1a'
        },
        strategies: 'injectManifest',
        injectRegister: false,
        injectManifest: {
          swSrc: 'public/custom-sw.js',
          swDest: 'custom-sw.js',
        },
      }),
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        'react': path.resolve(__dirname, './node_modules/react'),
        'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
        'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom')
      },
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
      dedupe: ['react', 'react-dom', 'react-router-dom'] 
    },

    esbuild: {
      loader: 'jsx',
      jsx: 'automatic',
      jsxInject: "import React from 'react'",
    },

    build: {
      outDir: 'build',
      assetsDir: 'assets',
      sourcemap: !isProduction,
      minify: isProduction ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: isProduction,
          pure_funcs: isProduction ? ['console.log'] : [],
        },
      },
      rollupOptions: {
        external: [], 
        output: {
          manualChunks: {
            'vendor': [
              'react',
              'react-dom',
              '@mui/material',
              '@emotion/react',
              '@emotion/styled',
            ],
            'icons': [
              '@mui/icons-material',
              'react-icons',
            ],
            'utils': [
              'lodash',
              'axios',
              'date-fns',
            ],
          },
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]'
        }
      },
      chunkSizeWarningLimit: 1000,
      target: 'es2020',
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      cssMinify: true,
      reportCompressedSize: true,
      emptyOutDir: true,
    },

    css: {
      modules: {
        localsConvention: 'camelCase',
      }
    },

    server: {
      host: true,
      port: 3005,
      hmr: true,
      fs: {
        strict: true,
      },
      proxy: {
        '/api': {
          target: 'https://k-connect.ru',
          changeOrigin: true,
          secure: true,
          ws: true,
        },
        '/socket.io': {
          target: 'https://k-connect.ru',
          ws: true,
        },
      }
    },

    preview: {
      port: 3005,
      host: true,
    },
    
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@mui/material',
        '@emotion/react',
        '@emotion/styled',
        'lodash',
        'axios',
        './src/pages/Info/RulesPage.js',
        './src/pages/Main/ArtistPage.js',
        './src/pages/Main/ChannelsPage.js',
        './src/pages/Main/LeaderboardPage.js',
        './src/pages/Main/MainPage.js',
        './src/pages/Main/MorePage.js',
        './src/pages/Main/MusicPage.js',
        './src/pages/Main/PostDetailPage.js',
        './src/pages/Main/SearchPage.js',
        './src/pages/Main/UpdatesPage.js',
        './src/pages/Messenger/JoinGroupChat.js',
        './src/pages/Messenger/MessengerPage.js',
        './src/pages/User/ProfilePage.js',
        './src/pages/User/SettingsPage.js',
        './src/pages/User/components/PostsFeed.js',
        './src/pages/User/components/WallFeed.js',
        './src/utils/LinkUtils.js',
      ],
      exclude: ['@vite/client', '@vite/env'],
    },
  };
});
