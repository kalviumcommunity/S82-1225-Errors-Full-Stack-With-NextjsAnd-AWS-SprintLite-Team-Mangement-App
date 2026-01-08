import { getTaskSummary } from "@/lib/tasks";

// Mark as dynamic route - prevents static generation at build time
export const dynamic = "force-dynamic";

export async function GET() {
  const summary = await getTaskSummary();
  return Response.json({ data: summary });
}

export const revalidate = 60;
