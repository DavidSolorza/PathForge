export interface CuratedResource {
  title: string
  url?: string
  author?: string
  type: 'documentation' | 'practice' | 'course' | 'book' | 'platform'
  lang: 'es' | 'en'
  text?: string
}

const RESOURCES: Record<string, CuratedResource[]> = {
  python: [
    { title: 'Python desde cero', author: 'SoyDalto', type: 'course', lang: 'es', text: '**Variables y tipos:** En Python no necesitas declarar el tipo. `nombre = "Ana"` crea un string automaticamente. Los tipos basicos son int, float, str, bool, list, dict.' },
    { title: 'Documentacion oficial Python', url: 'https://docs.python.org/es/3/tutorial/', type: 'documentation', lang: 'es' },
    { title: 'Practica Python', url: 'https://www.w3schools.com/python/', type: 'practice', lang: 'en' },
    { title: 'Python intermedio', author: 'PildorasInformaticas', type: 'course', lang: 'es', text: '**List comprehension:** `[x*2 for x in range(10)]` genera una lista con los pares del 0 al 18 en una sola linea. Es la forma pythonica de transformar datos.' },
    { title: 'Python avanzado y proyectos', author: 'freeCodeCamp', type: 'course', lang: 'en' },
  ],
  javascript: [
    { title: 'JavaScript moderno', author: 'midudev', type: 'course', lang: 'es', text: '**Arrow functions:** `const suma = (a, b) => a + b`. Mas cortas que `function`, no tienen su propio `this`, ideales para callbacks. Usalas siempre que puedas.' },
    { title: 'MDN JavaScript Guide', url: 'https://developer.mozilla.org/es/docs/Web/JavaScript/Guide', type: 'documentation', lang: 'es' },
    { title: 'JavaScript.info en espanol', url: 'https://es.javascript.info/', type: 'documentation', lang: 'es' },
    { title: 'JavaScript avanzado', author: 'freeCodeCamp', type: 'course', lang: 'en' },
  ],
  react: [
    { title: 'React desde cero', author: 'midudev', type: 'course', lang: 'es', text: '**Componentes:** Son funciones que devuelven JSX. `function Saludo({ nombre }) { return <h1>Hola {nombre}</h1>; }`. Cada componente recibe `props` y retorna UI.' },
    { title: 'Documentacion oficial React', url: 'https://es.react.dev/learn', type: 'documentation', lang: 'es' },
  ],
  diseño: [
    { title: 'Diseno UI/UX desde cero', author: 'Figma', type: 'course', lang: 'es', text: '**Principios de diseno:** Contraste, repeticion, alineacion y proximidad (CRAP). El contraste jerarquiza, la repeticion unifica, la alineacion ordena y la proximidad agrupa.' },
    { title: 'Figma Tutorial', url: 'https://www.figma.com/resources/learn-design/', type: 'documentation', lang: 'es' },
  ],
  html: [
    { title: 'HTML desde cero', author: 'SoyDalto', type: 'course', lang: 'es', text: '**Estructura basica:** `<html><head><title>Titulo</title></head><body><h1>Titulo</h1><p>Parrafo</p></body></html>`. Todo empieza con `<!DOCTYPE html>`.' },
    { title: 'MDN HTML Documentation', url: 'https://developer.mozilla.org/es/docs/Web/HTML', type: 'documentation', lang: 'es' },
  ],
  css: [
    { title: 'CSS moderno', author: 'midudev', type: 'course', lang: 'es', text: '**Flexbox:** `display: flex` activa el modelo flexible. `justify-content: center` centra horizontalmente. `align-items: center` centra verticalmente. Ideal para layouts.' },
    { title: 'CSS Tricks Guide', url: 'https://css-tricks.com/guides/', type: 'documentation', lang: 'en' },
  ],
  node: [
    { title: 'Node.js desde cero', author: 'midudev', type: 'course', lang: 'es', text: '**Modulos:** `const fs = require("fs")` importa el modulo de sistema de archivos. En ES modules: `import fs from "fs"`. Node usa CommonJS por defecto.' },
    { title: 'Node.js Documentation', url: 'https://nodejs.org/es/docs/', type: 'documentation', lang: 'es' },
  ],
  typescript: [
    { title: 'TypeScript desde cero', author: 'midudev', type: 'course', lang: 'es', text: '**Tipado:** `let nombre: string = "Ana"`. TypeScript anade tipos a JavaScript. Esto previene errores en desarrollo. `interface Persona { nombre: string; edad: number }`.' },
    { title: 'TypeScript Handbook', url: 'https://www.typescriptlang.org/docs/', type: 'documentation', lang: 'en' },
  ],
  git: [
    { title: 'Git y GitHub desde cero', author: 'SoyDalto', type: 'course', lang: 'es', text: '**Comandos basicos:** `git init` inicia repo, `git add .` prepara cambios, `git commit -m "mensaje"` guarda, `git push` sube a GitHub. Haz commit por cada cambio logico.' },
    { title: 'Git SCM Documentation', url: 'https://git-scm.com/book/es/v2', type: 'documentation', lang: 'es' },
  ],
  sql: [
    { title: 'SQL desde cero', author: 'PildorasInformaticas', type: 'course', lang: 'es', text: '**SELECT basico:** `SELECT nombre, edad FROM usuarios WHERE edad > 18 ORDER BY edad DESC`. El orden: SELECT, FROM, WHERE, ORDER BY, LIMIT.' },
    { title: 'SQL Practice (W3Schools)', url: 'https://www.w3schools.com/sql/', type: 'practice', lang: 'en' },
  ],
  docker: [
    { title: 'Docker desde cero', author: 'midudev', type: 'course', lang: 'es', text: '**Conceptos clave:** Imagen = plantilla, Contenedor = instancia en ejecucion. `docker pull ubuntu` descarga una imagen. `docker run -it ubuntu bash` inicia un contenedor interactivo.' },
    { title: 'Docker Documentation', url: 'https://docs.docker.com/', type: 'documentation', lang: 'en' },
  ],
  matematicas: [
    { title: 'Matematicas basicas', author: 'Matematicas profe Alex', type: 'course', lang: 'es', text: '**Regla de tres simple:** Si 5 manzanas cuestan $25, cuanto cuestan 8? 5 -> 25, 8 -> x. x = (8 * 25) / 5 = $40. Proporcionalidad directa.' },
    { title: 'Khan Academy (matematicas)', url: 'https://es.khanacademy.org/math', type: 'course', lang: 'es' },
  ],
  data_science: [
    { title: 'Data Science desde cero', author: 'freeCodeCamp', type: 'course', lang: 'en', text: '**Pandas basico:** `df = pd.read_csv("datos.csv")` carga datos. `df.head()` muestra primeras filas. `df.describe()` da estadisticas. `df.groupby("categoria").mean()` agrupa.' },
    { title: 'Python Data Science Handbook', url: 'https://jakevdp.github.io/PythonDataScienceHandbook/', type: 'book', lang: 'en' },
  ],
  productividad: [
    { title: 'Metodo GTD productividad', author: 'David Allen', type: 'course', lang: 'es', text: '**Getting Things Done:** 1) Captura todo, 2) Clarifica que es, 3) Organiza por contextos, 4) Revisa semanalmente, 5) Ejecuta. Tu mente es para tener ideas, no para almacenarlas.' },
    { title: 'Notion para productividad', url: 'https://www.notion.so/es-es/help/guides', type: 'documentation', lang: 'es' },
  ],
  emprendimiento: [
    { title: 'Emprendimiento digital', author: 'Yunuen Perez', type: 'course', lang: 'es', text: '**Lean Startup:** Construye un MVP (Minimum Viable Product), midelo, aprende. El ciclo es: Ideas -> Construir -> Medir -> Aprender. Falla rapido, aprende rapido.' },
    { title: '100 Days of Code', url: 'https://www.100daysofcode.com/', type: 'practice', lang: 'en' },
  ],
  ciberseguridad: [
    { title: 'Ciberseguridad desde cero', author: 'HackerSploit', type: 'course', lang: 'en', text: '**Principios basicos:** Confidencialidad (solo quien debe ve), Integridad (datos no alterados), Disponibilidad (accesible cuando se necesita). Es el triangulo CIA.' },
    { title: 'TryHackMe (practica)', url: 'https://tryhackme.com/', type: 'practice', lang: 'en' },
  ],
  inteligencia_artificial: [
    { title: 'IA desde cero', author: 'DotCSV', type: 'course', lang: 'es', text: '**Machine Learning:** Algoritmos que aprenden de datos. Supervisado (datos etiquetados), No supervisado (sin etiquetas), Reforzado (prueba y error). Ejemplo: clasificar emails como spam o no spam.' },
    { title: 'FastAI Practical Deep Learning', url: 'https://course.fast.ai/', type: 'course', lang: 'en' },
  ],
}

export function searchResources(topic: string, type?: string): CuratedResource[] {
  const t = topic.toLowerCase()
  const results: CuratedResource[] = []

  for (const [key, resources] of Object.entries(RESOURCES)) {
    if (t.includes(key) || key.includes(t)) {
      let filtered = resources
      if (type?.includes('video') || type?.includes('youtube')) {
        continue
      } else if (type?.includes('libro') || type?.includes('book') || type?.includes('leer')) {
        filtered = filtered.filter((r) => r.type === 'book' || r.type === 'documentation')
      } else if (type?.includes('practica') || type?.includes('practice')) {
        filtered = filtered.filter((r) => r.type === 'practice')
      }
      results.push(...filtered.slice(0, 5))
    }
  }

  return results.length > 0 ? results.slice(0, 5) : getDefaultResources(type)
}

function getDefaultResources(type?: string): CuratedResource[] {
  return [
    { title: 'freeCodeCamp - cursos gratuitos', url: 'https://www.freecodecamp.org/espanol/', type: 'course', lang: 'es' },
    { title: 'Documentacion oficial (MDN, Python.org, etc.)', url: 'https://developer.mozilla.org/es/', type: 'documentation', lang: 'es' },
    { title: 'Busca a autores como SoyDalto, midudev, freeCodeCamp en tu tema', author: 'SoyDalto / midudev / freeCodeCamp', type: 'course', lang: 'es', text: 'Estos creadores tienen cursos completos gratis. Busca "[tema] [autor]" en Google.' },
  ]
}

export function formatResourcesAsText(resources: CuratedResource[]): string {
  if (resources.length === 0) return ''
  return resources.map((r, i) => {
    const label = r.type === 'documentation' ? 'documentacion' : r.type === 'practice' ? 'practica' : r.type === 'course' ? 'curso' : r.type === 'book' ? 'libro' : 'plataforma'
    let line = `${i + 1}. ${r.title}`
    if (r.author) line += ` (busca a **${r.author}**)`
    if (r.url) line += `\n   ${r.url}`
    line += ` [${label}, ${r.lang === 'es' ? 'espanol' : 'ingles'}]`
    return line
  }).join('\n')
}
