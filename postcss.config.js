export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    // CSS minification with cssnano - Tailwind handles purging
    ...(process.env.NODE_ENV === 'production' ? {
      cssnano: {
        preset: ['advanced', {
          discardComments: { removeAll: true },
          reduceIdents: false, // Keep class names for debugging
          mergeRules: true,
          minifyFontValues: true,
          minifyGradients: true,
          normalizeWhitespace: true,
          discardUnused: { keyframes: true, fontFace: true },
          zindex: false, // Don't optimize z-index
          cssDeclarationSorter: true,
        }],
      },
    } : {}),
  },
};
