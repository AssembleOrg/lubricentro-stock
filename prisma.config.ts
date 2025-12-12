import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    path: './prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL || '',
    // directUrl is handled via DIRECT_URL environment variable for migrations
    // Prisma will use DIRECT_URL if available, otherwise falls back to DATABASE_URL
  },
});

