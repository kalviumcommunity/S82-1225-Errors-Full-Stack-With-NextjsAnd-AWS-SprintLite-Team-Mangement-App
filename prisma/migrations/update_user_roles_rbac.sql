-- UpdateUserRolesRBAC
-- This migration updates the User.role field to use RBAC roles (admin, manager, editor, viewer)

-- Update default role value
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'viewer';

-- Update existing roles to RBAC roles
-- Mapping: Owner -> admin, Admin -> admin, Manager -> manager, Member -> viewer

UPDATE "User" 
SET "role" = CASE 
    WHEN "role" = 'Owner' THEN 'admin'
    WHEN "role" = 'Admin' THEN 'admin'
    WHEN "role" = 'Manager' THEN 'manager'
    WHEN "role" = 'Member' THEN 'viewer'
    ELSE 'viewer' -- Default fallback
END;

-- Add comment to explain role values
COMMENT ON COLUMN "User"."role" IS 'RBAC roles: admin (full access), manager (team management), editor (content creation), viewer (read-only)';
