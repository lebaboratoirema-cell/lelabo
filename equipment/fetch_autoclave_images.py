#!/usr/bin/env python3
"""
One-off helper: download the 10 autoclave-category product images referenced by
research/competitor-scrape/20260716-001332 so they can be re-hosted into our own
Supabase Storage bucket. Uses Playwright's browser context (not a bare requests.get)
because scientificlabs.co.uk's Cloudflare rule 403s non-browser clients on image URLs.

Usage: python equipment/fetch_autoclave_images.py
Output: .tmp/autoclave-images/<sku>.jpg
"""
from pathlib import Path
from playwright.sync_api import sync_playwright

UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")

IMAGES = {
    "219748": "https://www.scientificlabs.co.uk/image/display/219748",
    "AAN420": "https://www.scientificlabs.co.uk/image/display/AAN420",
    "AC701": "https://www.scientificlabs.co.uk/image/display/AC701",
    "AUT1653": "https://www.scientificlabs.co.uk/image/display/AUT1651",
    "AUT1655": "https://www.scientificlabs.co.uk/image/display/AUT1651",
    "AUT1657": "https://www.scientificlabs.co.uk/image/display/AUT1651",
    "AUT1659": "https://www.scientificlabs.co.uk/image/display/AUT1651",
    "AUT1670": "https://www.scientificlabs.co.uk/image/display/AUT1670",
    "AUT1694": "https://www.scientificlabs.co.uk/image/display/AUT1694",
    "AUT1698": "https://www.scientificlabs.co.uk/image/display/AUT1698",
}

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / ".tmp" / "autoclave-images"


def main():
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(user_agent=UA, viewport={"width": 1366, "height": 900})
        context.add_init_script(
            "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
        )
        for sku, url in IMAGES.items():
            resp = context.request.get(url)
            out_path = OUT_DIR / f"{sku}.jpg"
            if resp.ok:
                out_path.write_bytes(resp.body())
                print(f"OK   {sku} -> {out_path} ({len(resp.body())} bytes)")
            else:
                print(f"FAIL {sku} status={resp.status}")
        context.close()
        browser.close()


if __name__ == "__main__":
    main()
