## **🔁 Feature: Puzzle Review Mode (Spaced Review)**

### **Goal**

Transform deviation review into an engaging, low-friction training ritual modeled after Chessable’s puzzle flow, with spaced repetition logic guiding what to show and when.

---

### **✅ Entry Point**

**Trigger:**  
 User lands on the `Review Queue` page (now redesigned).

**Call to action:**

* Header: “Ready to review?”

* Button: `[Yes!]`

* Optionally: small “What is this?” explainer link

---

### **🧩 Puzzle Session Flow**

#### **1\. Session Init**

* Pull list of deviations where:

  * User deviated first

  * Not marked “ignored”

  * Due for review by spaced repetition algorithm

* Show progress bar (e.g. "1 of 5 puzzles")

* Begin session in fullscreen or immersive mode

#### **2\. Puzzle Setup**

* Show board state just before deviation

* Animate opponent's last book move

* Prompt user: *“Your move”*

#### **3\. User Input**

* User must play the expected prep move

* Max 2 attempts (configurable)

* If wrong:

  * Shake animation or light cue

  * Second attempt allowed

* If correct or failed both:

  * Show correct move

  * Optional: highlight from prep (1–2 move continuation)

#### **4\. Post-Puzzle Options**

* \[▶️ Replay My Prep Line\] (optional)

* \[➡️ Next Puzzle\]

---

### **📈 Spaced Repetition**

* Each puzzle outcome is recorded:

  * Correct on 1st / 2nd / failed

  * Timestamps and attempt counts

* Spaced algorithm updates priority queue

  * Use default SM2 or 1-3-7-30 style system

* Re-serves puzzles that were failed more frequently

* Even old deviations can resurface if algorithm schedules them

---

### **🧠 Session Management**

* Progress bar: “Puzzle 3 of 5” or completion ring

* Sessions can be ended implicitly (tab closed or navigation away)

* Resume logic picks up where user left off

* Future enhancement: allow user to adjust daily target (e.g. “Do 5 a day”)

---

### **🧼 Design Notes**

* No clutter: default view is just the board and minimal UI

* Animate opponent's move to show how position arose

* Exit strategy: no button needed; closing tab or leaving session is sufficient

* No “adopt,” “ignore,” or “view study” in puzzle view—those stay in full deviation UI for now

---

## **🛠 Cursor Build Plan (Step-by-Step)**

1. **Build Puzzle Session Launcher**

   * Replace old Review Queue with “Ready to Review?” CTA

   * Clicking begins fullscreen Puzzle Session mode

2. **Spaced Repetition Engine**

   * Define review history model: attempts, success/fail, timestamp

   * Implement simple queue logic (e.g. SM2 or similar)

   * Prioritize unreviewed \+ due deviations

3. **Puzzle Player Component**

   * Renders board at last in-book position

   * Animates opponent’s last move

   * Handles user input and checks against expected move

   * Tracks attempt count

   * Shows correct answer after success/failure

4. **Session Tracker**

   * Session object holds current puzzle index, total puzzles

   * Displays progress bar

   * Resumes on reload from local state or DB

5. **Minimal UI**

   * Only show:

     * Board

     * “Next Puzzle”

     * “Replay Prep Line” (optional)

