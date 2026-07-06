#!/usr/bin/env python3
"""Build a static HTML site from README.md.

Renders the repository's README.md (a single-page "awesome list") into a
styled, self-contained HTML page under ./_site so it can be published as a
static site (e.g. GitHub Pages). Also copies the static/ asset directory.

Usage:
    python3 scripts/build_site.py [output_dir]   # default output_dir: _site
"""
from __future__ import annotations

import re
import shutil
import sys
import time
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent.parent
README = ROOT / "README.md"
STATIC = ROOT / "static"

PAGE_TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>The Book of Secret Knowledge</title>
<style>
  body{{max-width:980px;margin:0 auto;padding:32px 24px;
       font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;
       line-height:1.55;color:#1f2328;background:#fff}}
  pre,code{{font-family:ui-monospace,SFMono-Regular,Consolas,monospace}}
  pre{{background:#f6f8fa;padding:14px;border-radius:8px;overflow:auto}}
  code{{background:#eff1f3;padding:2px 5px;border-radius:4px}}
  pre code{{background:none;padding:0}}
  a{{color:#0969da;text-decoration:none}}
  a:hover{{text-decoration:underline}}
  h1,h2,h3{{border-bottom:1px solid #d0d7de;padding-bottom:.3em}}
  img{{max-width:100%}}
  table{{border-collapse:collapse}}
  th,td{{border:1px solid #d0d7de;padding:6px 12px}}
  hr{{border:0;border-top:1px solid #d0d7de}}
  @media (prefers-color-scheme: dark){{
    body{{background:#0d1117;color:#e6edf3}}
    pre{{background:#161b22}}code{{background:#161b22}}
    h1,h2,h3,hr,th,td{{border-color:#30363d}}
    a{{color:#4493f8}}
  }}
</style>
</head>
<body>
{body}
<hr>
<p style="color:#656d76">Built from README.md on {ts}.</p>
</body>
</html>
"""

# Common GitHub emoji shortcodes used in the README headings. The offline
# Markdown renderer does not convert these, so map the frequently used ones to
# their Unicode equivalents for a closer match to GitHub's rendering.
EMOJI = {
    ":notebook_with_decorative_cover:": "\U0001F4D4",
    ":restroom:": "\U0001F6BB",
    ":information_source:": "\u2139\ufe0f",
    ":newspaper:": "\U0001F4F0",
    ":ballot_box_with_check:": "\u2611\ufe0f",
    ":anger:": "\U0001F4A2",
    ":trident:": "\U0001F531",
    ":small_orange_diamond:": "\U0001F538",
    ":diamond_shape_with_a_dot_inside:": "\U0001F4A0",
    ":high_brightness:": "\U0001F506",
    ":file_folder:": "\U0001F4C1",
    ":books:": "\U0001F4DA",
    ":cd:": "\U0001F4BF",
    ":pushpin:": "\U0001F4CC",
    ":arrow_up:": "\u2B06\ufe0f",
}


def convert_emoji(text: str) -> str:
    for code, char in EMOJI.items():
        text = text.replace(code, char)
    # Drop any remaining unmapped :shortcode: tokens so they do not show as raw
    # text in headings/links (keeps output clean without a full emoji DB).
    return re.sub(r":[a-z0-9_+\-]+:", "", text)


def build(out_dir: Path) -> None:
    if not README.exists():
        sys.exit(f"README.md not found at {README}")

    md_source = convert_emoji(README.read_text(encoding="utf-8"))
    body = markdown.markdown(
        md_source,
        extensions=["extra", "toc", "tables", "fenced_code", "sane_lists"],
    )
    html = PAGE_TEMPLATE.format(
        body=body,
        ts=time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime()),
    )

    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)
    (out_dir / "index.html").write_text(html, encoding="utf-8")

    if STATIC.exists():
        shutil.copytree(STATIC, out_dir / "static")

    # Disable Jekyll processing on GitHub Pages (serve files as-is).
    (out_dir / ".nojekyll").write_text("", encoding="utf-8")

    print(f"Built site -> {out_dir/'index.html'} ({len(html)} bytes)")


if __name__ == "__main__":
    target = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "_site"
    build(target)
