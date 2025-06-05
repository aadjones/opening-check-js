# Debugging Plan - June 2, 2025

## Implementing a Backend Proxy for CORS Issues

- [x] **Step 1: Install HTTPX**
  - Add `httpx` to your `requirements.txt` file.
  - Run `pip install -r requirements.txt` to install the package.

- [x] **Step 2: Add Proxy Endpoint**
  - Open `main.py` in the `chess_backend` directory.
  - Add a new endpoint `/proxy/{path:path}` that forwards requests to the Lichess API using `httpx`.

- [x] **Step 3: Configure CORS**
  - Ensure the CORS middleware in `main.py` allows requests from your frontend.
  - Update the `origins` list if necessary to include all frontend URLs.

- [x] **Step 4: Update Frontend**
  - Modify the frontend code to send requests to the new proxy endpoint instead of directly to the Lichess API.

- [x] **Step 5: Test the Proxy**
  - Run the backend server and test the proxy endpoint to ensure it forwards requests correctly.
  - Check for any errors or issues in the console and logs.

- [x] **Step 6: Debug and Refine**
  - Address any issues encountered during testing.
  - Refine the proxy implementation as needed to handle edge cases or improve performance.

- [x] **Step 7: Document Changes**
  - Update any relevant documentation to reflect the new proxy setup.
  - Ensure team members are informed of the changes and how to use the proxy.

# Debugging Plan for Deviation Detail Page

**Date:** June 5, 2025

## Goal
Fix logical and UI/UX issues on the Deviation Detail page so that:
- The correct move played and expected move are shown at the deviation point
- The chessboard displays the correct position at the deviation
- Move navigation controls work as expected
- The UI is visually clear and user-friendly

---

## Step 1: Logic & Data Flow Fixes

### 1.1. PGN Parsing & Move History
- Ensure the PGN is parsed into a correct array of FENs and move list.
- Validate that the move list matches the actual game moves.

### 1.2. Deviation Index Calculation
- Calculate the correct index in the move list/FEN array for the deviation:
  - Use `whole_move_number` and `color` to determine the ply (half-move) index.
  - Confirm this matches the move where the deviation occurred.

### 1.3. Move Comparison Display
- Show the actual move played at the deviation index (from the move list).
- Show the expected move (from the database/prep).
- Ensure these are accurate and match the board state.

### 1.4. Chessboard Position
- On page load, set the chessboard to the FEN at the deviation index.
- Ensure navigation controls update the board and move index correctly.

### 1.5. Navigation Controls
- Bind navigation buttons and slider to the move index and FEN array.
- Display the correct move number (e.g., "Move 5/20").
- Fix any NaN/0 or off-by-one errors.

---

## Step 2: UI/UX Improvements (After Logic is Fixed)
- Redesign layout with clear cards/panels for each section.
- Improve move comparison visuals (compact, clear, use icons/SAN).
- Polish chessboard and navigation controls (centered, tooltips, spacing).
- Group and style action buttons for clarity and compactness.
- Ensure responsiveness and consistent styling throughout.

---

## Next Actions
1. Fix logic/data flow as described in Step 1.
2. Test with real deviations and edge cases.
3. Once logic is correct, proceed to UI/UX redesign in Step 2. 