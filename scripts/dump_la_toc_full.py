import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\夜雨线代强化讲义.pdf')
for pno in range(1, 5):
    print(f'=== Page {pno} ===')
    for l in doc[pno].get_text().split('\n'):
        if l.strip():
            print(l.strip())
