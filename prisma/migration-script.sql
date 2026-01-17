-- Migration script to update CLIENT role to SALES role
-- Run this before applying schema changes

-- First, update all users with CLIENT role to SALES
-- This is safe because we're renaming CLIENT to SALES
UPDATE "User" SET role = 'SALES' WHERE role = 'CLIENT';

-- Verify the update
SELECT COUNT(*) as sales_users FROM "User" WHERE role = 'SALES';
