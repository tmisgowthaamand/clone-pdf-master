import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Optimize JSX runtime (Fast Refresh is enabled by default)
      jsxRuntime: 'automatic',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080,
    // Optimize HMR
    hmr: {
      overlay: false,
    },
  },
  build: {
    // Optimize build for production - Maximum performance
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
        passes: 3, // Multiple passes for better minification
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false, // Remove all comments
      },
    },
    // Code splitting for better caching - Aggressive splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor chunks aggressively
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'react-vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui-vendor';
            }
            if (id.includes('pdf') || id.includes('jspdf')) {
              return 'pdf-vendor';
            }
            if (id.includes('lucide')) {
              return 'icons-vendor';
            }
            // Other vendors
            return 'vendor';
          }
          // Split pages
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('.')[0];
            return `page-${pageName}`;
          }
        },
        // Optimize chunk names
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
      },
    },
    // Optimize chunk size
    chunkSizeWarningLimit: 500,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Disable source maps in production
    sourcemap: false,
    // Optimize asset inlining
    assetsInlineLimit: 4096, // Inline assets < 4kb
    // Report compressed size
    reportCompressedSize: false, // Faster builds
    // Enable CSS minification
    cssMinify: true,
  },
  // Optimize dependencies - Aggressive pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      '@radix-ui/react-select',
      '@radix-ui/react-slider',
      '@radix-ui/react-tabs',
    ],
    exclude: ['@radix-ui/react-icons'],
    // Force optimization
    force: false,
    // Enable esbuild optimization
    esbuildOptions: {
      target: 'esnext',
      supported: {
        'top-level-await': true,
      },
    },
  },
  // Performance optimizations - Maximum speed
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
    // Minify everything
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true,
    // Drop console in production
    drop: ['console', 'debugger'],
    // Optimize for size and speed
    legalComments: 'none',
    treeShaking: true,
  },
  // Experimental features for better performance
  experimental: {
    renderBuiltUrl(filename) {
      // Use CDN for assets if needed
      return filename;
    },
  },
})
