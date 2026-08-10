import pg from 'pg';

const { Pool } = pg;

let poolInstance = null;

/**
 * Lazily initialize and return the PostgreSQL pool.
 * This avoids ESM evaluation hoisting issues by reading process.env after config loads.
 */
export function getPool() {
  if (poolInstance) return poolInstance;

  console.log('[DEBUG] Available env keys:', Object.keys(process.env).filter(k => k.includes('DATABASE') || k.includes('URL') || k.includes('PORT') || k.includes('GROQ')));
  console.log('[DEBUG] process.env.DATABASE_URL raw value:', process.env.DATABASE_URL);
  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/speakspin';
  console.log('[DEBUG] getPool evaluating connectionString:', connectionString ? connectionString.substring(0, 45) + '...' : 'undefined');
  const isNeon = connectionString.includes('neon.tech');

  poolInstance = new Pool({
    connectionString,
    ssl: isNeon ? { rejectUnauthorized: false } : false
  });

  return poolInstance;
}

export async function connectDB() {
  try {
    const pool = getPool();
    const client = await pool.connect();
    console.log(`PostgreSQL Connected successfully to database.`);
    
    // Auto-initialize tables if they don't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        google_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        topic VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        duration INTEGER NOT NULL,
        overall_score INTEGER NOT NULL,
        overall_feedback TEXT NOT NULL,
        categories JSONB NOT NULL,
        filler_words JSONB NOT NULL,
        anxiety_indicators JSONB NOT NULL,
        strengths JSONB NOT NULL,
        improvements JSONB NOT NULL,
        challenge_for_next TEXT,
        exemplar_speech TEXT,
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('PostgreSQL Tables initialized (users, sessions).');
    client.release();
  } catch (error) {
    console.error('PostgreSQL Connection/Initialization Error:');
    console.error(error);
    process.exit(1);
  }
}

export default connectDB;
