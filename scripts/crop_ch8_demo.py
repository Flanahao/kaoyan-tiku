import fitz
import os
from PIL import Image, ImageDraw, ImageFont

scratch = r'C:\Users\Flanagan\.gemini\antigravity\brain\245a53b0-48f5-43cf-91fa-8d59a2d10fe9\scratch'
doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\概率论数理统计讲义.pdf')

CANVAS_WIDTH = 1536

def render_page(page):
    scale = CANVAS_WIDTH / page.rect.width
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), dpi=None)
    im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
    return im, scale

def find_outermost_ink(im_rgb, y0_px, y1_px, threshold=240):
    gray = im_rgb.convert('L')
    w, h = gray.size
    pix_data = gray.load()
    y_min, y_max = y1_px, y0_px
    has_ink = False
    scan_top = max(0, y0_px - 20)
    scan_bottom = min(h, y1_px + 20)
    for y in range(scan_top, scan_bottom):
        if any(pix_data[x, y] < threshold for x in range(int(w * 0.05), int(w * 0.95))):
            has_ink = True
            if y < y_min: y_min = y
            if y > y_max: y_max = y
    if has_ink:
        return y_min, y_max
    return y0_px, y1_px

def crop_with_badge(im, y0_px, y1_px, q_num_str, prev_bottom=None, next_top=None):
    y_min, y_max = find_outermost_ink(im, y0_px, y1_px)
    max_pad = 15
    if prev_bottom is not None and prev_bottom < y_min:
        top_pad = min(max_pad, (y_min - prev_bottom) // 2)
        top = max(prev_bottom + 1, y_min - top_pad)
    else:
        top = max(0, y_min - max_pad)
        
    if next_top is not None and next_top > y_max:
        bottom_pad = min(max_pad, (next_top - y_max) // 2)
        bottom = min(next_top - 1, y_max + bottom_pad)
    else:
        bottom = min(im.height, y_max + max_pad)
        
    cropped = im.crop((0, top, CANVAS_WIDTH, bottom))
    
    # Add Badge Option A
    badge_h_box = 44
    final_im = Image.new('RGB', (CANVAS_WIDTH, cropped.height + badge_h_box), (255, 255, 255))
    draw = ImageDraw.Draw(final_im)
    try:
        font_badge = ImageFont.truetype('msyh.ttc', 20)
    except:
        font_badge = ImageFont.load_default()
        
    # Blue pill badge at x=135
    bx, by = 135, 8
    bw, bh = 88, 30
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=5, fill=(47, 128, 237))
    draw.text((bx + 14, by + 1), q_num_str, fill=(255, 255, 255), font=font_badge)
    
    final_im.paste(cropped, (0, badge_h_box))
    return final_im

# Page 82
im82, s82 = render_page(doc[82])
# Q1: 72 ~ 128 in pt
q1 = crop_with_badge(im82, int(72 * s82), int(128 * s82), '题 01', next_top=int(145 * s82))
q1.save(os.path.join(scratch, 'pb_08-01_question.png'))

# Q2: 245 ~ 335 in pt (skip the "注：..." above it)
q2 = crop_with_badge(im82, int(245 * s82), int(335 * s82), '题 02', prev_bottom=int(220 * s82), next_top=int(370 * s82))
q2.save(os.path.join(scratch, 'pb_08-02_question.png'))

# Q3: 535 ~ 610 in pt
q3 = crop_with_badge(im82, int(535 * s82), int(610 * s82), '题 03', prev_bottom=int(500 * s82), next_top=int(630 * s82))
q3.save(os.path.join(scratch, 'pb_08-03_question.png'))

# Page 83
im83, s83 = render_page(doc[83])
# Q4: 70 ~ 125 in pt
q4 = crop_with_badge(im83, int(70 * s83), int(125 * s83), '题 04', next_top=int(140 * s83))
q4.save(os.path.join(scratch, 'pb_08-04_question.png'))

# Q5: 195 ~ 372 in pt
q5 = crop_with_badge(im83, int(195 * s83), int(372 * s83), '题 05', prev_bottom=int(190 * s83), next_top=int(380 * s83))
q5.save(os.path.join(scratch, 'pb_08-05_question.png'))

print('Saved all 5 questions for Chapter 8')
