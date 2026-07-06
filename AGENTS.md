# AGENTS.md

## Cursor Cloud specific instructions

This repository (`the-book-of-secret-knowledge`) is a **documentation-only "awesome list"**. The
entire product is a single large `README.md` (~210 KB) plus a preview image in `static/img`. There
is **no application code, no `package.json`, no build system, and no automated test suite**. The
GitHub Actions workflow in `.github/workflows/azure-webapps-node.yml` runs `npm run build/test
--if-present`, which are no-ops here because there is no `package.json`.

The "development environment" therefore centers on editing/reviewing Markdown, linting it, rendering
it for preview, and checking links (see `.github/CONTRIBUTING.md`).

### Lint

- Markdown linter is installed by the update script into `~/.local/mdtools`.
- Run: `~/.local/mdtools/node_modules/.bin/markdownlint README.md`
- The repo has **no `markdownlint` config**, so the default ruleset reports thousands of findings
  (mostly `MD033` inline-HTML and `MD013` line-length). This is expected — the list is intentionally
  HTML-heavy — and does not indicate a broken environment. Do not "fix" these en masse.

### Build / Run (preview the book)

The reproducible build renders `README.md` into a static site with
`scripts/build_site.py` (requires `markdown` + `pygments`, installed by the update script):

```bash
python3 scripts/build_site.py _site          # writes _site/index.html (+ static/, .nojekyll)
cd _site && python3 -m http.server 8090       # open http://localhost:8090/
```

- `_site/` is git-ignored — do **not** commit generated HTML.
- The build script maps the common GitHub emoji shortcodes used in headings (e.g.
  `:notebook_with_decorative_cover:` -> 📔) and strips any unmapped `:shortcode:` tokens, since the
  offline Python `markdown` renderer has no emoji database. When previewing after a rebuild, do a
  **hard reload** (Ctrl+Shift+R) — the browser aggressively caches `index.html` on a fixed port.

### Deploy

Deployment target is **GitHub Pages** via `.github/workflows/deploy-pages.yml` (build with
`scripts/build_site.py`, then `actions/upload-pages-artifact` + `actions/deploy-pages`). It needs no
secrets (uses the built-in `GITHUB_TOKEN`/OIDC). One-time repo setting required:
**Settings -> Pages -> Source -> "GitHub Actions"**. The older `azure-webapps-node.yml` targets an
Azure Web App and requires the `AZURE_WEBAPP_PUBLISH_PROFILE` secret + a pre-created Azure app.

### Broken-link check

`.github/CONTRIBUTING.md` documents the canonical link checker (a `curl`-based shell loop over
`href="..."` values). It requires outbound network access (available in this environment). Running
it against every link is slow; sample a subset when iterating.
