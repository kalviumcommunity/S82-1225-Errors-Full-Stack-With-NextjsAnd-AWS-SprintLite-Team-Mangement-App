import { getTaskUser } from '@/lib/tasks'

export async function GET() {
  const tasks = await getTaskUser()
  return Response.json({ data: tasks })
}

export const dynamic = 'force-dynamic'
