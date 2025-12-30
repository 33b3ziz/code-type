import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { snippets as snippetsTable } from '../schema'
import { snippets } from './snippets'
import 'dotenv/config'

async function seed() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set')
  }

  const pool = new Pool({ connectionString })
  const db = drizzle(pool)

  console.log('Seeding database with code snippets...')

  // Insert all snippets
  const inserted = await db
    .insert(snippetsTable)
    .values(
      snippets.map((snippet) => ({
        title: snippet.title,
        code: snippet.code,
        language: snippet.language,
        difficulty: snippet.difficulty,
        category: snippet.category,
      }))
    )
    .onConflictDoNothing()
    .returning({ id: snippetsTable.id, title: snippetsTable.title })

  console.log(`Inserted ${inserted.length} snippets`)

  // Summary by language
  const byLanguage = snippets.reduce(
    (acc, s) => {
      acc[s.language] = (acc[s.language] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  console.log('By language:', byLanguage)

  // Summary by difficulty
  const byDifficulty = snippets.reduce(
    (acc, s) => {
      acc[s.difficulty] = (acc[s.difficulty] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  console.log('By difficulty:', byDifficulty)

  await pool.end()
  console.log('Seed completed!')
}

seed().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
