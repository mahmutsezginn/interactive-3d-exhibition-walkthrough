# Application architecture

## Boundaries

- **Gallery scene:** loads and presents replaceable building geometry.
- **Navigation:** owns landmarks, generated dense nodes, shortest paths,
  free-look orientation, and transitions.
- **Artwork:** will own artwork metadata and placement independently of geometry.
- **UI:** exposes reachable destinations and deliberate view controls.

The first milestone uses the supplied OBJ/MTL files as a temporary runtime
format. The scene boundary is deliberately small so `GalleryModel` can later be
changed to a GLB loader without changing navigation or UI code.

## Runtime coordinate system

- Units: metres.
- Y axis: up.
- Entrance door centre: approximately `(0, 0, 0)`.
- The gallery extends primarily toward negative Z.
- Initial camera eye height: `1.65 m`.

The Sweet Home 3D OBJ is authored in centimetres. `GalleryModel` applies a
`0.01` scale and translates the door centre to the runtime origin.

## Navigation model

Sixteen hand-authored landmarks and their collision-tested path geometry remain
the source of truth. At runtime each path is subdivided into steps no longer
than 2.4 m, producing a 50-node walking graph. Floor clicks create an exact
temporary destination. Runtime wall raycasts either approve a direct segment or
attach that destination to nearby graph nodes with 0.35 m clearance; weighted
shortest-path routing supplies the safe route to the camera controller. A click
with no safe connection is rejected instead of snapping to an unrelated node.

Mouse/touch dragging controls unrestricted horizontal yaw while pitch remains
level at the fixed eye height. Left/right arrow keys provide a non-pointer
viewing alternative. Camera translation locks the visitor's existing yaw for
the whole route, preventing automatic turns. Pointer lock,
WASD, physics-driven collision movement, artwork inspection, post-processing,
and production lighting remain outside this milestone.
