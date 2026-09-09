import fitz, os, sys, re
from PIL import Image, ImageDraw, ImageFont
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'D:\AntigravityChat\夜雨题库_去水印\概率论数理统计讲义.pdf'
doc = fitz.open(pdf_path)
CANVAS_WIDTH = 1536
base_out = r'D:\考研题库网站\数一题库\夜雨强化\概率论'

def render_page(page):
    scale = CANVAS_WIDTH / page.rect.width
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale))
    im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
    return im, scale

def find_outermost_ink_clean(im_rgb, y0_px, y1_px, prev_bottom_px=None, next_top_px=None, threshold=240, min_ink_count=3):
    gray = im_rgb.convert('L')
    w, h = gray.size
    pix_data = gray.load()
    y_min, y_max = y1_px, y0_px
    has_ink = False
    scan_top = max(0 if prev_bottom_px is None else prev_bottom_px + 2, y0_px - 8)
    scan_bottom = min(h if next_top_px is None else next_top_px - 2, y1_px + 8)
    for y in range(scan_top, scan_bottom):
        ink_cnt = sum(1 for x in range(int(w * 0.05), int(w * 0.95)) if pix_data[x, y] < threshold)
        if ink_cnt >= min_ink_count:
            has_ink = True
            if y < y_min: y_min = y
            if y > y_max: y_max = y
    if has_ink:
        return y_min, y_max
    return y0_px, y1_px

def crop_question_unit(im, y0_px, y1_px, q_num_str, prev_bottom_px=None, next_top_px=None):
    y_min, y_max = find_outermost_ink_clean(im, y0_px, y1_px, prev_bottom_px, next_top_px)
    max_pad = 12
    if prev_bottom_px is not None and prev_bottom_px < y_min:
        top_pad = min(max_pad, (y_min - prev_bottom_px) // 2)
        top = max(prev_bottom_px + 1, y_min - top_pad)
    else:
        top = max(0, y_min - max_pad)
        
    if next_top_px is not None and next_top_px > y_max:
        bottom_pad = min(max_pad, (next_top_px - y_max) // 2)
        bottom = min(next_top_px - 1, y_max + bottom_pad)
    else:
        bottom = min(im.height, y_max + max_pad)
        
    cropped = im.crop((0, top, CANVAS_WIDTH, bottom))
    
    badge_h = 44
    final_im = Image.new('RGB', (CANVAS_WIDTH, cropped.height + badge_h), (255, 255, 255))
    draw = ImageDraw.Draw(final_im)
    font_badge = ImageFont.truetype('msyh.ttc', 20)
    
    bx, by = 135, 8
    bw, bh = 88, 30
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=5, fill=(47, 128, 237))
    draw.text((bx + 14, by + 1), q_num_str, fill=(255, 255, 255), font=font_badge)
    final_im.paste(cropped, (0, badge_h))
    return final_im

# Detailed items for Chapter 2
CH2_ITEMS = [
    (21, 360, 480, 350, 490, "设 F1(x), F2(x) 都是分布函数，常数 a, b，证明：aF1(x) + bF2(x) 也是一个分布函数"),
    (21, 485, 525, 480, 765, "设 F1(x), F2(x) 都是分布函数，证明：F1(x)F2(x) 也是一个分布函数"),
    (22, 95, 125, 80, 140, "设随机变量 X 的分布函数 ... 求 ... (2010)"),
    (22, 420, 475, 410, 490, "设 F1(x), F2(x) 为两个分布函数... 必为概率密度的是（2011）"),
    (22, 495, 760, 485, 765, "设 X 和 Y 是任意两个相互独立的连续型随机变量... 则（2002）"),
    (23, 385, 540, 375, 550, "已知随机变量 X 的概率分布为 ... 试写出 X 的分布函数（1987）"),
    (25, 100, 125, 90, 140, "设随机变量 X 服从参数为 λ 的指数分布... 求 ... (2013)"),
    (25, 600, 760, 595, 765, "设随机变量 X~N(μ, σ²)... 则（2016）"),
    (26, 72, 145, 65, 150, "设随机变量 X 与 Y 均服从正态分布... 则（1993）"),
    (26, 150, 320, 145, 325, "设 X 是随机变量，且 X~N(μ, σ²)... 则（2013）"),
    (26, 323, 430, 320, 435, "设随机变量 X 与 Y 相互独立，且都服从正态分布... 则（2019）"),
    (26, 432, 545, 430, 765, "设两个相互独立的随机变量 X 与 Y 分别服从正态分布... 则（1999）"),
    (27, 75, 95, 65, 100, "设随机变量 X 服从正态分布 N(1, 4)... (2002)"),
    (27, 98, 205, 95, 210, "设随机变量 X 服从均值为 2，方差为 σ² 的正态分布... (1991)"),
    (27, 206, 330, 205, 360, "设随机变量 X 服从正态分布 N(μ1, σ1²)... 则必有（2006）"),
    (27, 470, 625, 465, 765, "判断等式对错 / 设随机变量 X 服从正态分布... 则 c 等于（2004）"),
    (28, 72, 150, 65, 180, "设随机变量 X 的概率密度为 f(x)... 为 X 的分布函数，则对任意实数，有..."),
    (28, 345, 365, 335, 370, "设随机变量 X 与 Y 相互独立，且均服从区间 [0, 1] 上的均匀分布，求 P{X²>=Y} (2006)"),
    (28, 365, 470, 360, 480, "设随机变量 X 与 Y 相互独立，且均服从区间 [0, 1] 上的均匀分布，求 P{X+Y<=1}"),
    (28, 635, 660, 625, 765, "已知随机变量 X 的概率分布 ... 求 Y=2X+1 的概率分布"),
    (29, 72, 86, 65, 100, "已知随机变量 X 的概率分布 ... 求 Y=X² 的概率分布"),
    (29, 320, 370, 310, 480, "设随机变量 X~N(μ, σ²)，证明：Y=aX+b 也服从正态分布"),
    (29, 485, 520, 480, 765, "设随机变量 X 的概率密度为 f(x)... 求 Y=2X 的概率密度"),
    (30, 134, 160, 125, 380, "设随机变量 X 的概率密度 ... 求 Y=X² 的概率密度"),
    (30, 385, 440, 380, 765, "设随机变量 X 的概率密度为 ... 令随机变量 Y=... 求随机事件 的分布函数"),
    (31, 72, 86, 65, 90, "设随机变量 X 服从参数 λ 的指数分布，令 Y=... 求随机事件 的分布函数"),
    (31, 88, 200, 86, 210, "设随机变量 X 的分布函数 F(x) 在 (-∞, +∞) 上严格递增，证明：Y=F(X)~U(0,1)"),
    (31, 205, 755, 200, 765, "设连续型随机变量 X 的分布函数为 F(x)..."),
]

# Detailed items for Chapter 4
CH4_ITEMS = [
    (48, 500, 525, 490, 530, "设 X~B(n, p), 求 E(X)"),
    (48, 528, 640, 525, 765, "设随机变量 X~P(λ), 求 E(X)"),
    (49, 72, 95, 65, 345, "设随机变量 X~U(a, b), 求 E(X)"),
    (49, 348, 380, 345, 570, "设随机变量 X 的分布函数为... (2009)"),
    (50, 88, 110, 80, 270, "设随机变量 (X, Y) 具有概率密度... 求 E(XY)"),
    (50, 275, 300, 270, 480, "设随机变量 X, Y 相互独立，且都服从 [0, 1] 上的均匀分布，求 E|X-Y|"),
    (51, 82, 100, 75, 110, "设 X~B(1, p), 求 D(X)"),
    (51, 108, 220, 100, 315, "设随机变量 X~B(n, p), 求 D(X)"),
    (51, 315, 360, 310, 490, "设 X 和 Y 是两个相互独立且均服从正态分布... (1996 和 1998)"),
    (51, 490, 508, 485, 510, "设 X 是随机变量，C 是常数，证明：D(X+C)=D(X)"),
    (51, 508, 540, 505, 765, "设随机变量 X 与 Y 相互独立，证明：D(X±Y)=D(X)+D(Y)"),
    (52, 72, 90, 65, 95, "设随机变量 X 与 Y 相互独立，且 E(X)=... 求 D(XY) (2016)"),
    (52, 88, 220, 85, 290, "设连续型随机变量 X 与 Y 相互独立... 则（2014）"),
    (53, 185, 220, 180, 580, "设随机变量 X, Y，且相关系数 ρXY=0，则（2008）"),
    (53, 585, 640, 580, 765, "设二维随机变量 服从正态分布... 求 cov(X, Y) (2011)"),
    (54, 158, 180, 150, 435, "设随机变量 X 与 Y 不相关，且 ... 求 ... (2015)"),
    (54, 435, 480, 430, 765, "设 A, B 是两个随机事件... 证明随机变量 IA 和 IB 不相关的充分必要条件是 A 和 B 相互独立 (2000)"),
    (55, 72, 95, 65, 220, "设随机变量 X 与 Y 的相关系数为 ρ，若 U=aX+b, V=cY+d... (2003)"),
    (55, 220, 270, 215, 765, "随机试验 E 有三种两两不相容的结果... 求 X 与 Y 的相关系数 (2016)"),
    (56, 82, 180, 75, 470, "设二维随机变量 在区域 上服从均匀分布... (1) 求 ... (2) 求 与 的相关系数"),
    (56, 470, 540, 465, 765, "设 A, B 是两个相互独立的随机事件... 求 X 与 Y 的相关系数"),
    (57, 72, 150, 65, 345, "已知随机变量 服从二维正态分布... (1) ... (2) ... (3) ... (1994)"),
    (57, 345, 500, 340, 765, "已知二维随机变量 联合分布律如下... 求 ..."),
]

def crop_chapter_items(ch_num, title, items):
    ch_dir = os.path.join(base_out, title)
    if os.path.exists(ch_dir):
        for f in os.listdir(ch_dir):
            os.remove(os.path.join(ch_dir, f))
    os.makedirs(ch_dir, exist_ok=True)
    print(f"=== Cropping {title} ({len(items)} questions) ===")
    for q_idx, (pno, y0, y1, p_bot, n_top, desc) in enumerate(items, 1):
        page = doc[pno]
        im, scale = render_page(page)
        y0_px = int(y0 * scale)
        y1_px = int(y1 * scale)
        p_bot_px = int(p_bot * scale) if p_bot is not None else None
        n_top_px = int(n_top * scale) if n_top is not None else None
        
        q_str = f"题 {q_idx:02d}"
        cropped = crop_question_unit(im, y0_px, y1_px, q_str, p_bot_px, n_top_px)
        fname = f"pb_{ch_num:02d}-{q_idx:02d}_question.png"
        cropped.save(os.path.join(ch_dir, fname))
        print(f"  Saved {fname}: {desc[:35]}")

crop_chapter_items(2, "第2章 一维随机变量及其分布", CH2_ITEMS)
crop_chapter_items(4, "第4章 随机变量的数字特征", CH4_ITEMS)
print("Chapters 2 and 4 cropped successfully.")
