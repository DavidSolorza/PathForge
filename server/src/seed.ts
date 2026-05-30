import bcrypt from 'bcryptjs'
import { connectDB } from './db'
import { ActivityModel, ChatHistoryModel, LearningPathModel, ProjectModel, StatsModel, UserModel } from './models'

const sampleUser = {
  email: 'admin@pathforge.app',
  password: 'password123',
  name: 'Administrador',
  avatar: 'https://api.dicebear.com/6.x/initials/svg?seed=PathForge',
  bio: 'Usuario inicial para pruebas',
  favoriteCategories: ['frontend', 'backend', 'design'],
}

const sampleLearningPath = {
  title: 'Ruta de fundamentos de JavaScript',
  goal: 'Aprender los conceptos básicos para construir aplicaciones web modernas',
  category: 'programming',
  difficulty: 'beginner',
  progress: 0,
  stages: [
    {
      name: 'Bases del lenguaje',
      description: 'Variables, tipos, condicionales y bucles',
      order: 1,
      status: 'pending',
      topics: [
        {
          name: 'Sintaxis y variables',
          content: 'Aprende a declarar variables y tipos primitivos en JavaScript.',
          difficulty: 'easy',
          completed: false,
          resources: [
            { title: 'Documentación oficial de Mozilla', type: 'documentation', url: 'https://developer.mozilla.org/es/docs/Web/JavaScript' },
          ],
        },
      ],
    },
  ],
}

const sampleProject = {
  name: 'Portfolio personal',
  description: 'Un proyecto para mostrar habilidades y proyectos completados.',
  technologies: ['React', 'TypeScript', 'TailwindCSS'],
  status: 'draft',
  repoUrl: 'https://github.com/usuario/portfolio',
  demoUrl: 'https://portfolio.example.com',
}

const sampleActivity = {
  type: 'path_created',
  title: 'Creaste tu primera ruta de aprendizaje',
  pathName: sampleLearningPath.title,
}

const sampleChatHistory = {
  mode: 'chat',
  messages: [
    { role: 'user', content: 'Hola, ¿cómo empiezo?', timestamp: new Date() },
    { role: 'assistant', content: 'Puedes comenzar creando una ruta con los temas que quieres aprender.', timestamp: new Date() },
  ],
}

async function seed() {
  await connectDB()

  const existingUser = await UserModel.findOne({ email: sampleUser.email }).lean()
  if (existingUser) {
    console.log('[seed] Usuario inicial ya existe:', existingUser.email)
    return process.exit(0)
  }

  const hashedPassword = await bcrypt.hash(sampleUser.password, 10)
  const user = await UserModel.create({ ...sampleUser, password: hashedPassword })
  await StatsModel.create({ userId: user._id.toString() })
  await LearningPathModel.create({ ...sampleLearningPath, userId: user._id.toString() })
  await ProjectModel.create({ ...sampleProject, userId: user._id.toString() })
  await ActivityModel.create({ ...sampleActivity, userId: user._id.toString(), timestamp: new Date() })
  await ChatHistoryModel.create({ ...sampleChatHistory, userId: user._id.toString() })

  console.log('[seed] Datos iniciales creados para usuario:', user.email)
  process.exit(0)
}

seed().catch((error) => {
  console.error('[seed] Error al sembrar datos:', error)
  process.exit(1)
})
