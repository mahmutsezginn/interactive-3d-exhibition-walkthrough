# Dense navigation graph

Sixteen hand-authored landmarks define the meaningful locations and branching
structure below. Positions are in runtime metres after the entrance-origin
transform.

```text
entrance -> passage -> gallery_entry
                         /       \
                 west_bay       upper_bay
                      |             |
                 west_turn ------ center_bay
                                      |
                                  east_turn
                                      |
                                  rear_gallery
                                      |
                                 corridor_entry
                                      |
                                  corridor_mid
                                      |
                                  round_reveal
                                      |
                                  round_center
                                  /    |    \
                         round_west round_back round_east
```

At runtime, every configured path segment is divided into steps no longer than
2.4 m. This expands the 16 landmarks into a 50-node walking graph without
inventing new geometry paths. Weighted shortest-path routing can therefore move
between distant areas while staying on the validated network. A floor click
creates a temporary target at the exact selected position. The target is
connected only to dense nodes that can reach it with 0.35 m wall clearance; a
clear direct segment is preferred when one exists.

The entrance route stays centred until it clears the passage wall before
turning into `gallery_entry`. The lower route uses two intermediate waypoints:
the first keeps the
`gallery_entry -> west_bay` transition inside the outer wall's V-shaped corner,
and the second passes around the detached diagonal wall between `west_bay` and
`west_turn`. The route toward the corridor remains on the right-hand side of the
second diagonal wall. Source paths are explicit configuration rather than being
inferred from mesh topology.

## Visitor input

- Mouse or touch drag changes yaw continuously through 360°. Pitch remains
  level at the 1.65 m human eye height.
- Left and right arrow keys provide incremental horizontal look controls.
- Clicking a `room_*` or `ground_*` floor surface moves to that exact safe
  point. Clear nearby points use a direct segment; obstructed points connect to
  the validated graph and use its weighted shortest route. Unreachable clicks
  do not snap the visitor to an unrelated node.
- Translation preserves the visitor's yaw from the moment movement begins;
  the route never forces the camera to turn toward its path or destination.
- Nearby floor rings move one dense step at a time. Accessible landmark buttons
  expose the nearest important destination in each available graph direction.
- Drag gestures use a movement threshold, so releasing a drag does not also
  trigger floor navigation.
- Reduced-motion moves directly to the selected route destination and disables
  hotspot pulsing.

## Geometry validation

Route validation uses the runtime OBJ at the same scale and entrance-origin
transform as `GalleryModel`. Tests raycast every graph edge against the wall
meshes and sample a 0.35 m visitor clearance along each dense edge. Tests also
enforce the maximum edge length, graph connectivity, shortest-path traversal,
and floor-segment clearance. The headless preview capture in
`scripts/qa/capture-camera-route.mjs` visits the authored landmarks through real
mouse events. `scripts/qa/check-free-navigation.mjs` separately validates drag
look and walkable-floor clicking.
