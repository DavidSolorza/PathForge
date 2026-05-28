import type { LearningPath, Category, ChatMessage } from '@shared/types'
import { CATEGORIES } from '@shared/types'
import { PathStorageService } from '@features/learning-path/services/PathStorageService'
import { UserStorageService } from '@features/profile/services/UserStorageService'
import { config } from '@core/config'
import { searchResources } from './curatedResources'

interface TopicDef { name: string; description?: string }

const SPECIFIC_TOPICS: Record<string, { stages: { name: string; topics: TopicDef[] }[] }> = {
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
  
  // Dynamic fallback generator to make it personalized even if not in database
  const cleanGoal = goal.replace(/aprender|aprende|quiero aprender|dominando/gi, '').trim()
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

async function generateAITopics(goal: string, context?: ChatMessage[]): Promise<{ stages: { name: string; topics: TopicDef[] }[] } | null> {
  const apiKey = localStorage.getItem('pathforge_gemini_api_key') || config.gemini.apiKey
  if (!apiKey) return null
  let contextText = ''
  if (context && context.length > 0) {
    const ctxMessages = context.filter((m) => m.role === 'user').slice(-6)
    if (ctxMessages.length > 0) {
      contextText = '\nContexto de la conversacion:\n' + ctxMessages.map((m) => `- ${m.content}`).join('\n')
    }
  }
  const prompt = `Genera ruta aprendizaje para "${goal}".${contextText}\n\nSOLO JSON: {"stages":[{"name":"...","topics":[{"name":"..."}]}]}. 4 stages, 5 topics c/u, nombres MUY especificos con ejemplos. Espanol. Sin markdown.`
  try {
    const res = await fetch(`${config.gemini.apiUrl}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
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
      description: topic.description || `Paso para ${stage.name.toLowerCase()}`,
      difficulty: (si === 0 ? 'easy' : si === 1 ? 'medium' : 'hard') as 'easy' | 'medium' | 'hard',
      completed: false,
      resources: [{
        id: `res_${Date.now()}_${si}_${ti}_0`,
        title: `Investiga sobre: ${topic.name}`,
        type: 'documentation' as const,
        url: '#',
      }],
    })),
  }))
}

function detectCategory(goal: string): { category: Category; difficulty: 'beginner' | 'intermediate' | 'advanced' } {
  const g = goal.toLowerCase()
  if (g.includes('python') || g.includes('program') || g.includes('javascript') || g.includes('desarrollo') || g.includes('progra') || g.includes('web') || g.includes('ia') || g.includes('datos') || g.includes('ciberseguridad') || g.includes('docker') || g.includes('react') || g.includes('node') || g.includes('css') || g.includes('html')) return { category: 'tecnologia', difficulty: 'beginner' }
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
  const g = goal.toLowerCase()
  if (g.startsWith('aprender ')) return 'Aprendiendo ' + goal.slice(9).trim()
  if (g.startsWith('aprende ')) return 'Aprendiendo ' + goal.slice(8).trim()
  if (g.startsWith('quiero aprender ')) return 'Aprendiendo ' + goal.slice(16).trim()
  return 'Dominando ' + goal.trim()
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

Usa **negritas** para conceptos clave. Incluye CODIGO si es programacion. NUNCA des URLs de videos. Recomienda autores/creadores YOUTUBEROS ("Busca a [nombre] en YouTube").

Termina con entusiasmo: "Quieres que genere una ruta de aprendizaje con el modo Generador de rutas, que profundice en algun paso, o que te haga un ejercicio/examen?"

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

  async generatePath(goal: string, context?: ChatMessage[]): Promise<LearningPath> {
    const { category, difficulty } = detectCategory(goal)
    const title = generateTitle(goal)
    const specific = findSpecificTopics(goal)
    let stagesData = specific
    if (!stagesData) {
      stagesData = await generateAITopics(goal, context) || GENERIC_TOPICS
    }
    const stages = stagesFromDefs(stagesData, goal)
    const path = PathStorageService.create({ title, goal, category, difficulty, stages })
    UserStorageService.updateStats((prev) => ({ ...prev, totalPaths: prev.totalPaths + 1, favoriteCategory: category }))
    UserStorageService.addActivity({ id: `act_${Date.now()}`, type: 'path_created', title: `Nueva ruta: ${title}`, pathName: title, timestamp: new Date().toISOString() })
    return path
  },

  async recommendNext(pathId: string): Promise<string> {
    const path = PathStorageService.getById(pathId)
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

    return { id: `chat_${Date.now()}`, role: 'assistant', content, timestamp: new Date().toISOString() }
  },
}

function getSmartFallback(msg: string): string {
  const m = msg.toLowerCase()

  if (m.includes('python')) {
    return `**Python - Guia rapida**\n\nPython es un lenguaje interpretado, de tipado dinamico. Se usa para web, datos, IA, automatizacion.\n\n**Variables:** \`nombre = "Ana"\`, \`edad = 25\` (no necesitas declarar tipo)\n**Listas:** \`numeros = [1, 2, 3]\`, \`numeros.append(4)\`\n**if/else:**\n\`\`\`python\nif edad >= 18:\n    print("Mayor de edad")\nelse:\n    print("Menor")\n\`\`\`\n**Bucle for:** \`for i in range(5): print(i)\`\n\n**Autores:** Busca a **SoyDalto** para empezar, **PildorasInformaticas** para intermedio, **freeCodeCamp** para proyectos.\n\nQuieres que genere una ruta de aprendizaje con el modo Generador de rutas, que profundice en algun paso, o que te haga un ejercicio/examen?`
  }

  if (m.includes('javascript') || m.includes('js')) {
    return `**JavaScript - Guia rapida**\n\nJS es el lenguaje de la web.\n\n**Variables:** \`let nombre = "Ana"\`, \`const edad = 25\`\n**Arrow function:** \`const suma = (a, b) => a + b\`\n**Arrays:**\n\`\`\`javascript\nconst nums = [1, 2, 3, 4, 5]\nconst pares = nums.filter(n => n % 2 === 0)\n\`\`\`\n\n**Autores:** Busca a **midudev** para JS moderno y React, **SoyDalto** para fundamentos.\n\nQue parte te interesa mas?`
  }

  if (m.includes('react')) {
    return `**React - Guia rapida**\n\n**Componente basico:**\n\`\`\`tsx\nfunction Saludo({ nombre }) {\n  return <h1>Hola {nombre}</h1>\n}\n\`\`\`\n**Estado:** \`const [contador, setContador] = useState(0)\`\n**Efectos:** \`useEffect(() => { ... }, [])\`\n\n**Autor:** Busca a **midudev**\n\nTienes experiencia con HTML/CSS/JS?`
  }

  if (m.includes('html')) {
    return `**HTML - Estructura basica:**\n\`\`\`html\n<!DOCTYPE html>\n<html>\n<head><title>Titulo</title></head>\n<body>\n  <h1>Titulo</h1>\n  <p>Parrafo</p>\n</body>\n</html>\n\`\`\`\n\n**Autores:** Busca a **SoyDalto** para HTML+CSS, **MDN** como referencia.`
  }

  if (m.includes('css')) {
    return `**CSS - Flexbox:**\n\`\`\`css\n.contenedor {\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  gap: 16px;\n}\n\`\`\`\n\n**Autores:** Busca a **midudev** para CSS moderno, **CSS Tricks** para guias.`
  }

  if (m.includes('hola') || m.includes('buenas') || m.includes('hey')) {
    return 'Hola! Soy tu mentor de aprendizaje. Puedo ayudarte con cualquier tema. Tambien puedes crear una ruta de aprendizaje usando el modo "Generador de rutas". Que quieres aprender hoy?'
  }

  if (m.includes('gracias') || m.includes('thanks')) {
    return 'De nada! Sigue adelante, la constancia es lo unico que importa. Si necesitas algo mas, aqui estoy.'
  }

  const topicTexts: Record<string, { response: string; author: string }> = {
    docker: { response: '**Docker:**\n- **Imagen:** plantilla con todo lo necesario\n- **Contenedor:** instancia en ejecucion\n- \`docker pull ubuntu\`\n- \`docker run -it ubuntu bash\`', author: 'midudev' },
    sql: { response: '**SQL - Consultas:**\n\`\`\`sql\nSELECT nombre, edad FROM usuarios WHERE edad > 18 ORDER BY edad DESC;\n\`\`\`', author: 'PildorasInformaticas' },
    node: { response: '**Node.js:** JS en el servidor. \`require("fs")\` para archivos, \`http.createServer()\` para servidor web.', author: 'midudev' },
    git: { response: '**Git:**\n\`\`\`\ngit init\ngit add .\ngit commit -m "msg"\ngit push\ngit pull\n\`\`\`', author: 'SoyDalto' },
    typescript: { response: '**TypeScript:**\n\`\`\`typescript\ninterface Usuario { nombre: string; edad: number }\nconst user: Usuario = { nombre: "Ana", edad: 25 }\n\`\`\`', author: 'midudev' },
    emprendimiento: { response: '**Lean Startup:** MVP -> Medir -> Aprender. Ciclo: Ideas -> Construir -> Medir -> Aprender.', author: 'Yunuen Perez' },
    productividad: { response: '**GTD:** 1) Captura todo, 2) Clarifica, 3) Organiza, 4) Revisa, 5) Ejecuta.', author: 'David Allen' },
    matematicas: { response: '**Regla de tres:** Si 5 cuestan $25, 8 cuestan x. x = (8 * 25) / 5 = $40', author: 'Matematicas profe Alex' },
    ciberseguridad: { response: '**Triangulo CIA:** Confidencialidad, Integridad, Disponibilidad.', author: 'HackerSploit' },
    inteligencia: { response: '**ML:** Supervisado (datos etiquetados), No supervisado (sin etiquetas), Reforzado (prueba y error).', author: 'DotCSV' },
    datos: { response: '**Pandas:** \`df = pd.read_csv("datos.csv")\`, \`df.head()\`, \`df.describe()\`, \`df.groupby("cat").mean()\`', author: 'freeCodeCamp' },
  }

  for (const [key, val] of Object.entries(topicTexts)) {
    if (m.includes(key)) return `${val.response}\n\n**Autor:** Busca a **${val.author}**\n\nQuieres que genere una ruta de aprendizaje con el modo Generador de rutas, que profundice en algun paso, o que te haga un ejercicio/examen?`
  }

  return `**${msg} - Guia de aprendizaje**\n\n**Paso 1 - Fundamentos:**\n* Busca en Google o YouTube "[tema] para principiantes"\n* Identifica los conceptos clave y la terminologia basica\n* Consigue las herramientas o materiales necesarios\n\n**Paso 2 - Practica guiada:**\n* Dedica 15-20 min diarios. La consistencia vence al talento\n* Sigue tutoriales paso a paso para principiantes\n* Anota errores comunes para evitarlos\n\n**Paso 3 - Investigacion y recursos:**\n* Busca comunidades del tema en Reddit, Discord, Telegram\n* Encuentra creadores de contenido especializados en ese tema\n* "Ensenar es aprender dos veces": explica lo que aprendes\n\n**Paso 4 - Autonomia:**\n* Propone tu propio proyecto o meta personal\n* Evalua tu progreso cada semana\n* Busca temas avanzados por tu cuenta\n\nQuieres que genere una ruta de aprendizaje con el modo Generador de rutas, que profundice en algun paso, o que te haga un ejercicio/examen?`
}
