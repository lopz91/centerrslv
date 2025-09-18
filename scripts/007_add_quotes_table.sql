-- Create quotes table for sales calculator
CREATE TABLE IF NOT EXISTS quotes (
  id SERIAL PRIMARY KEY,
  quote_number VARCHAR(50) UNIQUE DEFAULT 'Q-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD(nextval('quote_sequence')::text, 4, '0'),
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  project_type VARCHAR(100) NOT NULL,
  project_area DECIMAL(10,2),
  project_perimeter DECIMAL(10,2),
  project_notes TEXT,
  material_cost DECIMAL(10,2) DEFAULT 0,
  labor_cost DECIMAL(10,2) DEFAULT 0,
  services_cost DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  additional_services JSONB DEFAULT '[]',
  status VARCHAR(50) DEFAULT 'draft', -- draft, sent, accepted, rejected, expired
  valid_until DATE DEFAULT (CURRENT_DATE + INTERVAL '30 days'),
  zoho_quote_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID REFERENCES auth.users(id)
);

-- Create sequence for quote numbers
CREATE SEQUENCE IF NOT EXISTS quote_sequence START 1;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_quotes_customer_email ON quotes(customer_email);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON quotes(status);
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON quotes(created_at);
CREATE INDEX IF NOT EXISTS idx_quotes_quote_number ON quotes(quote_number);

-- Create trigger to update updated_at
CREATE OR REPLACE FUNCTION update_quotes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER quotes_updated_at_trigger
  BEFORE UPDATE ON quotes
  FOR EACH ROW
  EXECUTE FUNCTION update_quotes_updated_at();
