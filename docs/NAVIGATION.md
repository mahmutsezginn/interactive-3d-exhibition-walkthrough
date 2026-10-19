# Initial navigation graph

The graph is provisional and must be adjusted while viewing the real model.
Positions are in runtime metres after the entrance-origin transform.

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

The lower route uses an intermediate waypoint to pass around the detached
diagonal wall. The route toward the corridor remains on the right-hand side of
the second diagonal wall. Camera paths are explicit configuration rather than
being inferred from mesh topology.
