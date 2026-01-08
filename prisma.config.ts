import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load environment variables from .env.development in development
// In production/Docker, DATABASE_URL is set via environment variables
if (process.env.NODE_ENV !== "production") {
  config({ path: ".env.development" });
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
