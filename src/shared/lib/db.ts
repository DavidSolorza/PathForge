import type { User, Skill, LearningPath, Stage, Project, Recommendation, UserStats } from '@shared/types'

const DB_KEY = 'pathforge_db'

interface Database {
  users: User[]
  skills: Skill[]
  learningPaths: LearningPath[]
  projects: Project[]
  recommendations: Recommendation[]
  stats: UserStats
}

const demoSkills: Skill[] = [
  { id: 's1', name: 'python', category: 'backend', level: 'advanced', progress: 75, experience: 120 },
  { id: 's2', name: 'javascript', category: 'frontend', level: 'intermediate', progress: 55, experience: 80 },
  { id: 's3', name: 'typescript', category: 'frontend', level: 'beginner', progress: 25, experience: 30 },
  { id: 's4', name: 'react', category: 'frontend', level: 'intermediate', progress: 50, experience: 70 },
  { id: 's5', name: 'node', category: 'backend', level: 'beginner', progress: 30, experience: 40 },
  { id: 's6', name: 'docker', category: 'devops', level: 'beginner', progress: 15, experience: 15 },
  { id: 's7', name: 'sql', category: 'database', level: 'intermediate', progress: 45, experience: 60 },
  { id: 's8', name: 'mongodb', category: 'database', level: 'beginner', progress: 20, experience: 25 },
  { id: 's9', name: 'git', category: 'devops', level: 'advanced', progress: 80, experience: 100 },
]

const demoPaths: LearningPath[] = [
  {
    id: 'lp1',
    goal: 'Desarrollo Web',
    progress: 35,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date().toISOString(),
    stages: [
      {
        id: 'st1',
        name: 'Fundamentos de la Web',
        description: 'HTML, CSS y los pilares de internet',
        order: 1,
        status: 'completed',
        progress: 100,
        technologies: ['HTML', 'CSS', 'HTTP'],
        resources: [
          { id: 'r1', title: 'MDN Web Docs', type: 'article', url: 'https://developer.mozilla.org', completed: true },
          { id: 'r2', title: 'FreeCodeCamp Responsive Design', type: 'course', url: 'https://freecodecamp.org', completed: true },
        ],
      },
      {
        id: 'st2',
        name: 'JavaScript Moderno',
        description: 'ES6+, asincronía, manipulación del DOM',
        order: 2,
        status: 'in_progress',
        progress: 60,
        technologies: ['JavaScript', 'ES6+', 'DOM'],
        resources: [
          { id: 'r3', title: 'JavaScript.info', type: 'article', url: 'https://javascript.info', completed: true },
          { id: 'r4', title: 'You Don\'t Know JS', type: 'book', url: 'https://github.com/getify/You-Dont-Know-JS', completed: false },
        ],
      },
      {
        id: 'st3',
        name: 'Framework Frontend',
        description: 'React, componentes, estado y routing',
        order: 3,
        status: 'available',
        progress: 0,
        technologies: ['React', 'TypeScript', 'Vite'],
        resources: [
          { id: 'r5', title: 'React Docs', type: 'article', url: 'https://react.dev', completed: false },
        ],
      },
      {
        id: 'st4',
        name: 'Backend y APIs',
        description: 'Node.js, Express, REST APIs, base de datos',
        order: 4,
        status: 'locked',
        progress: 0,
        technologies: ['Node.js', 'Express', 'MongoDB'],
        resources: [],
      },
      {
        id: 'st5',
        name: 'Proyecto Final',
        description: 'Aplica todo lo aprendido en un proyecto completo',
        order: 5,
        status: 'locked',
        progress: 0,
        technologies: ['React', 'Node.js', 'MongoDB', 'Docker'],
        resources: [],
      },
    ],
  },
  {
    id: 'lp2',
    goal: 'Aprender Python',
    progress: 70,
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    updatedAt: new Date().toISOString(),
    stages: [
      {
        id: 'st6',
        name: 'Fundamentos de Python',
        description: 'Sintaxis, variables, tipos de datos, funciones',
        order: 1,
        status: 'completed',
        progress: 100,
        technologies: ['Python'],
        resources: [
          { id: 'r6', title: 'Python Official Tutorial', type: 'course', url: 'https://docs.python.org/3/tutorial/', completed: true },
        ],
      },
      {
        id: 'st7',
        name: 'Estructuras de Datos',
        description: 'Listas, diccionarios, conjuntos, tuplas',
        order: 2,
        status: 'completed',
        progress: 100,
        technologies: ['Python'],
        resources: [
          { id: 'r7', title: 'Real Python', type: 'article', url: 'https://realpython.com/', completed: true },
        ],
      },
      {
        id: 'st8',
        name: 'POO y Módulos',
        description: 'Clases, herencia, módulos, paquetes',
        order: 3,
        status: 'completed',
        progress: 100,
        technologies: ['Python'],
        resources: [],
      },
      {
        id: 'st9',
        name: 'Librerías Populares',
        description: 'NumPy, Pandas, Matplotlib',
        order: 4,
        status: 'in_progress',
        progress: 40,
        technologies: ['NumPy', 'Pandas', 'Matplotlib'],
        resources: [
          { id: 'r8', title: 'Pandas Documentation', type: 'article', url: 'https://pandas.pydata.org/docs/', completed: false },
        ],
      },
      {
        id: 'st10',
        name: 'Proyecto Práctico',
        description: 'Construye una aplicación con Python',
        order: 5,
        status: 'locked',
        progress: 0,
        technologies: ['Python', 'Pandas'],
        resources: [],
      },
    ],
  },
]

const demoProjects: Project[] = [
  {
    id: 'p1',
    name: 'Portfolio Personal',
    description: 'Sitio web personal con React y TypeScript',
    technologies: ['React', 'TypeScript', 'CSS'],
    status: 'completed',
    repoUrl: 'https://github.com/demo/portfolio',
    demoUrl: 'https://demo-portfolio.vercel.app',
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: 'p2',
    name: 'API REST con Node.js',
    description: 'API de tareas con autenticación JWT',
    technologies: ['Node.js', 'Express', 'MongoDB', 'JWT'],
    status: 'in_progress',
    repoUrl: 'https://github.com/demo/task-api',
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'p3',
    name: 'Dashboard Analítico',
    description: 'Dashboard con gráficos interactivos',
    technologies: ['Python', 'Pandas', 'Dash'],
    status: 'draft',
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
]

const demoRecommendations: Recommendation[] = [
  {
    id: 'rec1',
    type: 'next_step',
    title: 'Profundiza en TypeScript',
    description: 'TypeScript te dará una base sólida para proyectos escalables',
    relevance: 95,
    reason: 'Ya tienes experiencia con JavaScript. TypeScript es el siguiente paso natural.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rec2',
    type: 'skill',
    title: 'Aprende Next.js',
    description: 'Framework de React para producción',
    relevance: 88,
    reason: 'Tus habilidades en React pueden expandirse con Server Components y SSR.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rec3',
    type: 'project',
    title: 'Construye un clon de Trello',
    description: 'Aplica React, drag & drop, y estado global',
    relevance: 82,
    reason: 'Un proyecto completo que integra múltiples tecnologías que ya conoces.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rec4',
    type: 'resource',
    title: 'Curso: Docker para Desarrolladores',
    description: 'Domina contenedores y despliegue',
    relevance: 76,
    reason: 'Tienes Docker iniciado. Profundizar te abrirá puertas en DevOps.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'rec5',
    type: 'next_step',
    title: 'Introducción a Testing',
    description: 'Vitest, React Testing Library, TDD',
    relevance: 90,
    reason: 'El testing es fundamental para proyectos profesionales y te prepara para trabajo en equipo.',
    createdAt: new Date().toISOString(),
  },
]

function getDefaultDB(): Database {
  return {
    users: [
      {
        id: 'u1',
        email: 'demo@pathforge.ai',
        name: 'Carlos Martínez',
        bio: 'Desarrollador full-stack en formación. Apasionado por la tecnología y el aprendizaje continuo.',
        avatar: '',
        createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    skills: demoSkills,
    learningPaths: demoPaths,
    projects: demoProjects,
    recommendations: demoRecommendations,
    stats: {
      totalSkills: demoSkills.length,
      completedProjects: demoProjects.filter((p) => p.status === 'completed').length,
      totalProgress: 45,
      learningStreak: 12,
      hoursLearned: 540,
    },
  }
}

function loadDB(): Database {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      return JSON.parse(raw) as Database
    }
  } catch {}
  const db = getDefaultDB()
  saveDB(db)
  return db
}

function saveDB(db: Database) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  } catch {}
}

export const LocalDB = {
  getUsers: (): User[] => loadDB().users,

  getUser: (id: string): User | undefined => loadDB().users.find((u) => u.id === id),

  upsertUser: (user: User): User => {
    const db = loadDB()
    const idx = db.users.findIndex((u) => u.id === user.id)
    if (idx >= 0) {
      db.users[idx] = { ...db.users[idx], ...user, updatedAt: new Date().toISOString() }
    } else {
      db.users.push({ ...user, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    }
    saveDB(db)
    return user
  },

  getSkills: (): Skill[] => loadDB().skills,

  updateSkill: (id: string, updates: Partial<Skill>): Skill | undefined => {
    const db = loadDB()
    const idx = db.skills.findIndex((s) => s.id === id)
    if (idx >= 0) {
      db.skills[idx] = { ...db.skills[idx], ...updates }
      saveDB(db)
      return db.skills[idx]
    }
    return undefined
  },

  getLearningPaths: (): LearningPath[] => loadDB().learningPaths,

  getLearningPath: (id: string): LearningPath | undefined =>
    loadDB().learningPaths.find((lp) => lp.id === id),

  updateStage: (pathId: string, stageId: string, updates: Partial<Stage>) => {
    const db = loadDB()
    const path = db.learningPaths.find((lp) => lp.id === pathId)
    if (path) {
      const stage = path.stages.find((s) => s.id === stageId)
      if (stage) {
        Object.assign(stage, updates)
        const total = path.stages.reduce((sum, s) => sum + s.progress, 0)
        path.progress = Math.round(total / path.stages.length)
        path.updatedAt = new Date().toISOString()
        saveDB(db)
      }
    }
  },

  addLearningPath: (path: LearningPath): LearningPath => {
    const db = loadDB()
    db.learningPaths.push(path)
    saveDB(db)
    return path
  },

  getProjects: (): Project[] => loadDB().projects,

  addProject: (project: Project): Project => {
    const db = loadDB()
    db.projects.push(project)
    saveDB(db)
    return project
  },

  updateProject: (id: string, updates: Partial<Project>): Project | undefined => {
    const db = loadDB()
    const idx = db.projects.findIndex((p) => p.id === id)
    if (idx >= 0) {
      db.projects[idx] = { ...db.projects[idx], ...updates, updatedAt: new Date().toISOString() }
      saveDB(db)
      return db.projects[idx]
    }
    return undefined
  },

  deleteProject: (id: string): boolean => {
    const db = loadDB()
    const len = db.projects.length
    db.projects = db.projects.filter((p) => p.id !== id)
    if (db.projects.length !== len) {
      saveDB(db)
      return true
    }
    return false
  },

  getRecommendations: (): Recommendation[] => loadDB().recommendations,

  getStats: (): UserStats => loadDB().stats,

  refreshStats: (): UserStats => {
    const db = loadDB()
    db.stats = {
      totalSkills: db.skills.length,
      completedProjects: db.projects.filter((p) => p.status === 'completed').length,
      totalProgress: db.learningPaths.length > 0
        ? Math.round(db.learningPaths.reduce((sum, lp) => sum + lp.progress, 0) / db.learningPaths.length)
        : 0,
      learningStreak: db.stats.learningStreak,
      hoursLearned: db.skills.reduce((sum, s) => sum + s.experience, 0),
    }
    saveDB(db)
    return db.stats
  },
}
