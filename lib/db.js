import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis;

let prisma;

if (!globalForPrisma.prisma) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
  }
} else {
  prisma = globalForPrisma.prisma;
}

// Optionally, load DATABASE_URL from cloud secret manager at runtime
// import { getCloudSecrets } from './cloudSecrets';
// (async () => {
//   if (!process.env.DATABASE_URL) {
//     const secrets = await getCloudSecrets();
//     process.env.DATABASE_URL = secrets.DATABASE_URL;
//   }
// })();

export { prisma };
