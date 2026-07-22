#!/usr/bin/env python3
"""
Le Laboratoire — Supabase (Postgres) -> Hostinger MySQL data migration.

READ-ONLY on the Supabase side. Nothing is deleted or altered in Supabase;
it stays the live backup. This script only SELECTs from Postgres and
INSERTs into MySQL.

Requires:
    pip install psycopg2-binary mysql-connector-python

Env vars (put in .env, never commit):
    SUPABASE_DB_URL   postgres connection string, e.g.
                      postgresql://postgres:PASSWORD@db.xxxx.supabase.co:5432/postgres
                      (Supabase dashboard -> Project Settings -> Database -> Connection string)
    MYSQL_HOST
    MYSQL_PORT        default 3306
    MYSQL_DATABASE
    MYSQL_USER
    MYSQL_PASSWORD

Usage:
    1. Apply equipment/migrate-to-mysql/mysql_schema.sql to the Hostinger
       database first (via phpMyAdmin or `mysql < mysql_schema.sql`).
    2. python equipment/migrate-to-mysql/migrate.py            # dry run, prints counts
    3. python equipment/migrate-to-mysql/migrate.py --apply     # actually writes to MySQL
    4. python equipment/migrate-to-mysql/migrate.py --apply --truncate
       # wipe target tables first (use for re-runs; safe, target only)
"""

import argparse
import json
import os
import sys

import psycopg2
import psycopg2.extras
import mysql.connector

# Order matters: parents before children (FK-safe insert order).
TABLES_IN_ORDER = [
    "categories",
    "products",
    "product_variants",
    "product_images",
    "product_documents",
    "orders",
    "order_items",
    "blog_posts",
    "cookie_consents",
]

# Columns that are Postgres jsonb and must be json.dumps()'d for MySQL JSON columns.
JSON_COLUMNS = {
    "categories": {"name", "description", "group_label"},
    "products": {"name", "description", "specifications", "delivery"},
    "product_variants": {"name"},
    "product_images": {"alt"},
    "orders": {"shipping_address"},
    "order_items": {"product_name", "variant_name"},
}

BOOL_COLUMNS = {
    "categories": {"is_active"},
    "products": {"is_active", "is_featured"},
    "product_variants": {"is_active"},
    "product_images": {"is_primary"},
    "blog_posts": {"is_published"},
    "cookie_consents": set(),
}


def connect_pg():
    dsn = os.environ.get("SUPABASE_DB_URL")
    if not dsn:
        sys.exit("SUPABASE_DB_URL not set. See script docstring.")
    return psycopg2.connect(dsn)


def connect_mysql():
    required = ["MYSQL_HOST", "MYSQL_DATABASE", "MYSQL_USER", "MYSQL_PASSWORD"]
    missing = [k for k in required if not os.environ.get(k)]
    if missing:
        sys.exit(f"Missing env vars: {', '.join(missing)}")
    return mysql.connector.connect(
        host=os.environ["MYSQL_HOST"],
        port=int(os.environ.get("MYSQL_PORT", "3306")),
        database=os.environ["MYSQL_DATABASE"],
        user=os.environ["MYSQL_USER"],
        password=os.environ["MYSQL_PASSWORD"],
    )


def fetch_rows(pg_conn, table):
    with pg_conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
        cur.execute(f"SELECT * FROM {table} ORDER BY created_at")
        return cur.fetchall()


def convert_row(table, row):
    json_cols = JSON_COLUMNS.get(table, set())
    bool_cols = BOOL_COLUMNS.get(table, set())
    out = {}
    for col, val in row.items():
        if val is not None and col in json_cols:
            out[col] = json.dumps(val)
        elif val is not None and col in bool_cols:
            out[col] = 1 if val else 0
        else:
            out[col] = val
    return out


def insert_rows(my_conn, table, rows, truncate):
    if not rows:
        print(f"  {table}: 0 rows, skipping")
        return
    cur = my_conn.cursor()
    if truncate:
        cur.execute("SET FOREIGN_KEY_CHECKS = 0")
        cur.execute(f"TRUNCATE TABLE {table}")
        cur.execute("SET FOREIGN_KEY_CHECKS = 1")

    columns = list(rows[0].keys())
    placeholders = ", ".join(["%s"] * len(columns))
    col_list = ", ".join(f"`{c}`" for c in columns)
    sql = f"INSERT INTO {table} ({col_list}) VALUES ({placeholders})"

    values = [[convert_row(table, r)[c] for c in columns] for r in rows]
    cur.executemany(sql, values)
    my_conn.commit()
    print(f"  {table}: inserted {cur.rowcount} rows")
    cur.close()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--apply", action="store_true", help="actually write to MySQL (default: dry run)")
    parser.add_argument("--truncate", action="store_true", help="TRUNCATE each MySQL table before insert (target only, Supabase untouched)")
    parser.add_argument("--only", help="comma-separated list of tables to migrate (default: all)")
    args = parser.parse_args()

    tables = TABLES_IN_ORDER
    if args.only:
        wanted = set(args.only.split(","))
        tables = [t for t in TABLES_IN_ORDER if t in wanted]

    pg_conn = connect_pg()
    print("Connected to Supabase (read-only).")

    counts = {}
    all_rows = {}
    for table in tables:
        rows = fetch_rows(pg_conn, table)
        counts[table] = len(rows)
        all_rows[table] = rows
    pg_conn.close()

    print("\nRow counts in Supabase source:")
    for t, c in counts.items():
        print(f"  {t}: {c}")

    if not args.apply:
        print("\nDry run only. Re-run with --apply to write into MySQL.")
        return

    my_conn = connect_mysql()
    print("\nConnected to Hostinger MySQL. Writing...")
    for table in tables:
        insert_rows(my_conn, table, all_rows[table], truncate=args.truncate)
    my_conn.close()
    print("\nDone. Supabase source was not modified — it remains your backup.")


if __name__ == "__main__":
    main()
