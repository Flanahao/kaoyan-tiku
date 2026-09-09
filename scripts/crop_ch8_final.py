import fitz, os
from PIL import Image, ImageDraw, ImageFont

scratch = r'C:\Users\Flanagan\.gemini\antigravity\brain\245a53b0-48f5-43cf-91fa-8d59a2d10fe9\scratch'
doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\概率论数理统计讲义.pdf')
CANVAS_WIDTH = 1536

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

# Process Page 82 (Q1, Q2, Q3)
im82, s82 = render_page(doc[82])
# Q1: 72 ~ 142 pt, next_top is 145.7 pt ("注：...")
q1 = crop_question_unit(im82, int(72 * s82), int(142 * s82), '题 01', next_top_px=int(145.0 * s82))
q1.save(os.path.join(scratch, 'pb_08-01_question.png'))

# Q2: starts at 245 pt ("设 X1...Xn 为来自正态总体..."), ends at 330 pt ("...拒绝域为（ ）（2025）")
# next_top is 375 pt ("提示：...")
q2 = crop_question_unit(im82, int(245 * s82), int(330 * s82), '题 02', prev_bottom_px=int(220 * s82), next_top_px=int(370 * s82))
q2.save(os.path.join(scratch, 'pb_08-02_question.png'))

# Q3: starts at 538 pt ("设 X_bar 为来自总体..."), ends at 606 pt ("...（超越卷）")
# next_top is 634 pt ("提示：...")
q3 = crop_question_unit(im82, int(538 * s82), int(606 * s82), '题 03', prev_bottom_px=int(500 * s82), next_top_px=int(630 * s82))
q3.save(os.path.join(scratch, 'pb_08-03_question.png'))

# Process Page 83 (Q4, Q5)
im83, s83 = render_page(doc[83])
# Q4: starts at 72 pt ("设总体..."), ends at 124 pt ("...（余炳森五套卷）")
# next_top is 142 pt ("提示：...")
q4 = crop_question_unit(im83, int(72 * s83), int(124 * s83), '题 04', next_top_px=int(140 * s83))
q4.save(os.path.join(scratch, 'pb_08-04_question.png'))

# Q5: starts at 198 pt ("设总体..."), ends at 370 pt ("...（李永乐三套卷）")
# next_top is 382 pt ("提示：...")
q5 = crop_question_unit(im83, int(198 * s83), int(370 * s83), '题 05', prev_bottom_px=int(190 * s83), next_top_px=int(380 * s83))
q5.save(os.path.join(scratch, 'pb_08-05_question.png'))

print('Successfully regenerated all 5 questions of Chapter 8')
