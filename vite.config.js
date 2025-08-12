// Vite config for K-Connect
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import path from 'path';
import wasm from 'vite-plugin-wasm';
import topLevelAwait from 'vite-plugin-top-level-await';
import viteCompression from 'vite-plugin-compression';
import { createHtmlPlugin } from 'vite-plugin-html';
import imagePresets, { widthPreset } from 'vite-plugin-image-presets';
// import terser from '@rollup/plugin-terser'; // Not used directly

// [INFO] Проект переведён на rolldown-vite вместо vite. Конфиг совместим с rolldown-vite.

// Aliases for cleaner imports
const alias = {
  '@': path.resolve(__dirname, './src'),
  'react': path.resolve(__dirname, './node_modules/react'),
  'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
  'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom'),
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    base: '/',
    publicDir: 'public',
    // --- Plugins ---
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
            }],
            ['@babel/preset-typescript', {
              isTSX: true,
              allExtensions: true
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
        compressionOptions: { level: 9 },
        success: (file) => console.log(`✅ Gzip compressed: ${file}`),
        error: (err) => console.warn(`⚠️ Gzip compression failed: ${err.message}`),
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
      imagePresets({
        cover: widthPreset({
          widths: [400, 800, 1200],
          formats: ['webp', 'jpeg', 'png'],
        })
      }),
    ].filter(Boolean),

    // --- Module Resolution ---
    resolve: {
      alias,
      extensions: ['.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
      dedupe: ['react', 'react-dom', 'react-router-dom'] 
    },

    // --- ESBuild ---
    esbuild: {
      loader: 'jsx',
      jsx: 'automatic',
    },

    // --- Build Options ---
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
          onwarn(warning, warn) {
            // Игнорируем WARN о eval в lottie-web
            // Это безопасно, так как lottie-web использует eval только для парсинга JSON анимаций
            // и не выполняет пользовательский код
            if (warning.code === 'EVAL' && warning.id && warning.id.includes('lottie')) {
              return;
            }
            // Игнорируем WARN о eval в node_modules
            if (warning.code === 'EVAL' && warning.id && warning.id.includes('node_modules')) {
              return;
            }
            warn(warning);
          },
          external: [],
          treeshake: {
            moduleSideEffects: false,
            propertyReadSideEffects: false,
            tryCatchDeoptimization: false,
          },
          output: {
            manualChunks: {
              // Основные библиотеки
              'react': ['react', 'react-dom'],
              'mui': [
                '@mui/material',
                '@mui/icons-material', 
                '@emotion/react',
                '@emotion/styled'
              ],
              'router': ['react-router-dom'],
              
              // Тяжелые библиотеки отдельно
              'markdown': ['react-markdown'],
              'lottie': ['lottie-react'],
              'framer': ['framer-motion'],
              
              // Утилиты
              'utils': ['lodash', 'axios', 'date-fns'],
            },
            entryFileNames: 'assets/[name].[hash].js',
            chunkFileNames: 'assets/[name].[hash].js',
            assetFileNames: 'assets/[name].[hash].[ext]'
          }
        },
      chunkSizeWarningLimit: 800, // Более строгий лимит для контроля размера
      target: 'es2020',
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
      cssMinify: true,
      reportCompressedSize: true,
      emptyOutDir: true,
    },

    // --- CSS Modules ---
    css: {
      modules: {
        localsConvention: 'camelCase',
      }
    },

    // --- Dev Server ---
    server: {
      host: true,
      port: 3005,
      hmr: true,
      fs: { strict: true },
      // Игнорируем WARN о eval в dev режиме
      onwarn(warning, warn) {
        if (warning.code === 'EVAL' && warning.id && warning.id.includes('lottie')) {
          return;
        }
        if (warning.code === 'EVAL' && warning.id && warning.id.includes('node_modules')) {
          return;
        }
        warn(warning);
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

    // --- Preview Server ---
    preview: {
      port: 3005,
      host: true,
    },
    
    // --- Dependency Optimization ---
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@mui/material',
        '@emotion/react',
        '@emotion/styled',
        'lodash',
        'axios',
      ],
      exclude: ['@vite/client', '@vite/env'],
    },
  };
});

