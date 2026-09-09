import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\概率论数理统计讲义.pdf')

for pno in [82, 83]:
    page = doc[pno]
    print(f'=== Page {pno} ===')
    blocks = page.get_text('blocks')
    for i, b in enumerate(blocks):
        txt = b[4].strip().replace('\n', ' ')
        if b[1] >= 62 and b[3] <= 760:
            print(f'  Block {i} [{b[0]:.1f}, {b[1]:.1f}, {b[2]:.1f}, {b[3]:.1f}]: {txt}')
