# Supabase Setup Guide - Chess Opening Trainer

## Quick Setup (5 minutes)

### 1. Create Supabase Account & Project
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign up (GitHub/Google/Email)
3. Click "New Project"
4. Fill in:
   - **Name**: `opening-check-hobby` (or whatever you like)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Plan**: Free (perfect for hobby projects)
5. Wait 2-3 minutes for setup

### 2. Get Your API Keys
1. In your project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → This is your `SUPABASE_URL`
   - **anon public** key → This is your `SUPABASE_ANON_KEY`
   - **service_role secret** key → This is your `SUPABASE_SERVICE_ROLE_KEY`

### 3. Set Up Environment Variables
1. Copy `env.example` to `.env.local` (for frontend) or `.env` (for backend)
2. Replace the placeholder values with your actual Supabase credentials

### 4. Create Database Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `planning_docs/supabase_schema.sql`
3. Paste it into the SQL Editor
4. Click **Run**

### 5. Test Your Setup
1. Go to **Table Editor** in Supabase dashboard
2. You should see tables: `profiles`, `lichess_studies`, `opening_deviations`, `review_queue`
3. Try the authentication by going to **Authentication** → **Users**

## What You Get (Free Tier Limits)
- ✅ **50,000 monthly active users** (way more than you need!)
- ✅ **500 MB database** (plenty for chess data)
- ✅ **5 GB bandwidth** (good for hobby use)
- ✅ **1 GB file storage** (for any images/assets)
- ✅ **Unlimited API requests**
- ✅ **Community support**

## Database Tables Created
- **profiles**: User information (extends Supabase auth)
- **lichess_studies**: Stores your imported Lichess studies
- **opening_deviations**: Records when you deviate from study moves
- **review_queue**: Simple spaced repetition system

## Security Features
- ✅ **Row Level Security (RLS)** enabled on all tables
- ✅ Users can only access their own data
- ✅ Automatic profile creation on signup
- ✅ Secure authentication with magic links

## Next Steps
1. Set up your frontend to connect to Supabase
2. Implement Lichess OAuth integration
3. Start building the deviation detection logic

## Troubleshooting
- **Can't see tables?** Make sure you ran the SQL schema
- **Authentication not working?** Check your API keys in environment variables
- **RLS errors?** Make sure you're using the correct user context

## Useful Supabase Dashboard Sections
- **Table Editor**: View/edit your data
- **SQL Editor**: Run custom queries
- **Authentication**: Manage users
- **API**: View auto-generated API docs
- **Logs**: Debug issues 