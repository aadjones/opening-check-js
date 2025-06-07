# OutOfBook Backend & Integration — Plain-English Roadmap
*(human-friendly summary of the revised plan, [Current Date])*

---

## 0. Big Picture

| Question | Plain answer |
| --- | --- |
| **What's the end goal?** | A system that watches your Lichess games, spots when you go "off book," and helps you review those moments in a clean dashboard. |
| **Why this plan?** | We have the frontend pieces built, but they're not connected to real data. We need to wire everything up and make it actually work. |
| **How's the work sliced?** | Three phases of ~1-2 hour "task loops." Each loop has clear success criteria so we know when it's really done. |

---

## 1. Core Architecture Change (already accepted)

* **Timestamp-based game syncing**  
  *Instead of counting games, we track when we last looked. Never miss a game, even if you play 100 in one day.*  
* **Simple review status**  
  *Each deviation is either "needs review," "reviewed," "adopted," or "ignored."*  
* **Basic prep score**  
  *Weekly score of how well you stuck to your prep vs. went off book.*  

***Hidden gotcha:** test the sync system with a power user early—if it chokes on 50+ games, you'll have unhappy users.*

---

## 2. Phase 1 — "Make It Work"

1. **Database Updates (Task 1)**  
   *Add a few columns to track sync times and review status. Keep it simple—we can add fancy stuff later.*  
2. **Game Sync (Task 2)**  
   *Build the core system that checks Lichess for new games. Handle batches, respect rate limits, don't break.*  
3. **Review System (Task 3)**  
   *Let users mark deviations as reviewed, adopted, or ignored. Basic but effective.*  
4. **Prep Score (Task 4)**  
   *Calculate a simple weekly score: how often did you stick to your prep?*

**Phase-1 success snapshot**

* The system can fetch your games from Lichess without breaking.  
* You can mark deviations as reviewed.  
* Your weekly prep score shows up.  
* Everything works even if you play 50 games in one day.

---

## 3. Phase 2 — "Make It Useful"

* **Dashboard comes alive**  
  - Real games show up in the list.  
  - Prep score widget shows actual numbers.  
  - Last game summary shows what really happened.  
* **Review queue works**  
  - See your unresolved deviations.  
  - Mark them reviewed with one click.  
  - Basic actions (review/adopt/ignore) all work.  
* **Sync controls**  
  - Set how often to check for games.  
  - Manual sync button works.  
  - See if sync is happening.

**Phase-2 success snapshot**

* Your real games appear in the dashboard.  
* You can review deviations, see your prep score, and control when the system checks for new games.  
* Everything feels connected and real.

---

## 4. Phase 3 — "Don't Break"

* **Error handling**  
  - Sync errors show friendly messages.  
  - API problems don't crash the app.  
  - Users know what went wrong.  
* **Loading states**  
  - See when sync is happening.  
  - Lists show loading state.  
  - Actions show they're working.

**Phase-3 success snapshot**

* The app handles errors gracefully.  
* Users always know what's happening.  
* Nothing breaks in weird ways.

---

## 5. Future Stuff (Post-MVP)

* **Advanced features we'll add later:**
  - Smart insights about your prep holes
  - Real-time updates beyond basic sync
  - Quiet hours for notifications
  - Advanced prep score features
  - Performance optimizations
  - Analytics and metrics

---

## 6. Test Strategy Cheatsheet

| Scope | What we test | When |
| --- | --- | --- |
| **Unit** | Sync logic, score calculation, status updates | Each task loop |
| **Integration** | Sync + database, frontend + backend | After each phase |
| **E2E** | Full "play game → see deviation → review it" journey | Final polish |

---

## 7. Common Gotchas to Watch For

* **Rate limits:** Lichess API has limits. Handle them gracefully.
* **Batch size:** Don't try to sync 1000 games at once.
* **Error states:** Always show what went wrong.
* **Loading:** Always show what's happening.
* **Edge cases:** What if a user plays 100 games? What if sync fails?

---

## 8. Success Metrics (Human Terms)

* **Phase 1:** Does it reliably get your games and track reviews?
* **Phase 2:** Can you actually use it to review your prep mistakes?
* **Phase 3:** Does it feel solid and trustworthy?

---

## Notes

* Keep it simple. We can add fancy features later.
* Test with real users early—especially power users.
* If something feels overengineered, it probably is.
* Focus on making it work reliably before making it fancy. 