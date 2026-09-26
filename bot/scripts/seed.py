#!/usr/bin/env python3
"""Fetch official product docs into seed/official/<date>/. Stdout is the stamp."""
from __future__ import annotations

import hashlib
import json
import os
import re
import shutil
import sys
import urllib.error
import urllib.request
from datetime import date, datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from console.paths import PAGES_PATH, SEED_DIR

SITEMAP = "https://docs.x.ai/sitemap.xml"
UA = "MininjaSeed/1.0 (thingscorp; local snapshot)"
PAGE_RE = re.compile(r"<loc>(https://docs\.x\.ai/grok-bot/[^<]+)</loc>")
STAMP_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")
TIMEOUT = 30


def load_catalog(path: Path) -> list[str]:
    if not path.exists():
        raise SystemExit(f"seed: missing catalog {path}")
    urls = []
    seen = set()
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if line not in seen:
            seen.add(line)
            urls.append(line)
    if not urls:
        raise SystemExit("seed: catalog is empty")
    return urls


def sitemap_pages(xml: str) -> list[str]:
    urls = []
    seen = set()
    for url in PAGE_RE.findall(xml):
        url = url.rstrip("/")
        if url not in seen:
            seen.add(url)
            urls.append(url)
    return urls


def fetch(url: str) -> bytes:
    req = urllib.request.Request(
        url,
        headers={"User-Agent": UA, "Accept": "text/markdown, text/plain;q=0.9, */*;q=0.1"},
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return resp.read()


def slug_for(url: str) -> str:
    name = url.rstrip("/").rsplit("/", 1)[-1]
    if not name or name == "grok-bot":
        name = "index"
    return f"{name}.md"


def sha256(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def append_catalog(path: Path, urls: list[str]) -> None:
    if not urls:
        return
    with path.open("a") as fh:
        for url in urls:
            fh.write(url + "\n")


def dated_dirs(seed_dir: Path) -> list[str]:
    if not seed_dir.exists():
        return []
    return sorted(p.name for p in seed_dir.iterdir() if p.is_dir() and STAMP_RE.fullmatch(p.name))


def main(argv: list[str]) -> int:
    if argv in (["-h"], ["--help"]):
        sys.stderr.write("usage: mininja seed\n")
        return 0
    catalog = load_catalog(PAGES_PATH)
    try:
        xml = fetch(SITEMAP).decode("utf-8", "replace")
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        sys.stderr.write(f"seed: sitemap failed: {exc}\n")
        return 1
    discovered = sitemap_pages(xml)
    extra = [u for u in discovered if u not in catalog]
    append_catalog(PAGES_PATH, extra)
    wanted = list(catalog) + extra
    # keep catalog order, then extras; drop dupes
    ordered = []
    seen = set()
    for url in wanted:
        if url not in seen:
            seen.add(url)
            ordered.append(url)

    stamp = date.today().isoformat()
    SEED_DIR.mkdir(parents=True, exist_ok=True)
    tmp = SEED_DIR / f".tmp-{stamp}-{os.getpid()}"
    if tmp.exists():
        shutil.rmtree(tmp)
    tmp.mkdir()

    pages = []
    failed = []
    missing = []
    try:
        for url in ordered:
            slug = slug_for(url[:-3] if url.endswith(".md") else url)
            row = {"url": url, "file": slug, "status": "ok", "bytes": 0, "sha256": ""}
            try:
                body = fetch(url)
            except urllib.error.HTTPError as exc:
                row["status"] = f"http {exc.code}"
                if exc.code == 404:
                    missing.append(url)
                else:
                    failed.append(url)
            except (urllib.error.URLError, TimeoutError, OSError) as exc:
                row["status"] = f"error {exc}"
                failed.append(url)
            else:
                text = body.lstrip()
                if not text:
                    row["status"] = "empty"
                    failed.append(url)
                elif text.startswith(b"<!DOCTYPE") or text.startswith(b"<html"):
                    row["status"] = "html"
                    failed.append(url)
                else:
                    (tmp / slug).write_bytes(body)
                    row["bytes"] = len(body)
                    row["sha256"] = sha256(body)
            pages.append(row)

        ok_pages = [p for p in pages if p["status"] == "ok"]
        if failed:
            raise RuntimeError(f"{len(failed)} fetch error(s), snapshot not promoted")
        if not ok_pages:
            raise RuntimeError("no pages fetched")

        manifest = {
            "stamp": stamp,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "sitemap": SITEMAP,
            "catalog": str(PAGES_PATH),
            "new_from_sitemap": extra,
            "pages": pages,
            "ok": len(ok_pages),
            "missing": missing,
            "failed": failed,
        }
        (tmp / "manifest.json").write_text(json.dumps(manifest, indent=2) + "\n")

        dest = SEED_DIR / stamp
        bak = SEED_DIR / f".bak-{stamp}-{os.getpid()}"
        if dest.exists():
            dest.rename(bak)
        tmp.rename(dest)
        if bak.exists():
            shutil.rmtree(bak, ignore_errors=True)
    except Exception as exc:
        if tmp.exists():
            shutil.rmtree(tmp, ignore_errors=True)
        sys.stderr.write(f"seed: {exc}\n")
        return 1

    for url in missing:
        sys.stderr.write(f"seed: gone {url}\n")
    sys.stdout.write(stamp + "\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
