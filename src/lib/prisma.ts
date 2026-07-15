import { PrismaClient } from '../generated/client'
import { PrismaNeonHttp } from '@prisma/adapter-neon'
import { neon } from '@neondatabase/serverless'

function createPrismaClient() {
  const sql = neon(process.env.DATABASE_URL!)
  const adapter = new PrismaNeonHttp(sql)
  return new PrismaClient({ adapter })
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
