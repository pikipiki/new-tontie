/** Static hosts receive a meta policy; frame-ancestors requires host response headers. */
export function productionSecurityPlugin() {
  return {
    name: 'production-security-policy',
    apply: 'build',
    transformIndexHtml() {
      return [
        {
          tag: 'meta',
          injectTo: 'head-prepend',
          attrs: {
            'http-equiv': 'Content-Security-Policy',
            content: [
              "default-src 'self'",
              "script-src 'self' 'wasm-unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob:",
              "font-src 'self' data:",
              "connect-src 'self' blob:",
              "worker-src 'self' blob:",
              "media-src 'self' blob:",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'none'",
            ].join('; '),
          },
        },
      ]
    },
  }
}
