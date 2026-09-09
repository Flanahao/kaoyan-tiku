import fitz
import os
from PIL import Image, ImageDraw, ImageFont

scratch = r'C:\Users\Flanagan\.gemini\antigravity\brain\245a53b0-48f5-43cf-91fa-8d59a2d10fe9\scratch'
doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\夜雨线代强化讲义.pdf')
page = doc[19] # page 20

# Render at 1536 px width
target_width = 1536
scale = target_width / page.rect.width
pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), dpi=None)
im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)

print(f'Rendered full page at {im.size}')

# Let's inspect the 3 questions on this page:
# Q1: 类似题 (y: 95 ~ 180 in pt -> y: 245 ~ 465 in px)
# Q2: 特征方程法 ... n阶行列式 (y: 195 ~ 360 in pt -> y: 500 ~ 930 in px)
# Q3: 计算 Dn = ... (y: 590 ~ 750 in pt -> y: 1520 ~ 1935 in px)

def find_outermost_ink_y(im_rgb, rough_y0, rough_y1, threshold=240):
    gray = im_rgb.convert('L')
    w, h = gray.size
    pix_data = gray.load()
    y_min, y_max = rough_y1, rough_y0
    has_ink = False
    scan_top = max(0, rough_y0 - 30)
    scan_bottom = min(h, rough_y1 + 30)
    for y in range(scan_top, scan_bottom):
        if any(pix_data[x, y] < threshold for x in range(int(w * 0.05), int(w * 0.95))):
            has_ink = True
            if y < y_min: y_min = y
            if y > y_max: y_max = y
    if has_ink:
        return y_min, y_max
    return rough_y0, rough_y1

# Test cropping Q1
y0, y1 = find_outermost_ink_y(im, int(95 * scale), int(185 * scale))
pad = 20
cropped_q1 = im.crop((0, max(0, y0 - pad), target_width, min(im.height, y1 + pad)))

# Add Number badge Option A:
# Add a top header bar or badge in top-left
# E.g. Badge: [ 题 01 ] or 【题 01】
# Let's see: We can add a small padding at top for the badge, or put the badge in top-left
badge_height = 50
final_im = Image.new('RGB', (target_width, cropped_q1.height + badge_height), (255, 255, 255))

# Draw badge
draw = ImageDraw.Draw(final_im)
# Load font: simhei or msyh or simsun
try:
    font = ImageFont.truetype('msyhbd.ttc', 28) # Microsoft YaHei Bold
    font_small = ImageFont.truetype('msyh.ttc', 20)
except:
    font = ImageFont.load_default()

# Draw a modern, beautiful question badge:
# Pill badge: e.g. blue rounded rectangle with white text "题 01"
badge_x0, badge_y0 = 135, 12
badge_w, badge_h = 100, 36
draw.rounded_rectangle([badge_x0, badge_y0, badge_x0 + badge_w, badge_y0 + badge_h], radius=6, fill=(47, 128, 237))
draw.text((badge_x0 + 16, badge_y0 + 3), '题 01', fill=(255, 255, 255), font=font_small)

# Paste question content below badge
final_im.paste(cropped_q1, (0, badge_height))

out_path = os.path.join(scratch, 'test_q1_optionA.png')
final_im.save(out_path)
print('Saved', out_path)
