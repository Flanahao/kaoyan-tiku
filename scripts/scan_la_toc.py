import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\夜雨线代强化讲义.pdf')
print(f'Total pages in 线代: {len(doc)}')

# Let's inspect TOC in 線代 (usually pages 1 to 5)
for pno in range(1, 5):
    print(f'=== Page {pno} ===')
    txt = doc[pno].get_text()
    for line in txt.split('\n'):
        line = line.strip()
        if '...' in line or '章' in line or '专题' in line:
            print('  ', line[:80])
