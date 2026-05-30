import bcrypt from 'bcryptjs'
import {
  ActivityModel,
  ChatHistoryModel,
  LearningPathModel,
  ProjectModel,
  StatsModel,
  UserModel,
} from './models'

const SEED_USERS = [
  {
    email: 'admin@pathforge.app',
    password: 'password123',
    name: 'Administrador',
    avatar: 'https://api.dicebear.com/6.x/initials/svg?seed=PathForge',
    bio: 'Usuario inicial para pruebas',
    favoriteCategories: ['frontend', 'backend', 'design'],
  },
  {
    email: 'demo@pathforge.ai',
    password: '123456',
    name: 'Usuario Demo',
    avatar: 'https://api.dicebear.com/6.x/initials/svg?seed=Demo',
    bio: 'Cuenta demo para acceso rapido',
    favoriteCategories: ['programming', 'frontend'],
  },
] as const

const SAMPLE_PATH = {
  title: 'Ruta de fundamentos de JavaScript',
  goal: 'Aprender los conceptos basicos para construir aplicaciones web modernas',
  category: 'programming',
  difficulty: 'beginner' as const,
  progress: 0,
  stages: [
    {
      name: 'Bases del lenguaje',
      description: 'Variables, tipos, condicionales y bucles',
      order: 1,
      status: 'pending' as const,
      topics: [
        {
          name: 'Sintaxis y variables',
          content: 'Aprende a declarar variables y tipos primitivos en JavaScript.',
          difficulty: 'easy' as const,
          completed: false,
          resources: [
            {
              title: 'Documentacion oficial de Mozilla',
              type: 'documentation' as const,
              url: 'https://developer.mozilla.org/es/docs/Web/JavaScript',
            },
          ],
        },
      ],
    },
  ],
}

export async function syncIndexes(): Promise<void> {
  await Promise.all([
    UserModel.syncIndexes(),
    LearningPathModel.syncIndexes(),
    ProjectModel.syncIndexes(),
    ActivityModel.syncIndexes(),
    StatsModel.syncIndexes(),
    ChatHistoryModel.syncIndexes(),
  ])
  console.log('[DB] Indices sincronizados en las 6 colecciones')
}

export async function seedIfEmpty(): Promise<void> {
  const userCount = await UserModel.countDocuments()
  if (userCount > 0) {
    console.log('[DB] Datos existentes detectados, seed omitido')
    return
  }

  console.log('[DB] Base de datos vacia — creando colecciones y datos iniciales...')

  const adminSeed = SEED_USERS[0]
  const hashedAdmin = await bcrypt.hash(adminSeed.password, 10)
  const admin = await UserModel.create({ ...adminSeed, password: hashedAdmin })

  const demoSeed = SEED_USERS[1]
  const hashedDemo = await bcrypt.hash(demoSeed.password, 10)
  await UserModel.create({ ...demoSeed, password: hashedDemo })

  const userId = admin._id.toString()

  await StatsModel.create({
    userId,
    totalPaths: 1,
    completedTopics: 0,
    totalProgress: 0,
    streak: 0,
    longestStreak: 0,
    favoriteCategory: 'programming',
    activeDays: 1,
  })

  await LearningPathModel.create({ ...SAMPLE_PATH, userId })

  await ProjectModel.create({
    userId,
    name: 'Portfolio personal',
    description: 'Un proyecto para mostrar habilidades y proyectos completados.',
    technologies: ['React', 'TypeScript', 'TailwindCSS'],
    status: 'draft',
    progress: 0,
    notes: 'Proyecto inicial de ejemplo',
    repoUrl: 'https://github.com/usuario/portfolio',
    demoUrl: 'https://portfolio.example.com',
  })

  await ActivityModel.create({
    userId,
    type: 'path_created',
    title: 'Creaste tu primera ruta de aprendizaje',
    pathName: SAMPLE_PATH.title,
    timestamp: new Date(),
  })

  await ChatHistoryModel.create({
    userId,
    mode: 'chat',
    messages: [
      { role: 'user', content: 'Hola, como empiezo a aprender JavaScript?', timestamp: new Date() },
      { role: 'assistant', content: 'Puedes comenzar creando una ruta con los temas que quieres aprender.', timestamp: new Date() },
    ],
  })

  console.log('[DB] Seed completado')
  console.log('[DB]   admin@pathforge.app / password123')
  console.log('[DB]   demo@pathforge.ai / 123456')
}

export async function initDb(): Promise<void> {
  await syncIndexes()
  await seedIfEmpty()
}
