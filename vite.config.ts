import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Plugin to inline critical CSS
function inlineCriticalCSS() {
  return {
    name: 'inline-critical-css',
    transformIndexHtml(html: string) {
      // Read critical CSS file
      const criticalCSSPath = path.resolve(__dirname, 'src/critical.css');
      if (fs.existsSync(criticalCSSPath)) {
        const criticalCSS = fs.readFileSync(criticalCSSPath, 'utf-8');
        // Inject critical CSS into HTML
        return html.replace(
          '</head>',
          `<style id="critical-css">${criticalCSS}</style></head>`
        );
      }
      return html;
    },
  };
}

// Plugin to remove unused code
function removeUnusedCode() {
  return {
    name: 'remove-unused-code',
    enforce: 'post' as const,
    generateBundle(_options: any, bundle: any) {
      // Remove source maps in production
      if (process.env.NODE_ENV === 'production') {
        Object.keys(bundle).forEach(key => {
          if (key.endsWith('.map')) {
            delete bundle[key];
          }
        });
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Optimize JSX runtime (Fast Refresh is enabled by default)
      jsxRuntime: 'automatic',
    }),
    inlineCriticalCSS(),
    removeUnusedCode(),
  ],
  css: {
    // Optimize CSS processing
    devSourcemap: false,
    preprocessorOptions: {
      css: {
        // Optimize CSS imports
        charset: false,
      },
    },
  },
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
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 3, // Multiple passes for better minification
        unsafe: true,
        unsafe_comps: true,
        unsafe_math: true,
        unsafe_methods: true,
        // Aggressive dead code elimination
        dead_code: true,
        unused: true,
        // Remove unreachable code
        conditionals: true,
        evaluate: true,
        booleans: true,
        loops: true,
        // Inline functions
        inline: 3,
        // Remove duplicate code
        reduce_vars: true,
        collapse_vars: true,
        // Optimize comparisons
        comparisons: true,
        // Optimize sequences
        sequences: true,
        // Optimize properties
        properties: true,
        // Join consecutive var statements
        join_vars: true,
        // Optimize if-return and if-continue
        if_return: true,
      },
      mangle: {
        safari10: true,
        // Mangle properties for smaller size
        properties: {
          regex: /^_/,
        },
      },
      format: {
        comments: false, // Remove all comments
        ascii_only: true, // Escape unicode characters
      },
    },
    // Code splitting for better caching - Ultra-aggressive splitting
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Ultra-aggressive code splitting for faster initial load
          if (id.includes('node_modules')) {
            // Core React - smallest possible
            if (id.includes('react/') || id.includes('react-dom/client')) {
              return 'react-core';
            }
            if (id.includes('react-dom') && !id.includes('client')) {
              return 'react-dom';
            }
            if (id.includes('react-router')) {
              return 'router';
            }
            // Split Radix UI by component for better tree-shaking
            if (id.includes('@radix-ui/react-select')) {
              return 'radix-select';
            }
            if (id.includes('@radix-ui/react-slider')) {
              return 'radix-slider';
            }
            if (id.includes('@radix-ui/react-tabs')) {
              return 'radix-tabs';
            }
            if (id.includes('@radix-ui/react-dialog')) {
              return 'radix-dialog';
            }
            if (id.includes('@radix-ui/react-dropdown')) {
              return 'radix-dropdown';
            }
            if (id.includes('@radix-ui')) {
              return 'radix-other';
            }
            // PDF libraries - split separately (heavy)
            if (id.includes('pdf-lib')) {
              return 'pdf-lib';
            }
            if (id.includes('pdfjs-dist')) {
              return 'pdfjs';
            }
            // Icons - lazy load
            if (id.includes('lucide-react')) {
              return 'icons';
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'supabase';
            }
            // Other vendors
            return 'vendor';
          }
          // Split each page into its own chunk
          if (id.includes('/pages/')) {
            const pageName = id.split('/pages/')[1].split('.')[0];
            return `page-${pageName}`;
          }
          // Split components by category
          if (id.includes('/components/ui/')) {
            return 'ui-components';
          }
          if (id.includes('/components/')) {
            return 'components';
          }
        },
        // Optimize chunk names with shorter hashes
        chunkFileNames: 'assets/[name]-[hash:8].js',
        entryFileNames: 'assets/[name]-[hash:8].js',
        assetFileNames: 'assets/[name]-[hash:8].[ext]',
        // Inline critical CSS
        inlineDynamicImports: false,
        // Optimize chunk size
        experimentalMinChunkSize: 10000, // 10kb minimum
      },
      // Enable tree-shaking (moderate settings to avoid breaking the build)
      treeshake: {
        moduleSideEffects: 'no-external',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
    // Optimize chunk size - Aggressive splitting
    chunkSizeWarningLimit: 300,
    // Enable CSS code splitting - Per route
    cssCodeSplit: true,
    // Disable source maps in production
    sourcemap: false,
    // Optimize asset inlining - Aggressive
    assetsInlineLimit: 8192, // Inline assets < 8kb for fewer requests
    // Report compressed size
    reportCompressedSize: false, // Faster builds
    // Enable CSS minification - Use lightningcss for better compression
    cssMinify: 'lightningcss',
    // CSS target for better optimization
    cssTarget: 'chrome90',
  },
  // Optimize dependencies - Aggressive pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
    ],
    exclude: [
      '@radix-ui/react-icons',
      'lucide-react', // Load icons on demand
      'pdf-lib', // Load PDF libraries on demand
      'pdfjs-dist', // Load PDF.js on demand
    ],
    // Force optimization
    force: false,
    // Enable esbuild optimization
    esbuildOptions: {
      target: 'esnext',
      supported: {
        'top-level-await': true,
      },
      treeShaking: true,
      minify: true,
      // Drop console and debugger in production
      drop: ['console', 'debugger'],
      // Optimize for size
      legalComments: 'none',
      // Minify identifiers
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
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
    // Pure annotations for better tree shaking
    pure: ['console.log', 'console.info', 'console.debug'],
    // Keep names for better debugging (but still minified)
    keepNames: false,
  },
  // Experimental features for better performance
  experimental: {
    renderBuiltUrl(filename) {
      // Use CDN for assets if needed
      return filename;
    },
  },
})
