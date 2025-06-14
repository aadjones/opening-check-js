# Quick Setup Instructions

## ✅ What's Done
- [x] Supabase project created
- [x] Database schema set up
- [x] Supabase client libraries installed
- [x] Client configuration files created
- [x] Environment variables configured and tested
- [x] Vitest testing framework set up
- [x] MCP (Model Context Protocol) configured for AI database assistance

## 🤖 MCP Setup - AI Database Assistant

**What is MCP?** Model Context Protocol allows AI assistants (like Claude in Cursor) to directly interact with your Supabase database - creating tables, running queries, generating types, and more!

### Current Configuration
- **Project ID**: `fsmtmtconmgujlhmkqgp` (OutOfBook - Active)
- **Project Name**: "OutOfBook" 
- **Region**: us-east-2
- **Status**: ACTIVE_HEALTHY
- **MCP Server**: Supabase MCP Server (Global configuration)
- **Authentication**: Personal Access Token (stored securely in environment variables)

### 🎯 Target Database
This project connects to the **"OutOfBook"** Supabase project which contains:
- **5 tables**: profiles, lichess_studies, opening_deviations, review_queue, sync_preferences
- **Live data**: ~20 opening deviations, 4 Lichess studies, 1 user profile
- **Database URL**: `db.fsmtmtconmgujlhmkqgp.supabase.co`

**⚠️ Important**: When using MCP, make sure you're working with project ID `fsmtmtconmgujlhmkqgp`. You can verify this by asking the AI: *"What Supabase projects do I have?"* and confirming you see the "OutOfBook" project as ACTIVE.

**📋 Project Configuration**: See `.cursor/project-config.json` for the complete project configuration including database details.

### For New Team Members

If you're setting up this project on a new machine:

1. **Create Supabase Personal Access Token:**
   - Go to [supabase.com](https://supabase.com) → Sign in
   - Click your profile → Account Settings → Access Tokens
   - Generate new token named "Cursor MCP Server"
   - Copy the token immediately!

2. **Set Environment Variable (Windows PowerShell):**
   ```powershell
   # Set for current session
   $env:SUPABASE_ACCESS_TOKEN = "your-token-here"
   
   # Make it permanent
   [Environment]::SetEnvironmentVariable("SUPABASE_ACCESS_TOKEN", "your-token-here", "User")
   
   # Verify it worked
   echo $env:SUPABASE_ACCESS_TOKEN
   ```

3. **Configure Global MCP in Cursor:**
   - Open Cursor Settings → MCP
   - Click "Add new global MCP server"
   - Replace the empty configuration with:
   ```json
   {
     "mcpServers": {
       "supabase": {
         "command": "cmd",
         "args": [
           "/c",
           "npx",
           "-y",
           "@supabase/mcp-server-supabase@latest",
           "--access-token",
           "%SUPABASE_ACCESS_TOKEN%"
         ]
       }
     }
   }
   ```

4. **Restart Cursor completely** and verify the MCP connection shows "Active" status

### What You Can Do With MCP

Once configured, you can ask the AI assistant to:
- **Query database**: "Show me recent opening deviations"
- **Create tables**: "Add a new table for game analysis"
- **Generate types**: "Generate TypeScript types for my database"
- **Run migrations**: "Add a new column to track opening names"
- **Manage projects**: "List all my Supabase projects"

### Security Notes
- **Personal Access Token**: Works across ALL your Supabase projects
- **Environment Variables**: Keeps credentials secure and out of git
- **Global Configuration**: Works in any Cursor project, no per-project setup needed

## 🎉 Setup Complete!

Your Supabase integration is working perfectly! The tests confirm:
- ✅ Backend connection successful
- ✅ Frontend connection successful  
- ✅ Database tables accessible
- ✅ Environment variables properly configured

## 🧪 Testing Your Setup

### Run Tests
```bash
cd chess_frontend

# Run all tests
npm run test:run

# Run with visual UI (recommended)
npm run test:ui

# Watch mode for development
npm run test
```

### Test Results
- **Unit tests**: Always pass (use mocked Supabase)
- **Integration tests**: Pass when environment variables are set
- **6 tests total**: All should be passing ✅

## 📁 Files Created
- `chess_frontend/src/lib/supabase.ts` - Frontend Supabase client with TypeScript types
- `chess_backend/supabase_client.py` - Backend Supabase client with connection testing
- `chess_frontend/src/test/` - Complete test suite with unit and integration tests
- `chess_frontend/README-TESTING.md` - Comprehensive testing documentation
- `planning_docs/supabase_schema.sql` - Database schema
- `planning_docs/SUPABASE_SETUP.md` - Detailed setup guide

## 🚀 Next Steps - Ready to Build!

Now that your foundation is solid, you can choose what to build next:

### Option 1: Authentication System 🔐
- Build login/signup components
- Implement Lichess OAuth
- User profile management

### Option 2: Basic Dashboard 📊  
- Create main app layout
- Study selection interface
- Basic navigation

### Option 3: Core Logic 🧠
- Lichess API integration
- Opening deviation detection
- Review queue system

### Option 4: Chess Interface ♟️
- Chess board component
- Move visualization
- Position analysis

## 💡 Development Workflow

1. **Write tests first** (we have the framework ready!)
2. **Use `npm run test:ui`** for the best development experience
3. **Check both frontend and backend** when making changes
4. **Environment variables are secure** (not committed to git)

## 🛠️ Useful Commands

```bash
# Frontend development
cd chess_frontend
npm run dev          # Start dev server
npm run test:ui      # Run tests with UI
npm run build        # Build for production

# Backend development  
cd chess_backend
python supabase_client.py    # Test Supabase connection
python main.py              # Start FastAPI server

# Testing
cd chess_frontend
npm run test                # Watch mode
npm run test:run           # Run once
npm run test:coverage      # With coverage report
```

**🎯 You're all set! What would you like to build next?** 