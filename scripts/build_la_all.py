import fitz, os, sys, re, zipfile, csv
from PIL import Image, ImageDraw, ImageFont
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'D:\AntigravityChat\夜雨题库_去水印\夜雨线代强化讲义.pdf'
doc = fitz.open(pdf_path)
CANVAS_WIDTH = 1536
base_out = r'D:\考研题库网站\数一题库\夜雨强化\线代'
dl_dir = r'D:\antigravityDownload'
os.makedirs(dl_dir, exist_ok=True)

CHAPTERS_LA = [
    (1, "第1章 行列式的计算与性质", 6, 24),
    (2, "第2章 向量与线性相关性", 25, 41),
    (3, "第3章 常见矩阵的性质与运算", 42, 56),
    (4, "第4章 特征值与特征向量", 57, 59),
    (5, "第5章 矩阵 An 次方计算", 60, 66),
    (6, "第6章 矩阵及分块矩阵的秩", 67, 73),
    (7, "第7章 线性方程组所有考法", 74, 100),
    (8, "第8章 相似的所有考法", 101, 124),
    (9, "第9章 二次型的所有考法", 125, 148),
    (10, "第10章 专题一：AB=BA 专题（矩阵可交换）", 149, 153),
    (11, "第11章 专题二：AB=0 专题", 154, 155),
    (12, "第12章 专题三：分块矩阵初等变换专题（AB=C）", 156, 156),
]

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

def is_la_question(txt):
    if not txt: return False
    # Filter out pure theory / outline items
    if any(txt.startswith(k) for k in [
        '定义', '定理', '性质', '考法', '题型', '结论', '方法', '公式', '做题经验', '注：', '注一', '注二',
        '主讲人', '为什么你学得好', '目录', '第一步', '第二步', '第三步', '特别注意', '常用结论', '充要条件',
        '充分条件', '逆用行列式', '化三角行列式', '爪形行列式', '正定二次型的判定', '可交换的充分条件',
        '分块矩阵初等变换', '经典套路', '相似对角化原理'
    ]):
        return False
        
    has_tag = bool(re.search(r'（(19\d\d|20\d\d|张宇|李林|李永乐|超越|合工大|共阳|余炳森|余丙森|高联|汤家凤|第.*届)', txt))
    starts_q = any(txt.startswith(k) for k in [
        '设', '已知', '计算', '证明', '求', '试求', '类似题', '给定', '将', '若', '求解', '问', '判', '下列', '下述'
    ])
    has_action = any(k in txt for k in ['计算', '求', '证明', '为（', '是（', '则（', '（ ）', '？', '行列式', '特征值', '基础解系', '通解', '可逆', '相似', '秩', '规范型', '标准形'])
    return has_tag or (starts_q and has_action)

def process_la_all():
    total_questions = 0
    chapter_summary = []
    
    for ch_num, title, p_start, p_end in CHAPTERS_LA:
        ch_dir = os.path.join(base_out, title)
        if os.path.exists(ch_dir):
            for f in os.listdir(ch_dir):
                os.remove(os.path.join(ch_dir, f))
        os.makedirs(ch_dir, exist_ok=True)
        print(f"\n================ Processing {title} ================")
        
        q_idx = 1
        for pno in range(p_start - 1, p_end):
            page = doc[pno]
            im_page, scale = render_page(page)
            gray = np.array(im_page.convert('L'))
            h, w = gray.shape
            
            y_start = int(65 * scale)
            y_end = int(765 * scale)
            
            row_ink = np.any(gray[y_start:y_end, int(w*0.05):int(w*0.95)] < 240, axis=1)
            max_line_gap_px = int(22 * scale)
            
            items = []
            in_item = False
            item_start = 0
            last_ink_y = 0
            
            for i, has_ink in enumerate(row_ink):
                y = y_start + i
                if has_ink:
                    if not in_item:
                        in_item = True
                        item_start = y
                    last_ink_y = y
                else:
                    if in_item:
                        if (y - last_ink_y) > max_line_gap_px:
                            items.append((item_start, last_ink_y))
                            in_item = False
            if in_item:
                items.append((item_start, last_ink_y))
                
            for it_idx, (top_px, bot_px) in enumerate(items):
                rect = fitz.Rect(0, top_px / scale, page.rect.width, bot_px / scale)
                txt = page.get_text('text', clip=rect).strip().replace('\n', ' ')
                
                if not is_la_question(txt):
                    continue
                    
                prev_bot = items[it_idx - 1][1] if it_idx > 0 else int(62 * scale)
                next_top = items[it_idx + 1][0] if it_idx + 1 < len(items) else int(768 * scale)
                
                q_num_str = f"题 {q_idx:02d}"
                q_im = crop_question_unit(im_page, top_px, bot_px, q_num_str, prev_bottom_px=prev_bot, next_top_px=next_top)
                
                fname = f"pb_{ch_num:02d}-{q_idx:02d}_question.png"
                q_im.save(os.path.join(ch_dir, fname))
                print(f"  P{pno+1} [{top_px/scale:.0f}-{bot_px/scale:.0f}]: {fname} -> {txt[:50]}")
                q_idx += 1
                
        count = q_idx - 1
        chapter_summary.append((ch_num, title, count))
        total_questions += count
        print(f"{title}: total {count} questions.")
        
        # Generate logical_map.csv for this chapter
        csv_path = os.path.join(ch_dir, 'logical_map.csv')
        with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
            writer = csv.writer(f)
            writer.writerow([
                'asset_no', 'chapter_no', 'chapter_name', 'category', 
                'question_type', 'item_no', 'subpart_label', 'question_file', 
                'solution_file', 'solution_page_count'
            ])
            for idx in range(1, count + 1):
                writer.writerow([
                    f"{idx:03d}",
                    f"{ch_num:02d}",
                    title,
                    "夜雨强化",
                    "习题",
                    f"{idx:02d}",
                    "",
                    f"pb_{ch_num:02d}-{idx:02d}_question.png",
                    "",
                    0
                ])

    # Package consolidated ZIP
    zip_name = "夜雨强化_线性代数_全12章交付包.zip"
    zip_path = os.path.join(dl_dir, zip_name)
    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as z:
        for ch_num, title, count in chapter_summary:
            ch_dir = os.path.join(base_out, title)
            for fname in sorted(os.listdir(ch_dir)):
                fpath = os.path.join(ch_dir, fname)
                arcname = f"{title}/{fname}"
                z.write(fpath, arcname)

    zip_size = os.path.getsize(zip_path)
    print(f"\n================ SUMMARY ================")
    for c, t, cnt in chapter_summary:
        print(f"LA{c:02d}: {t} -> {cnt} questions")
    print(f"Total across all 12 chapters of 线代: {total_questions} questions.")
    print(f"Consolidated ZIP: {zip_path}")
    print(f"Size: {zip_size:,} bytes ({zip_size / 1024 / 1024:.2f} MB)")
    assert zip_size < 40000000, f"ZIP exceeds 40MB limit!"
    print("线代 ZIP SIZE STRICTLY < 40MB! VALIDATION PASSED!")

if __name__ == '__main__':
    process_la_all()
