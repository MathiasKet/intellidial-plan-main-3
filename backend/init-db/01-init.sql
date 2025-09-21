-- Create the application user with password (if not exists)
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'app_user') THEN
      CREATE USER app_user WITH PASSWORD 'app_password';
   END IF;
END $$;

-- Grant all privileges on the database to the app user
GRANT ALL PRIVILEGES ON DATABASE ai_voice_caller TO app_user;

-- Connect to the database
\c ai_voice_caller

-- Grant all privileges on the public schema to the app user
GRANT ALL ON SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;

-- Allow the app user to create tables in the public schema
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO app_user;
