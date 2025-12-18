import { prisma } from '@/lib/db'

export async function GET() {
  try {
    await prisma.$connect()
    return Response.json({ status: 'connected', message: '✅ Database connected successfully' })
  } catch (error) {
    return Response.json({ status: 'error', message: '❌ Database connection failed', error: error.message }, { status: 500 })
  }
}
