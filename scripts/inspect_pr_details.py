import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\概率论数理统计讲义.pdf')

for pno in range(4, 12):
    page = doc[pno]
    print(f"=== Page {pno+1} (idx {pno}) ===")
    blocks = page.get_text("blocks")
    for b in blocks:
        txt = b[4].strip().replace('\n', ' ')
        if b[1] < 60: continue # header
        if b[3] > 770: continue # footer
        print(f"  [{b[1]:.1f}, {b[3]:.1f}] {txt[:80]}")
