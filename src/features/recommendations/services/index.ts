import { LocalDB } from '@shared/lib/db'
import { config } from '@core/config'
import type { Recommendation, ChatMessage } from '@shared/types'

export const RecommendationService = {
  async getAll(): Promise<Recommendation[]> {
    await new Promise((r) => setTimeout(r, 200))
    return LocalDB.getRecommendations()
  },

  async askAI(query: string): Promise<ChatMessage> {
    const response = await GeminiService.chat(query)
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date().toISOString(),
    }
  },
}

export const GeminiService = {
  async analyzeProgress(): Promise<{
    nextSteps: string[]
    gaps: string[]
    readyForProjects: boolean
    complementarySkills: string[]
  }> {
    const skills = LocalDB.getSkills()
    const paths = LocalDB.getLearningPaths()
    const prompt = `
      Eres un asesor de aprendizaje experto. Analiza este perfil de estudiante:
      
      Habilidades: ${JSON.stringify(skills.map(s => ({ name: s.name, level: s.level, progress: s.progress })))}
      Rutas de aprendizaje: ${JSON.stringify(paths.map(p => ({ goal: p.goal, progress: p.progress })))}
      
      Responde ÚNICAMENTE con JSON (sin markdown, sin texto adicional):
      {
        "nextSteps": ["paso 1", "paso 2", "paso 3"],
        "gaps": ["brecha 1", "brecha 2"],
        "readyForProjects": true/false,
        "complementarySkills": ["habilidad 1", "habilidad 2"]
      }
    `
    try {
      const response = await callGemini(prompt)
      const cleaned = response.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      return JSON.parse(cleaned)
    } catch {
      return {
        nextSteps: ['Practicar con proyectos personales', 'Profundizar en tus tecnologías principales', 'Explorar nuevas áreas'],
        gaps: ['Falta experiencia en testing', 'Necesitas más práctica en proyectos reales'],
        readyForProjects: true,
        complementarySkills: ['Git avanzado', 'Metodologías ágiles'],
      }
    }
  },

  async chat(message: string): Promise<string> {
    const skills = LocalDB.getSkills()
    const paths = LocalDB.getLearningPaths()
    const projects = LocalDB.getProjects()

    const contextPrompt = `
      Eres PathForge AI, un asistente experto en desarrollo de aprendizaje personalizado.
      Tu tono es amable, motivador y profesional. Hablas en español.
      
      Contexto del estudiante:
      - Habilidades: ${skills.map(s => `${s.name} (${s.level}, ${s.progress}%)`).join(', ')}
      - Rutas activas: ${paths.map(p => p.goal).join(', ')}
      - Proyectos: ${projects.map(p => `${p.name} (${p.status})`).join(', ')}
      
      Consulta del estudiante: "${message}"
      
      Instrucciones de formato:
      - Usa saltos de línea entre secciones
      - Estructura tu respuesta con secciones claras usando emojis como viñetas
      - Usa este formato de ejemplo:
      
        TÍTULO DE SECCIÓN
        ──────────────────
        • Punto uno con explicación clara
        • Punto dos con detalles útiles
        
        SIGUIENTE SECCIÓN
        ─────────────────
        • Contenido relevante
        
      - Sé específico basado en el perfil del estudiante
      - Da consejos prácticos y accionables
      - Máximo 4 secciones
      - Termina con una pregunta para seguir la conversación
    `

    try {
      return await callGemini(contextPrompt)
    } catch {
      return getFallbackResponse(message, skills, paths)
    }
  },
}

async function callGemini(prompt: string): Promise<string> {
  const apiKey = config.gemini.apiKey
  if (!apiKey) {
    return getOfflineResponse(prompt)
  }

  const response = await fetch(`${config.gemini.apiUrl}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || 'Lo siento, no pude procesar tu consulta.'
}

function getOfflineResponse(prompt: string): string {
  if (prompt.includes('JSON') || prompt.includes('json')) {
    return JSON.stringify({
      nextSteps: ['Repasar fundamentos', 'Hacer proyectos prácticos', 'Aprender testing'],
      gaps: ['Práctica en proyectos reales', 'Trabajo en equipo'],
      readyForProjects: true,
      complementarySkills: ['Git', 'Metodologías ágiles', 'Documentación técnica'],
    })
  }
  return getFallbackResponse(prompt, [], [])
}

function getFallbackResponse(message: string, skills: any[], paths: any[]): string {
  const msg = message.toLowerCase()
  if (msg.includes('qué sigue') || msg.includes('que sigue') || msg.includes('después') || msg.includes('next')) {
    return getNextSteps(skills, paths)
  }
  if (msg.includes('proyecto') || msg.includes('project')) {
    return getProjectIdeas(skills)
  }
  if (msg.includes('python') || msg.includes('javascript') || msg.includes('react')) {
    return getSpecificAdvice(msg, skills)
  }
  return getGeneralAdvice()
}

function getNextSteps(skills: any[], paths: any[]): string {
  const advanced = skills.filter((s: any) => s.level === 'advanced' || s.level === 'expert')
  const intermediate = skills.filter((s: any) => s.level === 'intermediate')
  const beginner = skills.filter((s: any) => s.level === 'beginner')

  let advice = 'Basado en tu perfil actual, aquí tienes mis recomendaciones:\n'
  advice += '──────────────────────────────────────────\n\n'

  if (advanced.length > 0) {
    advice += '🔷 FORTALEZAS\n'
    advice += `Tienes un nivel avanzado en: ${advanced.map((s: any) => s.name).join(', ')}.\n`
    advice += 'Puedes considerar enseñar o mentorar a otros en estas áreas.\n\n'
  }

  if (intermediate.length > 0) {
    advice += '📈 EN DESARROLLO\n'
    advice += `Tus habilidades en ${intermediate.map((s: any) => s.name).join(', ')} están en un buen nivel.\n`
    advice += 'Te recomiendo profundizar con proyectos prácticos que las integren.\n\n'
  }

  if (beginner.length > 0) {
    advice += '🌱 PARA CRECER\n'
    advice += `Dedica tiempo a fortalecer: ${beginner.map((s: any) => s.name).join(', ')}.\n`
    advice += 'Prueba construir pequeños proyectos para afianzar conceptos.\n\n'
  }

  advice += '¿QUÉ TAL SI PRUEBAS ESTO?\n'
  advice += '──────────────────────────\n'
  advice += '1. Identifica un proyecto que integre 2 o 3 tecnologías que estés aprendiendo\n'
  advice += '2. Establece metas semanales pequeñas y medibles\n'
  advice += '3. Comparte tu progreso en GitHub o LinkedIn\n\n'

  if (paths.length > 0) {
    advice += `🎯 Ruta activa: ${paths.map((p: any) => p.goal).join(', ')} — ${Math.round(paths[0]?.progress || 0)}% completado\n\n`
  }

  advice += '¿Quieres que te sugiera un proyecto específico para las tecnologías que te interesan?'
  return advice
}

function getProjectIdeas(skills: any[]): string {
  const skillNames = skills.map((s: any) => s.name.toLowerCase())
  let ideas = '🎯 PROYECTOS RECOMENDADOS\n'
  ideas += '──────────────────────────\n\n'

  if (skillNames.includes('react')) {
    ideas += 'Con React:\n'
    ideas += '  • Gestor de tareas con drag & drop (React + TypeScript)\n'
    ideas += '  • Dashboard de métricas personales (React + Chart.js)\n'
    ideas += '  • Clon de Trello con estado global (Zustand)\n\n'
  }
  if (skillNames.includes('python')) {
    ideas += 'Con Python:\n'
    ideas += '  • Web scraper para seguimiento de precios (BeautifulSoup)\n'
    ideas += '  • Analizador de datos CSV/Excel (Pandas)\n'
    ideas += '  • API REST con FastAPI\n\n'
  }
  if (skillNames.includes('node')) {
    ideas += 'Con Node.js:\n'
    ideas += '  • API REST con autenticación JWT (Express)\n'
    ideas += '  • Chat en tiempo real (Socket.io)\n'
    ideas += '  • CLI tool para automatizar tareas\n\n'
  }
  if (skillNames.includes('mongodb') || skillNames.includes('sql')) {
    ideas += 'Con Bases de Datos:\n'
    ideas += '  • Sistema de inventario completo\n'
    ideas += '  • Aplicación de notas con búsqueda\n\n'
  }
  if (skillNames.includes('docker')) {
    ideas += 'Con Docker:\n'
    ideas += '  • Microservicio dockerizado con CI/CD\n'
    ideas += '  • Entorno de desarrollo multi-contenedor\n\n'
  }

  ideas += '💡 CONSEJO\n'
  ideas += '──────────\n'
  ideas += 'Elige un proyecto que te apasione y empieza con una versión mínima.\n'
  ideas += 'Puedes iterar y mejorar con el tiempo. ¡Lo importante es empezar!'
  return ideas
}

function getSpecificAdvice(msg: string, skills: any[]): string {
  if (msg.includes('python')) {
    return '🐍 PYTHON\n──────────────────\n\nTienes un buen camino recorrido con Python. Para seguir avanzando:\n\n' +
      '📚 Bibliotecas recomendadas:\n' +
      '  • Pandas — manipulación de datos\n' +
      '  • NumPy — computación numérica\n' +
      '  • Matplotlib — visualización\n' +
      '  • FastAPI — APIs modernas\n\n' +
      '🎯 Proyectos para practicar:\n' +
      '  • Scripts de automatización de tareas\n' +
      '  • Web scraper con BeautifulSoup\n' +
      '  • API REST con FastAPI\n' +
      '  • Challenges en LeetCode o Codewars\n\n' +
      '💡 ¿Te interesa data science, backend, automatización o IA?\n' +
      'Dime tu enfoque y te doy una ruta más específica.'
  }
  if (msg.includes('javascript')) {
    return '🟨 JAVASCRIPT\n──────────────────\n\nJavaScript es la base del desarrollo web moderno. Para seguir creciendo:\n\n' +
      '📚 Áreas clave:\n' +
      '  • ES6+: arrow functions, destructuring, spread operator\n' +
      '  • Async/await y promesas\n' +
      '  • Manipulación del DOM\n' +
      '  • Fetch API y consumo de APIs\n\n' +
      '🎯 Próximos pasos:\n' +
      '  • Profundiza en React (ya tienes experiencia)\n' +
      '  • Aprende Node.js para backend\n' +
      '  • Testing con Jest o Vitest\n' +
      '  • TypeScript para código más robusto\n\n' +
      '💡 ¿Quieres enfocarte en frontend, backend o full-stack?'
  }
  if (msg.includes('react')) {
    return '⚛️ REACT\n──────────────────\n\nYa tienes bases de React. Para llevar tus habilidades al siguiente nivel:\n\n' +
      '📚 Temas avanzados:\n' +
      '  • Estado global con Zustand (ya lo conoces)\n' +
      '  • React Router (ya lo tienes)\n' +
      '  • Patrones: render props, HOCs, custom hooks\n' +
      '  • Suspense y Concurrent Mode\n\n' +
      '🎯 Próximos pasos:\n' +
      '  • Next.js para SSR y SSG\n' +
      '  • React Testing Library para pruebas\n' +
      '  • TypeScript con tipos avanzados\n' +
      '  • Optimización: memo, useMemo, useCallback\n\n' +
      '💡 ¿Te gustaría explorar Next.js o prefieres seguir con React puro?'
  }
  return getGeneralAdvice()
}

function getGeneralAdvice(): string {
  return '🚀 CONSEJOS GENERALES\n' +
    '────────────────────────\n\n' +
    'Aquí tienes principios clave para tu aprendizaje:\n\n' +
    '🎯 Prioridades:\n' +
    '  • Consistencia > Intensidad: 30 min diarios > 5 horas un día\n' +
    '  • Aprende haciendo: los proyectos son la mejor forma\n' +
    '  • Enseña lo que aprendes: explicar refuerza el conocimiento\n\n' +
    '🌐 Comunidad:\n' +
    '  • GitHub: comparte tu código y contribuye\n' +
    '  • Stack Overflow: aprende de problemas reales\n' +
    '  • LinkedIn: construye tu red profesional\n\n' +
    '📝 Hábitos:\n' +
    '  • Documenta tu aprendizaje (blog, notas técnicas)\n' +
    '  • Toma descansos: el cerebro necesita asimilar\n' +
    '  • Revisa y actualiza tus metas regularmente\n\n' +
    '💡 ¿Sobre qué tecnología o tema específico te gustaría recibir consejos?\n' +
    'Pregúntame lo que necesites.'
}
