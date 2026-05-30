import { connectDB } from './db'

connectDB()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('[seed] Error:', error)
    process.exit(1)
  })
