# **OutOfBook**

## **Overview**

You spent hours preparing your lines. King's Indian, Najdorf, London System—whatever flavor of self-respect you cooked up. But then? You mixed up your move order and played h3 on move 6 instead of Be2. **OutOfBook** is the assistant that remembers your prep *even when you don't*. It watches your games, waits for you to slip, and politely shows you what you meant to play.

You plug in your Lichess studies (White and Black), and from then on, we quietly track your games. When you go out-of-book, we'll let you know—and walk you back to the line.

## **🧠 Core Loop**

**Connect → Detect → Notify → Review → Reinforce**

1. User connects their Lichess account via OAuth

2. System polls for recent games

3. Detects deviation from user's study-defined repertoire

4. Logs the deviation with exact FEN, move, and chapter context

5. Sends notification (email or dashboard)

6. User reviews the move, replays the correct line, or adapts it

## **🧍‍♂️ User Model**

**Primary User:**

* Rating 1200–2000 Lichess

* Already has White and Black prep stored in Lichess studies

* Plays online blitz/rapid daily

* Wants alignment between what they *train* and what they *play*

**Secondary Users:**

* Coaches (reviewing deviation history for students)

* Stat junkies (habitual pattern optimizers)

## **🧱 System Architecture** 

**Inputs:**

* OAuth-authenticated Lichess user

* Two Lichess Studies (White / Black)

* Stream of recent games from the Lichess API

**Core Logic:**  
 For each new game:

* Determine side played

* Compare opening sequence against study tree

* Detect earliest move that deviates

* Store a snapshot:

  * Game ID, move number, move played, move expected, FEN

  * Matched chapter, time control, result, timestamp

* Trigger review or email notification

**Snapshot Model:**  
Deviations are immutable. If you later edit your study, the system keeps the original reference. You can re-analyze, but the moment of error is frozen.

## 

## **🧰 Product Surface**

### **Dashboard**

* Most recent deviation (or success)

* Shortlist of last 5 games

* Quick filters: time control, date range, deviation size

### **Deviation Page (`/deviation/:id`)**

\-----------------------------------------------------------  
| ❌ You deviated from your prep on move 6                |  
| 📖 Opening: King's Indian – Classical                   |  
| 🤝 vs. BigBlunder420 (1740) — Blitz 5+3 — Result: Loss |  
\-----------------------------------------------------------

    You played:   6.h3     ❌  
    Expected:     6.Be2    ✅

\<chessboard view at move 6 — white to move\>

\+------------------------+------------------------+  
|    \[ View My Move \]    |    \[ View My Prep \]    |  
\+------------------------+------------------------+

\-----------------------------------------------------------  
| ▶️ \[ Replay My Prep Line \]                               |  
| ✅ \[ Mark as Reviewed \]                                  |  
| ... \[ More Options \]                                     |  
|     \- I meant to play h3 (Adopt it)                     |  
|     \- Ignore this chapter in the future                 |  
|     \- View full study on Lichess →                      |  
\-----------------------------------------------------------

\-----------------------------------------------------------  
| 🔄 You've deviated from this line 3 times recently.      |  
| Want to revisit it again next week?   \[ Remind Me \]     |  
\-----------------------------------------------------------

### 

### 

### **Notification System**

* Email opt-in after first deviation

* Notification frequency:

  * Every game

  * Daily digest

  * Weekly summary

* Smart triggers:

  * New deviation

  * Same mistake repeated

  * Prep followed perfectly

## **🌀 Onboarding Flow**

1\. Landing Page  
\-----------------------------------------------------------  
|  🧠 OutOfBook                                             |  
|  Track your real games against your real prep.           |  
|                                                         |  
| ✅ Automatic deviation detection                        |  
| ✅ Review what you forgot, right after you forget it     |  
| ✅ Stay aligned with your own prep ()         |  
|                                                         |  
| \[ Connect with Lichess \]                                |  
|                                                         |  
| ↓ Want to try first?                                    |  
| \[ Try a demo \]                                          |  
\-----------------------------------------------------------

2\. Study Selection  
\-----------------------------------------------------------  
| 🎯 Step 2: Choose Your Repertoire                        |
|                                                          |
| 🧠 Welcome to OutOfBook                                  |
| Track your games against your prep.                      |
\-----------------------------------------------------------

[Card: White Repertoire]
🔍 White Repertoire Study URL
[________________________________________________]
[Validate]  [How to find your study URL? →]

[Card: Black Repertoire]
🔍 Black Repertoire Study URL
[________________________________________________]
[Validate]  [How to find your study URL? →]

[Card: Quick Start]
⬜ Load Demo Repertoires
(Perfect for trying out the system)

[Card: Status]
✅ URLs validated and ready
⚠️ Please fix the following:
  • White study URL is invalid
  • Black study URL is private

[Primary Action Button]
✅ Start Tracking Your Games

\-----------------------------------------------------------
[Card: Help & Privacy]
📚 Need help? Check our guide on setting up studies
🔒 Your studies stay private - we only read your opening lines
📎 We'll access your studies through your Lichess account
\-----------------------------------------------------------

3\. Ready State  
\-----------------------------------------------------------  
| ✅ You're ready to go\!                                  |  
|                                                         |  
| We'll start checking your new games for deviations.     |  
|                                                         |  
| What happens next?                                      |  
| \- You play games on Lichess (as usual)                  |  
| \- We check for opening drift                            |  
| \- You get notified when something's worth reviewing     |  
|                                                         |  
| \[ View Dashboard (0 Deviations) \]                       |  
\-----------------------------------------------------------

4\. Email Opt-In Prompt (after first deviation)  
\-----------------------------------------------------------  
| 📬 Want to get notified next time you go off-book?      |  
|                                                         |  
| You just deviated from your prep.                       |  
| We can send you insights like this by email.            |  
|                                                         |  
| \[ Your email: \_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_ \]                |  
|                                                         |  
| \[ ✅ \ \ Yes, send \ me \ updates \]                             |  
| \[ Maybe \ later \]                                         |  
\-----------------------------------------------------------

## **🧭 Typical User Journey**

### **1\. Setup**

* User lands on OutOfBook from a tweet, blog, or coach

* Connects Lichess account via OAuth

* Selects studies or uses demos

* Tracking begins silently in background

### **2\. First Use**

* Plays a few blitz games

* Deviates on move 6 in a known prep

* Gets notified via email (or sees it on dashboard)

* Clicks through to deviation page

### **3\. Review**

* Sees played move vs. prep

* Replays correct line

* Clicks "Mark as Reviewed"

### **4\. Follow-up**

* Plays again next day

* No deviations detected: "Nice—your prep held."

* Weekly summary email shows improvement trends

### **5\. Habit**

* User now reviews deviation after every session

* App becomes part of their training rhythm

## **⚙️ Filters & Settings**

* Time control toggles: Bullet / Blitz / Rapid / Classical

* Game type filters: Rated vs Casual, Human vs Bot

* Chapter management: Progressive opt-in, per-deviation exclusion

* Notification settings: Frequency, tone (e.g. celebration on/off)

## **📐 Design Principles**

* Progressive disclosure: Only ask what matters, when it matters

* Minimum viable judgment: Assume player is sincere

* Passive until needed: OutOfBook is not a platform, it's a whisper

* User-aligned: You reflect their goals, not override them

* Defaults that learn: Smart enough to improve with use

## **🧭 Future Additions**

* Drill mode: revisit deviations until resolved

* Deviation map: visual tree of prep failures over time

* Coach mode: share deviation summaries with a mentor

* Chess.com support

* Push notifications (for the feral blitz player)

* Drift detector: suggest recurring deviations as new prep

## **🗣️ One-Sentence Pitch**

**"OutOfBook watches your games, remembers your prep, and tells you exactly where you drifted—so you can stop making the same mistake on move 6 over and over."**

