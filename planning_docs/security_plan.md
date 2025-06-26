# Security Plan

## Overview
This document outlines the security plan for implementing Row-Level Security (RLS) in our application. It covers the approach for both development and production environments.

## Development Phase

1. **Temporarily Disable RLS**
   - Disable RLS on the `profiles` table to facilitate development and testing.
   - Focus on building and testing features without security restrictions.

2. **Create Development Policies**
   - Optionally, create permissive RLS policies for development.
   - Allow all authenticated users to insert and select rows.

## Preparing for Production

1. **Design RLS Policies**
   - Plan and design RLS policies that align with security requirements.
   - Ensure each user can only access their own data.

2. **Test RLS Policies**
   - Thoroughly test RLS policies before deploying to production.
   - Use test cases to simulate different user roles and access scenarios.

3. **Enable RLS for Production**
   - Enable RLS for production once policies are verified.
   - Monitor and adjust policies based on real-world usage.

## Next Steps
- Access Supabase Dashboard to adjust RLS settings for development.
- Begin designing RLS policies for production.
- **NOTE:** As of 26 June 2025, secret validation is temporarily skipped for the scheduled sync Edge Function cron job to simplify development and reduce friction. **TODO:** Add proper secret validation before production deployment to prevent unauthorized access.
- **NOTE:** As of 26 June 2025, JWT authentication between the scheduled sync Edge Function and the Python backend is also skipped for development simplicity. **TODO:** Implement JWT verification in the Python backend and send the JWT from the Edge Function before production deployment.

---

This document will be updated as the project progresses and new security considerations arise. 