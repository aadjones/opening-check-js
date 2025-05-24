# Cursor Rules for Chess Opening Deviation Analyzer

This directory contains Cursor rules that provide AI coding assistance specifically tailored for your chess opening deviation analyzer project. These rules are based on the latest best practices from the Cursor community and official Supabase guidelines.

## 📁 Available Rules

### 🗄️ Database Rules
- **`supabase-functions.mdc`** - Guidelines for writing Supabase database functions with proper security and performance
- **`supabase-rls.mdc`** - Row Level Security (RLS) policies for secure multi-user data access
- **`supabase-edge-functions.mdc`** - Edge Functions for background tasks like game polling and study caching

### 🎨 Frontend Rules
- **`react-typescript.mdc`** - React/TypeScript best practices including chess-specific components
- Includes chess board components, deviation review interfaces, and Supabase integration hooks

### 🔧 Backend Rules
- **`fastapi-python.mdc`** - FastAPI development with Pydantic models, authentication, and API design
- Includes chess-specific models, spaced repetition algorithms, and Lichess API integration

## 🚀 How to Use

### Automatic Application
These rules are automatically applied when you work with relevant file types:
- `.sql` files → Database function and RLS rules
- `.ts`, `.tsx` files → React/TypeScript rules  
- `.py` files → FastAPI/Python rules

### Manual Invocation
You can manually invoke specific rules in Cursor:
- Type `@supabase-functions` for database function help
- Type `@supabase-rls` for RLS policy guidance
- Type `@react-typescript` for React component assistance
- Type `@fastapi-python` for backend API help

### Examples

#### Creating a Database Function
When working with SQL files, ask:
> "Create a function to calculate spaced repetition intervals"

The AI will follow the Supabase function guidelines and generate:
```sql
create or replace function public.calculate_spaced_repetition(...)
returns table (...)
language plpgsql
security invoker
set search_path = ''
as $$
-- Implementation following SM-2 algorithm
$$;
```

#### Building React Components
When working with TypeScript files, ask:
> "Create a chess board component with move highlighting"

The AI will generate properly typed React components with chess-specific interfaces and Supabase integration.

#### Designing API Endpoints
When working with Python files, ask:
> "Create an endpoint to submit deviation reviews"

The AI will generate FastAPI routes with proper Pydantic models, authentication, and error handling.

## 🎯 Project-Specific Features

### Chess Domain Knowledge
The rules include chess-specific examples:
- FEN position handling
- Move notation parsing
- Chess board rendering
- Opening deviation analysis

### Supabase Integration
Optimized for your Supabase architecture:
- Row Level Security patterns
- Real-time subscriptions
- Edge Function templates
- Authentication flows

### Spaced Repetition
Includes SM-2 algorithm implementations for:
- Review scheduling
- Difficulty adjustments
- Progress tracking

## 📚 Rule Sources

These rules are based on:
- [Official Supabase AI Editor Rules](https://supabase.com/ui/docs/ai-editors-rules/prompts)
- [Cursor Rules Community Repository](https://github.com/sanjeed5/awesome-cursor-rules-mdc)
- [PostgreSQL Best Practices](https://playbooks.com/rules/postgresql)
- Chess application domain expertise

## 🔄 Updates

These rules are current as of May 2025 and reflect the latest best practices. They'll help ensure your code follows modern patterns and leverages Supabase features effectively.

## 💡 Tips

1. **Be Specific**: The more specific your requests, the better the AI can apply the relevant rules
2. **Context Matters**: Rules work best when you're in the appropriate file type
3. **Combine Rules**: You can reference multiple rules in complex questions
4. **Review Suggestions**: Always review AI-generated code for your specific requirements

Happy coding! 🎉 