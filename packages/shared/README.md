# AOM Legacy Shared Types

This package contains early cross-app TypeScript contracts for the Family Tree platform.

Current exports cover:

- family roles,
- person profile summaries,
- media asset summaries,
- media instances,
- deduplication candidates,
- timeline events,
- social providers,
- social provenance.

The API and web app should import shared contracts from `@aomlegacy/shared` instead of redefining domain shapes independently.
