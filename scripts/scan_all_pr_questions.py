import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\概率论数理统计讲义.pdf')

CHAPTERS = [
    (1, '第1章 随机事件及其概率', 5, 20),
    (2, '第2章 一维随机变量及其分布', 21, 31),
    (3, '第3章 二维随机变量及其分布', 32, 47),
    (4, '第4章 随机变量的数字特征', 48, 58),
    (5, '第5章 大数定律和中心极限定理', 59, 61),
    (6, '第6章 数理统计的基本概念', 62, 69),
    (7, '第7章 参数估计', 70, 78),
    (8, '第8章 假设检验与置信区间', 79, 83),
]

def analyze_chapter_items(ch_idx, title, p_start, p_end):
    print(f'================ {title} (Pages {p_start} ~ {p_end}) ================')
    for pno in range(p_start, p_end + 1):
        page = doc[pno]
        blocks = page.get_text('blocks')
        for b in blocks:
            txt = b[4].strip().replace('\n', ' ')
            if b[1] < 62 or b[3] > 760 or not txt: continue
            # Check if this block looks like a question or exercise problem
            is_q = False
            # Check source tags like (2014) or (张宇...)
            if re.search(r'（\s*(19\d\d|20\d\d|张宇|超越|李林|李永乐|合工大|共阳|余炳森)[^）]*）', txt):
                is_q = True
            elif re.match(r'^(类似题|计算|证明：|试求|设总体|已知总体|设数|某人|某班|袋中|从数|将编号|将五个|寝室|三十名)', txt):
                is_q = True
            elif any(k in txt for k in ['求射击', '求取出', '求第四个', '求下列事件概率', '求甲最终', '求系统正常工作']):
                is_q = True
            if is_q:
                print(f'  P{pno} [{b[1]:.1f} ~ {b[3]:.1f}]: {txt[:75]}')

for ch_idx, title, p_start, p_end in CHAPTERS:
    analyze_chapter_items(ch_idx, title, p_start, p_end)
