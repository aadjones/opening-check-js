# User Stories & Acceptance Criteria

## Epic 1: Onboarding & Setup

### Story 1.1: OAuth Authentication
**As a** chess player  
**I want to** connect my Lichess account securely  
**So that** OutOfBook can access my games and studies  

**Acceptance Criteria:**
- [ ] User clicks "Connect with Lichess" button
- [ ] Redirected to Lichess OAuth page
- [ ] After authorization, returns to OutOfBook dashboard
- [ ] User's Lichess username displayed in UI
- [ ] JWT token stored securely in browser

### Story 1.2: Study Selection
**As a** new user  
**I want to** select my White and Black repertoire studies  
**So that** the system knows what to compare my games against  

**Acceptance Criteria:**
- [ ] Display searchable list of user's Lichess studies
- [ ] User can select one White study and one Black study
- [ ] Demo studies available for testing
- [ ] Studies are validated (must be public, contain games)
- [ ] Selection saved to user profile

### Story 1.3: Demo Mode
**As a** potential user  
**I want to** try OutOfBook without connecting my account  
**So that** I can understand the value before committing  

**Acceptance Criteria:**
- [ ] "Try Demo" button on landing page
- [ ] Pre-loaded demo data (famous games + repertoire)
- [ ] Full functionality except real game polling
- [ ] Clear indication this is demo mode
- [ ] Easy path to convert to real account

## Epic 2: Game Monitoring & Analysis

### Story 2.1: Game Polling
**As a** user  
**I want** my recent games automatically analyzed  
**So that** I don't have to manually upload anything  

**Acceptance Criteria:**
- [ ] System polls Lichess API every 5 minutes for new games
- [ ] Only analyzes games played after account connection
- [ ] Handles rate limiting gracefully
- [ ] Notifies user of any polling errors

### Story 2.2: Deviation Detection
**As a** user  
**I want** to see exactly where I deviated from my prep  
**So that** I can identify specific mistakes to fix  

**Acceptance Criteria:**
- [ ] Compares game moves against selected studies
- [ ] Identifies first move that deviates
- [ ] Captures FEN position, expected move, actual move
- [ ] Links to specific study chapter
- [ ] Handles transpositions correctly

### Story 2.3: Perfect Games Recognition
**As a** user  
**I want** to see when I followed my prep correctly  
**So that** I get positive reinforcement for good habits  

**Acceptance Criteria:**
- [ ] Dashboard shows "Perfect Games" count
- [ ] Green checkmark for games with no deviations
- [ ] Weekly summary includes perfect game percentage
- [ ] Celebration animation for streaks

## Epic 3: Spaced Repetition Learning

### Story 3.1: Review Queue
**As a** user  
**I want** to see my deviations in a learning queue  
**So that** I can systematically review and fix my mistakes  

**Acceptance Criteria:**
- [ ] Queue shows deviations scheduled for review
- [ ] Items ordered by priority (overdue first)
- [ ] Shows position, expected move, actual move
- [ ] Interactive chess board for visualization
- [ ] Queue updates after each review

### Story 3.2: Review Interface
**As a** user  
**I want** to practice the correct move in context  
**So that** I build muscle memory for the right response  

**Acceptance Criteria:**
- [ ] Shows chess position before deviation
- [ ] User attempts to play correct move
- [ ] Immediate feedback (correct/incorrect)
- [ ] Option to replay the correct line
- [ ] Links to full study chapter

### Story 3.3: Spaced Repetition Algorithm
**As a** user  
**I want** difficult deviations to appear more frequently  
**So that** I focus on my biggest weaknesses  

**Acceptance Criteria:**
- [ ] Easy reviews scheduled less frequently
- [ ] Hard reviews scheduled more frequently
- [ ] Interval increases with consecutive correct answers
- [ ] Failed reviews reset to short interval
- [ ] User can mark items as "mastered"

## Epic 4: Progress Tracking

### Story 4.1: Dashboard Overview
**As a** user  
**I want** to see my recent progress at a glance  
**So that** I can track improvement over time  

**Acceptance Criteria:**
- [ ] Shows recent deviations (last 5)
- [ ] Games analyzed counter
- [ ] Perfect games percentage
- [ ] Items due for review count
- [ ] Recent improvement trends

### Story 4.2: Detailed Statistics
**As a** data-driven user  
**I want** to see detailed analytics about my play  
**So that** I can identify patterns and improvement areas  

**Acceptance Criteria:**
- [ ] Deviation frequency by opening
- [ ] Time control breakdown
- [ ] Most common mistake types
- [ ] Improvement trends over time
- [ ] Heatmap of weak positions

### Story 4.3: Progress Sharing
**As a** user with a coach  
**I want** to share my deviation summary  
**So that** my coach can help me improve  

**Acceptance Criteria:**
- [ ] Generate shareable link for progress summary
- [ ] Public view shows anonymized statistics
- [ ] Coach can see specific deviations (with permission)
- [ ] Export data as PDF or CSV