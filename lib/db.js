import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis

let prisma

if (!globalForPrisma.prisma) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
  prisma = new PrismaClient({ adapter })
  if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma
  }
} else {
  prisma = globalForPrisma.prisma
}

export { prisma }
