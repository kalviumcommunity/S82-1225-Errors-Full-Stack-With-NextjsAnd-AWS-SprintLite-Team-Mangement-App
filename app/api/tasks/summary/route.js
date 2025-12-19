import { getTaskSummary } from '@/lib/tasks'

export async function GET() {
  const summary = await getTaskSummary()
  return Response.json({ data: summary })
}

export const revalidate = 60
