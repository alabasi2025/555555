import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./drizzle/schema-pg.ts",
  out: "./drizzle/migrations-pg",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "postgresql://poweruser:powerpass123@localhost:5432/power_station_db",
  },
  verbose: true,
  strict: true,
});
