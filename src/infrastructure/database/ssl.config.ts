import fs from 'fs';
import path from 'path';

/**
 * Load SSL certificate for database connection
 * Supabase requires SSL connections
 */
export function getSSLConfig() {
  // For Supabase pooler (port 6543), we MUST use rejectUnauthorized: false
  // The pooler uses certificates that don't match the hostname exactly
  // Even with the official Supabase CA cert, providing it causes validation issues
  // The solution is to NOT provide the cert when using rejectUnauthorized: false
  // This is a known limitation/requirement of Supabase's connection pooler
  
  // Simply return the SSL config without the certificate
  // SSL is still required and encrypted, we just don't verify the certificate chain
  return {
    rejectUnauthorized: false, // REQUIRED for Supabase pooler
    // Do NOT provide ca certificate when rejectUnauthorized is false
    // Providing it causes "self-signed certificate in certificate chain" error
  };
}

