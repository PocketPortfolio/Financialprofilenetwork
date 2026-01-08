-- Production Purge: Remove all test data
-- Execute in Supabase SQL Editor

BEGIN;

-- Delete conversations linked to test leads
DELETE FROM conversations 
WHERE lead_id IN (
  SELECT id FROM leads 
  WHERE email LIKE '%test%' 
     OR email LIKE '%example%' 
     OR company_name = 'Test Corp'
     OR company_name LIKE '%Test%'
);

-- Delete audit logs linked to test leads
DELETE FROM audit_logs 
WHERE lead_id IN (
  SELECT id FROM leads 
  WHERE email LIKE '%test%' 
     OR email LIKE '%example%' 
     OR company_name = 'Test Corp'
     OR company_name LIKE '%Test%'
);

-- Delete test leads
DELETE FROM leads 
WHERE email LIKE '%test%' 
   OR email LIKE '%example%' 
   OR company_name = 'Test Corp'
   OR company_name LIKE '%Test%';

-- Verify cleanup
SELECT 
  COUNT(*) as total_leads,
  COUNT(CASE WHEN status = 'NEW' THEN 1 END) as new_leads,
  COUNT(CASE WHEN status = 'RESEARCHING' THEN 1 END) as researching_leads,
  COUNT(CASE WHEN status = 'CONTACTED' THEN 1 END) as contacted_leads
FROM leads;

COMMIT;

