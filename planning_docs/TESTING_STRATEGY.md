# Testing Strategy

## Testing Pyramid

### Unit Tests (70% of tests)
**Backend:**
- Chess position analysis functions
- Spaced repetition algorithm
- Supabase client integration
- Database model methods
- API endpoint logic
- Row Level Security (RLS) policy testing

**Frontend:**
- Component rendering
- User interaction handlers
- Chess board state management
- Supabase client functions
- Real-time subscription handling
- Utility functions

### Integration Tests (20% of tests)
- API endpoint integration
- Supabase database operations
- Lichess API integration
- Supabase authentication flow
- Background job processing (Edge Functions)
- Real-time subscription functionality

### End-to-End Tests (10% of tests)
- Complete user onboarding with Supabase Auth
- Deviation detection workflow
- Review queue functionality
- Real-time updates across browser tabs
- Cross-browser compatibility
- Mobile responsiveness

## Test Data Strategy

### Chess Positions
- Known opening positions with clear correct moves
- Transposition cases
- Edge cases (castling, en passant, promotion)
- Historical game positions

### User Scenarios
- New user onboarding via Supabase Auth
- Returning user with existing data
- User with no recent games
- User with many deviations
- Multi-user real-time scenarios

### API Responses
- Mock Lichess API responses
- Error scenarios and rate limiting
- Large datasets for performance testing
- Supabase real-time event simulation

## Supabase-Specific Testing

### Authentication Testing
- OAuth flow with Lichess provider
- JWT token validation and refresh
- Session persistence across browser sessions
- User role and permission testing

### Database Testing
- Row Level Security (RLS) policy enforcement
- Cross-user data isolation
- Database function testing
- Real-time subscription accuracy
- Edge Function execution

### Real-time Features Testing
```typescript
// Example test for real-time subscriptions
describe('Real-time Deviations', () => {
  it('should receive new deviations in real-time', async () => {
    const mockDeviation = { /* test data */ };
    
    // Set up subscription
    const subscription = supabase
      .channel('test-deviations')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'deviations'
      }, (payload) => {
        expect(payload.new).toMatchObject(mockDeviation);
      });
    
    // Trigger deviation creation
    await createDeviation(mockDeviation);
    
    // Verify real-time update received
  });
});
```

### Edge Function Testing
```typescript
// Test Supabase Edge Functions
describe('Game Polling Edge Function', () => {
  it('should poll Lichess API and store deviations', async () => {
    const response = await fetch('/functions/v1/poll-games', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: 'test-user-id' })
    });
    
    expect(response.status).toBe(200);
    // Verify deviations were stored
  });
});
```

## Automated Testing Pipeline
1. **Pre-commit**: Linting, type checking, unit tests
2. **Pull Request**: Full test suite, integration tests, RLS policy tests
3. **Staging**: E2E tests, performance tests, real-time feature tests
4. **Production**: Smoke tests, monitoring alerts, Supabase health checks

## Performance Testing
- Load testing with 1000+ concurrent users
- Supabase database performance under heavy queries
- Real-time subscription performance with many concurrent connections
- API response times under various loads
- Memory usage and leak detection
- Edge Function cold start performance

## Security Testing
- Supabase OAuth flow security
- Row Level Security (RLS) policy enforcement
- SQL injection prevention (Supabase built-in protection)
- XSS vulnerability scanning
- JWT token security and expiration
- Data encryption verification (Supabase handles encryption at rest)
- Cross-user data access prevention

## Supabase Environment Testing

### Local Development
```bash
# Start local Supabase stack
supabase start

# Run migrations
supabase db reset

# Run tests against local instance
npm test
```

### Staging Environment
- Separate Supabase project for staging
- Production-like data volume testing
- Real-time feature testing with multiple users
- Performance benchmarking

### Production Monitoring
- Supabase dashboard monitoring
- Custom health check endpoints
- Real-time subscription health
- Database performance metrics
- Edge Function execution logs

## Test Coverage Goals
- **Unit Tests**: 90% code coverage
- **Integration Tests**: All API endpoints and database operations
- **E2E Tests**: Critical user journeys
- **RLS Policies**: 100% policy coverage with positive and negative test cases
- **Real-time Features**: All subscription channels and events