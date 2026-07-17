#!/usr/bin/env python3
"""
Generic image downloader for catalog import pipeline. Reads a category data
file (equipment/data/<slug>.json), downloads each product's source image via
Playwright's browser context (scientificlabs.co.uk 403s bare requests.get on
image URLs), dedupes by URL, writes to .tmp/<slug>-images/<sku>.jpg.

Usage: python equipment/fetch_category_images.py balances
"""
import json
import sys
from pathlib import Path
from playwright.sync_api import sync_playwright

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")

ROOT = Path(__file__).resolve().parent.parent


def main():
    if len(sys.argv) != 2:
        print("Usage: python equipment/fetch_category_images.py <category-slug>")
        sys.exit(1)
    slug = sys.argv[1]
    data_path = ROOT / "equipment" / "data" / f"{slug}.json"
    data = json.loads(data_path.read_text(encoding="utf-8"))

    out_dir = ROOT / ".tmp" / f"{slug}-images"
    out_dir.mkdir(parents=True, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(user_agent=UA, viewport={"width": 1366, "height": 900})
        context.add_init_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
        )
        for product in data["products"]:
            sku = product["sku"]
            safe_sku = sku.replace("/", "-")
            url = product["image_url"]
            out_path = out_dir / f"{safe_sku}.jpg"
            try:
                resp = context.request.get(url, timeout=30000)
                if resp.ok:
                    out_path.write_bytes(resp.body())
                    print(f"OK   {sku} -> {out_path} ({len(resp.body())} bytes)")
                else:
                    print(f"FAIL {sku} status={resp.status}")
            except Exception as e:
                print(f"FAIL {sku} error={str(e).encode('ascii', 'replace').decode('ascii')}")
        context.close()
        browser.close()


if __name__ == "__main__":
    main()
