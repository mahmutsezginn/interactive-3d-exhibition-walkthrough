# Application architecture

## Boundaries

- **Gallery scene:** loads and presents replaceable building geometry.
- **Navigation:** owns camera nodes, graph edges, view targets, and transitions.
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

## Milestone 1

The prototype intentionally excludes unrestricted movement, pointer lock,
WASD, a physics engine, artwork inspection, post-processing, and production
lighting. Navigation is a hand-authored graph and every visible destination is
also available as an accessible HTML button.
