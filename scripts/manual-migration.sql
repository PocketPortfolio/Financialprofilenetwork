-- Manual migration for Sprint 4: Humanity & Precision Upgrade
-- Add new fields to leads table

-- Add location field
ALTER TABLE leads ADD COLUMN IF NOT EXISTS location TEXT;

-- Add timezone field
ALTER TABLE leads ADD COLUMN IF NOT EXISTS timezone TEXT;

-- Add detected language field
ALTER TABLE leads ADD COLUMN IF NOT EXISTS detected_language TEXT;

-- Add detected region field
ALTER TABLE leads ADD COLUMN IF NOT EXISTS detected_region TEXT;

-- Add news signals field (JSONB)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS news_signals JSONB;

-- Add scheduled send at field
ALTER TABLE leads ADD COLUMN IF NOT EXISTS scheduled_send_at TIMESTAMP;

-- Create index on timezone for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_timezone ON leads(timezone) WHERE timezone IS NOT NULL;

-- Create index on scheduled_send_at for scheduled email queries
CREATE INDEX IF NOT EXISTS idx_leads_scheduled_send_at ON leads(scheduled_send_at) WHERE scheduled_send_at IS NOT NULL;

