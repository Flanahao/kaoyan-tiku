import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\概率论数理统计讲义.pdf')

# Let's inspect page by page for 概率论
for pno in range(5, 84):
    page = doc[pno]
    blocks = page.get_text('blocks')
    q_candidates = []
    for b in blocks:
        txt = b[4].strip().replace('\n', ' ')
        if b[1] < 62 or b[3] > 760 or not txt: continue
        # Detect if it's question text
        has_src = bool(re.search(r'（\s*(19\d\d|20\d\d|张宇|超越|李林|李永乐|合工大|共阳|余炳森|高联|汤家凤)[^）]*）', txt))
        starts_q = bool(re.match(r'^(类似题|计算|证明|试求|设总体|已知总体|设随机变量|已知随机|设数|某人|某班|袋中|袋子|从数|将编号|将五个|寝室|三十名|若随机变量|设两两|设甲|设一个|设为来自|设是来自|总体|下表列出了|现从一批)', txt))
        if has_src or starts_q:
            q_candidates.append((b[1], b[3], txt[:60]))
    if q_candidates:
        print(f'Page {pno} (printed {pno-4}): {len(q_candidates)} items')
        for y0, y1, t in q_candidates:
            print(f'   [{y0:.1f} ~ {y1:.1f}]: {t}')
