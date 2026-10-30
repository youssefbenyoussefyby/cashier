import sqlite3
import pandas as pd
import re
import random
from datetime import datetime

# ── CONFIG ────────────────────────────────────────────────────────────────────
EXCEL_PATH    = 'ETAT CA 2024 FINAL YOUSSEF.xlsx'  # ← Path to your Excel file
SQLITE_DB     = 'cashier.db'                 # ← Path to your SQLite .db
CLIENT_LOOKUP = True                               # Set False to skip client logic

# Range from which to draw random IDs for liste_article_f.id
RANDOM_MIN = 10_000_000
RANDOM_MAX = 99_999_999
# ───────────────────────────────────────────────────────────────────────────────

def normalize_product_name(raw_name: str) -> str:
    """
    Remove any "+3DT LOI" (and everything after) and strip whitespace.
    E.g. "MIRALLO 22,5 TTC +3DT LOI 47" → "MIRALLO 22,5 TTC"
    """
    if raw_name is None or str(raw_name).strip() == '':
        return None
    return re.sub(r'\+3DT LOI.*$', '', str(raw_name)).strip()

def parse_price(price_str: str) -> float:
    """
    Convert strings like "6,8 TTC" or "22,5 TTC" → 6.8 or 22.5.
    Assumes a comma as decimal separator; drops any non-digit/comma text.
    """
    if pd.isna(price_str):
        return 0.0
    digits = re.findall(r'[\d,]+', str(price_str))
    if not digits:
        return 0.0
    num = digits[0].replace(',', '.')
    try:
        return float(num)
    except ValueError:
        return 0.0

def generate_unique_random_id(cursor) -> int:
    """
    Draw a random int in [RANDOM_MIN, RANDOM_MAX], check if it’s already used
    in liste_article_f.id. If so, retry until a unique one is found.
    """
    while True:
        candidate = random.randint(RANDOM_MIN, RANDOM_MAX)
        cursor.execute("SELECT 1 FROM liste_article_f WHERE id = ?", (candidate,))
        if cursor.fetchone() is None:
            return candidate

def load_client_lookup_from_excel(excel_path: str) -> dict:
    """
    Load the 'MATRICULE FISC' sheet (if present) and build a dict:
      key   = client_name.strip().upper()
      value = (reference, matricule_fiscale)
    We’ll only extract column 0 as name, column 1 as Matricule_fiscale.
    All other columns remain empty.
    """
    try:
        df_clients = pd.read_excel(excel_path, sheet_name='MATRICULE FISC', header=None)
    except ValueError:
        return {}

    client_dict = {}
    for _, row in df_clients.iterrows():
        raw_name = row.iloc[0]
        raw_mf   = row.iloc[1] if len(row) > 1 else None

        if pd.isna(raw_name):
            continue
        name = str(raw_name).strip()
        matricule = str(raw_mf).strip() if pd.notna(raw_mf) else ''

        client_dict[name.upper()] = (matricule, matricule)
    return client_dict

def find_or_create_client(cursor, client_name: str, client_lookup_dict: dict):
    """
    1) If client_name is blank/NaN, return None.
    2) Else, look in existing 'clients' table by name → return its id.
    3) If not found, look in client_lookup_dict (keyed by name.upper()):
       • If found, insert a new client with:
           reference = matricule_fiscale,
           name = client_name,
           and leave other fields NULL.
       • If not found in lookup_dict, insert a new client with:
           reference = '' (empty string).
       Return the newly inserted client.id.
    """
    if client_name is None or str(client_name).strip() == '':
        return None

    name_str = str(client_name).strip()
    cursor.execute("SELECT id FROM clients WHERE name = ?", (name_str,))
    existing = cursor.fetchone()
    if existing:
        return existing[0]

    lookup_key = name_str.upper()
    if lookup_key in client_lookup_dict:
        matricule, _ = client_lookup_dict[lookup_key]
        mf = matricule if matricule else ''
    else:
        mf = ''

    cursor.execute("SELECT COUNT(*) FROM clients")
    count_row = cursor.fetchone()
    current_count = count_row[0] if count_row else 0
    new_index = current_count + 1
    reference = f"CL{new_index:06d}"

    cursor.execute("""
        INSERT INTO clients(
            reference,
            name,
            responsable,
            tele,
            email,
            debt,
            address,
            Matricule_fiscale
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        reference,
        name_str,
        None,
        None,
        None,
        None,
        None,
        mf
    ))
    return cursor.lastrowid

def main():
    # ─ Step A: Read Excel, extract headers and column indices ──────────────
    df = pd.read_excel(EXCEL_PATH, header=None, sheet_name=0)

    # We expect:
    #  • Row index 2 (third row) = product names (columns 4, 5, …)
    #  • Row index 3 (fourth row) = unit prices (e.g. "6,8 TTC")
    #  • Column index 12 (M) = TOTAL (to take abs and store in facture.price)
    #  • Column index 13 (N) = REMISE (to store in facture.remise)
    #  • Rows index ≥ 4 = one invoice per row
    header_row        = 2
    price_row         = 3
    invoice_start_row = 4

    total_col_index  = 12  # TOTAL is in column M (0-based index 12)
    remise_col_index = 13  # REMISE is in column N (0-based index 13)

    # 1) Load client lookup dict from "MATRICULE FISC" sheet (if any)
    client_lookup_dict = {}
    if CLIENT_LOOKUP:
        client_lookup_dict = load_client_lookup_from_excel(EXCEL_PATH)

    # 2a) Extract & normalize product names from row 2, columns ≥ 4
    raw_product_names = df.iloc[header_row, 4:].tolist()
    cleaned_names = [
        normalize_product_name(raw) if pd.notna(raw) else None
        for raw in raw_product_names
    ]

    # 2b) Extract & parse unit prices from row 3, columns ≥ 4
    raw_price_cells = df.iloc[price_row, 4:].tolist()
    parsed_prices = [parse_price(p) for p in raw_price_cells]

    # 2c) Build list of (column_index, product_name, unit_price)
    products_info = []
    for col_idx, (pname, pprice) in enumerate(zip(cleaned_names, parsed_prices), start=4):
        if pname and pname.strip():
            products_info.append((col_idx, pname.strip(), pprice))

    # ─ Step B: Connect to SQLite ─────────────────────────────────────────────
    conn = sqlite3.connect(SQLITE_DB)
    cursor = conn.cursor()

    # ─ Step C: Loop over each invoice row (index ≥ 4) ────────────────────────
    row_idx = invoice_start_row
    while row_idx < len(df):
        row_data = df.iloc[row_idx]

        client_name = row_data[0]            # Column A (0)
        invoice_num = row_data[1]            # Column B (1)
        raw_date    = row_data[2]            # Column C (2)
        total_raw   = row_data[total_col_index]  # Column M (12)
        remise_raw  = row_data[remise_col_index] # Column N (13)

        # If NUM FACTURE is blank/NaN, stop
        if pd.isna(invoice_num):
            break

        # ── C.1: facture.id = int(invoice_num)
        try:
            inv_int = int(invoice_num)
        except (ValueError, TypeError):
            inv_int = int(float(invoice_num))
        facture_id = inv_int

        # ── C.2: facture.number = 'FA' + zero-padded 6 digits
        facture_number = f"FA{inv_int:06d}/2024"

        # ── C.3: Parse DATE → 'dd/MM/YYYY'
        if pd.isna(raw_date):
            date_str = None
        else:
            if isinstance(raw_date, (pd.Timestamp, datetime)):
                date_str = raw_date.strftime("%d/%m/%Y")
            else:
                try:
                    parsed = pd.to_datetime(raw_date)
                    date_str = parsed.strftime("%d/%m/%Y")
                except Exception:
                    date_str = str(raw_date)

        # ── C.4: Look up or insert client if CLIENT_LOOKUP=True
        client_id = None
        if CLIENT_LOOKUP:
            client_id = find_or_create_client(cursor, client_name, client_lookup_dict)

        # ── C.5: Compute 'price' = abs(TOTAL), 'remise' = REMISE or 0
        price_val = abs(float(total_raw)) if pd.notna(total_raw) else 0.0
        try:
            remise_val = abs(float(remise_raw))*100 / price_val if pd.notna(remise_raw) and price_val else 0.0
        except ValueError:
            remise_val = 0.0

        # ── C.6: Compute 'avance' = abs(price_val - 1000) if price_val < 1000 else 0
        if price_val > 1000:
            remise_val = 0;
        remise_val = round(remise_val,2);

        # ── C.7: Insert into 'facture'
        cursor.execute("""
            INSERT OR IGNORE INTO facture(
                id,
                number,
                client,
                date,
                remise,
                price,
                avance
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            facture_id,
            facture_number,
            client_id,
            date_str,
            remise_val,
            price_val,
            0
        ))

        # ── C.8: Insert each product line into 'liste_article_f'
        for col_idx, prod_name, prod_price in products_info:
            qty_cell = row_data[col_idx]
            if pd.isna(qty_cell) or qty_cell == 0:
                continue

            # Look up product.id by name
            cursor.execute("SELECT id FROM products WHERE name = ?", (prod_name,))
            rowp = cursor.fetchone()
            if not rowp:
                print(f"⚠️  Product '{prod_name}' not found. Skipping line.")
                continue
            product_id = rowp[0]

            # Round quantity to two decimals
            rounded_qty = round(float(qty_cell), 2)

            # Generate a random unique ID for liste_article_f row
            random_line_id = generate_unique_random_id(cursor)

            # Insert line
            cursor.execute("""
                INSERT INTO liste_article_f(
                    id,
                    product,
                    quantite,
                    prix,
                    facture
                ) VALUES (?, ?, ?, ?, ?)
            """, (
                random_line_id,
                product_id,
                rounded_qty,
                prod_price,
                facture_id
            ))

        row_idx += 1

    # ─ Step D: Commit & Close ────────────────────────────────────────────────
    conn.commit()
    conn.close()
    print("✅  Import finished (facture.remise, facture.price, facture.avance updated).")

if __name__ == '__main__':
    main()
