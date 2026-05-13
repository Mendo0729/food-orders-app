const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error('Falta DATABASE_URL en el archivo .env. Copia .env.example a .env y agrega la URL de PostgreSQL de Supabase.');
}

if (process.env.DATABASE_URL.includes('[') || process.env.DATABASE_URL.includes(']')) {
  throw new Error(
    'DATABASE_URL todavia contiene placeholders con corchetes. Reemplaza tu_password y tu_host.supabase.co con los valores reales de Supabase.'
  );
}

try {
  const databaseUrl = new URL(process.env.DATABASE_URL);

  if (!databaseUrl.password) {
    throw new Error(
      'DATABASE_URL no incluye contrasena. Revisa la cadena de conexion de Supabase.'
    );
  }
} catch (error) {
  if (error.message.includes('DATABASE_URL')) {
    throw error;
  }

  throw new Error(
    'DATABASE_URL no es una URL valida. Si tu contrasena tiene caracteres como @, #, %, / o :, debes codificarla para URL.'
  );
}

const databaseUrl = new URL(process.env.DATABASE_URL);
const isLocalDatabase = ['localhost', '127.0.0.1', '::1'].includes(databaseUrl.hostname);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDatabase
    ? false
    : {
        rejectUnauthorized: false
      }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
