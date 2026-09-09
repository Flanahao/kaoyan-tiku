import fitz
import sys

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\概率论数理统计讲义.pdf')
for pno in range(5, 21):
    print(f'================ Page {pno} (printed {pno - 4}) ================')
    blocks = doc[pno].get_text('blocks')
    for b in blocks:
        txt = b[4].strip().replace('\n', ' ')
        if txt and not any(k in txt for k in ['站在更高的位置', '为什么你学得好', str(pno-4)]):
            print(f'  [{b[1]:.1f} ~ {b[3]:.1f}]: {txt[:70]}')
