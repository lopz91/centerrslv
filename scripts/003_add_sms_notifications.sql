-- Add SMS notifications table for tracking order updates
CREATE TABLE IF NOT EXISTS order_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  notification_type VARCHAR(20) NOT NULL CHECK (notification_type IN ('sms', 'email', 'push')),
  message TEXT NOT NULL,
  phone_number VARCHAR(20),
  email_address VARCHAR(255),
  status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'failed', 'pending')),
  message_id VARCHAR(255), -- External service message ID (e.g., Twilio SID)
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add phone number to profiles if not exists
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS sms_notifications_enabled BOOLEAN DEFAULT true;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_order_notifications_order_id ON order_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_order_notifications_created_at ON order_notifications(created_at);

-- Enable RLS
ALTER TABLE order_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for order_notifications
CREATE POLICY "Users can view their own order notifications" ON order_notifications
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE user_id = auth.uid()
    )
  );

-- Admin policy (you'll need to implement admin role checking)
CREATE POLICY "Admins can manage all order notifications" ON order_notifications
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );
