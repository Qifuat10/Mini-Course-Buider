# CLAUDE.md

## Tech Stack
- Plain HTML, CSS, and JavaScript only.
- No frameworks and no build step: files open directly in a browser.

## Project Structure
- `index.html` — the single long page (header, contents menu, lessons, assignment).
- `styles.css` — layout, responsive rules, light and dark themes.
- `script.js` — theme toggle, progress bar, contents menu, tick-off steps (saved in the browser).
- `images/` — screenshots and photos used in the assignment steps.
- `README.md` — project readme.

The assignment section is built. Lessons from the slides (Phase 1) go in `index.html` before it, as `<section class="part" id="...">` blocks; the contents menu picks them up automatically.

## Key Requirements
1. Every page must be responsive and work on desktop, tablet, and phone.
2. Users can toggle between a light and a dark theme. The default is the light theme.

## Visual Design
"Blueprint": engineering-document look. Fonts: IBM Plex Sans (text) and IBM Plex Mono (labels, step numbers). Light palette: cool white `#F6F8FB`, navy ink `#0F1B2D`, blue accent `#1F5BFF`, orange `#B84300` for warnings. Dark palette: midnight `#0B1220`, soft blue accent `#6B93FF`. Squared corners (4-6px), thin borders, and colours are CSS variables in `styles.css`.

## Feature Plan
The site is one page (`index.html`) that shows one lesson section at a time, in this order:
1. Header: course title and the light/dark theme toggle.
2. Table of contents: stays visible while scrolling (a collapsible menu on phones).
3. Lessons: one section per slide (3-5 in total).
4. Practical assignment: a section with steps students can tick off.

How students move around:
- Lessons are sections on one page; JavaScript shows one at a time (no separate pages). Previous/Next buttons and the contents menu switch between them, and the URL hash (e.g. `#part-3`) links to a lesson.
- Click a table-of-contents link to jump to a lesson; the current lesson is highlighted.
- The progress bar shows which lesson they are on out of the total.
- Each lesson ends with one inline check-in question (multiple choice, or short answer in lesson 5). The answer is marked right or wrong in place, and students can continue either way.
- Ticked assignment steps, check-in answers and the chosen theme are remembered in the browser.

Phases:
- **Phase 1 - Course from the slides:** build the page from the user's slides (PDF or PowerPoint), with the lessons, table of contents, progress bar and theme toggle. Ask the user for the slides before starting.
- **Phase 2 - Practical assignment:** add the assignment lesson the user will provide, with checkable steps.
- **Phase 3 - Final checks:** test on desktop, tablet and phone, in both themes.

## Rules for Claude
- Explain technical terms in plain language.
- Ask before making big changes.
- Ask rather than guess.
