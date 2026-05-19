export const config = {
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 15000,
  },
  app: {
    name: 'PathForge AI',
    tagline: 'Construye tu ruta. Evoluciona tus habilidades.',
    version: '1.0.0',
  },
  auth: {
    tokenKey: 'pathforge_token',
    refreshTokenKey: 'pathforge_refresh_token',
  },
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
  },
  pagination: {
    defaultPageSize: 20,
  },
} as const
