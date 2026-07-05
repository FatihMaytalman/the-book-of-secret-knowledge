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

There is no server in the repo. To view the book locally, render `README.md` to HTML and serve it:

```bash
mkdir -p /tmp/book
python3 -c "import markdown,pathlib; pathlib.Path('/tmp/book/index.html').write_text(markdown.markdown(pathlib.Path('README.md').read_text(), extensions=['extra','toc','tables','fenced_code']))"
cd /tmp/book && python3 -m http.server 8080   # open http://localhost:8080/
```

- Render into `/tmp` (or another out-of-repo path) — do **not** commit generated HTML.
- Caveat: the offline Python `markdown` renderer does **not** convert GitHub emoji shortcodes
  (e.g. `:notebook_with_decorative_cover:` shows as literal text). GitHub converts these server-side;
  this is a preview-only cosmetic difference, not a bug.

### Broken-link check

`.github/CONTRIBUTING.md` documents the canonical link checker (a `curl`-based shell loop over
`href="..."` values). It requires outbound network access (available in this environment). Running
it against every link is slow; sample a subset when iterating.
