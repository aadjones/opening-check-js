# Testing Guide - Chess Frontend

## 🧪 Testing Framework: Vitest

We use **Vitest** as our testing framework because it's:
- ⚡ Fast and lightweight
- 🔧 Easy to configure with Vite
- 🎯 Great TypeScript support
- 🌐 Built-in jsdom for DOM testing

## 🚀 Running Tests

### Basic Commands
```bash
# Run tests in watch mode (recommended for development)
npm run test

# Run tests once and exit
npm run test:run

# Run tests with visual UI (opens in browser)
npm run test:ui

# Run tests with coverage report
npm run test:coverage
```

## 📁 Test Structure

```
src/test/
├── setup.ts                    # Test configuration and global setup
├── supabase.test.ts            # Unit tests for Supabase client (mocked)
└── supabase-integration.test.ts # Integration tests (real Supabase connection)
```

## 🔧 Test Types

### 1. Unit Tests (`supabase.test.ts`)
- **Mocked Supabase client** - doesn't require real connection
- Tests the structure and API of our Supabase configuration
- Always runs, regardless of environment variables

### 2. Integration Tests (`supabase-integration.test.ts`)
- **Real Supabase connection** - requires environment variables
- Tests actual database connectivity
- Automatically skips if `.env.local` is not configured

## ⚙️ Environment Setup for Tests

### For Unit Tests Only
No setup required! Unit tests use mocked Supabase client.

### For Integration Tests
1. Set up your `.env.local` file:
   ```bash
   VITE_SUPABASE_URL=your_actual_supabase_url
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key
   ```

2. Integration tests will automatically:
   - ✅ Run if environment variables are set
   - ⚠️ Skip with helpful message if not set

## 📊 Test Results

### ✅ Success Output
```
✓ src/test/supabase.test.ts (4 tests)
✓ src/test/supabase-integration.test.ts (2 tests)
✅ Supabase integration test passed!
```

### ⚠️ Skipped Integration Tests
```
⚠️ Skipping integration test - Supabase environment variables not set
To run this test, set up your .env.local file with:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY
```

## 🛠️ Configuration Files

### `vitest.config.ts`
- Configures Vitest to work with React and jsdom
- Sets up global test environment
- Points to test setup file

### `src/test/setup.ts`
- Extends Vitest with jest-dom matchers
- Configures cleanup after each test
- Global test configuration

## 🎯 What We're Testing

### Supabase Configuration
- ✅ Client can be imported without errors
- ✅ Database tables are accessible
- ✅ Authentication methods are available
- ✅ Environment variables are properly structured

### Database Connectivity
- ✅ Can connect to profiles table
- ✅ Queries return expected data structure
- ✅ Error handling works correctly

## 🔍 Debugging Tests

### View Test Output
```bash
# Run with verbose output
npm run test -- --reporter=verbose

# Run specific test file
npm run test supabase

# Run with UI for interactive debugging
npm run test:ui
```

### Common Issues

1. **Environment Variables Not Set**
   - Integration tests will skip with helpful message
   - Unit tests will still pass

2. **Supabase Connection Errors**
   - Check your `.env.local` file
   - Verify Supabase project is running
   - Check API keys are correct

3. **Import Errors**
   - Make sure all dependencies are installed
   - Check TypeScript configuration

## 🚀 Next Steps

As we build more features, we'll add tests for:
- 🔐 Authentication components
- 📊 Dashboard functionality  
- ♟️ Chess board interactions
- 🔄 Lichess API integration
- 📈 Deviation detection logic

## 💡 Tips

- **Use `npm run test:ui`** for the best development experience
- **Write tests as you build features** - it's easier than retrofitting
- **Integration tests are valuable** but unit tests are faster
- **Mock external dependencies** in unit tests for speed and reliability 