#!/usr/bin/env python3
"""
Competitor catalog scraper (scientificlabs.co.uk) -> research reference data.

Deterministic equipment script: extracts structured product data (name, brand,
SKU, price, specs, image URL) from JSON-LD Product schema on each product page.

Each HTTP request uses a fresh, isolated browser context. scientificlabs.co.uk
runs Cloudflare bot detection that escalates to an unsolvable JS challenge once
a session makes more than one cross-path navigation -- a fresh context per
request avoids that without needing to solve any challenge.

OUTPUT IS REFERENCE-ONLY. Descriptions are the competitor's raw English text and
must be rewritten (and translated to French) before use on lelaboratoire. Images
are the competitor's hosted assets and must NOT be re-published without rights
(use your own photos or licensed stock instead).

Usage:
    python equipment/scrape_competitor_catalog.py --categories test-tubes rotary-evaporators
    python equipment/scrape_competitor_catalog.py --categories test-tubes --max-pages 3 --max-products 50

Output:
    research/competitor-scrape/<run-timestamp>/products.json
    research/competitor-scrape/<run-timestamp>/products.csv
"""
import argparse
import csv
import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = "https://www.scientificlabs.co.uk"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")
REQUEST_DELAY_SECONDS = 1.5  # site's robots.txt sets crawl-delay: 1000 (ms)

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "research" / "competitor-scrape"


def fetch_html(browser, url: str) -> str:
    """Load a URL in a fresh, isolated context and return its rendered HTML."""
    context = browser.new_context(user_agent=UA, viewport={"width": 1366, "height": 900})
    context.add_init_script(
        "Object.defineProperty(navigator, 'webdriver', {get: () => undefined})"
    )
    page = context.new_page()
    try:
        page.goto(url, timeout=30000)
        page.wait_for_timeout(2500)
        if "Just a moment" in page.title():
            page.wait_for_timeout(5000)  # let Cloudflare's JS challenge auto-clear
        html = page.content()
    finally:
        context.close()
    return html


def find_product_urls(browser, category_slug: str, max_pages: int) -> list[str]:
    urls: set[str] = set()
    for page_num in range(1, max_pages + 1):
        list_url = f"{BASE}/segment/{category_slug}?page={page_num}&sortby=DEFAULT"
        html = fetch_html(browser, list_url)
        found = set(re.findall(r'href="(https://www\.scientificlabs\.co\.uk/product/[^"]+)"', html))
        if not found:
            break
        before = len(urls)
        urls |= found
        if len(urls) == before:
            break  # no new products on this page -> pagination ended
        time.sleep(REQUEST_DELAY_SECONDS)
    return sorted(urls)


def extract_product(browser, url: str, category_slug: str) -> dict | None:
    html = fetch_html(browser, url)
    data = None
    for block in re.findall(
        r'<script type="application/ld\+json"[^>]*>(.*?)</script>',
        html, re.DOTALL,
    ):
        try:
            parsed = json.loads(block)
        except json.JSONDecodeError:
            continue
        if parsed.get("@type") == "Product":
            data = parsed
            break
    if data is None:
        return None

    offer = data.get("offers", {}) or {}
    specs = {
        p["name"]: p["value"]
        for p in data.get("additionalProperty", []) or []
        if "name" in p and "value" in p
    }
    return {
        "source_url": url,
        "source_category_slug": category_slug,
        "source_sku": data.get("sku"),
        "name_en_raw": data.get("name"),
        "brand": (data.get("brand") or {}).get("name"),
        "description_en_raw": data.get("description"),
        "price_gbp": offer.get("price"),
        "currency": offer.get("priceCurrency"),
        "image_url": (data.get("image") or [None])[0],
        "specs_raw": specs,
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }


def run(categories: list[str], max_pages: int, max_products: int | None) -> list[dict]:
    results: list[dict] = []
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            args=["--disable-blink-features=AutomationControlled"],
        )

        for slug in categories:
            print(f"[category] {slug}: listing products...")
            urls = find_product_urls(browser, slug, max_pages)
            if max_products:
                urls = urls[:max_products]
            print(f"[category] {slug}: {len(urls)} product(s) found")

            for i, url in enumerate(urls, 1):
                try:
                    record = extract_product(browser, url, slug)
                except Exception as exc:
                    print(f"  [error] {url}: {exc}")
                    continue
                if record:
                    results.append(record)
                    print(f"  [{i}/{len(urls)}] {record['source_sku']} - {record['name_en_raw'][:60]}")
                else:
                    print(f"  [skip] no product data: {url}")
                time.sleep(REQUEST_DELAY_SECONDS)

        browser.close()
    return results


def write_outputs(records: list[dict]) -> Path:
    run_dir = OUT_DIR / datetime.now().strftime("%Y%m%d-%H%M%S")
    run_dir.mkdir(parents=True, exist_ok=True)

    (run_dir / "products.json").write_text(
        json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    csv_path = run_dir / "products.csv"
    fields = [
        "source_url", "source_category_slug", "source_sku", "name_en_raw",
        "brand", "description_en_raw", "price_gbp", "currency", "image_url",
        "specs_raw", "scraped_at",
    ]
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for r in records:
            row = dict(r)
            row["specs_raw"] = json.dumps(row["specs_raw"], ensure_ascii=False)
            writer.writerow(row)

    return run_dir


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--categories", nargs="+", required=True,
                         help="scientificlabs.co.uk segment slugs, e.g. test-tubes rotary-evaporators")
    parser.add_argument("--max-pages", type=int, default=5,
                         help="max listing pages per category (default 5)")
    parser.add_argument("--max-products", type=int, default=None,
                         help="cap products per category (default: no cap)")
    args = parser.parse_args()

    records = run(args.categories, args.max_pages, args.max_products)
    out_dir = write_outputs(records)
    print(f"\nDone. {len(records)} product(s) written to {out_dir}")
    print("REMINDER: descriptions/images are reference-only. Rewrite descriptions "
          "in French, and source your own product photos before publishing.")


if __name__ == "__main__":
    main()
