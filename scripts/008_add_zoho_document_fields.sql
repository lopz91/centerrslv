-- Add fields to track Zoho Books documents in orders table
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS zoho_invoice_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS zoho_invoice_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS zoho_shipping_ticket_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS zoho_shipping_ticket_number VARCHAR(100);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_zoho_invoice ON orders(zoho_invoice_id);
CREATE INDEX IF NOT EXISTS idx_orders_zoho_shipping_ticket ON orders(zoho_shipping_ticket_id);

-- Add comments for documentation
COMMENT ON COLUMN orders.zoho_invoice_id IS 'Zoho Books invoice ID for this order';
COMMENT ON COLUMN orders.zoho_invoice_number IS 'Zoho Books invoice number for this order';
COMMENT ON COLUMN orders.zoho_shipping_ticket_id IS 'Zoho Books delivery challan ID for this order';
COMMENT ON COLUMN orders.zoho_shipping_ticket_number IS 'Zoho Books delivery challan number for this order';
