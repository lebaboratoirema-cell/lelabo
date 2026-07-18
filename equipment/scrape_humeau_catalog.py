#!/usr/bin/env python3
"""
Competitor catalog scraper (humeau.com) -> research reference data.

Deterministic equipment script: extracts structured product data (name, brand,
SKU, price, description, specs, image URL) from JSON-LD Product schema +
spec table on each product page.

humeau.com serves plain server-rendered HTML with no bot-detection challenge,
so plain HTTP requests work (no Playwright/browser needed).

NOTE: humeau.com's robots.txt explicitly disallows ClaudeBot/anthropic-ai
(Disallow: / for that user-agent group). Run only with explicit user
authorization to override.

OUTPUT IS REFERENCE-ONLY. Descriptions are the competitor's raw French text
and must be REWRITTEN (not translated/copied) before use on lelaboratoire.
Images are the competitor's hosted assets and must NOT be re-published
without rights (use your own photos or licensed stock instead).

Usage:
    python equipment/scrape_humeau_catalog.py --subcategories becher
    python equipment/scrape_humeau_catalog.py --subcategories becher fiole --max-products 20
"""
import argparse
import csv
import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path

import requests

BASE = "https://www.humeau.com"
CATEGORY_PATH = "petit-materiel-verrerie-plastique"
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")
REQUEST_DELAY_SECONDS = 1.5

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "research" / "competitor-scrape-humeau"

SESSION = requests.Session()
SESSION.headers.update({"User-Agent": UA})


def fetch_html(url: str) -> str:
    resp = SESSION.get(url, timeout=30)
    resp.raise_for_status()
    return resp.text


def find_product_urls(subcategory_slug: str) -> list[str]:
    url = f"{BASE}/{CATEGORY_PATH}/{subcategory_slug}.html"
    html = fetch_html(url)
    found = set(re.findall(r'href="(https://www\.humeau\.com/[a-z0-9-]+-\d+\.html)"', html))
    return sorted(found)


def extract_specs_table(html: str) -> dict:
    m = re.search(
        r'id="product-attribute-specs-table".*?<tbody>(.*?)</tbody>',
        html, re.DOTALL,
    )
    if not m:
        return {}
    rows = re.findall(
        r'<th[^>]*class="label">([^<]+)</th><td[^>]*>\s*([^<]*?)\s*</td>',
        m.group(1), re.DOTALL,
    )
    return {label.strip(): value.strip() for label, value in rows}


def extract_product(url: str, subcategory_slug: str) -> dict | None:
    html = fetch_html(url)
    data = None
    for block in re.findall(
        r'<script type="application/ld\+json">(.*?)</script>',
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
    price_spec = offer.get("priceSpecification", {}) or {}
    return {
        "source_url": url,
        "source_subcategory_slug": subcategory_slug,
        "source_sku": data.get("sku"),
        "name_fr_raw": data.get("name"),
        "brand": (data.get("brand") or {}).get("name"),
        "description_fr_raw": data.get("description"),
        "price": price_spec.get("price") or offer.get("price"),
        "currency": price_spec.get("priceCurrency") or offer.get("priceCurrency"),
        "image_url": data.get("image"),
        "specs_raw": extract_specs_table(html),
        "scraped_at": datetime.now(timezone.utc).isoformat(),
    }


def run(subcategories: list[str], max_products: int | None) -> list[dict]:
    results: list[dict] = []
    for slug in subcategories:
        print(f"[subcategory] {slug}: listing products...")
        urls = find_product_urls(slug)
        if max_products:
            urls = urls[:max_products]
        print(f"[subcategory] {slug}: {len(urls)} product(s) found")

        for i, url in enumerate(urls, 1):
            try:
                record = extract_product(url, slug)
            except Exception as exc:
                print(f"  [error] {url}: {exc}")
                continue
            if record:
                results.append(record)
                print(f"  [{i}/{len(urls)}] {record['source_sku']} - {(record['name_fr_raw'] or '')[:60]}")
            else:
                print(f"  [skip] no product data: {url}")
            time.sleep(REQUEST_DELAY_SECONDS)

    return results


def write_outputs(records: list[dict]) -> Path:
    run_dir = OUT_DIR / datetime.now().strftime("%Y%m%d-%H%M%S")
    run_dir.mkdir(parents=True, exist_ok=True)

    (run_dir / "products.json").write_text(
        json.dumps(records, indent=2, ensure_ascii=False), encoding="utf-8"
    )

    csv_path = run_dir / "products.csv"
    fields = [
        "source_url", "source_subcategory_slug", "source_sku", "name_fr_raw",
        "brand", "description_fr_raw", "price", "currency", "image_url",
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
    parser.add_argument("--subcategories", nargs="+", required=True,
                         help="humeau.com subcategory slugs under petit-materiel-verrerie-plastique, e.g. becher fiole")
    parser.add_argument("--max-products", type=int, default=None,
                         help="cap products per subcategory (default: no cap)")
    args = parser.parse_args()

    records = run(args.subcategories, args.max_products)
    out_dir = write_outputs(records)
    print(f"\nDone. {len(records)} product(s) written to {out_dir}")
    print("REMINDER: descriptions/images are reference-only. Rewrite descriptions "
          "in your own words, and source your own product photos before publishing.")


if __name__ == "__main__":
    main()
