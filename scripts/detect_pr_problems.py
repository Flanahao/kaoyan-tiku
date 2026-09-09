import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\概率论数理统计讲义.pdf')

CHAPTERS = [
    (1, '第1章 随机事件及其概率', 6, 21),
    (2, '第2章 一维随机变量及其分布', 22, 32),
    (3, '第3章 二维随机变量及其分布', 33, 48),
    (4, '第4章 随机变量的数字特征', 49, 59),
    (5, '第5章 大数定律和中心极限定理', 60, 62),
    (6, '第6章 数理统计的基本概念', 63, 70),
    (7, '第7章 参数估计', 71, 79),
    (8, '第8章 假设检验与置信区间', 80, 84),
]

def is_red_color(color):
    # PyMuPDF color is integer or tuple (r, g, b) in [0, 1]
    if isinstance(color, (list, tuple)) and len(color) >= 3:
        r, g, b = color[0], color[1], color[2]
        return r > 0.8 and g < 0.3 and b < 0.3
    return False

def analyze_chapter(ch_num, title, p_start, p_end):
    print(f"\n{'='*30} CH{ch_num}: {title} (P{p_start}~P{p_end}) {'='*30}")
    items = []
    for pno in range(p_start - 1, p_end):
        page = doc[pno]
        blocks = page.get_text("dict")["blocks"]
        for b in blocks:
            if "lines" not in b: continue
            b_text = ""
            is_red = False
            y0 = b["bbox"][1]
            y1 = b["bbox"][3]
            if y0 < 65 or y1 > 765: continue # ignore header/footer
            
            for line in b["lines"]:
                for span in line["spans"]:
                    txt = span["text"].strip()
                    if not txt: continue
                    b_text += txt + " "
                    # check color
                    col = span.get("color")
                    # PyMuPDF span['color'] is an integer: (r << 16) + (g << 8) + b
                    if isinstance(col, int):
                        r = (col >> 16) & 255
                        g = (col >> 8) & 255
                        b_val = col & 255
                        if r > 180 and g < 60 and b_val < 60:
                            is_red = True
            b_text = b_text.strip()
            if not b_text: continue
            items.append({
                "page": pno + 1,
                "y0": y0,
                "y1": y1,
                "text": b_text,
                "is_red": is_red
            })
    return items

for ch_num, title, p_s, p_e in CHAPTERS:
    items = analyze_chapter(ch_num, title, p_s, p_e)
    # Print red headers
    reds = [it for it in items if it["is_red"]]
    print(f"Red headers ({len(reds)}):")
    for r in reds:
        print(f"  P{r['page']} [{r['y0']:.1f}-{r['y1']:.1f}]: {r['text']}")
