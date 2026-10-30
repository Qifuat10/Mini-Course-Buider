# CLAUDE.md

## Tech Stack
- Plain HTML, CSS, and JavaScript only.
- No frameworks and no build step: files open directly in a browser.

## Project Structure
The repository is nearly empty for now:
- `README.md` — the only file so far.

Update this section as files and folders are added.

## Key Requirements
1. Every page must be responsive and work on desktop, tablet, and phone.
2. Users can toggle between a light and a dark theme. The default is the light theme.

## Feature Plan
The site is one long scrolling page (`index.html`), in this order:
1. Header: course title and the light/dark theme toggle.
2. Table of contents: stays visible while scrolling (a collapsible menu on phones).
3. Lessons: one section per slide (3-5 in total).
4. Practical assignment: a section with steps students can tick off.

How students move around:
- Scroll down through the lessons.
- Click a table-of-contents link to jump to a lesson; the current lesson is highlighted.
- A progress bar shows how far down the course they are.
- Ticked assignment steps and the chosen theme are remembered in the browser.

Phases:
- **Phase 1 - Course from the slides:** build the page from the user's slides (PDF or PowerPoint), with the lessons, table of contents, progress bar and theme toggle. Ask the user for the slides before starting.
- **Phase 2 - Practical assignment:** add the assignment lesson the user will provide, with checkable steps.
- **Phase 3 - Final checks:** test on desktop, tablet and phone, in both themes.

## Rules for Claude
- Explain technical terms in plain language.
- Ask before making big changes.
- Ask rather than guess.
