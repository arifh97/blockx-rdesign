-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================
-- IMPORTANT: Since you're using server-side Drizzle with postgres driver,
-- you're connecting as the 'postgres' role which BYPASSES RLS by default.
-- 
-- For RLS to work with your setup, you need to either:
-- 1. Use Supabase client libraries (which use the 'authenticated' role)
-- 2. Create a separate database role for your application
-- 3. Use SET ROLE in your queries (not recommended)
--
-- For now, these policies are set to PERMISSIVE (true) to allow your
-- server-side queries to work. In production, you should implement
-- application-level authorization in your server actions/API routes.
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE bid_payment_accounts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- BYPASS POLICIES FOR POSTGRES ROLE
-- ============================================
-- Since you're using the postgres connection string, create permissive policies
-- Your authorization should be handled in your server actions/API routes

-- Users table - fully accessible
CREATE POLICY "Allow all for service role" ON users FOR ALL USING (true) WITH CHECK (true);

-- Bids - fully accessible
CREATE POLICY "Allow all for service role" ON bids FOR ALL USING (true) WITH CHECK (true);

-- Orders - fully accessible
CREATE POLICY "Allow all for service role" ON orders FOR ALL USING (true) WITH CHECK (true);

-- Chat messages - fully accessible
CREATE POLICY "Allow all for service role" ON chat_messages FOR ALL USING (true) WITH CHECK (true);

-- Disputes - fully accessible
CREATE POLICY "Allow all for service role" ON disputes FOR ALL USING (true) WITH CHECK (true);

-- User payment accounts - fully accessible (protect in application code)
CREATE POLICY "Allow all for service role" ON user_payment_accounts FOR ALL USING (true) WITH CHECK (true);

-- Bid payment accounts - fully accessible
CREATE POLICY "Allow all for service role" ON bid_payment_accounts FOR ALL USING (true) WITH CHECK (true);
