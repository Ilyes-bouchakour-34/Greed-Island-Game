# Greed Island: The Cards Matcher

A high-difficulty memory match game inspired by Hunter x Hunter's Greed Island arc.

## The Challenge

You have 60 seconds to find 20 pairs of matching cards hidden in a 40-card grid. 
But this is no ordinary memory game. 

### Features & Mechanics

1. **Probability Engine ("The cards whisper to each other")**: 
   Every face-down card displays a percentage indicating the probability that it matches the currently revealed card.
   - Base probability is calculated based on remaining unrevealed cards.
   - **Pattern Detection**: Adjacent cards (horizontally and vertically) to the currently flipped card receive a 20% aura boost in probability, as Nen auras cluster.
   - **Distortion**: Sometimes the numbers lie.

2. **Nen Interference (Hisoka's Bungee Gum)**:
   - "Bungee Gum has both the properties of rubber and gum... and memory distortion."
   - If you make **3 consecutive mismatches**, Hisoka's Nen activates. A random already-matched pair (or a revealed card) will forcefully flip back down, forcing you to remember it again.

3. **Time Limit & Efficiency**:
   - 60 seconds to clear the board.
   - A perfect game is 20 moves. Try to minimize your moves!

## Architecture

This project is built using Vanilla JavaScript with ES6 modules to ensure a clean component-like structure without the need for a complex build step.

- `app.js`: Main controller managing game state.
- `algorithm/`: Contains the logic for probability calculation, pattern detection, and Nen interference.
- `components/`: Handles DOM manipulation and rendering for the grid, overlay, and HUD.

## How to Run

Since the project uses ES6 Modules (`<script type="module">`), you cannot just open the HTML file directly from the file system (`file://` protocol) due to CORS restrictions in modern browsers.

You must run it through a local development server. 
- If you have VS Code, use the **Live Server** extension.
- Or use python: `python -m http.server` and navigate to `http://localhost:8000`
- Or use npx: `npx serve .`
