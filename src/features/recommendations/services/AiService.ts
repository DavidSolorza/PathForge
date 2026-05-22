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
      { name: 'Listas, tuplas y diccionarios' },
      { name: 'Estructuras de control: if, elif, else' },
      { name: 'Bucles: for y while' },
      { name: 'Funciones: def, parametros y return' },
    ]},
    { name: 'Funciones y modulos', topics: [
      { name: 'Funciones lambda y list comprehension' },
      { name: 'Modulos y paquetes con pip' },
      { name: 'Manejo de archivos (txt, csv, json)' },
      { name: 'Manejo de excepciones (try, except)' },
      { name: 'Programacion orientada a objetos basica' },
    ]},
    { name: 'POO y proyectos', topics: [
      { name: 'Clases, herencia y polimorfismo' },
      { name: 'Metodos especiales y decoradores' },
      { name: 'Entornos virtuales y dependencias' },
      { name: 'Testing con pytest' },
      { name: 'Proyecto: CRUD con archivos' },
    ]},
    { name: 'Python avanzado', topics: [
      { name: 'APIs con FastAPI o Flask' },
      { name: 'Web scraping con BeautifulSoup' },
      { name: 'Bases de datos con SQLite' },
      { name: 'Decoradores avanzados' },
      { name: 'Proyecto final integrador' },
    ]},
  ]},
  javascript: { stages: [
    { name: 'Fundamentos de JS', topics: [
      { name: 'Variables (let, const) y tipos de datos' },
      { name: 'Funciones y arrow functions' },
      { name: 'Arrays y metodos (map, filter, reduce)' },
      { name: 'Objetos y destructuring' },
      { name: 'Template literals y spread operator' },
    ]},
    { name: 'DOM y eventos', topics: [
      { name: 'Seleccion de elementos del DOM' },
      { name: 'Eventos (click, submit, input)' },
      { name: 'Manipulacion de estilos' },
      { name: 'Formularios y validacion' },
      { name: 'Proyecto: todo app' },
    ]},
    { name: 'Asincronia y APIs', topics: [
      { name: 'Callbacks y promesas' },
      { name: 'Async/await' },
      { name: 'Fetch API' },
      { name: 'CRUD con REST API' },
      { name: 'Proyecto: app del clima' },
    ]},
    { name: 'JS moderno', topics: [
      { name: 'ES6 modules (import/export)' },
      { name: 'npm y package.json' },
      { name: 'Bundlers con Vite' },
      { name: 'Testing con Jest' },
      { name: 'Proyecto: SPA completa' },
    ]},
  ]},
  react: { stages: [
    { name: 'Fundamentos de React', topics: [
      { name: 'JSX y componentes funcionales' },
      { name: 'Props y composicion' },
      { name: 'Estado con useState' },
      { name: 'Renderizado condicional y listas' },
      { name: 'Eventos y formularios' },
    ]},
    { name: 'React intermedio', topics: [
      { name: 'useEffect y ciclo de vida' },
      { name: 'useRef y DOM' },
      { name: 'Context API' },
      { name: 'Custom hooks' },
      { name: 'React Router' },
    ]},
    { name: 'Estado global y APIs', topics: [
      { name: 'Zustand para estado global' },
      { name: 'React Query' },
      { name: 'Formularios con Hook Form' },
      { name: 'Autenticacion y rutas protegidas' },
      { name: 'Proyecto: CRUD completo' },
    ]},
    { name: 'Avanzado', topics: [
      { name: 'Performance (memo, useMemo, useCallback)' },
      { name: 'Testing con RTL' },
      { name: 'Lazy loading y Suspense' },
      { name: 'Deploy en Vercel' },
      { name: 'Proyecto full-stack' },
    ]},
  ]},
  diseño: { stages: [
    { name: 'Fundamentos de diseno', topics: [
      { name: 'Principios CRAP' },
      { name: 'Teoria del color' },
      { name: 'Tipografia' },
      { name: 'UX research basico' },
      { name: 'Wireframes' },
    ]},
    { name: 'Herramientas', topics: [
      { name: 'Figma: interfaz basica' },
      { name: 'Figma: componentes y auto layout' },
      { name: 'Diseno de interfaces moviles' },
      { name: 'Sistemas de diseno' },
      { name: 'Proyecto: app en Figma' },
    ]},
  ]},
}

const GENERIC_TOPICS: { stages: { name: string; topics: TopicDef[] }[] } = {
  stages: [
    { name: 'Cimientos: lo que necesitas saber', topics: [
      { name: 'Conceptos clave explicados desde cero' },
      { name: 'Terminologia esencial que usaras siempre' },
      { name: 'Herramientas y materiales para empezar' },
      { name: 'Ejemplo practico: tu primer contacto' },
      { name: 'Errores comunes al iniciar y como evitarlos' },
    ]},
    { name: 'Manos a la obra: practica guiada', topics: [
      { name: 'Ejercicios faciles para ganar confianza' },
      { name: 'Tecnica principal paso a paso' },
      { name: 'Ejercicios progresivos: sube el nivel' },
      { name: 'Aplica lo aprendido en un caso real' },
      { name: 'Revisa errores y corrige tu tecnica' },
    ]},
    { name: 'Explora por tu cuenta', topics: [
      { name: 'Reto personal: algo que te apasione' },
      { name: 'Busca recursos avanzados (ya sabes como)' },
      { name: 'Comunidades donde aprender y preguntar' },
      { name: 'Crea tu propio proyecto' },
      { name: 'Ensenale a alguien (la mejor forma de aprender)' },
    ]},
    { name: 'Dominio: vuelvete autonomo', topics: [
      { name: 'Proyecto final: demuestra lo que sabes' },
      { name: 'Evalua tu progreso y define metas' },
      { name: 'Contribuye a la comunidad del tema' },
      { name: 'Plan para seguir aprendiendo solo' },
      { name: 'Ensenar a otros: consolida tu conocimiento' },
    ]},
  ],
}

function findSpecificTopics(goal: string): { stages: { name: string; topics: TopicDef[] }[] } | null {
  const g = goal.toLowerCase()
  for (const [key, data] of Object.entries(SPECIFIC_TOPICS)) {
    if (g.includes(key) || key.includes(g)) return data
  }
  return null
}

async function generateAITopics(goal: string, context?: ChatMessage[]): Promise<{ stages: { name: string; topics: TopicDef[] }[] } | null> {
  const apiKey = config.gemini.apiKey
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
  const apiKey = config.gemini.apiKey
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
