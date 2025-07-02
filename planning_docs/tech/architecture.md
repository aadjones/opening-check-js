# OutOfBook Architecture Notes

## Game Sync System Design

### Overview
The game sync system is responsible for keeping OutOfBook's database in sync with users' Lichess games. It needs to handle both casual players and power users efficiently while ensuring no games are missed.

### Core Strategy
Instead of fetching a fixed number of recent games each time, we track the last synced timestamp for each user and fetch all games since that point. This ensures we never miss games, regardless of how many are played.

### Implementation Flow
```
User plays games on Lichess
↓
Our sync system runs (based on user's frequency preference)
↓
Fetch games since last_synced_at
↓
If games found:
  - Process them
  - Update last_synced_at to the most recent game's timestamp
↓
If no games found:
  - Just update last_synced_at to current time
  - (This prevents re-fetching the same time period)
```

### Database Requirements
```sql
-- Add to user profile or new sync table
alter table profiles add column last_synced_at timestamp with time zone;
alter table profiles add column last_game_at timestamp with time zone;
```

### User Pattern Handling

#### A. Casual Players (1-2 games per day)
- Hourly sync is sufficient
- Each sync will fetch 0-2 games
- Very efficient

#### B. Active Players (10-20 games per day)
- Hourly sync still works well
- Each sync might fetch 5-10 games
- Still manageable

#### C. Power Users (100+ games in a day)
Two approaches to handle high volume:

1. **Batch Processing**
   - If >50 games detected in one sync
   - Process in batches of 50
   - Update last_synced_at after each batch
   - Prevents timeouts and memory issues

2. **Smart Sync**
   - If user plays very frequently, increase sync frequency
   - Example: if 100 games in 2 hours, sync every 10 minutes
   - Spreads the load

### Error Handling & Recovery
- Failed syncs don't update last_synced_at
- Next sync will retry the same period
- Track failed syncs with sync_attempted_at
- After 3 failures, mark for manual review

### Rate Limiting
- Respect Lichess API rate limits
- Implement exponential backoff
- Track API calls per user
- Temporarily increase sync interval if limits hit

### Example Implementation
```typescript
async function syncUserGames(userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('lichess_username, last_synced_at, last_game_at')
    .eq('id', userId)
    .single();

  // If never synced, start from 24 hours ago
  const since = profile.last_synced_at || new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  try {
    // Fetch games since last sync
    const games = await fetchLichessGames(profile.lichess_username, since);
    
    if (games.length === 0) {
      // No new games, just update sync time
      await updateLastSynced(userId, new Date());
      return;
    }

    // Handle large batches
    if (games.length > 50) {
      // Process in batches of 50
      for (let i = 0; i < games.length; i += 50) {
        const batch = games.slice(i, i + 50);
        await processGameBatch(batch);
        // Update last_synced_at to the last game in this batch
        await updateLastSynced(userId, new Date(batch[batch.length - 1].createdAt));
      }
    } else {
      // Process all games at once
      await processGameBatch(games);
      await updateLastSynced(userId, new Date(games[games.length - 1].createdAt));
    }

    // Update last_game_at to most recent game
    await updateLastGameAt(userId, new Date(games[0].createdAt));

  } catch (error) {
    // Handle rate limits, network errors, etc.
    if (isRateLimitError(error)) {
      // Increase sync interval for this user
      await increaseSyncInterval(userId);
    }
    throw error;
  }
}
```

### Benefits
1. Never miss games, regardless of volume
2. Efficient for both casual and power users
3. Handles rate limits gracefully
4. Adapts to user's playing patterns
5. Easy to recover from failures

### Future Considerations
- Add monitoring for sync performance
- Implement user-specific sync frequency based on playing patterns
- Add manual sync trigger for immediate updates
- Consider adding a queue system for very high volume users
- Add analytics to track sync patterns and optimize performance 