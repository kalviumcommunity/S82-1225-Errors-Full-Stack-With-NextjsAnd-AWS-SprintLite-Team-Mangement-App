import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function getUsers() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true },
  });
  console.log("Users in database:");
  users.forEach((u) => console.log(`  ${u.name}: ${u.id}`));
  await prisma.$disconnect();
  await pool.end();
}

getUsers();
