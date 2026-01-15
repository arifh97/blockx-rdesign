-- Enable RLS on new payment tables
ALTER TABLE user_payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_payment_accounts ENABLE ROW LEVEL SECURITY;

-- Create permissive policies for service role (postgres connection bypasses RLS by default)
-- Authorization should be handled in application code (server actions)

-- User payment accounts - fully accessible (protect in application code)
CREATE POLICY "Allow all for service role" ON user_payment_accounts 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Bid payment accounts - fully accessible
CREATE POLICY "Allow all for service role" ON bid_payment_accounts 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
