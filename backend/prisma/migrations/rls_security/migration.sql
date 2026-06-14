-- -----------------------------------------------------------------------------
-- NEXUS ENTERPRISE: POSTGRES ROW LEVEL SECURITY (RLS) HARDENING
-- -----------------------------------------------------------------------------

-- 1. Enable RLS on core multi-tenant tables
ALTER TABLE "Workspace" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Meeting" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Task" ENABLE ROW LEVEL SECURITY;

-- 2. Create Tenant Policies
-- Assumes application injects: SET LOCAL app.current_user_id = 'uuid';
-- Assumes application injects: SET LOCAL app.current_org_id = 'uuid';

-- Workspace RLS
CREATE POLICY workspace_isolation_policy ON "Workspace"
    USING ("organizationId" = current_setting('app.current_org_id')::text);

-- Meeting RLS
CREATE POLICY meeting_isolation_policy ON "Meeting"
    USING ("workspaceId" IN (SELECT id FROM "Workspace" WHERE "organizationId" = current_setting('app.current_org_id')::text));

-- Document RLS
CREATE POLICY document_isolation_policy ON "Document"
    USING ("workspaceId" IN (SELECT id FROM "Workspace" WHERE "organizationId" = current_setting('app.current_org_id')::text));

-- Task RLS
CREATE POLICY task_isolation_policy ON "Task"
    USING ("workspaceId" IN (SELECT id FROM "Workspace" WHERE "organizationId" = current_setting('app.current_org_id')::text));

-- 3. Force RLS for Superusers (if application connects as table owner)
ALTER TABLE "Workspace" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Meeting" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Document" FORCE ROW LEVEL SECURITY;
ALTER TABLE "Task" FORCE ROW LEVEL SECURITY;

-- 4. Create Read-Only Analytics Role
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'nexus_analytics') THEN
    CREATE ROLE nexus_analytics WITH LOGIN PASSWORD 'secure_analytics_password';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE nexus TO nexus_analytics;
GRANT USAGE ON SCHEMA public TO nexus_analytics;

-- Grant Read-Only access specifically excluding PII columns (if explicitly defined via views)
GRANT SELECT ON "Workspace" TO nexus_analytics;
GRANT SELECT ON "Meeting" TO nexus_analytics;
-- Explicitly revoke access to Users table passwords
REVOKE ALL ON "User" FROM nexus_analytics;
GRANT SELECT (id, email, name, "createdAt") ON "User" TO nexus_analytics;
