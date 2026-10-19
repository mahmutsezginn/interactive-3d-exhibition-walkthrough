# Asset pipeline

The current Milestone 1 prototype loads the supplied OBJ and MTL directly so
navigation can be validated against the real geometry immediately.

The production pipeline will be:

1. Open `references/sweet-home/ExhibDemo-RoundedRoom.obj` in Blender.
2. Remove the duplicate entrance frame (`Montant_87`).
3. Recalculate normals and inspect the curved-wall seams.
4. Replace the oversized rectangular ground with a fitted gallery floor.
5. Preserve stable wall or anchor names for future artwork placement.
6. Work in metres, with the entrance centred near the world origin.
7. Create UVs and optional lightmap UVs only when materials/lighting begin.
8. Export `public/galleries/rounded-room/gallery.glb`.
9. Validate and optimize the GLB before replacing the temporary OBJ loader.

Do not overwrite the files under `references/`; they are immutable inputs.
