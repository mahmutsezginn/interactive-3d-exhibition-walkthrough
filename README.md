# Exhibition Walkthrough

A graph-guided 3D exhibition prototype built with Next.js, TypeScript, React
Three Fiber, Three.js, and Drei.

## Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Checks

```bash
npm run typecheck
npm run test
npm run lint
npm run build
```

## Project inputs

- Product brief: `docs/EXHIBITION_BRIEF.md`
- Immutable Sweet Home 3D inputs: `references/sweet-home/`
- Runtime model for Milestone 1: `public/galleries/rounded-room/`
- Navigation configuration: `src/config/galleries/rounded-room/navigation.ts`

The OBJ loader is temporary. See `scripts/asset-pipeline/README.md` for the GLB
cleanup and conversion plan.

This repository standardizes on npm. `.npmrc` enables `legacy-peer-deps` to
avoid an npm 10 Arborist failure while resolving optional Expo/React Native peer
dependencies exposed by React Three Fiber; those native packages are not used
by this browser application.
