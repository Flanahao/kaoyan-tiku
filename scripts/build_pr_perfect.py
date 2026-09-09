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

def find_outermost_ink(im_rgb, y0_px, y1_px, prev_bottom_px=None, next_top_px=None, threshold=240):
    gray = im_rgb.convert('L')
    w, h = gray.size
    pix_data = gray.load()
    y_min, y_max = y1_px, y0_px
    has_ink = False
    scan_top = max(0 if prev_bottom_px is None else prev_bottom_px + 1, y0_px - 10)
    scan_bottom = min(h if next_top_px is None else next_top_px - 1, y1_px + 10)
    for y in range(scan_top, scan_bottom):
        if any(pix_data[x, y] < threshold for x in range(int(w * 0.05), int(w * 0.95))):
            has_ink = True
            if y < y_min: y_min = y
            if y > y_max: y_max = y
    if has_ink:
        return y_min, y_max
    return y0_px, y1_px

def crop_question_unit(im, y0_px, y1_px, q_num_str, prev_bottom_px=None, next_top_px=None):
    y_min, y_max = find_outermost_ink(im, y0_px, y1_px, prev_bottom_px, next_top_px)
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

# Special explicit crops for Chapter 5, 7, 8 to ensure 100% precision
EXPLICIT_CROPS = {
    5: [
        # (pno, y0, y1, prev_bot, next_top, desc)
        (59, 470, 526, 460, 535, "设总体 X 服从参数为 2 的指数分布... (2003)"),
        (59, 532, 665, 526, 765, "设随机变量序列 Xn 相互独立..."),
        (60, 290, 356, 280, 365, "假设 X1...Xn 是来自总体 X 的简单随机样本... (1996)"),
        (60, 365, 580, 356, 765, "某保险公司多年统计资料表明... (1998)"),
        (61, 72, 125, 65, 150, "一生产线生产的产品成箱包装... (2001)"),
        (61, 345, 376, 335, 380, "设随机变量 X 和 Y 的数学期望分别为... (2001)"),
        (61, 378, 570, 376, 765, "设相互独立的随机变量 X1...X10 的数学期望都是 1..."),
    ],
    7: [
        (70, 445, 500, 410, 540, "设总体 X 的期望 μ 和方差 σ²>0 都存在..."),
        (70, 540, 620, 500, 765, "设总体 X~U(a, b)..."),
        (71, 72, 105, 65, 120, "设总体 X 在 [θ, λθ] 上服从均匀分布... (李艳芳三套卷)"),
        (72, 72, 86, 65, 100, "设 X~N(μ, σ²)... 求 μ, σ² 的最大似然估计量"),
        (72, 305, 370, 290, 765, "设总体 X 的概率密度为 f(x; θ)... (2006)"),
        (73, 110, 190, 100, 205, "设 X1...Xn 是来自总体 X 的简单随机样本... (张宇八套卷)"),
        (73, 540, 595, 530, 765, "设总体 X~U(-θ, θ)... (余丙森五套卷)"),
        (74, 72, 86, 65, 100, "设总体 X 在 [a, b] 上服从均匀分布..."),
        (74, 260, 325, 250, 335, "已知总体 X 的概率密度为 f(x)=1/2 e^-|x-θ|... (张宇八套卷)"),
        (74, 480, 510, 470, 765, "设 X1...Xn 是来自期望为 θ 的指数分布... (2021)"),
        (75, 130, 185, 125, 195, "设 X1...Xn 是来自总体 X 的一个样本... 证明：样本方差 S² 是 σ² 的无偏估计"),
        (75, 195, 427, 185, 595, "已知总体 X 服从 [0, θ] 上的均匀分布... (2024)"),
        (75, 600, 640, 595, 765, "设 X1, X2 是来自总体 X 的简单随机样本... (2021)"),
        (76, 134, 180, 125, 200, "设 X1, X2, X3 是来自总体 X 的一个样本..."),
        (76, 630, 660, 620, 765, "证明：设 X1...Xn 是来自总体 X 的一个样本..."),
        (77, 75, 116, 65, 200, "设 X1...Xn 是来自总体 X 的一个样本，若 E(X) 和 D(X) 存在..."),
        (77, 350, 400, 340, 765, "设 X1...Xn 是来自总体 X 的一个样本，其中 μ 未知..."),
        (78, 110, 245, 100, 765, "综合题：设总体 X 的概率密度为... (2014、2015年真题改编)"),
    ],
    8: [
        (82, 72, 142, 65, 145, "两类错误超越卷"),
        (82, 245, 330, 220, 370, "显著水平拒绝域2025"),
        (82, 538, 606, 500, 630, "超越卷拒绝域"),
        (83, 72, 124, 65, 140, "余炳森五套卷"),
        (83, 198, 370, 190, 380, "李永乐三套卷"),
    ]
}

def clean_dir(d):
    if os.path.exists(d):
        for f in os.listdir(d):
            os.remove(os.path.join(d, f))

# Let's run the explicit crops for CH5, CH7, CH8
for ch_num, items in EXPLICIT_CROPS.items():
    ch_name = f"第{ch_num}章 " + ("大数定律和中心极限定理" if ch_num==5 else ("参数估计" if ch_num==7 else "假设检验与置信区间"))
    ch_dir = os.path.join(base_out, ch_name)
    clean_dir(ch_dir)
    os.makedirs(ch_dir, exist_ok=True)
    print(f"=== Explicit Cropping for {ch_name} ({len(items)} items) ===")
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
        print(f"  Saved {fname}: {desc[:40]}")

print("Explicit crops done successfully.")
