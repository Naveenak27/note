const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['warn', 'error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Critical for Supabase compatibility
  __internal: {
    engine: {
      useUds: false,
      enableEngineDebugMode: false,
      forceTransactions: false,
    },
  },
});

// Connection verification
prisma.$connect()
  .then(() => {
    console.log('✅ Database connected successfully');
    // Verify connection with a simple query
    return prisma.$queryRaw`SELECT 1 as connection_test`;
  })
  .then(() => console.log('🔌 Connection test successful'))
  .catch(error => {
    console.error('❌ Database connection failed:', error.message);
    console.error('💡 Troubleshooting tips:');
    console.error('1. Verify your Supabase project is active');
    console.error('2. Check if your IP is whitelisted in Supabase');
    console.error('3. Ensure your password is correct');
    console.error('4. Try connecting with a database client like pgAdmin');
    process.exit(1);
  });

// Graceful shutdown
const shutdown = async () => {
  await prisma.$disconnect();
  console.log('Database connection closed');
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

module.exports = prisma;