# OutOfBook - Project Charter

## Vision Statement
OutOfBook is the intelligent chess training companion that bridges the gap between opening preparation and actual gameplay, using spaced repetition to reinforce learning from real game deviations.

## Mission
To help chess players (1200-2000 rating) maintain consistency between their studied repertoire and actual gameplay through automated deviation detection and adaptive learning reinforcement.

## Success Metrics
- **User Engagement**: 70% of users review deviations within 24 hours
- **Learning Effectiveness**: 50% reduction in repeated deviations within 30 days
- **User Retention**: 60% monthly active users after 90 days
- **Technical Performance**: <2 second deviation detection, 99.5% uptime

## Key Constraints
- Must integrate with Lichess API (no Chess.com initially)
- Spaced repetition queue instead of email notifications
- OAuth-only authentication (no manual account creation)
- Studies must remain on Lichess (we don't host chess content)