// import { Pool, neonConfig } from '@neondatabase/serverless';
// import { PrismaNeon } from '@prisma/adapter-neon';
// import {PrismaClient}  from '@prisma/client';
// import ws from 'ws';

// // Sets up WebSocket connections, which enables Neon to use WebSocket communication.
// neonConfig.webSocketConstructor = ws;
// const connectionString = `${process.env.DATABASE_URL}`;

// // Creates a new connection pool using the provided connection string, allowing multiple concurrent connections.
// const pool = new Pool({ connectionString });
// const adapter = new PrismaNeon({ connectionString });

// export const prisma = new PrismaClient({ adapter });

import { PrismaClient } from '@prisma/client';
import { neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Enable WebSocket support for Neon
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL!;

// Create Prisma client with Neon adapter
const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter: new PrismaNeon({ connectionString }),
  });
};

// Prevent multiple instances in dev (Next.js hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
