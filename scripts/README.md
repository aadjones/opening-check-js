# Scripts Directory

This folder contains utility scripts for development, testing, and database management.

## reset_review_queue.sql

**Purpose:**
Resets the spaced repetition review queue for all users. This is useful for debugging, testing, or starting a new review cycle. It clears the current review queue and puzzle attempts, then repopulates the queue with all user deviations (where `first_deviator = 'user'`).

### How to Run

You can run this script in several ways:

#### 1. Supabase SQL Editor (Web UI)
- Open your Supabase project dashboard
- Go to **SQL Editor**
- Copy and paste the contents of `reset_review_queue.sql` into a new query
- Click **Run**

#### 2. Supabase CLI
- Make sure you have the Supabase CLI installed and authenticated
- Run:
  ```sh
  supabase db execute --file scripts/reset_review_queue.sql
  ```
  Or, if you need to specify a DB URL:
  ```sh
  supabase db reset --db-url "your-db-url" < scripts/reset_review_queue.sql
  ```

#### 3. Claude's mcp_supabase_execute_sql Tool
- If using Claude's automation, you can run the script by passing its contents to the `mcp_supabase_execute_sql` tool.

---

**Note:** This script will clear all current review queue and puzzle attempt data. Use with caution in production environments. 