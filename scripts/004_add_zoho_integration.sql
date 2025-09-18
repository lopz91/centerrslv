-- Add Zoho integration fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS zoho_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS last_zoho_sync TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS company VARCHAR(255),
ADD COLUMN IF NOT EXISTS address JSONB,
ADD COLUMN IF NOT EXISTS customer_type VARCHAR(20) CHECK (customer_type IN ('residential', 'commercial', 'contractor')),
ADD COLUMN IF NOT EXISTS credit_limit DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS payment_terms VARCHAR(50);

-- Create index for Zoho ID lookups
CREATE INDEX IF NOT EXISTS idx_profiles_zoho_id ON profiles(zoho_id);

-- Create sync log table for tracking synchronization history
CREATE TABLE IF NOT EXISTS zoho_sync_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sync_direction VARCHAR(20) NOT NULL CHECK (sync_direction IN ('to_zoho', 'from_zoho')),
  sync_status VARCHAR(20) NOT NULL CHECK (sync_status IN ('success', 'failed', 'pending')),
  zoho_id VARCHAR(255),
  error_message TEXT,
  sync_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for sync log queries
CREATE INDEX IF NOT EXISTS idx_zoho_sync_log_profile_id ON zoho_sync_log(profile_id);
CREATE INDEX IF NOT EXISTS idx_zoho_sync_log_created_at ON zoho_sync_log(created_at);

-- Enable RLS for sync log
ALTER TABLE zoho_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for zoho_sync_log
CREATE POLICY "Users can view their own sync logs" ON zoho_sync_log
  FOR SELECT USING (
    profile_id = auth.uid()
  );

-- Admin policy for sync logs
CREATE POLICY "Admins can manage all sync logs" ON zoho_sync_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
