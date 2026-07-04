# VectorShift Frontend Technical Assessment

## Setup & Running

### Frontend
```bash
cd frontend
npm install
npm start
```
Runs on http://localhost:3000

### Backend
```bash
cd backend
uvicorn main:app --reload
```
Runs on http://127.0.0.1:8000

Both servers must be running simultaneously to use the Submit Pipeline feature.

---

## What Was Built

### Part 1 — Node Abstraction

Created `BaseNode.js` — a single generic component that all node types render through. It accepts:
- `title` — the node's display name
- `fields` — array of field configs (`{ name, label, type, defaultValue, options }`)
- `handles` — array of handle configs (`{ type, position, id, style }`)

All field state is managed through the global Zustand store via `updateNodeField`, not local React state. This means field values are always available in the serialized pipeline at submit time. A scoped Zustand selector (`nodes.find(n => n.id === id)?.data`) prevents unnecessary re-renders across unrelated nodes.

The 4 original nodes (Input, Output, LLM, Text) were refactored into thin config wrappers around `BaseNode`. 5 new nodes were added to demonstrate the abstraction's flexibility:

| Node | Purpose | Key Fields |
|---|---|---|
| API Request | Call an external endpoint | Method (GET/POST/PUT/DELETE), URL |
| Database | Run a SQL query | SQL Query textarea |
| Send Email | Send an email action | To, Subject |
| Image Generation | Generate an image | Resolution dropdown |
| Condition | Branch on a comparison | Operator dropdown (==, !=, >, <) |

Each new node is ~15 lines of config — no duplicated boilerplate.

### Part 2 — Styling

Built a unified dark theme with indigo (#6366f1) accent throughout:
- **Node cards** — glassmorphic dark background (#1e1e24), 12px border radius, category-specific left-border accent colors (Input: green, Output: orange, LLM: blue, Text: purple, custom nodes: teal/pink/cyan)
- **Form controls** — consistent border-radius, indigo focus ring on all inputs/selects/textareas
- **Handles & edges** — high-contrast white dashed edges with arrowheads, visible circular handles
- **Toolbar** — top navbar with VectorShift branding and pill-shaped draggable node chips
- **Minimap** — dark-themed with indigo node indicators
- **Submit button** — floating bottom-center, indigo, doesn't overlap minimap or controls

### Part 3 — Text Node Logic

Two improvements to the Text node:

**Auto-resize:** The node container (not just the inner textarea) grows in both width and height as the user types. Uses a CSS Grid layout with a hidden mirror div to calculate width, and a `useEffect` with `scrollHeight` to drive height. Width grows up to 450px then wraps; height is uncapped. A `ResizeObserver` keeps React Flow's internals in sync as dimensions change.

**Variable handles:** Typing `{{ variableName }}` (where `variableName` is a valid JS identifier) dynamically creates a new `target` Handle on the left side of the Text node. Multiple variables create multiple handles, evenly spaced vertically. Handles are deduplicated — typing the same variable twice creates one handle. When a variable is removed from the text, its handle disappears and any connected edge is automatically removed from the store via `removeEdgesForHandle`.

### Part 4 — Backend Integration

**Frontend (`submit.js`):** Clicking Submit Pipeline POSTs `{ nodes, edges }` as JSON to `http://127.0.0.1:8000/pipelines/parse`. Displays a loading state during the request. On response, shows an animated modal (replacing native `alert()`) with node/edge counts and DAG status — green checkmark for valid pipelines, red warning with a plain-language explanation for cyclic ones.

**Backend (`main.py`):** The `/pipelines/parse` endpoint accepts the pipeline via a Pydantic model, calculates `num_nodes` and `num_edges` as simple counts, and checks for cycles using iterative DFS with a recursion stack (`rec_stack`) to detect back edges. Handles disconnected graphs by iterating over all nodes, not just from a single starting point. Returns `{ num_nodes: int, num_edges: int, is_dag: bool }`.

---

## Extra Features (Beyond Requirements)

| Feature | Description |
|---|---|
| Undo / Redo | Ctrl+Z / Ctrl+Shift+Z (or buttons) — covers node add, delete, move, connect, field edits |
| Delete | Hover X button on node, or select + Delete/Backspace key — cascades to connected edges |
| Right-click context menu | Duplicate or Delete any node — custom menu, browser default suppressed |
| Duplicate | Right-click → Duplicate or Ctrl+D — copies field values, no edges, new node is immediately selected/draggable |
| Marquee select | Left-click drag on empty canvas selects multiple nodes — drag or delete as a group |
| Animated result modal | Replaces native alert() — scale/fade animation, stat cards, DAG-aware color coding |
| Empty canvas hint | "Drag a node from the toolbar above to get started ↑" shown when canvas is empty |
| Toolbar tooltips | Hovering each node chip shows a plain-language description |