-- Add Zoho Books product synchronization columns to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS zoho_item_id VARCHAR(255) UNIQUE,
ADD COLUMN IF NOT EXISTS unit VARCHAR(50),
ADD COLUMN IF NOT EXISTS item_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS reorder_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS vendor_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS purchase_rate DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS last_synced TIMESTAMP,
ADD COLUMN IF NOT EXISTS zoho_created_time VARCHAR(255),
ADD COLUMN IF NOT EXISTS zoho_modified_time VARCHAR(255);

-- Create index on zoho_item_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_zoho_item_id ON products(zoho_item_id);

-- Create index on last_synced for sync monitoring
CREATE INDEX IF NOT EXISTS idx_products_last_synced ON products(last_synced);

-- Create sync log table to track synchronization history
CREATE TABLE IF NOT EXISTS zoho_sync_logs (
  id SERIAL PRIMARY KEY,
  sync_type VARCHAR(50) NOT NULL, -- 'full_sync', 'single_product', 'webhook'
  status VARCHAR(20) NOT NULL, -- 'success', 'failed', 'partial'
  products_synced INTEGER DEFAULT 0,
  error_message TEXT,
  sync_duration_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- Create index on sync logs for reporting
CREATE INDEX IF NOT EXISTS idx_zoho_sync_logs_created_at ON zoho_sync_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_zoho_sync_logs_status ON zoho_sync_logs(status);
