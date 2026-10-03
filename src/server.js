import { validateEnvironment } from './config/env.js';

validateEnvironment();

const { default: app } = await import('./app.js');
const { pool } = await import('./config/database.js');
const port = Number(process.env.PORT) || 3000;

try {
  await pool.query('SELECT 1');
  const server = app.listen(port, () => {
    console.log(`Bolsillo Claro API disponible en el puerto ${port}.`);
  });

  const shutdown = (signal) => {
    console.log(`${signal} recibido; cerrando conexiones.`);
    server.close(async () => {
      await pool.end();
      process.exit(0);
    });
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
} catch (error) {
  console.error('No se pudo conectar a PostgreSQL. Revisa DATABASE_URL y la red de Supabase.', error);
  await pool.end();
  process.exit(1);
}
