-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  avatar_url VARCHAR(512),
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'agent', 'user')),
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

-- Refresh tokens for JWT rotation
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(512) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked BOOLEAN DEFAULT false,
  revoked_at TIMESTAMPTZ,
  created_by_ip VARCHAR(45),
  UNIQUE(token)
);

-- Calls table
CREATE TABLE IF NOT EXISTS calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id VARCHAR(255), -- Twilio Call SID
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  from_number VARCHAR(50) NOT NULL,
  to_number VARCHAR(50) NOT NULL,
  direction VARCHAR(10) CHECK (direction IN ('inbound', 'outbound')),
  status VARCHAR(20) DEFAULT 'initiated' CHECK (status IN (
    'initiated', 'ringing', 'in-progress', 'completed', 'busy', 'failed', 'no-answer'
  )),
  duration INTEGER, -- in seconds
  recording_url TEXT,
  recording_duration INTEGER, -- in seconds
  price NUMERIC(10, 5),
  price_unit VARCHAR(10),
  started_at TIMESTAMPTZ,
  answered_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Call transcripts
CREATE TABLE IF NOT EXISTS call_transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  confidence FLOAT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Call segments (for detailed call analysis)
CREATE TABLE IF NOT EXISTS call_segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  speaker VARCHAR(50), -- 'agent', 'customer', 'system'
  content TEXT NOT NULL,
  start_time FLOAT, -- in seconds from call start
  end_time FLOAT,   -- in seconds from call start
  sentiment_score FLOAT,
  sentiment_label VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Contacts (address book)
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50) NOT NULL,
  company VARCHAR(255),
  job_title VARCHAR(255),
  notes TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT unique_user_contact UNIQUE (user_id, phone)
);

-- Call notes
CREATE TABLE IF NOT EXISTS call_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Call recordings
CREATE TABLE IF NOT EXISTS call_recordings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID NOT NULL REFERENCES calls(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  format VARCHAR(10) DEFAULT 'mp3',
  size_bytes BIGINT,
  storage_provider VARCHAR(50) DEFAULT 'twilio',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- CRM sync status
CREATE TABLE IF NOT EXISTS crm_sync (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES calls(id) ON DELETE CASCADE,
  crm_id VARCHAR(255), -- ID in the external CRM
  crm_type VARCHAR(50) NOT NULL, -- 'zoho', 'salesforce', etc.
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'synced', 'failed')),
  error_message TEXT,
  synced_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Call templates
CREATE TABLE IF NOT EXISTS call_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT false,
  tags TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  timezone VARCHAR(50) DEFAULT 'UTC',
  language VARCHAR(10) DEFAULT 'en',
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": true}'::jsonb,
  call_recording_enabled BOOLEAN DEFAULT true,
  voicemail_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Voicemails
CREATE TABLE IF NOT EXISTS voicemails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  call_id UUID REFERENCES calls(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  from_number VARCHAR(50) NOT NULL,
  to_number VARCHAR(50) NOT NULL,
  duration INTEGER NOT NULL, -- in seconds
  recording_url TEXT NOT NULL,
  transcript TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Scheduled calls
CREATE TABLE IF NOT EXISTS scheduled_calls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  phone_number VARCHAR(50) NOT NULL,
  scheduled_time TIMESTAMPTZ NOT NULL,
  timezone VARCHAR(50) DEFAULT 'UTC',
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'canceled', 'failed')),
  call_id UUID REFERENCES calls(id) ON DELETE SET NULL,
  reminder_sent BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Call analytics
CREATE TABLE IF NOT EXISTS call_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_calls INTEGER DEFAULT 0,
  answered_calls INTEGER DEFAULT 0,
  missed_calls INTEGER DEFAULT 0,
  total_duration INTEGER DEFAULT 0, -- in seconds
  avg_duration FLOAT DEFAULT 0,     -- in seconds
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_calls_user_id ON calls(user_id);
CREATE INDEX IF NOT EXISTS idx_calls_status ON calls(status);
CREATE INDEX IF NOT EXISTS idx_calls_created_at ON calls(created_at);
CREATE INDEX IF NOT EXISTS idx_call_transcripts_call_id ON call_transcripts(call_id);
CREATE INDEX IF NOT EXISTS idx_call_segments_call_id ON call_segments(call_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
CREATE INDEX IF NOT EXISTS idx_voicemails_user_id ON voicemails(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_user_id ON scheduled_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_calls_status ON scheduled_calls(status);

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
DO $$
DECLARE
    t record;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
        AND table_name IN ('users', 'calls', 'call_transcripts', 'call_segments', 
                          'contacts', 'call_notes', 'call_recordings', 'crm_sync',
                          'call_templates', 'user_settings', 'voicemails', 'scheduled_calls')
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_modtime ON %I', t.table_name, t.table_name);
        EXECUTE format('CREATE TRIGGER update_%s_modtime
                        BEFORE UPDATE ON %I
                        FOR EACH ROW EXECUTE FUNCTION update_modified_column()', 
                      t.table_name, t.table_name);
    END LOOP;
END;
$$;
