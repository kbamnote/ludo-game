VENDORED COPY of @ludo/engine.

The canonical source is ludo-server/packages/engine/src/. This is a local
copy so Phase 4 is playable before the package registry exists.

DO NOT EDIT THESE FILES. Edit the server copy and re-sync:

  npm run sync:engine

Phase 5 replaces this with a real dependency on @ludo/engine, at which point
this directory is deleted. Until then the sync script plus the engine tests
are what keep the two sides from drifting (risk R11).
