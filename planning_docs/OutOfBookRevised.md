# **OutOfBook — Revised Product Vision & Structure**

## **✳️ Reframing the Concept**

OutOfBook is no longer just a tattletale for prep mistakes. It's a personal **memory assistant**, a **repertoire mirror**, and a **habit reinforcement system**. It gently watches your games, highlights meaningful deviations, and helps you decide what to review, revise, or reinforce.

---

## **🔁 Core Loop (Revised)**

**Play → Detect → Reflect → Resolve → Grow**

1. Play a Lichess game

2. OutOfBook compares it against your study-defined prep

3. Detects if you went off-book — and **who deviated first**

4. Surfaces that info via the **Dashboard** or a **Notification**

5. You resolve it via the **Review Queue** — marking, adopting, or ignoring

6. Optional: system shows **Insights** based on trends, gaps, or coverage issues

---

## **🧱 Frontend Structure (Simplified and Cleaned)**

### **1\. Dashboard (default landing)**

* Summary of most recent game

* Prep Score (weekly): ✅ held prep, ❌ deviated, ➖ untracked

* Review Queue preview: "2 deviations need review"

* Insights block:

  * "You’ve deviated from 6.Be2 3x this week."

  * "60% of your opponents are playing 3.Nf3, which isn’t in your study."

* Recent Games List (with review status badges)

\[Dashboard Wireframe\]  
\+----------------------------------------------------------+  
| 🧠 Last Game: ❌ Deviation – Najdorf (move 6\)            |  
|    vs BigBlunder420 (Blitz 5+3) — Loss                  |  
|    \[▶️ Review Now\]                                       |  
\+----------------------------------------------------------+  
| 📊 Weekly Prep Score: ✅ 2 | ❌ 3 | ➖ 1                   |  
\+----------------------------------------------------------+  
| 📍 Insights:                                              |  
|    \- Deviated from 6.Be2 3x this week                    |  
|      \[Drill This Line\] \[Adopt h3 Instead\]               |  
|    \- 60% of opponents played 3.Nf3 (not in study)        |  
|      \[Add Variation\] \[Ignore\]                           |  
\+----------------------------------------------------------+  
| Recent Games:                                            |  
| ✅  vs User123 – Prep held (Reviewed)                   |  
| ❌  vs Forknado – Deviation on move 8 (Needs Review)    |  
| ➖  vs ChessKid99 – Untracked game                      |  
\+----------------------------------------------------------+

### **2\. Review Queue (focused correction hub)**

* Filtered list of **unresolved deviations only**

* Each deviation shows:

  * Game metadata (opponent, time control, result)

  * Deviation context (expected vs played)

  * Actions:

    * ✅ Mark Reviewed

    * ☑ Adopt Played Move

    * 🚫 Ignore Chapter

\[Review Queue Wireframe\]  
\+----------------------------------------------------------+  
| ❌ King's Indian – Deviation on move 8                  |  
|    You played a6 | Expected: Be2                         |  
|    vs Forknado (Rapid 10+0) — 2 days ago                |  
|    \[View\] \[✓ Mark Reviewed\] \[☑ Adopt Move\] \[🚫 Ignore\]  |  
\+----------------------------------------------------------+  
| ❌ Najdorf – Deviation on move 6                        |  
|    You played h3 | Expected: Be2                         |  
|    vs BigBlunder420 (Blitz 5+3) — 4 days ago            |  
|    \[View\] \[✓ Mark Reviewed\] \[☑ Adopt Move\] \[🚫 Ignore\]  |  
\+----------------------------------------------------------+

### **3\. Deviation Page (single deviation deep dive)**

* Chessboard at deviation point

* Replay prep line

* Show recurrence badge if repeated

* Resolution actions as above

\[Deviation Page Wireframe\]  
\+----------------------------------------------------------+  
| ❌ Deviation – Najdorf – Move 6                         |  
| vs BigBlunder420 (Blitz 5+3)                            |  
|                                                         |  
| \[Chessboard Here – FEN at deviation\]                   |  
|                                                         |  
| You played: h3 ❌  |  Expected: Be2 ✅                   |  
| \[▶️ Replay Prep Line\]                                   |  
| \[✓ Mark Reviewed\] \[☑ Adopt Move\] \[🚫 Ignore Chapter\]    |  
\+----------------------------------------------------------+

### **Game Tracker Replaced by Recent Games List**

Recent games are shown inline on the dashboard with review status tags:

* ✅ Prep Success (opponent deviated or you followed through)

* ❌ Deviation (needs review or reviewed)

* ➖ Untracked (not in study)

---

## **🧠 Review Status: A Core Concept**

* Every deviation is either:

  * 🔁 Needs Review

  * ✅ Reviewed

  * ☑ Adopted (user prefers the deviation)

  * 🚫 Ignored (user no longer wants this chapter tracked)

* This status is visible **everywhere the game is referenced**

---

## **📍 Insights (New System)**

Lightweight, contextual nudges based on pattern detection:

* Recurring deviation in same line → suggest drilling or adopting

* Opponent playing untracked variations → suggest expanding prep

* Prep “holes” → studies don’t match common opponent paths

Example:

📍 Insight:  
You’ve deviated from 6.Be2 in the Najdorf 4 times.  
\[Drill This Line →\] \[Adopt h3 Instead\]

📍 Insight:  
Your opponents are playing 3.Nf3 60% of the time,  
but it's not covered in your White study.  
\[Add Variation →\] \[Ignore for now\]

---

## **🧑‍🏫 Coach Mode (Future Layer)**

* Coach can see dashboard and review queue for each student

* Can attach notes to deviations

* Weekly summaries can be sent to students with review links

---

## **🔮 Future Extensibility (Quietly Supported Now)**

* Drill Mode (Spaced Repetition)

* Deviation Tree Visualization

* Export deviation history

* Tagging deviations with reasons

* Study Suggestion Engine (from insights)

---

## **🎯 Guiding Design Principles (Reconfirmed)**

* **Two modes:** reactive (Dashboard), intentional (Review Queue)

* **Review state is memory:** make it visible and central

* **No bloat:** no Game Tracker, just recent context

* **Fluency over friction:** one-breath resolution flow

* **Progressive power:** insights and coach tools only appear when needed

