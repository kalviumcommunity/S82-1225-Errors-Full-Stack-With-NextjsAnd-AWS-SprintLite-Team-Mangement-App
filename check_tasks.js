import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const tasks = await prisma.task.findMany({
    take: 5,
    include: {
      creator: { select: { id: true, name: true, email: true } },
      assignee: { select: { id: true, name: true, email: true } },
    },
  });
  console.log(JSON.stringify({ count: tasks.length, tasks }, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
