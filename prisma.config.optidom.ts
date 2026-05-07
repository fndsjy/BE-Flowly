import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema-optidom.prisma",
  migrations: {
    path: "prisma/migrations-optidom",
  },
  engine: "classic",
  datasource: {
    url: env("OPTIDOM_DATABASE_URL"),
  },
});

