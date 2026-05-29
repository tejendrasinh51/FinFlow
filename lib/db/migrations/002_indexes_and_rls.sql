-- Up migration: Indexes and Row-Level Security Policies

-- 1. Optimized indices for fast retrievals
CREATE INDEX IF NOT EXISTS idx_users_org ON users(org_id);
CREATE INDEX IF NOT EXISTS idx_metrics_org_type_date ON financial_metrics(org_id, metric_type, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_org ON reports(org_id);
CREATE INDEX IF NOT EXISTS idx_audit_org_date ON audit_log(org_id, created_at DESC);

-- 2. Enable Row-Level Security (RLS) on all core tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- 3. Define RLS Policies based on transaction-scoped session variable 'app.current_org_id'
-- Before querying, backend code runs: SET LOCAL app.current_org_id = 'org-uuid-here';

-- Users Policy
DROP POLICY IF EXISTS tenant_users_isolation ON users;
CREATE POLICY tenant_users_isolation ON users
  FOR ALL
  USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::UUID);

-- Metrics Policy
DROP POLICY IF EXISTS tenant_metrics_isolation ON financial_metrics;
CREATE POLICY tenant_metrics_isolation ON financial_metrics
  FOR ALL
  USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::UUID);

-- Reports Policy
DROP POLICY IF EXISTS tenant_reports_isolation ON reports;
CREATE POLICY tenant_reports_isolation ON reports
  FOR ALL
  USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::UUID);

-- Audit Log Policy
DROP POLICY IF EXISTS tenant_audit_isolation ON audit_log;
CREATE POLICY tenant_audit_isolation ON audit_log
  FOR ALL
  USING (org_id = NULLIF(current_setting('app.current_org_id', true), '')::UUID);
