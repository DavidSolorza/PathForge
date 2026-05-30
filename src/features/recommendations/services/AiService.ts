import type { LearningPath, Category, ChatMessage, Resource, AiUserContext } from '@shared/types'
import { PathStorageService } from '@features/learning-path/services/PathStorageService'
import { UserStorageService } from '@features/profile/services/UserStorageService'
import { config } from '@core/config'
import { searchResources } from './curatedResources'

interface TopicDef { name: string; description?: string; content?: string; resources?: { title: string; url: string; type: string }[] }

const SPECIFIC_TOPICS: Record<string, { stages: { name: string; topics: TopicDef[] }[] }> = {
  java: { stages: [
    { name: 'Fundamentos de Java', topics: [
      { name: 'Sintaxis basica: variables, tipos de datos y operadores' },
      { name: 'Estructuras de control: if, else, switch, bucles' },
      { name: 'Arrays y la clase String en Java' },
      { name: 'Programacion orientada a objetos: clases y objetos' },
      { name: 'Metodos, constructores y sobrecarga' },
    ]},
    { name: 'POO avanzada y colecciones', topics: [
      { name: 'Herencia, polimorfismo e interfaces' },
      { name: 'Clases abstractas y metodos final' },
      { name: 'Colecciones: List, Set, Map y genericos' },
      { name: 'Manejo de excepciones: try-catch-finally' },
      { name: 'Entrada/salida con java.io y java.nio' },
    ]},
    { name: 'APIs y frameworks Java', topics: [
      { name: 'Expresiones lambda y Stream API' },
      { name: 'Programacion concurrente con hilos' },
      { name: 'Acceso a bases de datos con JDBC' },
      { name: 'Introduccion a Spring Boot y Maven' },
      { name: 'Creacion de APIs REST con Spring' },
    ]},
    { name: 'Java en produccion', topics: [
      { name: 'Testing con JUnit y Mockito' },
      { name: 'Buenas practicas y patrones de diseno' },
      { name: 'Construccion y empaquetado con Maven/Gradle' },
      { name: 'Despliegue de aplicaciones Java' },
      { name: 'Proyecto final: aplicacion completa con Spring Boot' },
    ]},
  ]},
  python: { stages: [
    { name: 'Fundamentos de Python', topics: [
      { name: 'Variables y tipos de datos (int, float, str, bool)' },
      { name: 'Listas, tuplas y diccionarios en Python' },
      { name: 'Estructuras de control: if, elif, else' },
      { name: 'Bucles y repeticiones: for y while' },
      { name: 'Funciones: def, parámetros y return' },
    ]},
    { name: 'Funciones y módulos', topics: [
      { name: 'Funciones lambda y list comprehensions' },
      { name: 'Módulos y paquetes con pip' },
      { name: 'Manejo de archivos (txt, csv, json)' },
      { name: 'Manejo de excepciones (try, except)' },
      { name: 'Programación orientada a objetos básica' },
    ]},
    { name: 'POO y proyectos', topics: [
      { name: 'Clases, herencia y polimorfismo' },
      { name: 'Métodos especiales y decoradores en Python' },
      { name: 'Entornos virtuales y dependencias (venv/poetry)' },
      { name: 'Testing unitario con pytest' },
      { name: 'Proyecto: CRUD básico con almacenamiento local' },
    ]},
    { name: 'Python avanzado', topics: [
      { name: 'Creación de APIs REST con FastAPI o Flask' },
      { name: 'Web scraping con BeautifulSoup y Requests' },
      { name: 'Bases de datos relacionales con SQLite' },
      { name: 'Programación asíncrona en Python' },
      { name: 'Proyecto final integrador de desarrollo' },
    ]},
  ]},
  javascript: { stages: [
    { name: 'Fundamentos de JS', topics: [
      { name: 'Variables (let, const) y tipos de datos' },
      { name: 'Funciones y arrow functions modernas' },
      { name: 'Arrays y métodos avanzados (map, filter, reduce)' },
      { name: 'Objetos literales y destructuring' },
      { name: 'Template literals y spread/rest operator' },
    ]},
    { name: 'DOM y eventos', topics: [
      { name: 'Selección y manipulación de elementos del DOM' },
      { name: 'Manejo de eventos (click, submit, input)' },
      { name: 'Manipulación dinámica de estilos CSS' },
      { name: 'Formularios y validación de datos' },
      { name: 'Proyecto: Todo App interactiva' },
    ]},
    { name: 'Asincronía y APIs', topics: [
      { name: 'Callbacks y la evolución a Promesas' },
      { name: 'Uso de Async/await para flujos limpios' },
      { name: 'Consumo de servicios con Fetch API' },
      { name: 'Operaciones CRUD completas con REST APIs' },
      { name: 'Proyecto: Aplicación del Clima en tiempo real' },
    ]},
    { name: 'JS moderno y herramientas', topics: [
      { name: 'ES6 Modules (import/export)' },
      { name: 'Gestión de paquetes con npm y package.json' },
      { name: 'Configuración básica de bundlers con Vite' },
      { name: 'Introducción al testing con Jest' },
      { name: 'Proyecto final: SPA completa' },
    ]},
  ]},
  react: { stages: [
    { name: 'Fundamentos de React', topics: [
      { name: 'JSX y la filosofía de componentes funcionales' },
      { name: 'Props y composición de interfaces' },
      { name: 'Control de estado local con useState' },
      { name: 'Renderizado condicional y renderizado de listas' },
      { name: 'Manejo de eventos y formularios controlados' },
    ]},
    { name: 'React intermedio', topics: [
      { name: 'Efectos secundarios con useEffect y ciclo de vida' },
      { name: 'Referencias al DOM con useRef' },
      { name: 'Estado global simple con Context API' },
      { name: 'Creación de Custom Hooks reutilizables' },
      { name: 'Rutas dinámicas con React Router DOM' },
    ]},
    { name: 'Estado global y APIs', topics: [
      { name: 'Zustand para estado global ligero' },
      { name: 'Mutación y caché con React Query (TanStack)' },
      { name: 'Formularios avanzados con React Hook Form' },
      { name: 'Autenticación de usuarios y rutas protegidas' },
      { name: 'Proyecto: Dashboard de administración completo' },
    ]},
    { name: 'Optimización y despliegue', topics: [
      { name: 'Rendimiento: memo, useMemo y useCallback' },
      { name: 'Testing de componentes con React Testing Library' },
      { name: 'Carga perezosa con Lazy loading y Suspense' },
      { name: 'Despliegue y hosting en Vercel o Netlify' },
      { name: 'Proyecto final: App Full-Stack conectada' },
    ]},
  ]},
  diseño: { stages: [
    { name: 'Fundamentos de diseño', topics: [
      { name: 'Principios CRAP (Contraste, Repetición, Alineación, Proximidad)' },
      { name: 'Teoría del color aplicada a interfaces digitales' },
      { name: 'Jerarquía tipográfica y legibilidad' },
      { name: 'Principios de UX research básico' },
      { name: 'Creación de Wireframes de baja fidelidad' },
    ]},
    { name: 'Herramientas de Diseño UI', topics: [
      { name: 'Figma: Interfaz básica y herramientas de dibujo' },
      { name: 'Figma: Componentes reutilizables y Auto Layout' },
      { name: 'Diseño responsivo para móviles y escritorio' },
      { name: 'Sistemas de diseño básicos (colores, fuentes, espaciados)' },
      { name: 'Proyecto práctico: Prototipo interactivo en Figma' },
    ]},
  ]},
  ingles: { stages: [
    { name: 'Bases Gramaticales e Iniciales', topics: [
      { name: 'Verbo To Be, pronombres personales y saludos' },
      { name: 'Presente simple y adverbios de frecuencia' },
      { name: 'Vocabulario esencial cotidiano (familia, comida, hogar)' },
      { name: 'Pronunciación básica de fonemas difíciles en inglés' },
      { name: 'Lecturas muy cortas y diálogos guiados' },
    ]},
    { name: 'Conversación y Tiempos Pasados', topics: [
      { name: 'Pasado simple: verbos regulares e irregulares' },
      { name: 'Presente continuo y el futuro con "going to" / "will"' },
      { name: 'Vocabulario para situaciones comunes (viajes, compras, trabajo)' },
      { name: 'Práctica de listening con canciones o podcasts sencillos' },
      { name: 'Proyecto práctico: Simular una conversación en restaurante/aeropuerto' },
    ]},
    { name: 'Inglés Intermedio y Fluidez', topics: [
      { name: 'Presente perfecto y su diferencia con el pasado simple' },
      { name: 'Verbos modales (can, could, should, must, have to)' },
      { name: 'Vocabulario profesional e inglés de negocios básico' },
      { name: 'Técnicas de shadowing para mejorar la entonación' },
      { name: 'Escribir correos electrónicos informales y profesionales' },
    ]},
    { name: 'Dominio y Comunicación Libre', topics: [
      { name: 'Condicionales básicos (Zero, First, Second Conditional)' },
      { name: 'Phrasal verbs esenciales y su uso natural' },
      { name: 'Estrategias para sostener debates y opinar en inglés' },
      { name: 'Preparación de una presentación personal/laboral de 5 min' },
      { name: 'Proyecto: Grabación de una mini-presentación en video' },
    ]},
  ]},
  backend: { stages: [
    { name: 'Fundamentos de Backend con Node.js', topics: [
      { name: 'Arquitectura cliente-servidor y el protocolo HTTP' },
      { name: 'Node.js: Entorno de ejecución y el event loop' },
      { name: 'Gestión de módulos y npm' },
      { name: 'Creación de un servidor HTTP básico sin librerías' },
      { name: 'Lectura y escritura de archivos locales con modulo fs' },
    ]},
    { name: 'Desarrollo de APIs REST con Express', topics: [
      { name: 'Introducción a Express.js y enrutamiento' },
      { name: 'Uso y creación de Middlewares para request/response' },
      { name: 'Validación de parámetros y datos con Zod' },
      { name: 'Control de errores global y estructurado' },
      { name: 'Proyecto: API CRUD básica de artículos/usuarios' },
    ]},
    { name: 'Bases de Datos e Integración', topics: [
      { name: 'Bases de datos SQL vs NoSQL: conceptos clave' },
      { name: 'Conexión a PostgreSQL/MySQL mediante ORMs (Prisma)' },
      { name: 'Diseño de esquemas y relaciones de bases de datos' },
      { name: 'Autenticación con JSON Web Tokens (JWT) y encriptación con bcrypt' },
      { name: 'Proyecto: Sistema de autenticación seguro y base de datos' },
    ]},
    { name: 'Backend Avanzado y Despliegue', topics: [
      { name: 'Carga de archivos mediante Multer y almacenamiento en la nube' },
      { name: 'Buenas prácticas de seguridad (Helmet, CORS, Rate Limit)' },
      { name: 'Pruebas de integración con Supertest' },
      { name: 'Contenerización básica con Docker' },
      { name: 'Despliegue a producción en servicios cloud (Render/Railway)' },
    ]},
  ]},
  ciberseguridad: { stages: [
    { name: 'Fundamentos de Redes y Seguridad', topics: [
      { name: 'Conceptos clave de redes (IP, subredes, DNS, DHCP)' },
      { name: 'Modelo TCP/IP y protocolos esenciales (HTTP, HTTPS, SSH, FTP)' },
      { name: 'Triángulo de seguridad CIA (Confidencialidad, Integridad, Disponibilidad)' },
      { name: 'Introducción al sistema operativo Linux para seguridad' },
      { name: 'Análisis de tráfico básico con Wireshark' },
    ]},
    { name: 'Vulnerabilidades y OWASP Top 10', topics: [
      { name: 'Inyecciones SQL (SQLi) y cómo prevenirlas' },
      { name: 'Cross-Site Scripting (XSS) y Cross-Site Request Forgery (CSRF)' },
      { name: 'Autenticación rota y exposición de datos sensibles' },
      { name: 'Uso práctico de herramientas de escaneo como Nmap y Gobuster' },
      { name: 'Proyecto práctico: Encontrar y mitigar una vulnerabilidad básica' },
    ]},
    { name: 'Criptografía y Defensas', topics: [
      { name: 'Conceptos de criptografía simétrica y asimétrica' },
      { name: 'Funciones Hash, firmas digitales y certificados SSL/TLS' },
      { name: 'Configuración básica de firewalls y VPNs' },
      { name: 'Seguridad en el desarrollo (DevSecOps inicial)' },
      { name: 'Proyecto: Implementar hashes y cifrado en un backend' },
    ]},
    { name: 'Pentesting y Auditoría Práctica', topics: [
      { name: 'Metodologías de pruebas de penetración (reconocimiento, explotación)' },
      { name: 'Introducción a laboratorios de práctica (TryHackMe / HackTheBox)' },
      { name: 'Ingeniería social básica y concientización en seguridad' },
      { name: 'Redacción de reportes técnicos de vulnerabilidades' },
      { name: 'Proyecto final: Simular una auditoría de seguridad a una web local' },
    ]},
  ]},
}

const GENERIC_TOPICS: { stages: { name: string; topics: TopicDef[] }[] } = {
  stages: [
    { name: 'Cimientos: lo que necesitas saber', topics: [
      { name: 'Conceptos clave explicados desde cero' },
      { name: 'Terminología esencial que usarás siempre' },
      { name: 'Herramientas y materiales para empezar' },
      { name: 'Ejemplo práctico: tu primer contacto' },
      { name: 'Errores comunes al iniciar y cómo evitarlos' },
    ]},
    { name: 'Manos a la obra: práctica guiada', topics: [
      { name: 'Ejercicios fáciles para ganar confianza' },
      { name: 'Técnica principal paso a paso' },
      { name: 'Ejercicios progresivos: sube el nivel' },
      { name: 'Aplica lo aprendido en un caso real' },
      { name: 'Revisa errores y corrige tu técnica' },
    ]},
    { name: 'Explora por tu cuenta', topics: [
      { name: 'Reto personal: algo que te apasione' },
      { name: 'Busca recursos avanzados (ya sabes cómo)' },
      { name: 'Comunidades donde aprender y preguntar' },
      { name: 'Crea tu propio proyecto' },
      { name: 'Enséñale a alguien (la mejor forma de aprender)' },
    ]},
    { name: 'Dominio: vuélvete autónomo', topics: [
      { name: 'Proyecto final: demuestra lo que sabes' },
      { name: 'Evalúa tu progreso y define metas' },
      { name: 'Contribuye a la comunidad del tema' },
      { name: 'Plan para seguir aprendiendo solo' },
      { name: 'Enseñar a otros: consolida tu conocimiento' },
    ]},
  ],
}

function findSpecificTopics(goal: string): { stages: { name: string; topics: TopicDef[] }[] } | null {
  const g = goal.toLowerCase()
  for (const [key, data] of Object.entries(SPECIFIC_TOPICS)) {
    if (g.includes(key) || key.includes(g)) return data
  }
  
  const cleanGoal = goal
    .replace(/^(quiero\s+)?aprender\s+|^(quiero\s+)?aprende\s+|^(quiero\s+)?dominando\s+|^quiero\s+|^aprender\s+|^aprende\s+|^dominando\s+/gi, '')
    .replace(/^para\s+|^como\s+|^desde\s+cero\s*/gi, '')
    .replace(/desde cero$/gi, '')
    .trim()
  const capitalizedGoal = cleanGoal ? cleanGoal.charAt(0).toUpperCase() + cleanGoal.slice(1) : 'Nuevo Tema'
  
  return {
    stages: [
      {
        name: `Cimientos de ${capitalizedGoal}`,
        topics: [
          { name: `Conceptos clave y terminología básica de ${capitalizedGoal}` },
          { name: `Herramientas básicas y configuración inicial para ${capitalizedGoal}` },
          { name: `Ejemplo práctico y primera toma de contacto con ${capitalizedGoal}` },
          { name: `Errores comunes al empezar con ${capitalizedGoal} y cómo evitarlos` },
          { name: `Recursos y comunidades recomendadas de ${capitalizedGoal}` },
        ]
      },
      {
        name: `Práctica Guiada y Fundamentos de ${capitalizedGoal}`,
        topics: [
          { name: `Ejercicios iniciales de ${capitalizedGoal} paso a paso` },
          { name: `Aplicación de técnicas fundamentales de ${capitalizedGoal}` },
          { name: `Retos de nivel básico para ganar confianza en ${capitalizedGoal}` },
          { name: `Proyecto pequeño: aplicando lo aprendido en ${capitalizedGoal}` },
          { name: `Análisis de buenas prácticas en ${capitalizedGoal}` },
        ]
      },
      {
        name: `Exploración y Retos de Nivel Medio en ${capitalizedGoal}`,
        topics: [
          { name: `Conceptos avanzados de ${capitalizedGoal} que debes conocer` },
          { name: `Ejercicios prácticos con mayor nivel de complejidad` },
          { name: `Proyecto intermedio: resolución de un caso real de ${capitalizedGoal}` },
          { name: `Optimización del flujo de trabajo y eficiencia en ${capitalizedGoal}` },
          { name: `Enseñar a otros: explicación simple de un tema complejo de ${capitalizedGoal}` },
        ]
      },
      {
        name: `Dominio y Proyecto Final de ${capitalizedGoal}`,
        topics: [
          { name: `Diseño y desarrollo de tu Proyecto Final Integrador de ${capitalizedGoal}` },
          { name: `Evaluación de tu progreso y autocrítica en ${capitalizedGoal}` },
          { name: `Planificación para el aprendizaje continuo de ${capitalizedGoal}` },
          { name: `Cómo resolver problemas complejos en ${capitalizedGoal} de forma autónoma` },
          { name: `Consolidación: mentoría y portafolio de ${capitalizedGoal}` },
        ]
      }
    ]
  }
}

async function generateAITopics(goal: string, context?: ChatMessage[], preferences?: import('@shared/types').PathPreferences, userContext?: AiUserContext): Promise<{ stages: { name: string; topics: TopicDef[] }[] } | null> {
  const apiKey = localStorage.getItem('pathforge_gemini_api_key') || config.gemini.apiKey
  if (!apiKey) return null
  let contextText = ''
  if (context && context.length > 0) {
    const relevantMessages = context.slice(-20)
    const allMessages = relevantMessages.map((m) => `${m.role === 'user' ? 'Usuario' : 'Asistente'}: ${m.content}`).join('\n')
    contextText = '\n\nCONVERSACION COMPLETA (usa esto para entender EXACTAMENTE que quiere el usuario, su nivel, y que temas ya conoce):\n' + allMessages
  }

  let preferencesText = ''
  if (preferences) {
    const hoursLabel = { '<3': 'menos de 3 horas', '3-5': '3-5 horas', '5-10': '5-10 horas', '10+': 'mas de 10 horas' }
    const methodLabel = { 'lectura': 'leer y documentacion', 'video': 'videos y tutoriales', 'practica': 'practica directa con proyectos', 'mixto': 'mixto (todo)' }
    const levelLabel = { 'beginner': 'principiante', 'intermediate': 'intermedio', 'advanced': 'avanzado' }
    const projectLabel = { 'cortos': 'proyectos cortos (1-2 dias)', 'medianos': 'proyectos medianos (1 semana)', 'largos': 'proyectos largos (2+ semanas)' }
    preferencesText = `\n\nPREFERENCIAS DEL USUARIO:\n- Tiempo semanal: ${hoursLabel[preferences.weeklyHours]}\n- Metodo preferido: ${methodLabel[preferences.learningMethod]}\n- Nivel actual: ${levelLabel[preferences.currentLevel]}\n- Proyectos: ${projectLabel[preferences.projectPreference]}`
  }

  let userContextText = ''
  if (userContext) {
    if (userContext.paths.length > 0) {
      userContextText += '\n\nRUTAS EXISTENTES DEL USUARIO (no repitas temas que ya tiene):\n'
      userContext.paths.forEach((p) => {
        userContextText += `- "${p.title}" (${p.progress}% completado, ${p.completed}/${p.total} temas)\n`
      })
    }
    if (userContext.stats.completedTopics > 0) {
      userContextText += `\nESTADISTICAS: ${userContext.stats.completedTopics} temas completados, ${userContext.stats.totalMinutes} minutos estudiados\n`
    }
  }

  const prompt = `Genera una ruta de aprendizaje personalizada. Usa el contexto de la conversacion para entender EXACTAMENTE que quiere aprender el usuario, su nivel actual, y que temas ya conoce.

Objetivo del usuario: "${goal}"${contextText}${preferencesText}${userContextText}

REGLAS:
- SOLO JSON: {"stages":[{"name":"...","topics":[{"name":"...","content":"...","resources":[{"title":"...","url":"real_url","type":"documentation"}]]}]}
- 4 stages, 5 topics cada uno
- Cada topic DEBE tener "content" con mini-clase explicativa de 3-5 lineas CON CODIGO si aplica
- "resources" debe incluir URLs reales a documentacion oficial
- Los nombres deben ser muy especificos con ejemplos practicos
- ADAPTATE a las preferencias del usuario
- MUY IMPORTANTE: Si la conversacion muestra que el usuario ya sabe ciertos conceptos o ya tiene rutas completadas, NO incluyas esos temas. Empieza desde donde le corresponde.
- Si el usuario menciono temas especificos en el chat, INCLUYELOS en la ruta
- La ruta debe ser COMPLETA y cubrir todos los aspectos del tema, no solo una parte
- Espanol. Sin markdown alrededor del JSON.`

  try {
    const res = await fetch(`${config.gemini.apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) return null
    const cleaned = text.replace(/```json|```/g, '').trim()
    const parsed = JSON.parse(cleaned)
    if (parsed?.stages && Array.isArray(parsed.stages)) return parsed as { stages: { name: string; topics: TopicDef[] }[] }
    return null
  } catch { return null }
}

function generateFallbackContent(topicName: string, stageName: string, goal: string): string {
  const techKeywords = ['python', 'javascript', 'react', 'node', 'css', 'html', 'typescript', 'sql', 'docker', 'git', 'api', 'base de datos', 'backend', 'frontend', 'web']
  const isTech = techKeywords.some(k => goal.toLowerCase().includes(k) || topicName.toLowerCase().includes(k))

  if (isTech) {
    return `**${topicName}**\n\nEste tema cubre conceptos fundamentales relacionados con ${topicName.toLowerCase()}. La mejor forma de aprender es combinando teoria con practica directa.\n\n- Dedica tiempo a entender los conceptos clave\n- Sigue ejemplos paso a paso\n- Practica con ejercicios cortos\n- Busca documentacion oficial para profundizar\n\n**Recursos recomendados:** Busca tutoriales y documentacion de ${topicName.split('(')[0].trim()} en Google o YouTube.`
  }

  return `**${topicName}**\n\nParte de ${stageName.toLowerCase()} para dominar ${goal}.\n\nDedica tiempo a practicar y reforzar cada concepto antes de avanzar al siguiente tema.`
}

function stagesFromDefs(def: { stages: { name: string; topics: TopicDef[] }[] }, goal: string): LearningPath['stages'] {
  return def.stages.map((stage, si) => ({
    id: `stage_${Date.now()}_${si}`,
    name: stage.name,
    description: `${stage.name} — tu proximo paso para dominar ${goal}`,
    order: si,
    status: si === 0 ? 'in_progress' as const : 'pending' as const,
    topics: stage.topics.map((topic, ti) => ({
      id: `topic_${Date.now()}_${si}_${ti}`,
      name: topic.name,
      content: topic.content || generateFallbackContent(topic.name, stage.name, goal),
      difficulty: (si === 0 ? 'easy' : si === 1 ? 'medium' : 'hard') as 'easy' | 'medium' | 'hard',
      completed: false,
      resources: (topic.resources && topic.resources.length > 0
        ? topic.resources.map((r, ri) => ({
            id: `res_${Date.now()}_${si}_${ti}_${ri}`,
            title: r.title,
            type: (r.type === 'video' ? 'video' : 'article') as Resource['type'],
            url: r.url && r.url !== '#' ? r.url : '#',
          })).filter(r => r.url !== '#')
        : []
      ),
    })),
  }))
}

function detectCategory(_goal: string): { category: Category; difficulty: 'beginner' | 'intermediate' | 'advanced' } {
  return { category: 'tecnologia', difficulty: 'beginner' }
}

function generateTitle(goal: string): string {
  const techKeywords = [
    'python', 'javascript', 'typescript', 'java', 'c#', 'c++', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
    'react', 'vue', 'angular', 'svelte', 'nextjs', 'nuxt', 'gatsby',
    'node', 'express', 'fastapi', 'django', 'flask', 'spring', 'rails', 'laravel',
    'html', 'css', 'sass', 'tailwind', 'bootstrap',
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'firebase', 'supabase',
    'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'devops', 'ci/cd',
    'git', 'github', 'gitlab',
    'testing', 'jest', 'vitest', 'cypress', 'playwright',
    'graphql', 'rest', 'api', 'websocket',
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'ia', 'inteligencia artificial',
    'ciberseguridad', 'hacking', 'pentesting',
    'algoritmos', 'estructuras de datos', 'patrones de diseno',
    'frontend', 'backend', 'fullstack', 'mobile', 'web',
    'linux', 'bash', 'terminal', 'shell',
    'vim', 'vscode', 'neovim',
    'webpack', 'vite', 'rollup',
    'redux', 'zustand', 'mobx',
    'prisma', 'sequelize', 'mongoose', 'typeorm',
    'nginx', 'apache', 'vercel', 'netlify', 'heroku',
    'electron', 'react native', 'flutter',
    'blockchain', 'solidity', 'web3',
    'data science', 'pandas', 'numpy', 'matplotlib',
    'elasticsearch', 'rabbitmq', 'kafka',
    'microservicios', 'arquitectura', 'diseno de sistemas',
    'no sql', 'nosql'
  ]

  const lowerGoal = goal.toLowerCase()

  for (const keyword of techKeywords) {
    if (lowerGoal.includes(keyword)) {
      const words = keyword.split(' ')
      if (words.length === 1) {
        return keyword.charAt(0).toUpperCase() + keyword.slice(1)
      }
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    }
  }

  const clean = goal
    .replace(/^(quiero\s+)?aprender\s+|^(quiero\s+)?aprende\s+|^(quiero\s+)?dominar\s+|^quiero\s+|^aprender\s+|^aprende\s+|^dominar\s+/gi, '')
    .replace(/^para\s+|^como\s+|^desde\s+cero\s*/gi, '')
    .replace(/desde cero$/gi, '')
    .replace(/programacion|programación|desarrollo|development/gi, '')
    .trim()

  if (clean.length > 0 && clean.length < 30) {
    return clean.charAt(0).toUpperCase() + clean.slice(1)
  }

  const firstWords = clean.split(' ').slice(0, 3).join(' ')
  return firstWords.charAt(0).toUpperCase() + firstWords.slice(1)
}

const SYSTEM_PROMPT = `Eres un mentor personal de aprendizaje en PathForge AI. Hablas espanol de forma natural, como un amigo experto que da consejos directos y utiles. No eres un libro de texto ni un bot generico. Eres cercano, directo y te importa el progreso real del usuario.

DOMINAS: desarrollo web (HTML, CSS, JS, React, Vue, Angular), backend (Node, Express, APIs, SQL, NoSQL), DevOps (Docker, CI/CD, deploy), mobile (React Native, Flutter), IA/ML (Python, TensorFlow), ciberseguridad, testing, y herramientas digitales.

REGLAS DE ORO:
1. Se directo. Nada de introducciones genericas. Ve al grano en la primera linea.
2. Habla como una persona real. Usa frases cortas. Pregunta, opina, sugiere. Usa expresiones naturales como "mira", "te cuento", "la verdad es que", "oye".
3. Si ves datos del usuario (rutas, proyectos, estadisticas) USALOS. Di cosas como "Veo que completaste X temas" o "Tu ruta de React va al 60%".
4. Cuando alguien dice que termino una ruta, revisa sus datos y recomienda el siguiente paso CONCRETO: un proyecto especifico, una tecnologia complementaria, o consolidar con ejercicios.
5. Da ejemplos con codigo cuando sea relevante.
6. Recomienda autores/creadores en YouTube por nombre. NUNCA pongas URLs de videos.
7. No uses emojis. Usa **negritas** para enfatizar.
8. Adapta tu tono: principiante = paciente y sencillo. Avanzado = tecnico y retador.
9. Deja siempre una pregunta abierta al final para seguir la conversacion.
10. NUNCA digas "Como asistente" o "Como IA". Eres un mentor.
11. Si el usuario dice "ya acabe", "ya termine", "complete la ruta" o similar, asume que termino una ruta y analiza sus datos para darle el siguiente paso.
12. Si el usuario pregunta si esta listo para un proyecto, analiza sus temas completados y dale una respuesta honesta: si tiene menos de 10 temas, dile que practique mas. Si tiene mas de 10, dale proyectos especificos.

QUE HACER EN CADA CASO:
- "Progreso" o "como voy": revisa sus estadisticas reales y da numeros concretos mas una recomendacion.
- "Que sigue" o "despues": mira sus rutas incompletas y sugiere terminar esas antes de empezar nuevas, o recomienda la siguiente tecnologia logica.
- "Listo para proyecto" o "puedo hacer un proyecto": evalua sus temas completados. Si tiene menos de 10, sugiere practicar mas. Si tiene mas de 10, recomienda proyectos especificos para su stack.
- "Me falta para mi objetivo": identifica la brecha entre su estado actual y su meta.
- "Termine una ruta" o "ya acabe": felicita brevemente y da el siguiente paso concreto (proyecto, profundizar, o nueva ruta relacionada). Analiza que tecnologias aprendio y sugiere proyectos que usen esas tecnologias.
- Tema nuevo: explica prerrequisitos primero, luego el plan.

CUANDO EL USUARIO TERMINA UNA RUTA:
1. Felicitalo brevemente (1 linea maximo)
2. Revisa que tecnologias aprendio en esa ruta
3. Sugierele UN proyecto concreto que use esas tecnologias
4. Dile que habilidades le faltan para ese proyecto
5. Preguntale si quiere que le genere una ruta para esas habilidades faltantes

EJEMPLO DE BUENA RESPUESTA CUANDO TERMINAN UNA RUTA:
"Felicidades por terminar Python. Ahora que sabes variables, funciones, POO y manejo de archivos, te recomiendo este proyecto: un gestor de tareas en terminal que guarde los datos en un archivo JSON. Te va a faltar aprender sobre argparse para los argumentos de linea de comandos, pero eso lo puedes aprender en 1 hora. Quieres que te genere una ruta rapida para eso?"

Manten respuestas de 3-5 parrafos. Conversacional pero con sustancia.`

function buildContextBlock(ctx: AiUserContext): string {
  const pathsText = ctx.paths.length > 0
    ? ctx.paths.map((p) => `- "${p.title}" (${p.progress}% completado, ${p.completed}/${p.total} temas, categoria: ${p.category})`).join('\n')
    : 'Sin rutas creadas aun.'
  const projectsText = ctx.projects.length > 0
    ? ctx.projects.map((p) => `- "${p.name}" (${p.status}) [${p.technologies.join(', ')}]`).join('\n')
    : 'Sin proyectos registrados aun.'
  return `DATOS DEL USUARIO (usa estos datos para personalizar tu respuesta si es relevante):\n\nEstadisticas:\n- Minutos totales estudiados: ${ctx.stats.totalMinutes}\n- Racha actual: ${ctx.stats.streak} dias\n- Temas completados: ${ctx.stats.completedTopics}\n- Rutas creadas: ${ctx.stats.totalPaths}\n\nRutas de aprendizaje:\n${pathsText}\n\nProyectos:\n${projectsText}`
}

async function callGemini(systemPrompt: string, messages: { role: string; content: string }[]): Promise<string> {
  const apiKey = localStorage.getItem('pathforge_gemini_api_key') || config.gemini.apiKey
  if (!apiKey) throw new Error('Gemini API key not configured')

  const parts: { text: string }[] = []
  parts.push({ text: systemPrompt })

  for (const msg of messages) {
    const prefix = msg.role === 'user' ? 'Usuario' : 'Asistente'
    parts.push({ text: `${prefix}: ${msg.content}` })
  }

  parts.push({ text: 'Asistente:' })

  const res = await fetch(`${config.gemini.apiUrl}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: { temperature: 0.9, maxOutputTokens: 2048 },
    }),
  })
  if (!res.ok) throw new Error(`Gemini error ${res.status}`)
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Empty Gemini response')
  return text
}

export const AiService = {
  async verifyApiKey(key: string): Promise<boolean> {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Hola, responde con un ok' }] }],
          generationConfig: { maxOutputTokens: 10 },
        }),
      })
      return res.ok
    } catch {
      return false
    }
  },

  async generatePath(goal: string, context?: ChatMessage[], preferences?: import('@shared/types').PathPreferences, userContext?: AiUserContext): Promise<LearningPath> {
    const mergedGoal = goal
    let { category } = detectCategory(mergedGoal)
    const { difficulty } = detectCategory(mergedGoal)

    if (userContext && userContext.paths.length > 0) {
      const existingCats = userContext.paths.map((p) => p.category)
      const topCat = existingCats.sort((a, b) => existingCats.filter((c) => c === a).length - existingCats.filter((c) => c === b).length).pop()
      if (topCat && !mergedGoal.toLowerCase().includes(topCat)) {
        const detected = detectCategory(topCat + ' ' + mergedGoal)
        category = detected.category
      }
    }

    const title = generateTitle(mergedGoal)
    const specific = findSpecificTopics(mergedGoal)
    let stagesData = specific
    if (!stagesData) {
      stagesData = await generateAITopics(mergedGoal, context, preferences, userContext) || GENERIC_TOPICS
    }
    const stages = stagesFromDefs(stagesData, mergedGoal)
    const path = PathStorageService.create({ title, goal: mergedGoal, category, difficulty, stages })
    UserStorageService.updateStats((prev) => ({ ...prev, totalPaths: prev.totalPaths + 1, favoriteCategory: category }))
    UserStorageService.addActivity({ id: `act_${Date.now()}`, type: 'path_created', title: `Nueva ruta: ${title}`, pathName: title, timestamp: new Date().toISOString() })
    return path
  },

  async recommendNext(pathId: string): Promise<string> {
    const path = await PathStorageService.getById(pathId)
    if (!path) return 'No encontre la ruta. Que deseas aprender?'
    const allTopics = path.stages.flatMap((s) => s.topics)
    const completed = allTopics.filter((t) => t.completed).length
    const total = allTopics.length
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0
    const nextIncomplete = allTopics.find((t) => !t.completed)
    if (!nextIncomplete) return `Completaste ${path.title} al 100%. Que te gustaria aprender ahora?`
    let advice = `Basado en tu ruta "${path.title}" (${percent}% completado):\n\n**Siguiente tema:** ${nextIncomplete.name}\n`
    const resources = searchResources(nextIncomplete.name + ' ' + path.title)
    if (resources.length > 0) {
      advice += '\n**Autores:**\n'
      resources.slice(0, 2).forEach((r) => {
        if (r.author) advice += `* Busca a **${r.author}**\n`
        if (r.text) advice += `  ${r.text}\n\n`
      })
    }
    return advice + '\n**Consejo:** Sesiones de 25 min con descansos de 5 (Pomodoro).'
  },

  async chat(userMessage: string, history?: ChatMessage[], context?: AiUserContext): Promise<ChatMessage> {
    const contextBlock = context ? buildContextBlock(context) : ''
    const allMessages = history
      ? [...(context ? [{ role: 'user' as const, content: contextBlock }] : []), ...history, { role: 'user' as const, content: userMessage }]
      : [{ role: 'user' as const, content: userMessage }]

    let content: string
    try {
      content = await callGemini(SYSTEM_PROMPT, allMessages.map((m) => ({ role: m.role, content: m.content })))
    } catch {
      content = getSmartFallback(userMessage, context)
    }

    return { id: `msg_${Date.now()}_ai`, role: 'assistant', content, timestamp: new Date().toISOString() }
  },
}

function extractTopic(msg: string): string {
  const m = msg.toLowerCase()
  const knownTopics = ['python', 'javascript', 'js', 'react', 'html', 'css', 'docker', 'sql', 'node', 'git', 'typescript', 'ciberseguridad', 'machine learning', 'ia', 'datos', 'pandas']
  for (const topic of knownTopics) {
    if (m.includes(topic)) return topic
  }
  return ''
}

function getSmartFallback(msg: string, context?: AiUserContext): string {
  const m = msg.toLowerCase()

  const checkProgress = m.includes('progreso') || m.includes('avance') || m.includes('como voy') || m.includes('cuanto llevo')
  const checkReadiness = m.includes('listo') || m.includes('preparado') || m.includes('suficiente') || m.includes('puedo empezar') || m.includes('ya puedo')
  const checkProject = m.includes('proyecto') || m.includes('poryecto') || m.includes('project')
  const checkNext = m.includes('que sigue') || m.includes('siguiente') || m.includes('despues') || m.includes('next')
  const checkAnalyze = m.includes('analiza') || m.includes('analisis') || m.includes('evaluame') || m.includes('evaluacion')
  const checkGoal = m.includes('objetivo') || m.includes('meta') || m.includes('falta') || m.includes('llegar')
  const checkCompleted = m.includes('termine') || m.includes('complete') || m.includes('acabe') || m.includes('ya termine') || m.includes('finalice') || m.includes('ya acabe') || m.includes('ya complete') || m.includes('100%') || m.includes('termine la ruta') || m.includes('acabe la ruta') || m.includes('ya acabe') || m.includes('ya termine')

  const hasPaths = context && context.paths.length > 0
  const hasProjects = context && context.projects.length > 0
  const hasStats = context && context.stats.completedTopics > 0

  if (checkCompleted) {
    if (hasPaths) {
      const p = context!.paths
      const done = p.filter((path) => path.progress === 100)
      const inProgress = p.filter((path) => path.progress < 100)

      if (done.length > 0) {
        const completedPath = done[0]
        const category = completedPath.category

        const projectIdeas: Record<string, { name: string; tech: string; missing: string }> = {
          tecnologia: { name: 'una API REST con autenticacion y base de datos', tech: 'Node.js, Express, PostgreSQL, JWT', missing: 'manejo de errores avanzado y testing' },
          idiomas: { name: 'un blog bilingue con articulos semanales', tech: 'escritura, gramatica avanzada', missing: 'vocabulario tecnico y practica de conversacion' },
          diseno: { name: 'un portafolio completo con 3 proyectos de diseno', tech: 'Figma, principios de UX', missing: 'investigacion de usuarios y prototipado avanzado' },
          musica: { name: 'componer una cancion original de 3 minutos', tech: 'teoria musical, produccion basica', missing: 'armonia avanzada y mezcla' },
          arte: { name: 'una serie de 10 ilustraciones tematicas', tech: 'tecnicas de dibujo, color', missing: 'anatomia avanzada y composicion' },
          negocios: { name: 'un plan de negocios completo con proyecciones', tech: 'analisis de mercado, finanzas basicas', missing: 'estrategia de crecimiento y fundraising' },
          productividad: { name: 'un sistema personal de gestion de tareas y habitos', tech: 'metodologias de productividad', missing: 'automatizacion y delegacion' },
          ciencias: { name: 'un experimento documentado con analisis de datos', tech: 'metodo cientifico, analisis estadistico', missing: 'revision por pares y publicacion' },
          cocina: { name: 'un menu completo de 5 platos con maridaje', tech: 'tecnicas de cocina, presentacion', missing: 'cocina molecular y gestion de tiempos' },
          fotografia: { name: 'una serie fotografica tematica de 20 fotos editadas', tech: 'composicion, edicion en Lightroom', missing: 'iluminacion avanzada y narrativa visual' },
          deportes: { name: 'un plan de entrenamiento de 12 semanas con seguimiento', tech: 'tecnica, condicion fisica', missing: 'nutricion deportiva y prevencion de lesiones' },
          otros: { name: 'un proyecto personal que demuestre lo aprendido', tech: 'las herramientas de tu ruta', missing: 'aplicacion practica en casos reales' },
        }

        const idea = projectIdeas[category] || projectIdeas.otros

        return `Felicidades por terminar **${completedPath.title}**. Eso es un logro real.\n\nAhora, la diferencia entre saber y poder hacer es un proyecto. Te recomiendo este:\n\n**Proyecto sugerido:** ${idea.name}\n**Tecnologias que ya tienes:** ${completedPath.title}\n**Lo que te va a faltar:** ${idea.missing}\n\n**Plan concreto:**\n1. Dedica esta semana a planear el proyecto (que va a hacer, que pantallas va a tener)\n2. La siguiente semana, empieza a construir lo basico\n3. En 3 semanas, deberias tener un prototipo funcional\n\n${inProgress.length > 0 ? `\nOjo, tambien tienes ${inProgress.length} ruta${inProgress.length > 1 ? 's' : ''} a medias: ${inProgress.map((p) => `"${p.title}" (${p.progress}%)`).join(', ')}. Te recomiendo terminar esas antes de empezar algo nuevo.` : ''}\n\nQuieres que te genere una ruta rapida para aprender ${idea.missing}?`
      }
    }

    return `Felicidades por terminar tu ruta. Ahora viene la parte mas importante: aplicar lo que aprendiste.\n\n**El problema de solo hacer rutas:** Puedes ver 100 tutoriales y sentir que sabes mucho, pero cuando abres un archivo en blanco, no sabes por donde empezar. Eso es normal y se resuelve con proyectos.\n\n**Tu siguiente paso:**\n1. Piensa en un problema real que tengas (algo que te moleste hacer manualmente, una lista que quieras organizar, etc.)\n2. Intenta resolverlo con las tecnologias que aprendiste\n3. No tiene que ser perfecto, tiene que funcionar\n\n**Ejemplos de proyectos por nivel:**\n* **Principiante:** Calculadora, lista de tareas, generador de contrasenas\n* **Intermedio:** Blog personal, dashboard con datos de una API, clon de Twitter basico\n* **Avanzado:** App full-stack con login, e-commerce, sistema de reservas\n\nCuentame que tecnologias aprendiste y te doy un proyecto especifico.`
  }

  if (checkAnalyze || checkProgress) {
    if (hasStats) {
      const s = context!.stats
      const p = context!.paths

      const progressAnalysis = p.map((path) => {
        const status = path.progress === 100 ? 'completada' : path.progress >= 50 ? 'a mitad de camino' : path.progress > 0 ? 'recien empezada' : 'sin empezar'
        return `* **${path.title}**: ${path.progress}% (${status}, ${path.completed}/${path.total} temas)`
      }).join('\n')

      const recommendation = s.completedTopics === 0
        ? 'Aun no has completado ningun tema. Mi consejo: empieza hoy con el primer tema de tu primera ruta. No lo dejes para manana.'
        : s.completedTopics < 5
        ? 'Llevas pocos temas completados. Lo se, da pereza, pero la constancia es lo unico que funciona. 15 minutos diarios, no mas.'
        : s.completedTopics < 15
        ? 'Tienes buena base. Es momento de empezar un proyecto pequeno para consolidar lo aprendido. No esperes a "saber todo".'
        : 'Tienes solida experiencia. Es hora de proyectos mas ambiciosos o especializarte en algo concreto.'

      return `**Tu progreso actual**\n\nLlevas **${s.totalMinutes} minutos** estudiando, **${s.streak} dias** de racha, y **${s.completedTopics} temas** completados en **${s.totalPaths} rutas**.\n\n${progressAnalysis}\n\n${hasProjects ? `Tienes ${context!.projects.filter((pr) => pr.status === 'in_progress').length} proyectos en progreso y ${context!.projects.filter((pr) => pr.status === 'completed').length} completados.` : 'Aun no has registrado proyectos.'}\n\n**Mi analisis:** ${recommendation}\n\nQue te gustaria hacer ahora?`
    }

    return `**Analisis de progreso**\n\nPara saber donde estas, responde honestamente:\n\n**Nivel basico:**\n- Puedes explicar los conceptos sin mirar apuntes?\n- Has hecho al menos 5 ejercicios sin ver la solucion?\n\n**Nivel intermedio:**\n- Puedes empezar un archivo en blanco y escribir algo util?\n- Has resuelto errores por tu cuenta?\n\n**Nivel avanzado:**\n- Has completado un proyecto personal?\n- Puedes ensanarle el tema a alguien mas?\n\n**La verdad:** La mayoria de la gente se queda en nivel basico porque solo ve tutoriales. La diferencia esta en hacer proyectos propios.\n\nCuantos temas llevas completados? Asi te doy una recomendacion mas precisa.`
  }

  if (checkReadiness) {
    if (hasStats) {
      const s = context!.stats
      const p = context!.paths

      const readiness = s.completedTopics >= 15
        ? { level: 'listo', msg: 'Tienes base solida. Es hora de un proyecto real.' }
        : s.completedTopics >= 8
        ? { level: 'casi', msg: 'Te falta poco. Completa 5-7 temas mas y empieza un proyecto guiado.' }
        : { level: 'aun no', msg: 'Aun estas construyendo fundamentos. No te saltes pasos.' }

      const pathInfo = p.length > 0 ? `Tu ruta mas avanzada es "${p[0].title}" con ${p[0].progress}%.` : ''

      return `**Estas listo para avanzar?**\n\nSegun tus datos:\n* Temas completados: **${s.completedTopics}**\n* Minutos estudiados: **${s.totalMinutes}**\n* Racha: **${s.streak} dias**\n\n${pathInfo}\n\n**Mi evaluacion:** ${readiness.msg}\n\n**La prueba de fuego:** Intenta hacer esto sin mirar ningun tutorial:\n1. Abre un archivo en blanco\n2. Escribe un programa que haga algo util (aunque sea simple)\n3. Si te trabas, busca en la documentacion, no en YouTube\n\nSi puedes hacer eso, estas listo. Si no, repasa los temas que te costaron.\n\nQuieres que te recomiende un proyecto para tu nivel?`
    }

    return `**Estas listo para el siguiente nivel?**\n\nSenales de que puedes avanzar:\n\n**Verde (dale):**\n- Explicas conceptos sin dudar\n- Los ejercicios faciles te aburren\n- Comet errores nuevos (no los mismos de siempre)\n\n**Amarillo (practica mas):**\n- Necesitas el tutorial abierto para escribir codigo\n- Los errores te paralizan\n- Copias y pegas sin entender\n\n**Rojo (vuelve a lo basico):**\n- No puedes explicar un ejemplo simple\n- Saltaste conceptos por ir rapido\n- Llevas 2+ semanas en el mismo tema\n\n**La prueba:** Haz un ejercicio del nivel anterior sin ayuda. Si puedes, avanza. Si no, repasa.\n\nEn que color te ves?`
  }

  if (checkNext) {
    if (hasPaths) {
      const p = context!.paths
      const allDone = p.every((path) => path.progress === 100)
      const inProgress = p.filter((path) => path.progress < 100)

      if (allDone) {
        return `Completaste todas tus rutas. Eso es disciplina.\n\nAhora tienes dos caminos:\n\n**1. Profundizar:** Toma una tecnologia que viste y haz un proyecto complejo con ella. Por ejemplo, si aprendiste React, haz una app completa con autenticacion, base de datos y deploy.\n\n**2. Expandirte:** Aprende algo complementario. Si hiciste frontend, prueba backend. Si hiciste Python, prueba JavaScript. Si hiciste diseno, prueba desarrollo.\n\n**Mi recomendacion:** Antes de empezar algo nuevo, haz un proyecto con lo que ya sabes. Si no lo aplicas, lo olvidas.\n\nQue te llama mas: profundizar o expandirte?`
      }

      const pendingText = inProgress.map((path) => `* "${path.title}" va al ${path.progress}% (${path.completed}/${path.total} temas)`).join('\n')

      return `**Que sigue en tu aprendizaje**\n\n${pendingText}\n\n**Mi consejo directo:** Termina lo que empezaste antes de abrir nuevas rutas. Se que es tentador empezar algo nuevo, pero la magia esta en terminar.\n\n**Si te estancaste en una ruta:**\n- Cambia de tema 2-3 dias y vuelve con mente fresca\n- Busca un recurso diferente (si leias, prueba video; si veias video, prueba practica)\n- Salta el tema que te traba y vuelve despues\n\n**Si ya no te interesa:** No pasa nada. Elimina la ruta y crea una nueva de algo que si te motive.\n\nQuieres que te ayude a desbloquearte en alguna ruta?`
    }

    return `**Que sigue en tu aprendizaje?**\n\nEl camino tipico en programacion:\n\n1. **Fundamentos** (1-2 meses): sintaxis, estructuras de datos, funciones\n2. **Herramientas** (2-3 meses): Git, terminal, debugging\n3. **Proyectos guiados** (3-6 meses): 5-10 proyectos siguiendo tutoriales\n4. **Proyecto propio** (6+ meses): idea tuya, publica en GitHub\n5. **Especializacion**: frontend, backend, datos, mobile, etc.\n\n**El error mas comun:** Querer correr antes de caminar. La mayoria abandona en la fase 3 porque se frustra.\n\n**Mi consejo:** Disfruta cada fase. No hay prisa. 20 minutos diarios durante 6 meses te convierten en alguien competente.\n\nEn que fase dirias que estas?`
  }

  if (checkProject) {
    if (hasProjects) {
      const projs = context!.projects
      const completed = projs.filter((pr) => pr.status === 'completed')
      const inProgress = projs.filter((pr) => pr.status === 'in_progress')

      const projText = projs.map((pr) => {
        const status = pr.status === 'completed' ? 'completado' : pr.status === 'in_progress' ? 'en progreso' : 'borrador'
        return `* **${pr.name}** (${status}) - ${pr.technologies.join(', ')}`
      }).join('\n')

      const techStack = [...new Set(projs.flatMap((p) => p.technologies))].slice(0, 5)

      const projectIdeas = techStack.includes('React') || techStack.includes('JavaScript')
        ? '* App de gestion de tareas con autenticacion y base de datos\n* Dashboard con graficos de datos en tiempo real\n* Clon de Trello simplificado con drag and drop'
        : techStack.includes('Python')
        ? '* Analizador de datos con visualizaciones\n* Bot de Telegram que haga algo util\n* API REST con FastAPI y base de datos'
        : '* Un proyecto que resuelva un problema real que tengas\n* Algo que puedas terminar en 1-2 semanas\n* Que use las tecnologias que ya sabes'

      return `**Tus proyectos**\n\n${projText}\n\n${completed.length > 0 ? `Tienes ${completed.length} proyecto${completed.length > 1 ? 's' : ''} completado${completed.length > 1 ? 's' : ''}. Buen trabajo.` : 'Aun no has completado ningun proyecto.'}\n\n${inProgress.length > 0 ? `Tienes ${inProgress.length} en progreso. Mi consejo: termina uno antes de empezar otro.` : ''}\n\n**Ideas para tu siguiente proyecto:**\n${projectIdeas}\n\n**Regla de oro:** Elige algo que te entusiasme, dividelo en tareas de 30 minutos, y terminalo antes de que sea perfecto.\n\nTe gusta alguna idea o prefieres algo distinto?`
    }

    return `**Ideas de proyectos por nivel**\n\n**Principiante (1-2 semanas):**\n* Calculadora con historial\n* Generador de contrasenas\n* Todo list en terminal\n* Juego de adivinar numero\n* Conversor de unidades\n\n**Intermedio (2-4 semanas):**\n* Blog personal estatico\n* API REST de biblioteca\n* Dashboard con datos del clima\n* Clon basico de Twitter\n\n**Avanzado (1-3 meses):**\n* App full-stack con autenticacion\n* E-commerce con carrito\n* Sistema de tareas colaborativo\n* Clon de Trello simplificado\n\n**La regla mas importante:** Elige algo que te entusiasme. Si no te motiva, lo vas a dejar.\n\n**Como empezar:**\n1. Elige una idea\n2. Dividela en tareas de 30 minutos\n3. Empieza hoy, no manana\n4. Terminalo antes de que sea perfecto\n\nQue nivel dirias que tienes?`
  }

  if (checkGoal) {
    if (hasStats) {
      const s = context!.stats
      return `**Para lograr tu objetivo**\n\nLlevas **${s.totalMinutes} minutos** estudiados, **${s.completedTopics} temas** completados en **${s.totalPaths} rutas**.\n\nLa distancia entre donde estas y tu objetivo depende de que tan ambicioso sea:\n\n* **Conseguir trabajo:** Necesitas minimo 3 proyectos completos en tu portafolio y habilidades solidas en un stack especifico.\n* **Aprender algo nuevo:** Con 30 min diarios, en 3 meses tendras base solida.\n* **Un proyecto especifico:** Dividelo en tecnologias y evalua cuales ya dominas y cuales te faltan.\n\n**Mi consejo:** No te compares con otros. Comparate con quien eras hace 3 meses. Si sabes mas, vas bien.\n\nCuentame mas de tu objetivo para darte una guia mas precisa.`
    }

    return `**Para alcanzar tu objetivo**\n\nEl camino siempre es el mismo:\n\n1. **Define el objetivo en concreto** (no "ser programador", sino "poder crear una web con login y base de datos")\n2. **Identifica las habilidades necesarias** (React + Node + SQL + autenticacion)\n3. **Evalua cuales ya tienes y cuales te faltan**\n4. **Prioriza** lo que te falta por orden de dependencia\n5. **Crea una ruta** con el Generador de rutas\n\n**El error mas comun:** No definir el objetivo con claridad. "Quiero aprender a programar" es muy vago. "Quiero poder crear una API REST con autenticacion" es concreto.\n\nCual es tu objetivo exactamente?`
  }

  if (m.includes('python')) {
    return `**Python - De principiante a practico**\n\nPython es tu mejor primer lenguaje por su sintaxis clara y su versatilidad (web, datos, IA, automatizacion).\n\n**Tu primer programa:**\n\`\`\`python\nnombre = input("Como te llamas? ")\nedad = int(input("Cuantos anos tienes? "))\nanios = 100 - edad\nprint(f"{nombre}, te quedan {anios} anos para llegar a 100!")\n\`\`\`\n\n**Orden de aprendizaje:**\n1. Variables, tipos, input/output\n2. Condicionales (if/elif/else)\n3. Bucles (for, while)\n4. Listas y diccionarios\n5. Funciones\n6. Archivos y excepciones\n\n**Mini-ejercicio para hoy:**\nEscribe un programa que pida 5 numeros, los guarde en una lista, y muestre el promedio. Intentalo antes de buscar la solucion.\n\n**Autores:** Busca a **SoyDalto** (fundamentos), **PildorasInformaticas** (intermedio), **freeCodeCamp** (proyectos)\n\nQuieres que genere una ruta personalizada?`
  }

  if (m.includes('javascript') || m.includes('js')) {
    return `**JavaScript - Domina la web**\n\nJS es el lenguaje de los navegadores y ahora tambien del servidor con Node.js.\n\n**Ejercicio practico:**\n\`\`\`javascript\nconst boton = document.createElement("button")\nboton.textContent = "Agregar item"\nboton.onclick = () => {\n  const item = document.createElement("li")\n  item.textContent = prompt("Nuevo item:")\n  document.getElementById("lista").appendChild(item)\n}\ndocument.body.appendChild(boton)\n\`\`\`\n\n**Orden recomendado:**\n1. Variables (let, const), tipos, funciones\n2. Arrays y metodos (map, filter, reduce)\n3. DOM y eventos\n4. Fetch y APIs\n5. Async/await\n\n**Mini-ejercicio:**\nCrea un contador en HTML con 3 botones: +1, -1, reset. Conectalo con JS.\n\n**Autores:** Busca a **midudev** (JS moderno y React), **SoyDalto** (fundamentos)\n\nNecesitas ayuda con algo en especifico?`
  }

  if (m.includes('react')) {
    return `**React - Tu primer componente**\n\nReact es una libreria para construir interfaces con componentes reutilizables.\n\n**Mini-app:**\n\`\`\`tsx\nfunction App() {\n  const [tareas, setTareas] = useState([])\n  const [input, setInput] = useState("")\n\n  const agregar = () => {\n    setTareas([...tareas, { id: Date.now(), texto: input, hecha: false }])\n    setInput("")\n  }\n\n  return (\n    <div>\n      <input value={input} onChange={e => setInput(e.target.value)} />\n      <button onClick={agregar}>Agregar</button>\n      <ul>{tareas.map(t => <li key={t.id}>{t.texto}</li>)}</ul>\n    </div>\n  )\n}\n\`\`\`\n\n**Prerequisitos:** HTML, CSS y JavaScript (arrays, funciones, destructuring).\n\n**Mini-ejercicio:**\nAgregale un checkbox para marcar tareas como hechas y un boton para borrar las completadas.\n\n**Autor:** Busca a **midudev**\n\nTienes experiencia con HTML/CSS/JS o necesitas empezar desde ahi?`
  }

  if (m.includes('html')) {
    return `**HTML5 - Estructura semantica**\n\nHTML define la estructura de tu pagina.\n\n**Estructura moderna:**\n\`\`\`html\n<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="UTF-8">\n  <title>Mi pagina</title>\n</head>\n<body>\n  <header>\n    <nav><a href="/">Inicio</a></nav>\n  </header>\n  <main>\n    <article>\n      <h1>Titulo</h1>\n      <p>Contenido.</p>\n    </article>\n  </main>\n  <footer>&copy; 2026</footer>\n</body>\n</html>\n\`\`\`\n\n**Mini-ejercicio:**\nCrea una pagina personal con header, main con 3 secciones, y footer.\n\n**Autores:** Busca a **SoyDalto**, **MDN**`
  }

  if (m.includes('css')) {
    return `**CSS - De float a Grid**\n\nEl layout moderno se hace con Flexbox y Grid.\n\n**Centrar algo:**\n\`\`\`css\n.contenedor {\n  display: grid;\n  place-items: center;\n  min-height: 100vh;\n}\n\`\`\`\n\n**Layout responsive:**\n\`\`\`css\ntarjetas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 1rem;\n}\n\`\`\`\n\n**Mini-ejercicio:**\nToma una pagina HTML y aplicale: header fijo, main con grid de 3 columnas que se vuelva 1 en movil.\n\n**Autores:** Busca a **midudev**, **CSS Tricks**`
  }

  if (m.includes('hola') || m.includes('buenas') || m.includes('hey')) {
    const greeting = hasStats
      ? `Hola de nuevo. Veo que llevas ${context!.stats.completedTopics} temas completados. Que quieres hacer hoy?`
      : 'Hola! Soy tu mentor de aprendizaje. Puedo ayudarte con programacion, tecnologia, o crear una ruta personalizada. Que quieres aprender?'
    return greeting
  }

  if (m.includes('gracias') || m.includes('thanks')) {
    return 'De nada. Recuerda: la constancia vence al talento. 15 minutos diarios > 5 horas un solo dia. Aqui estoy cuando me necesites.'
  }

  const topicTexts: Record<string, { response: string; author: string }> = {
    docker: { response: `**Docker - Tu entorno portatil**\n\nDocker empaqueta tu app con todo lo que necesita.\n\n**Comandos esenciales:**\n\`\`\`bash\ndocker run -it ubuntu bash\ndocker ps\ndocker build -t mi-app .\n\`\`\`\n\n**Mini-ejercicio:**\nCrea un Dockerfile para una app de Node.js.`, author: 'midudev' },
    sql: { response: `**SQL - Consulta tu base de datos**\n\n**Las 4 operaciones basicas:**\n\`\`\`sql\nCREATE TABLE usuarios (id INT, nombre TEXT);\nINSERT INTO usuarios VALUES (1, 'Ana');\nSELECT * FROM usuarios;\nUPDATE usuarios SET nombre = 'Ana Maria';\nDELETE FROM usuarios WHERE id = 1;\n\`\`\`\n\n**Mini-ejercicio:**\nCrea una tabla "productos" y haz consultas.`, author: 'PildorasInformaticas' },
    node: { response: `**Node.js - JS fuera del navegador**\n\n**Servidor HTTP minimo:**\n\`\`\`javascript\nconst http = require('http')\nconst server = http.createServer((req, res) => {\n  res.end(JSON.stringify({ mensaje: 'Hola' }))\n})\nserver.listen(3000)\n\`\`\`\n\n**Orden:** Modulos nativos > Express > Bases de datos > Auth`, author: 'midudev' },
    git: { response: `**Git - Control de versiones**\n\n**Flujo basico:**\n\`\`\`bash\ngit init\ngit add .\ngit commit -m "mensaje"\ngit log --oneline\n\`\`\`\n\n**Mini-ejercicio:**\nCrea un repo, haz 3 commits, crea una rama, fusea.`, author: 'SoyDalto' },
    typescript: { response: `**TypeScript - JS con tipos**\n\n\`\`\`typescript\nfunction suma(a: number, b: number): number {\n  return a + b\n}\n\`\`\`\n\n**Mini-ejercicio:**\nPasa una funcion JS a TS con interfaces.`, author: 'midudev' },
    ciberseguridad: { response: `**Ciberseguridad - Protege tu codigo**\n\n**Practicas esenciales:**\n- Nunca subas claves API a GitHub\n- Usa variables de entorno\n- Valida toda entrada del usuario\n- Usa HTTPS en produccion\n\n**Autores:** Busca a **HackerSploit**, **S4vitar**`, author: 'HackerSploit' },
    inteligencia: { response: `**Machine Learning - Conceptos clave**\n\n**Tipos:**\n- Supervisado: datos etiquetados\n- No supervisado: sin etiquetas\n- Reforzado: prueba y error\n\n**Pilas:** Python + scikit-learn, TensorFlow, Pandas\n\n**Autores:** Busca a **DotCSV**, **freeCodeCamp**`, author: 'DotCSV' },
    datos: { response: `**Analisis de datos con Python**\n\n\`\`\`python\nimport pandas as pd\ndf = pd.read_csv("ventas.csv")\ndf.head(10)\ndf.describe()\n\`\`\`\n\n**Mini-ejercicio:**\nDescarga un CSV y calcula estadisticas.`, author: 'freeCodeCamp' },
  }

  for (const [key, val] of Object.entries(topicTexts)) {
    if (m.includes(key)) return `${val.response}\n\n**Autor:** Busca a **${val.author}**\n\nQuieres que genere una ruta personalizada?`
  }

  const detected = extractTopic(msg)
  const topicLabel = detected || msg.trim().split(' ').filter(w => w.length > 3).slice(-3).join(' ') || 'programacion'

  return `**${topicLabel}**\n\n**Plan de aprendizaje:**\n\n1. **Fundamentos** (1-2 semanas): Busca "Curso de ${topicLabel} para principiantes" en YouTube\n2. **Practica** (2-4 semanas): 20 minutos diarios, repite ejercicios sin ver solucion\n3. **Proyecto** (4-6 semanas): Algo pequeno pero realista\n4. **Profundizacion**: Lee documentacion oficial, ensena a otros\n\n**Regla de oro:** La consistencia vence al talento. 20 minutos diarios durante 6 meses.\n\nQuieres que genere una ruta personalizada?`
}
