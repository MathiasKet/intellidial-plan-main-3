import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { logger } from '../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
import 'dotenv/config';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function runMigrations() {
  try {
    logger.info('Starting database migrations...');
    
    // Read all migration files
    const migrationsDir = path.join(__dirname, '../migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations run in order

    // Track applied migrations
    await ensureMigrationsTable();
    const appliedMigrations = await getAppliedMigrations();
    
    // Apply migrations
    for (const file of files) {
      const migrationName = file.split('.')[0];
      
      if (!appliedMigrations.has(migrationName)) {
        logger.info(`Applying migration: ${file}`);
        
        // Read SQL file
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        
        // Execute SQL
        const { error } = await supabase.rpc('exec', { query: sql });
        
        if (error) {
          throw new Error(`Migration ${file} failed: ${error.message}`);
        }
        
        // Record migration
        await recordMigration(migrationName);
        logger.info(`Applied migration: ${file}`);
      } else {
        logger.info(`Skipping already applied migration: ${file}`);
      }
    }
    
    logger.info('All migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error(`Migration failed: ${error.message}`);
    process.exit(1);
  }
}

async function ensureMigrationsTable() {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `;
  
  await supabase.rpc('exec', { query: createTableSQL });
}

async function getAppliedMigrations() {
  const { data, error } = await supabase
    .from('_migrations')
    .select('name');
    
  if (error) {
    throw new Error(`Failed to get applied migrations: ${error.message}`);
  }
  
  return new Set(data.map(m => m.name));
}

async function recordMigration(name) {
  const { error } = await supabase
    .from('_migrations')
    .insert([{ name }]);
    
  if (error) {
    throw new Error(`Failed to record migration: ${error.message}`);
  }
}

// Run migrations
runMigrations();
