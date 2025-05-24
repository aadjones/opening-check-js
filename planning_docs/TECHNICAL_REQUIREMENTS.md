# Technical Requirements Document

## System Architecture

### High-Level Components

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API   │    │   Game Analyzer │
│   (React/TS)    │◄──►│   (FastAPI)     │◄──►│   (Background)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
│                        │
▼                        ▼
┌─────────────────┐    ┌─────────────────┐
│   Supabase      │    │   Lichess API   │
│   (Auth + DB)   │    │                 │
└─────────────────┘    └─────────────────┘
```

### Core Services

#### 1. Authentication Service
- **OAuth Integration**: Supabase Auth with Lichess OAuth provider
- **Session Management**: Supabase built-in JWT handling
- **User State**: Store Lichess username, selected studies in Supabase

#### 2. Game Polling Service
- **Frequency**: Every 5 minutes for active users, hourly for inactive
- **Rate Limiting**: Respect Lichess API limits (max 1 req/sec)
- **Error Handling**: Exponential backoff, dead letter queue
- **Storage**: Direct to Supabase with real-time updates

#### 3. Deviation Detection Engine
- **Input**: New games from polling service
- **Process**: Compare against cached study trees
- **Output**: Deviation records with real-time notifications

#### 4. Spaced Repetition Engine
- **Algorithm**: Modified SM-2 (SuperMemo)
- **Queue Management**: Priority-based review scheduling via Supabase functions
- **Difficulty Adjustment**: Based on user performance

#### 5. Study Cache Service
- **Purpose**: Cache Lichess studies to avoid repeated API calls
- **Invalidation**: Manual trigger + 24-hour TTL via Supabase functions
- **Storage**: Normalized opening tree structure in JSONB

## Database Schema (Supabase)

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lichess_username VARCHAR(50) UNIQUE NOT NULL,
    lichess_user_id VARCHAR(20) UNIQUE NOT NULL,
    white_study_id VARCHAR(20),
    black_study_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW(),
    last_active TIMESTAMP DEFAULT NOW(),
    settings JSONB DEFAULT '{}',
    
    -- Supabase Auth integration
    auth_user_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own data
CREATE POLICY "Users can view own data" ON users
    FOR ALL USING (auth.uid() = auth_user_id);
```

### Deviations Table
```sql
CREATE TABLE deviations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    game_id VARCHAR(20) NOT NULL,
    game_url VARCHAR(100) NOT NULL,
    move_number INTEGER NOT NULL,
    player_color VARCHAR(5) NOT NULL,
    played_move VARCHAR(10) NOT NULL,
    expected_move VARCHAR(10) NOT NULL,
    fen_before_deviation TEXT NOT NULL,
    opening_name VARCHAR(100),
    chapter_name VARCHAR(100),
    time_control VARCHAR(20),
    game_result VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW(),
    
    -- Spaced Repetition Fields
    review_count INTEGER DEFAULT 0,
    ease_factor DECIMAL(3,2) DEFAULT 2.5,
    interval_days INTEGER DEFAULT 1,
    next_review_date TIMESTAMP DEFAULT NOW(),
    last_reviewed TIMESTAMP,
    is_resolved BOOLEAN DEFAULT FALSE
);

-- Enable Row Level Security
ALTER TABLE deviations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own deviations
CREATE POLICY "Users can view own deviations" ON deviations
    FOR ALL USING (user_id IN (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
    ));
```

### Reviews Table
```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deviation_id UUID REFERENCES deviations(id),
    user_id UUID REFERENCES users(id),
    review_type VARCHAR(20) NOT NULL, -- 'correct', 'incorrect', 'skip'
    time_spent_seconds INTEGER,
    reviewed_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own reviews
CREATE POLICY "Users can view own reviews" ON reviews
    FOR ALL USING (user_id IN (
        SELECT id FROM users WHERE auth_user_id = auth.uid()
    ));
```

### Studies Cache Table
```sql
CREATE TABLE studies_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    study_id VARCHAR(20) UNIQUE NOT NULL,
    study_data JSONB NOT NULL,
    last_updated TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '24 hours'
);

-- This table can be public since it's just cached study data
```

## API Specification

### Authentication Endpoints (Supabase Auth)
```
GET  /auth/lichess          # Redirect to Lichess OAuth via Supabase
POST /auth/lichess/callback # Handle OAuth callback
POST /auth/refresh          # Refresh JWT token (handled by Supabase)
POST /auth/logout           # Invalidate session
```

### User Management
```
GET    /api/user/profile    # Get user profile
PUT    /api/user/studies    # Update study selections
GET    /api/user/stats      # Get user statistics
```

### Deviation Management
```
GET    /api/deviations              # Get paginated deviations
GET    /api/deviations/:id          # Get specific deviation
POST   /api/deviations/:id/review   # Record review attempt
PUT    /api/deviations/:id/resolve  # Mark as resolved
```

### Review Queue
```
GET    /api/queue                   # Get next items to review
POST   /api/queue/:id/answer        # Submit review answer
GET    /api/queue/stats             # Queue statistics
```

### Studies
```
GET    /api/studies/search          # Search user's studies
POST   /api/studies/refresh         # Force cache refresh
```

## Supabase-Specific Features

### Real-time Subscriptions
```typescript
// Frontend can subscribe to new deviations
const subscription = supabase
  .channel('deviations')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'deviations'
  }, (payload) => {
    // Handle new deviation in real-time
  })
  .subscribe()
```

### Edge Functions (for background tasks)
```typescript
// Supabase Edge Function for game polling
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey',
}

Deno.serve(async (req) => {
  // Poll Lichess API for new games
  // Detect deviations
  // Store in Supabase
  // Trigger real-time notifications
})
```

### Database Functions
```sql
-- Function to get next review items
CREATE OR REPLACE FUNCTION get_next_reviews(user_uuid UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
    deviation_id UUID,
    game_url VARCHAR,
    played_move VARCHAR,
    expected_move VARCHAR,
    fen_before_deviation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT d.id, d.game_url, d.played_move, d.expected_move, d.fen_before_deviation
    FROM deviations d
    JOIN users u ON d.user_id = u.id
    WHERE u.auth_user_id = user_uuid
      AND d.next_review_date <= NOW()
      AND d.is_resolved = FALSE
    ORDER BY d.next_review_date ASC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Performance Requirements

### Response Times
- Authentication: <500ms (Supabase handles this)
- Dashboard load: <2 seconds
- Deviation analysis: <5 seconds
- Review submission: <300ms (real-time updates)

### Scalability
- Support 1,000 concurrent users
- Process 10,000 games/hour
- Handle 100 deviations/minute
- Store 1M+ deviation records

### Availability
- 99.9% uptime (Supabase SLA)
- Automatic backups
- Point-in-time recovery

## Implementation Benefits

### Development Speed
- ✅ Built-in authentication
- ✅ Auto-generated REST APIs
- ✅ Real-time subscriptions
- ✅ Built-in dashboard and monitoring

### Security
- ✅ Row Level Security (RLS) policies
- ✅ JWT token management
- ✅ OAuth provider integration
- ✅ Automatic SQL injection protection

### Scalability
- ✅ Automatic scaling
- ✅ CDN for static assets
- ✅ Edge functions for background tasks
- ✅ Connection pooling

### Cost Efficiency
- ✅ Free tier: 500MB database, 50MB file storage
- ✅ Pay-as-you-scale pricing
- ✅ No infrastructure management costs

