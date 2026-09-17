import pg from 'pg';
import dns from 'dns';
import net from 'net';

// Enforce IPv4-first resolution to prevent WSL2/Linux IPv6 ETIMEDOUT & ENETUNREACH issues
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}
if (typeof net.setDefaultAutoSelectFamily === 'function') {
  net.setDefaultAutoSelectFamily(false);
}

const { Pool } = pg;

let poolInstance = null;

/**
 * Lazily initialize and return the PostgreSQL pool.
 * This avoids ESM evaluation hoisting issues by reading process.env after config loads.
 */
export function getPool() {
  if (poolInstance) return poolInstance;

  const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/speakspin';
  const isNeon = connectionString.includes('neon.tech');

  poolInstance = new Pool({
    connectionString,
    ssl: isNeon ? { rejectUnauthorized: false } : false,
    lookup: (hostname, options, cb) => {
      return dns.lookup(hostname, { family: 4, all: false }, cb);
    }
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
    console.warn('⚠️ PostgreSQL Connection Warning (server will stay online with offline/guest session fallback):');
    console.warn(error.message || error);
  }
}

export default connectDB;
