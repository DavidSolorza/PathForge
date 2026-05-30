import type { LearningPath, Category, ChatMessage, Resource } from '@shared/types'
import { CATEGORIES } from '@shared/types'
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

async function generateAITopics(goal: string, context?: ChatMessage[], preferences?: import('@shared/types').PathPreferences): Promise<{ stages: { name: string; topics: TopicDef[] }[] } | null> {
  const apiKey = localStorage.getItem('pathforge_gemini_api_key') || config.gemini.apiKey
  if (!apiKey) return null
  let contextText = ''
  if (context && context.length > 0) {
    const ctxMessages = context.filter((m) => m.role === 'user').slice(-6)
    if (ctxMessages.length > 0) {
      contextText = '\nContexto de la conversacion:\n' + ctxMessages.map((m) => `- ${m.content}`).join('\n')
    }
  }

  let preferencesText = ''
  if (preferences) {
    const hoursLabel = { '<3': 'menos de 3 horas', '3-5': '3-5 horas', '5-10': '5-10 horas', '10+': 'mas de 10 horas' }
    const methodLabel = { 'lectura': 'leer y documentacion', 'video': 'videos y tutoriales', 'practica': 'practica directa con proyectos', 'mixto': 'mixto (todo)' }
    const levelLabel = { 'beginner': 'principiante', 'intermediate': 'intermedio', 'advanced': 'avanzado' }
    const projectLabel = { 'cortos': 'proyectos cortos (1-2 dias)', 'medianos': 'proyectos medianos (1 semana)', 'largos': 'proyectos largos (2+ semanas)' }
    preferencesText = `\n\nPREFERENCIAS DEL USUARIO:\n- Tiempo semanal: ${hoursLabel[preferences.weeklyHours]}\n- Metodo preferido: ${methodLabel[preferences.learningMethod]}\n- Nivel actual: ${levelLabel[preferences.currentLevel]}\n- Proyectos: ${projectLabel[preferences.projectPreference]}`
  }

  const prompt = `Genera ruta aprendizaje para "${goal}".${contextText}${preferencesText}\n\nREGLAS:\n- SOLO JSON: {"stages":[{"name":"...","topics":[{"name":"...","content":"...","resources":[{"title":"...","url":"real_url","type":"documentation"}]]}]}\n- 4 stages, 5 topics c/u\n- Cada topic debe tener "content" con una mini-clase explicativa (3-5 lineas con codigo si aplica)\n- "resources" debe incluir URLs reales a documentacion oficial (MDN, python.org, react.dev, etc.)\n- Nombres MUY especificos con ejemplos practicos\n- ADAPTATE a las preferencias del usuario (tiempo, metodo, nivel, tipo de proyectos)\n- Espanol. Sin markdown alrededor del JSON.`

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

function detectCategory(goal: string): { category: Category; difficulty: 'beginner' | 'intermediate' | 'advanced' } {
  const g = goal.toLowerCase()
  if (g.includes('python') || g.includes('program') || g.includes('javascript') || g.includes('java') || g.includes('desarrollo') || g.includes('progra') || g.includes('web') || g.includes('ia') || g.includes('datos') || g.includes('ciberseguridad') || g.includes('docker') || g.includes('react') || g.includes('node') || g.includes('css') || g.includes('html')) return { category: 'tecnologia', difficulty: 'beginner' }
  if (g.includes('ingl') || g.includes('franc') || g.includes('alem') || g.includes('idioma')) return { category: 'idiomas', difficulty: 'beginner' }
  if (g.includes('dise') || g.includes('ux') || g.includes('ui') || g.includes('figma')) return { category: 'diseno', difficulty: 'beginner' }
  if (g.includes('guitar') || g.includes('piano') || g.includes('music') || g.includes('canto')) return { category: 'musica', difficulty: 'beginner' }
  if (g.includes('foto') || g.includes('camar')) return { category: 'fotografia', difficulty: 'beginner' }
  if (g.includes('cocin') || g.includes('gastron')) return { category: 'cocina', difficulty: 'beginner' }
  if (g.includes('market') || g.includes('emprend') || g.includes('negocio')) return { category: 'negocios', difficulty: 'beginner' }
  if (g.includes('dibuj') || g.includes('pint') || g.includes('arte')) return { category: 'arte', difficulty: 'beginner' }
  if (g.includes('matem') || g.includes('fisic') || g.includes('quimi') || g.includes('ciencia')) return { category: 'ciencias', difficulty: 'beginner' }
  if (g.includes('produc') || g.includes('organi') || g.includes('tiempo')) return { category: 'productividad', difficulty: 'beginner' }
  return { category: 'otros', difficulty: 'beginner' }
}

function generateTitle(goal: string): string {
  const clean = goal
    .replace(/^(quiero\s+)?aprender\s+|^(quiero\s+)?aprende\s+|^(quiero\s+)?dominando\s+|^quiero\s+|^aprender\s+|^aprende\s+|^dominando\s+/gi, '')
    .replace(/^para\s+|^como\s+|^desde\s+cero\s*/gi, '')
    .replace(/desde cero$/gi, '')
    .trim()
  const topic = clean || goal.trim()
  return topic.charAt(0).toUpperCase() + topic.slice(1)
}

const SYSTEM_PROMPT = `Eres un PROFESOR UNIVERSAL experto en ABSOLUTAMENTE TODAS las areas del conocimiento. Eres el corazon de PathForge AI, una plataforma inteligente que genera rutas personalizadas de aprendizaje y recomienda nuevas habilidades segun el avance del usuario. Hablas espanol. Eres paciente, claro, didactico, profesional, adaptable, amigable y preciso.

## Areas que dominas (Programacion y Tecnologia):
1. **Desarrollo Web** (HTML, CSS, JavaScript, TypeScript, React, Next.js, Vue, Angular, Tailwind CSS)
2. **Backend** (Node.js, Express, NestJS, APIs REST, GraphQL)
3. **Bases de datos** (SQL, PostgreSQL, MySQL, MongoDB, Supabase, Firebase)
4. **DevOps** (Docker, Linux, CI/CD, GitHub Actions, Deploy, Vercel, Railway, Render)
5. **Desarrollo Movil** (React Native, Expo, Flutter)
6. **Inteligencia Artificial** (Python, Machine Learning, Deep Learning, OpenAI, NLP, Vision)
7. **Ciberseguridad** (Redes, OWASP, Pentesting, Criptografia, Kali Linux, Wireshark)
8. **Diseno UX/UI** (Figma, Diseno responsive, Branding, Psicologia del color, Dashboards)
9. **Matematicas y Ciencias** (Algebra, Calculo, Estadistica, Logica, Fisica computacional)
10. **Herramientas digitales** (Excel, Notion, Google Drive, Git, Linux)
11. **Arquitectura y Patrones** (Clean Code, SOLID, MVC, Microservicios, Clean Architecture)
12. **Testing** (Jest, Cypress, RTL, Pruebas unitarias, E2E)

## Capacidades pedagogicas:
- Explica desde nivel BASICO hasta AVANZADO
- Adaptate a NINOS o ADULTOS
- Resuelve dudas PASO A PASO
- Genera EJERCICIOS y QUIZZES
- Ensena con EJEMPLOS concretos
- Detecta ERRORES comunes y explicelos
- Recomienda RECURSOS y autores para buscar
- Crea PLANES DE ESTUDIO personalizados
- SIMULA EXAMENES y entrevistas
- HAZ RESUMENES y mapas mentales

## Funciones analiticas clave (PathForge AI):
El usuario puede hacerte estas preguntas ESPECIFICAS. Responde analizando su progreso, proyectos y habilidades:

**"Que deberia aprender despues?"** - Analiza su ruta actual, mira que temas ha completado y recomienda el siguiente paso logico. Revisa proyectos y habilidades registradas.

**"Estoy listo para un proyecto?"** - Evalua si tiene los conocimientos suficientes. Pregunta que proyecto quiere hacer, analiza los prerrequisitos y determina si esta preparado o que le falta.

**"Que me falta para alcanzar mi objetivo?"** - El usuario describe su meta (ej: "ser desarrollador full stack"). Comparamos su estado actual con el objetivo y listamos las brechas (habilidades faltantes, temas no cubiertos).

**"Crea una ruta de aprendizaje para X"** - Genera un plan completo paso a paso desde cero hasta dominio.

## Modos de respuesta:
Segun lo que pida el usuario, adapta tu respuesta:
- **Modo profesor:** explicacion completa y estructurada
- **Modo examen:** preguntas para evaluar conocimiento
- **Modo practica:** ejercicios para resolver
- **Modo explicacion sencilla:** para ninos o principiantes absolutos
- **Modo experto:** respuestas tecnicas y profundas
- **Modo resumido:** solo lo esencial

## Tipos de preguntas que debes soportar:
"Como funciona?", "Explicame paso a paso", "Resuelvelo", "Corrige mi error", "Ensename desde cero", "Hazme ejercicios", "Evaluame", "Comparte ejemplos", "Haz un resumen", "Crea un proyecto", "Ayudame a estudiar", "Dame retos", "Simula un examen"

## Regla de oro: PRERREQUISITOS primero
Cuando el usuario diga "quiero aprender X", tu primera reaccion debe ser:
1. Identifica QUE NECESITA SABER ANTES de empezar X
2. Explica esos prerrequisitos de forma breve y clara
3. Solo entonces estructura el plan completo

Ejemplo: si dice "derivadas", primero explica que necesita saber funciones y limites. Si dice "React", primero HTML/CSS/JS. Si dice "guitarra", partes basicas. No lo mandes a buscar hasta que entienda los fundamentos.

## Estructura de respuesta cuando pide un tema nuevo:
**TEMA:** [nombre]
**NIVEL:** [principiante / intermedio / avanzado]
**PRERREQUISITOS:** [lo que debe saber antes, explicado breve]

**Paso 1 - Cimientos: lo que necesitas saber** - Conceptos clave, terminologia, ejemplo practico, errores comunes al empezar
**Paso 2 - Manos a la obra: practica guiada** - Primeros ejercicios, tecnica paso a paso, aplicacion real
**Paso 3 - Explora por tu cuenta** - Reto personal, recursos avanzados, comunidades, ensenar a otros
**Paso 4 - Dominio: vuelvete autonomo** - Proyecto final, evaluacion, contribuir, plan de continuidad

Usa **negritas** para conceptos clave. Incluye CODIGO si es programacion. NUNCA des URLs de videos. Recomienda autores/creadores YOUTUBEROS ("Busca a [nombre] en YouTube"). NUNCA uses emojis.

Termina con: "Quieres que genere una ruta de aprendizaje con el modo Generador de rutas, que profundice en algun paso, o que te haga un ejercicio/examen?"

Manten el contexto de la conversacion.`

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

  async generatePath(goal: string, context?: ChatMessage[], preferences?: import('@shared/types').PathPreferences): Promise<LearningPath> {
    const { category, difficulty } = detectCategory(goal)
    const title = generateTitle(goal)
    const specific = findSpecificTopics(goal)
    let stagesData = specific
    if (!stagesData) {
      stagesData = await generateAITopics(goal, context, preferences) || GENERIC_TOPICS
    }
    const stages = stagesFromDefs(stagesData, goal)
    const path = PathStorageService.create({ title, goal, category, difficulty, stages })
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

  async chat(userMessage: string, history?: ChatMessage[]): Promise<ChatMessage> {
    let content = ''
    const allMessages = history ? [...history, { role: 'user', content: userMessage }] : [{ role: 'user', content: userMessage }]

    try {
      content = await callGemini(SYSTEM_PROMPT, allMessages.map((m) => ({ role: m.role, content: m.content })))
    } catch {
      content = getSmartFallback(userMessage)
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

function getSmartFallback(msg: string): string {
  const m = msg.toLowerCase()

  // === CHECK-INS: progreso, readiness, proyectos ===
  const checkProgress = m.includes('progreso') || m.includes('avance') || m.includes('como voy') || m.includes('cuanto llevo')
  const checkReadiness = m.includes('listo') || m.includes('preparado') || m.includes('suficiente') || m.includes('puedo empezar')
  const checkProject = m.includes('proyecto') || m.includes('poryecto') || m.includes('project')
  const checkNext = m.includes('que sigue') || m.includes('siguiente') || m.includes('despues') || m.includes('next')
  const checkAnalyze = m.includes('analiza') || m.includes('analisis') || m.includes('evaluame') || m.includes('evaluacion')

  if (checkAnalyze || checkProgress || (checkReadiness && checkProject) || (checkProgress && checkProject)) {
    return `**Analisis de progreso - Estas listo para un proyecto?**\n\nPara saber si estas listo, revisa estas 3 areas:\n\n**1. Conceptos fundamentales:**\n- Puedes explicar lo que has aprendido sin mirar tutoriales?\n- Entiendes el "por que" detras de cada linea, no solo el "como"?\n- Has escrito el mismo codigo de memoria, sin copiar y pegar?\n\n**2. Resolucion de problemas:**\n- Cuando te sale un error, sabes por donde empezar a depurar?\n- Has resuelto al menos 5 ejercicios por tu cuenta (sin ver solucion)?\n- Sabes usar Google/documentacion para buscar lo que no sabes?\n\n**3. Autonomia:**\n- Puedes empezar un archivo en blanco y escribir codigo util?\n- Has personalizado o modificado ejemplos existentes?\n- Sabes usar Git para guardar tu progreso?\n\n**Como saber si estas listo:**\n* Si respondiste "si" a la mayoria, estas listo para un proyecto guiado (tipo tutorial con tu propio twist)\n* Si respondiste "si" a todo, lanzate a un proyecto propio\n* Si respondiste "no" en varias, dedica 1-2 semanas mas a hacer ejercicios especificos\n\n**Mi recomendacion:** El mejor momento para empezar un proyecto es cuando tienes miedo de no estar listo. El proyecto te va a ensenar lo que los tutoriales no pueden. Empieza con algo pequeno (que puedas terminar en 1 semana) y ve creciendo.\n\nQuieres que te recomiende ideas de proyectos para empezar?`
  }

  if (checkReadiness) {
    return `**Evaluacion de preparacion**\n\nNo importa en que tema estes, estas son las senales de que puedes avanzar al siguiente nivel:\n\n**Senales verdes (sigue adelante):**\n- Explicas los conceptos sin dudar\n- Los ejercicios faciles te aburren\n- Cometes errores nuevos (no los mismos de siempre)\n- Sabes lo que NO sabes y puedes buscarlo\n\n**Senales amarillas (practica mas):**\n- Necesitas tutorial abierto para escribir codigo\n- Los errores te paralizan\n- Copias y pegas sin entender del todo\n\n**Senales rojas (vuelve a lo basico):**\n- No puedes explicar un ejemplo simple con tus palabras\n- Saltaste conceptos por ir muy rapido\n- Llevas mas de 2 semanas en el mismo tema sin avanzar\n\n**Ejercicio de autoevaluacion:** Intenta hacer un ejercicio de la categoria anterior sin ayuda. Si puedes, avanza. Si no puedes, repasa.\n\nNecesitas ayuda con algo en concreto?`
  }

  if (checkNext) {
    return `**Que sigue en tu aprendizaje?**\n\nEl camino tipico de aprendizaje en programacion es:\n\n**Fase 1 - Fundamentos (1-2 meses):**\n* Sintaxis basica: variables, condicionales, bucles\n* Estructuras de datos: arrays/lista, objetos/diccionarios\n* Funciones y scope\n\n**Fase 2 - Herramientas (2-3 meses):**\n* Git y GitHub\n* Terminal y linea de comandos\n* Debugging basico\n\n**Fase 3 - Proyectos guiados (3-6 meses):**\n* 5-10 proyectos pequenos siguiendo tutoriales\n* Cada proyecto debe agregar algo nuevo que no estaba en el tutorial\n\n**Fase 4 - Proyecto propio (6+ meses):**\n* Idea propia, por pequena que sea\n* Publica en GitHub\n* Comparte en comunidades para feedback\n\n**Fase 5 - Especializacion:**\n* Elige un area: frontend, backend, datos, mobile, etc.\n* Aprende el stack especifico de esa area\n\n**Mi consejo:** No te apresures a llegar a Fase 5. La mayoria abandona porque quiere correr antes de caminar. Disfruta cada fase.\n\nEn que fase dirias que estas ahorita?`
  }

  if (checkProject) {
    return `**Ideas de proyectos por nivel**\n\n**Principiante (1-2 semanas cada uno):**\n* Calculadora con historial de operaciones\n* Generador de contrasenas seguras\n* Lista de tareas (todo list) en terminal\n* Juego de adivinar un numero\n* Conversor de unidades (temperatura, moneda, distancia)\n\n**Intermedio (2-4 semanas):**\n* Blog personal con pagina estatica\n* API REST de una biblioteca (libros, autores, prestamos)\n* Dashboard con datos de clima (consumiendo API gratuita)\n* Clon basico de Twitter (publicar, seguir, timeline)\n\n**Avanzado (1-3 meses):**\n* App full-stack con autenticacion\n* E-commerce con carrito de compras\n* Sistema de gestion de tareas colaborativo\n* Clon de Trello/Notion simplificado\n\n**Regla de oro para proyectos:**\n1. Elige algo que te entusiasme (vas a pasar MUCHAS horas ahi)\n2. Dividelo en tareas de 30 minutos maximo\n3. Termina antes de que sea perfecto (el proyecto perfecto no existe)\n4. Muestralo aunque este incompleto\n\nQue nivel dirias que tienes?`
  }

  if (m.includes('python')) {
    return `**Python - De principiante a practico**\n\nPython es tu mejor primer lenguaje por su sintaxis clara y su versatilidad (web, datos, IA, automatizacion).\n\n**Tu primer programa:**\n\`\`\`python\n# Pide tu nombre y saluda\nnombre = input("Como te llamas? ")\nedad = int(input("Cuantos anos tienes? "))\nanios = 100 - edad\nprint(f"{nombre}, te quedan {anios} anos para llegar a 100!")\n\`\`\`\n\n**Orden de aprendizaje:**\n1. Variables, tipos, input/output\n2. Condicionales (if/elif/else)\n3. Bucles (for, while)\n4. Listas y diccionarios\n5. Funciones\n6. Archivos y excepciones\n\n**Mini-ejercicio para hoy:**\nEscribe un programa que pida 5 numeros, los guarde en una lista, y muestre el promedio. Intentalo antes de buscar la solucion!\n\n**Autores:** Busca a **SoyDalto** (fundamentos), **PildorasInformaticas** (intermedio), **freeCodeCamp** (proyectos)\n\nQuieres que genere una ruta personalizada con el Generador de rutas?`
  }

  if (m.includes('javascript') || m.includes('js')) {
    return `**JavaScript - Domina la web**\n\nJS es el lenguaje de los navegadores y ahora tambien del servidor con Node.js.\n\n**Ejercicio practico - Manipular el DOM:**\n\`\`\`javascript\n// Crea una lista interactiva\nconst boton = document.createElement("button")\nboton.textContent = "Agregar item"\nboton.onclick = () => {\n  const item = document.createElement("li")\n  item.textContent = prompt("Nuevo item:")\n  document.getElementById("lista").appendChild(item)\n}\ndocument.body.appendChild(boton)\n\`\`\`\n\n**Orden recomendado:**\n1. Variables (let, const), tipos, funciones\n2. Arrays y metodos (map, filter, reduce)\n3. DOM y eventos\n4. Fetch y APIs\n5. Async/await\n\n**Mini-ejercicio:**\nCrea un contador en HTML con 3 botones: +1, -1, reset. Conectalo con JS. Cuando llegue a 10, muestra un mensaje.\n\n**Autores:** Busca a **midudev** (JS moderno y React), **SoyDalto** (fundamentos)\n\nNecesitas ayuda con algo en especifico?`
  }

  if (m.includes('react')) {
    return `**React - Tu primer componente**\n\nReact es una libreria para construir interfaces con componentes reutilizables.\n\n**Mini-app: Lista de tareas**\n\`\`\`tsx\nfunction App() {\n  const [tareas, setTareas] = useState([])\n  const [input, setInput] = useState("")\n\n  const agregar = () => {\n    setTareas([...tareas, { id: Date.now(), texto: input, hecha: false }])\n    setInput("")\n  }\n\n  return (\n    <div>\n      <input value={input} onChange={e => setInput(e.target.value)} />\n      <button onClick={agregar}>Agregar</button>\n      <ul>{tareas.map(t => <li key={t.id}>{t.texto}</li>)}</ul>\n    </div>\n  )\n}\n\`\`\`\n\n**Prerequisitos:** HTML, CSS y JavaScript (arrays, funciones, destructuring). Sin eso, React se vuelve confuso.\n**Orden:** JS basico > JS moderno (ES6+) > React\n\n**Mini-ejercicio:**\nToma el ejemplo de arriba, agregale un checkbox para marcar tareas como hechas, y un boton para borrar las completadas.\n\n**Autor:** Busca a **midudev**\n\nTienes experiencia con HTML/CSS/JS o necesitas empezar desde ahi?`
  }

  if (m.includes('html')) {
    return `**HTML5 - Estructura semantica**\n\nHTML no es un lenguaje de programacion, es de marcado. Define la estructura de tu pagina.\n\n**Estructura moderna:**\n\`\`\`html\n<!DOCTYPE html>\n<html lang="es">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Mi pagina</title>\n</head>\n<body>\n  <header>\n    <nav><a href="/">Inicio</a> <a href="/blog">Blog</a></nav>\n  </header>\n  <main>\n    <article>\n      <h1>Titulo del articulo</h1>\n      <p>Contenido principal aqui.</p>\n    </article>\n    <aside>Barra lateral</aside>\n  </main>\n  <footer>&copy; 2026</footer>\n</body>\n</html>\n\`\`\`\n\n**Mini-ejercicio:**\nCrea una pagina personal con: header con tu nombre, main con 3 secciones (sobre mi, proyectos, contacto), y footer. Usa etiquetas semanticas.\n\n**Autores:** Busca a **SoyDalto** (HTML+CSS), **MDN** (referencia oficial)`
  }

  if (m.includes('css')) {
    return `**CSS - De float a Grid**\n\nCSS controla la apariencia. El layout moderno se hace con Flexbox y Grid.\n\n**Centrar algo (la pregunta mas comun):**\n\`\`\`css\n.contenedor {\n  display: grid;\n  place-items: center;\n  min-height: 100vh;\n}\n\`\`\`\n\n**Layout responsive con Grid:**\n\`\`\`css\ntarjetas {\n  display: grid;\n  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));\n  gap: 1rem;\n  padding: 1rem;\n}\n\`\`\`\n\n**Mini-ejercicio:**\nToma una pagina HTML simple y aplicale: un header fijo arriba, main con grid de 3 columnas que se vuelva 1 en movil, colores con variables CSS.\n\n**Autores:** Busca a **midudev** (CSS moderno), **CSS Tricks** (guias completas)`
  }

  if (m.includes('hola') || m.includes('buenas') || m.includes('hey')) {
    return 'Hola! Soy tu mentor de aprendizaje. Puedo ayudarte con programacion y tecnologia. Tambien puedes crear una ruta de aprendizaje personalizada con el Generador de rutas. Que quieres aprender hoy?'
  }

  if (m.includes('gracias') || m.includes('thanks')) {
    return 'De nada! Recuerda: la constancia vence al talento. 15 minutos diarios > 5 horas un solo dia. Si necesitas algo mas, aqui estoy.'
  }

  const topicTexts: Record<string, { response: string; author: string }> = {
    docker: { response: `**Docker - Tu entorno portatil**\n\nDocker empaqueta tu app con todo lo que necesita para funcionar en cualquier maquina.\n\n**Comandos esenciales:**\n\`\`\`bash\n# Descargar y ejecutar Ubuntu interactivo\ndocker run -it ubuntu bash\n\n# Listar contenedores activos\ndocker ps\n\n# Construir desde Dockerfile\ndocker build -t mi-app .\n\`\`\`\n\n**Mini-ejercicio:**\nCrea un Dockerfile para una app de Node.js que: use node:18, copie package.json, ejecute npm install, exponga el puerto 3000.`, author: 'midudev' },
    sql: { response: `**SQL - Consulta tu base de datos**\n\nSQL te permite preguntarle cosas a una base de datos relacional.\n\n**Las 4 operaciones basicas (CRUD):**\n\`\`\`sql\n-- Crear tabla\nCREATE TABLE usuarios (id INT, nombre TEXT, edad INT);\n\n-- Insertar\nINSERT INTO usuarios VALUES (1, 'Ana', 25);\n\n-- Consultar\nSELECT nombre, edad FROM usuarios WHERE edad > 18;\n\n-- Actualizar\nUPDATE usuarios SET edad = 26 WHERE nombre = 'Ana';\n\n-- Eliminar\nDELETE FROM usuarios WHERE id = 1;\n\`\`\`\n\n**Mini-ejercicio:**\nCrea una tabla "productos" con id, nombre, precio, stock. Inserta 5 productos. Consulta los que cuestan menos de $100.`, author: 'PildorasInformaticas' },
    node: { response: `**Node.js - JS fuera del navegador**\n\nNode te permite escribir servidores, APIs, y herramientas con JavaScript.\n\n**Servidor HTTP minimo:**\n\`\`\`javascript\nconst http = require('http')\nconst server = http.createServer((req, res) => {\n  res.writeHead(200, { 'Content-Type': 'application/json' })\n  res.end(JSON.stringify({ mensaje: 'Hola mundo' }))\n})\nserver.listen(3000, () => console.log('Servidor en http://localhost:3000'))\n\`\`\`\n\n**Orden de aprendizaje:** Modulos nativos (fs, path, http) > Express > Bases de datos > Autenticacion\n\n**Mini-ejercicio:**\nCrea un servidor con Express que tenga 3 rutas: GET / (html simple), GET /api/usuarios (JSON con array), POST /api/usuarios (recibe JSON y responde "creado").`, author: 'midudev' },
    git: { response: `**Git - Control de versiones**\n\nGit registra cada cambio de tu codigo para que puedas volver atras, colaborar, y tener respaldo.\n\n**Flujo basico diario:**\n\`\`\`bash\ngit init\ngit add .\ngit commit -m "mensaje descriptivo"\ngit log --oneline\ngit checkout -b nueva-funcionalidad\n# ... trabajas ...\ngit add . && git commit -m "agrega login"\ngit checkout main\ngit merge nueva-funcionalidad\n\`\`\`\n\n**Mini-ejercicio:**\nCrea un repo local, haz 3 commits, crea una rama "experimento", haz 2 commits ahi, vuelve a main y fusea la rama.`, author: 'SoyDalto' },
    typescript: { response: `**TypeScript - JS con superpoderes**\n\nTS anade tipos a JS para evitar errores antes de ejecutar.\n\n**Diferencia clave:**\n\`\`\`typescript\n// JS - error en ejecucion\nfunction suma(a, b) { return a + b }\nsuma(5, "hola") // "5hola"\n\n// TS - error en compilacion\nfunction suma(a: number, b: number): number {\n  return a + b\n}\nsuma(5, "hola") // Error: string no es number\n\`\`\`\n\n**Mini-ejercicio:**\nToma una funcion JS que maneje un array de usuarios (nombre, edad, email) y pasala a TS con interfaces.`, author: 'midudev' },
    ciberseguridad: { response: `**Ciberseguridad - Protege tu codigo**\n\n**Triangulo CIA:** Confidencialidad, Integridad, Disponibilidad.\n\n**Practicas esenciales:**\n- Nunca subas claves API ni tokens a GitHub\n- Usa variables de entorno (.env)\n- Valida y sanitiza toda entrada del usuario (SQL injection, XSS)\n- Usa HTTPS en produccion\n- Contrasenas: hash con bcrypt, nunca texto plano\n\n**Autores:** Busca a **HackerSploit**, **S4vitar**`, author: 'HackerSploit' },
    inteligencia: { response: `**Machine Learning - Conceptos clave**\n\n**Tipos de aprendizaje:**\n- **Supervisado:** datos etiquetados (clasificacion, regresion)\n- **No supervisado:** sin etiquetas (clustering, asociacion)\n- **Reforzado:** prueba y error con recompensas\n\n**Pilas tecnologicas:**\n- Python + scikit-learn para empezar\n- TensorFlow / PyTorch para deep learning\n- Pandas + NumPy para manipulacion de datos\n\n**Autores:** Busca a **DotCSV** (conceptos), **freeCodeCamp** (practico)`, author: 'DotCSV' },
    datos: { response: `**Analisis de datos con Python**\n\n**Pandas - Operaciones diarias:**\n\`\`\`python\nimport pandas as pd\n\ndf = pd.read_csv("ventas.csv")\ndf.head(10)           # primeras filas\ndf.describe()          # estadisticas\ndf.groupby("ciudad").sum()  # agrupar\ndf[df["monto"] > 100]  # filtrar\n\`\`\`\n\n**Mini-ejercicio:**\nDescarga un CSV de ventas (o crea uno), calcula: total por mes, producto mas vendido, promedio por cliente.`, author: 'freeCodeCamp' },
  }

  for (const [key, val] of Object.entries(topicTexts)) {
    if (m.includes(key)) return `${val.response}\n\n**Autor:** Busca a **${val.author}**\n\nQuieres que genere una ruta de aprendizaje personalizada con el Generador de rutas?`
  }

  const detected = extractTopic(msg)
  const topicLabel = detected || msg.trim().split(' ').filter(w => w.length > 3).slice(-3).join(' ') || 'programacion'

  return `**${topicLabel} - Ruta de aprendizaje recomendada**\n\n**Paso 1 - Fundamentos (1-2 semanas):**\n* Busca en YouTube "Curso de ${topicLabel} para principiantes"\n* Identifica los conceptos clave: que es, para que sirve, las herramientas necesarias\n* Instala y configura tu entorno de trabajo\n* Completa 3 ejercicios basicos en tu primera semana\n\n**Paso 2 - Practica dirigida (2-4 semanas):**\n* Dedica 20 minutos diarios. Mejor poco cada dia que mucho un solo dia\n* Sigue tutoriales paso a paso y REPITE cada ejercicio sin mirar la solucion\n* Crea un documento con errores comunes y como solucionarlos\n* Explica cada concepto en voz alta como si se lo ensenaras a alguien\n\n**Paso 3 - Proyecto personal (4-6 semanas):**\n* Proponte un proyecto pequeno pero realista sobre ${topicLabel}\n* Dividelo en tareas de 30 minutos cada una\n* Usa Git desde el dia 1 (aunque estes solo)\n* Comparte tu progreso en comunidades del tema\n\n**Paso 4 - Profundizacion:**\n* Compara ${topicLabel} con tecnologias similares\n* Lee documentacion oficial, no solo tutoriales\n* Ensenale a alguien lo que aprendiste\n\n**Regla de oro:** La consistencia vence al talento. 20 minutos diarios durante 6 meses te convierten en alguien competente.\n\nQuieres que genere una ruta personalizada con el Generador de rutas?`
}
