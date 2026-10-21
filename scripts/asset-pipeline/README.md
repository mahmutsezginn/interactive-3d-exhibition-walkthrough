# Asset pipeline

The current Milestone 1 prototype loads the supplied OBJ and MTL directly so
navigation can be validated against the real geometry immediately.

The production pipeline will be:

1. Open `references/sweet-home/ExhibDemo-RoundedRoom-v2.obj` in Blender.
2. Preserve the single entrance frame (`Montant_100`).
3. Recalculate normals and inspect the curved-wall seams.
4. Inspect the fitted gallery floor and its `room_17_*` surfaces for gaps or
   overlapping faces.
5. Preserve stable wall or anchor names for future artwork placement.
6. Work in metres, with the entrance centred near the world origin.
7. Create UVs and optional lightmap UVs only when materials/lighting begin.
8. Export `public/galleries/rounded-room/gallery.glb`.
9. Validate and optimize the GLB before replacing the temporary OBJ loader.

Do not overwrite the files under `references/`; they are immutable inputs.
