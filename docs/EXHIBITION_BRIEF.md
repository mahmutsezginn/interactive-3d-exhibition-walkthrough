# Digital Exhibition Room — Project Brief

**Status:** Initial technical brief / pre-implementation  
**Project type:** Standalone web application  
**Primary audience:** Visitors to an individual artist's online exhibition  
**Prepared for:** Development with Codex in VS Code

## 1. Project vision

Build a browser-based, interactive 3D exhibition that allows visitors to explore an original, artist-focused virtual gallery and inspect artworks displayed on its walls.

The gallery is **not a digital twin of an existing building**. It is a deliberately designed virtual space with an atmospheric, dark/noir visual direction. The first commercial use case is a bespoke exhibition for one artist. However, the underlying code should be reasonably reusable for future artists and alternative gallery layouts.

The experience should feel like exploring a place, not clicking through a conventional image slideshow. Visitors decide which available route to take and which artwork to inspect. They do **not** need to follow a fixed guided tour.

## 2. Confirmed product decisions

1. **Standalone application:** Build this as a new Next.js project, not as a page inside an existing artist portfolio.
2. **Navigation:** Use a graph of predefined camera positions connected by clickable movement hotspots and simple on-screen controls. Visitors choose their own path through that graph.
3. **First milestone:** Make the 3D space render correctly and make navigation work before implementing elaborate lighting, artwork presentation, or visual polish.
4. **Architecture is provisional:** The Sweet Home 3D layout is an initial concept. Wall lengths, angles, room dimensions, passages, and the navigation graph may change after testing.

These are current requirements, not permission to silently redesign the architecture or add unrelated functionality.

## 3. Available design references and files

The physical layout has been drafted in **Sweet Home 3D**. Reference screenshots show the design from multiple elevated 3D angles; a top-down plan should also be supplied when possible.

Current spatial concept, from entrance to the far end:

- A narrow entrance area with a doorway and a relatively long initial passage.
- A larger central exhibition space with two detached or partially detached **diagonal display walls**, shaping the visitor's sightlines without prescribing a single order of exploration.
- A long connecting corridor leading toward the final room.
- A distinctive **circular / curved exhibition room** at the end, including a tighter inner curved section.

The circular room and the angled central walls are central to the intended spatial identity. Their exact geometry must be taken from the supplied 3D assets or 2D plan rather than guessed from screenshots.

**Suggested reference folder structure** (use actual exported filenames if they differ):

- `references/exhibition.sh3d` — original editable Sweet Home 3D project, if available.
- `references/sweet-home-export/` — OBJ export, its MTL file, and any dependent textures.
- `references/screenshots/` — perspective views and ideally a legible top-down floor plan.
- `docs/EXHIBITION_BRIEF.md` — this document.

**Important:** This brief does not include the `.sh3d`, `.obj`, or reference screenshots as embedded assets. Check which files are actually present in the repository before assuming they exist. Ask for missing assets if they are needed.

## 4. Intended visitor experience

The visitor enters the gallery and can independently explore its accessible spaces, inspect wall-mounted artworks, continue toward the circular room, and leave the exhibition at any time.

### Free exploration, but not free-look or FPS movement

**Free exploration means freedom to choose a route, not unrestricted movement in 3D space.**

For the initial version:

- **No WASD controls.**
- **No mouse-driven 360-degree free-look, pointer-lock, or first-person-shooter controls.**
- **No unrestricted character or camera movement.**
- Visitors navigate between **curated camera nodes** representing believable standing positions in the gallery.
- At each node, show only destinations that are genuinely reachable from that position.
- Use clickable hotspots placed near corridors, openings, or other logical destinations; complement them with accessible on-screen forward/back or directional controls where helpful.
- Allow visitors to change their viewing direction through deliberate on-screen actions (for example, left/right view buttons or selecting a visible wall), using controlled camera transitions rather than continuous mouse-look.
- Clicking a wall or artwork may smoothly orient the camera toward it; clicking an artwork should eventually allow closer inspection.
- Avoid forcing a single route or a prescribed order of artworks.

The node graph is **not** a simple straight sequence. Connections may branch, and visitors can revisit sections voluntarily.

### Camera and movement quality

- Transitions should be smooth and short, with natural eye-level framing.
- Camera paths must not pass through walls or visibly clip geometry.
- Avoid abrupt rotations, confusing reverse directions, and excessive camera motion.
- A transition can use intermediate waypoints or a short curve even when the UI exposes only two destination nodes.
- Provide a reduced-motion option or respect the user's `prefers-reduced-motion` setting.
- Make hotspots discoverable without filling the screen with bright game-like markers.
- Because the circular room is a destination at the end of a corridor, visitors should have an explicit **Exit Exhibition** and/or **Return to Entrance** action instead of being forced to travel all the way back manually.

## 5. Navigation system design

Keep navigation configuration **separate from the 3D mesh**. The goal is to change the gallery layout or its navigational affordances without rewriting camera-control code.

Represent each navigation node with, at minimum:

- Stable node identifier.
- Camera position and eye height (consistent with the model's real-world scale).
- Default look-at target or orientation.
- Reachable next-node identifiers and optional path waypoints.
- Optional hotspots or view targets for nearby walls/artworks.

A small hand-authored configuration is sufficient for the MVP. A graph editor, automated pathfinding, or collision-driven free-roam system is **not required** at this stage.

**Initial proof of concept:** Start with a few connected nodes across the entrance, central hall, corridor, and circular room. Validate lines of sight and camera paths in the real model before adding more nodes.

## 6. 3D asset pipeline

Treat the Sweet Home 3D model as the **source of the initial layout**, not a guaranteed production-ready asset.

1. Inspect the provided OBJ, MTL, and textures; determine the actual scale, axes, orientation, mesh grouping, normals, and whether doors, walls, and floors exported as expected.
2. Check for open wall joints, accidental gaps, inverted faces, doubled surfaces, and missing floors.
3. Recommend a practical web-ready pipeline (for example, conversion and cleanup in Blender followed by GLB/glTF). Do not assume the OBJ is already optimized or directly suitable for production.
4. Prefer a reusable asset-loading approach, with the gallery geometry independently replaceable as the Sweet Home 3D draft evolves.
5. If the export is flawed, explain the issue before deciding whether to repair the model, re-export, or selectively recreate simple geometry in code.
6. Do not infer exact measurements from perspective screenshots when model dimensions or a scale-bearing floor plan can be inspected.

The final room's curved geometry should stay curved; do not silently replace it with a rectangular room for convenience.

## 7. Artwork support — initial design requirements

Artwork placement does not need to be fully implemented in the first milestone, but the software architecture should allow it later.

- Artworks are **flat images or rectangular framed objects** by default, with configurable width, height, orientation, and position.
- Artwork data should be independent of the building mesh, so individual exhibitions can replace artworks without re-exporting the entire building.
- Artworks should be selectable; a later iteration will provide a closer view and details such as title, medium, year, dimensions, and description.
- Artwork layout is not fixed yet; avoid hardcoding a final collection or an exact number of paintings.
- **Curved walls require special handling:** Keep flat artworks flat. Place each artwork on an appropriate local tangent/orientation, with enough stand-off from the curved surface to avoid intersection. Large works may be better suited to separate flat panels or other walls.
- The circular room does **not** have to be filled with conventional paintings. It may host a special installation or a small number of carefully positioned works.

No drag-and-drop curator/editor interface is required for the MVP.

## 8. Visual direction — later milestone

Target a **dark, noir, cinematic contemporary-art atmosphere**, rather than the default bright white-cube gallery:

- Dark charcoal, black, and muted concrete-like surfaces.
- Restrained ambient lighting with carefully aimed artwork spotlights.
- Strong visual hierarchy, shadows, and controlled contrast.
- A dramatic reveal of the circular room after the corridor.
- Minimal, unobtrusive interface elements that do not compete with the artwork.

**Do not prioritize these effects over working geometry and navigation in milestone 1.** Lighting, materials, bloom, decorative elements, and refined artwork presentation belong to subsequent iterations. Performance and artwork legibility remain important even in a dark environment.

## 9. Technical direction

Preferred starting stack:

- **Next.js** with App Router.
- **TypeScript**.
- **React Three Fiber / Three.js** for the interactive 3D scene.
- **@react-three/drei** where it simplifies scene helpers and loading.
- Standard React UI for navigation controls and artwork information.

Choose the simplest maintainable state management approach for the MVP. Do not introduce a CMS, database, authentication, ecommerce, paid subscriptions, multiplayer, or an administrative editor unless separately requested.

Keep these concepts separate in the codebase:

- **Gallery scene / geometry:** what physical spaces exist.
- **Navigation graph and camera controller:** where visitors can go and what they can look at.
- **Artwork data and placement:** what is displayed and where.
- **UI:** interactive controls, map or hints if later needed, and artwork details.

The code should make it feasible to use an alternative 3D gallery with the same interaction system in the future.

## 10. MVP scope and explicit non-goals

### Milestone 1: Functional space and navigation

- Scaffold the standalone Next.js/TypeScript application.
- Load and render the exhibition model, or a clearly marked temporary geometry proxy if the actual model is unavailable.
- Establish correct scale, visitor eye height, and basic camera perspective.
- Implement a small navigation-node graph, clickable reachable destinations, and basic directional/look controls.
- Add smooth, collision-free camera transitions along validated paths.
- Demonstrate movement from the entrance through the central area and corridor to the circular room, with user-directed route choices wherever the layout permits.
- Provide a clear exit/return action.
- Ensure the prototype works with pointer/touch UI rather than requiring a keyboard.

### Later milestones

- Noir materials, lighting, and performance optimization.
- Artwork placement, artwork focus/inspection, and information panels.
- Mobile layout refinements, accessibility checks, and additional camera destinations.
- Optional minimap and richer exhibition-specific configuration.
- Reusable gallery templates and artist-facing administration, only if business demand justifies them.

### Out of scope for the first milestone

- WASD, pointer-lock, mouse-controlled 360-degree looking, or unrestricted walking.
- A strict linear guided tour.
- Fully automatic navigation graph generation.
- Photorealistic art-gallery rendering.
- A CMS, booking, payments, subscription service, or drag-and-drop exhibition editor.
- Modeling an existing real-world gallery as a digital twin.

## 11. Workflow instructions for Codex

**Do not begin with a large speculative implementation.**

1. Inspect the repository and available assets. Report which files are present and which are missing.
2. Review the Sweet Home 3D export and screenshots if supplied. Describe the inferred scene structure and flag unknown dimensions or geometry issues.
3. Propose a concise component architecture, asset-conversion workflow, and first navigation nodes.
4. Identify any decisions or missing information that would materially change the implementation. **Ask before making consequential assumptions.**
5. Present a phased implementation plan and wait for confirmation before major coding changes.
6. Once approved, implement milestone 1 incrementally. Keep each change easy to test and demonstrate.
7. After each meaningful milestone, report what works, how to run it locally, and what remains unresolved.

Do not treat reference images as pixel-perfect instructions. The model is an editable draft, and the intended visitor experience takes priority over prematurely locking geometry.

## 12. Acceptance criteria for the first demo

A successful first demo means:

- The exhibition geometry is visible in a browser at a believable scale.
- A visitor can start at the entrance and reach the central gallery and circular room.
- The visitor chooses among available paths where branches exist; there is no forced artwork order.
- Navigation works through clicks/taps and visible controls, **without WASD or mouse free-look**.
- Camera transitions do not visibly intersect walls.
- The user can turn toward selected areas or walls through controlled actions.
- The visitor can exit or return to the entrance without manually retracing the full route.
- Gallery assets, camera nodes, and artwork configuration are organized to support future layout changes.

## 13. Open questions to validate after asset inspection

These questions should be answered from the real export or a short discussion, rather than by guesswork:

- What are the actual dimensions, wall heights, corridor widths, and preferred eye height?
- Does the export include correct floor surfaces and a usable entrance opening?
- Which parts of the central exhibition space are connected by open passage, and which are blocked by the diagonal walls?
- How many navigation nodes are required to preserve both comprehensible movement and freedom to explore?
- Where should any selectable wall-view targets be placed, especially around curved geometry?
- How should the user interface adapt on narrow mobile screens?

**First request to Codex:** Inspect the assets and existing repository, then propose the implementation approach and first navigation graph. Do not generate the entire finished exhibition in one pass.
