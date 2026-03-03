# -*- coding: utf-8 -*-
"""Read price_inventory Excel and print structure (run from Downloads folder)."""
import openpyxl
import sys
import os

path = r"c:\Users\leedh\Downloads\price_inventory_260303.xlsx"
if not os.path.isfile(path):
    print("File not found:", path)
    sys.exit(1)

wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
ws = wb.active
rows = list(ws.iter_rows(max_row=20, values_only=True))
# Header at row index 2 (3rd row)
print("=== Header (row 2) ===")
if len(rows) > 2:
    for j, cell in enumerate(rows[2][:20]):
        print(j, repr(cell)[:60])
print("\n=== First 5 data rows (columns 0-13) ===")
for i in range(3, min(8, len(rows))):
    row = rows[i]
    if row:
        print("Row", i, ":", [row[j] if j < len(row) else None for j in range(14)])
wb.close()
