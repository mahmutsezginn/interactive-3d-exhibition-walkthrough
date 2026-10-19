# Interactive 3D Exhibition Walkthrough

An interactive, browser-based 3D exhibition built with Next.js, TypeScript,
React Three Fiber, Three.js, and Drei. Visitors move through a custom virtual
gallery using an accessible, graph-guided camera system instead of unrestricted
first-person controls.

## Current milestone

The first milestone validates the imported gallery geometry, real-world scale,
camera placement, and navigation routes. The application currently loads the
original OBJ/MTL export and provides a 16-node, branching walkthrough from the
entrance to the circular final room.

## Highlights

- Branching, configuration-driven camera navigation
- Clickable 3D hotspots and accessible on-screen controls
- Camera transitions with reduced-motion support
- Return-to-entrance and leave-exhibition flows
- Centimeter-to-meter model normalization with an entrance-based origin
- Responsive WebGL experience backed by navigation unit tests

## Tech stack

- Next.js App Router and React
- TypeScript
- React Three Fiber, Three.js, and Drei
- Vitest and ESLint
- npm

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Quality checks

```bash
npm run check
```

This runs TypeScript validation, unit tests, ESLint, and a production build.

## Architecture

The gallery shell, camera navigation, artwork layer, and interface are kept as
separate concerns. Navigation nodes and their directed connections live in
configuration, so routes can be tuned without modifying the 3D scene code.

## Project inputs

- Product brief: `docs/EXHIBITION_BRIEF.md`
- Architecture decisions: `docs/ARCHITECTURE.md`
- Initial camera graph: `docs/NAVIGATION.md`
- Immutable Sweet Home 3D inputs: `references/sweet-home/`
- Runtime model for Milestone 1: `public/galleries/rounded-room/`
- Navigation configuration: `src/config/galleries/rounded-room/navigation.ts`

The OBJ loader is temporary. See `scripts/asset-pipeline/README.md` for the GLB
cleanup and conversion plan.

This repository standardizes on npm. `.npmrc` enables `legacy-peer-deps` to
avoid an npm 10 Arborist failure while resolving optional Expo/React Native peer
dependencies exposed by React Three Fiber; those native packages are not used
by this browser application.

## Roadmap

- Visually validate and fine-tune every camera route against the gallery model
- Clean the source geometry and convert the runtime asset to GLB
- Add the exhibition's artwork data and presentation layer
- Develop the final noir lighting and material direction
