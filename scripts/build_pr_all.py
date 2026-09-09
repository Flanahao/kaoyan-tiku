import fitz, os, sys, re
from PIL import Image, ImageDraw, ImageFont
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'D:\AntigravityChat\夜雨题库_去水印\概率论数理统计讲义.pdf'
doc = fitz.open(pdf_path)
CANVAS_WIDTH = 1536
base_out = r'D:\考研题库网站\数一题库\夜雨强化\概率论'

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

def is_question_block(txt):
    if not txt: return False
    # Exclude non-questions
    if any(txt.startswith(k) for k in [
        '性质', '定理', '定义', '大纲', '公式', '做题经验', '重要结论', '二级结论', 
        '特别注意', '对偶律', '差：', '和：', '与包含相关性质', '条件概率', '事件与概率',
        '独立的判定', '判定一', '判定二', '判定三', '判定四', '判定五', '判定六', '由判定',
        '古典概型', '抽签原理', '伯努利概型', '常见离散型', '常见连续型', '二维随机变量',
        '卷积公式', '最值函数的分布', '数学期望', '方差', '协方差', '相关系数', '大数定律',
        '中心极限定理', '切比雪夫不等式', '数理统计的基本概念', '正态分布的样本均值', '矩估计法',
        '最大似然估计法', '估计量的评选标准', '假设检验与置信区间', '双边检验', '单边检验', '两类错误',
        '提示：', '注：', '注一', '注二', '特别地', '反过来', '证明方法', '由概率无法推出',
        '分布函数', '离散型随机变量', '连续型随机变量', '边缘分布', '条件分布', '主讲人',
        '为什么你学得好', '目录', '抽样分布', '数字特征', '方差的计算公式', '协方差的计算公式',
        '不相关的充要条件', '相关性与独立性的关系', '最值的期望和方差', '常见一维随机变量'
    ]):
        return False
        
    has_tag = bool(re.search(r'（(19\d\d|20\d\d|张宇|李林|李永乐|超越|合工大|共阳|余炳森|余丙森|高联|汤家凤|第.*届)', txt))
    starts_q = any(txt.startswith(k) for k in [
        '设', '已知', '从', '某', '袋', '将', '寝室', '三十名', '下表', '类似题', '证明：', '试求', '计算', 
        '一生产线', '一个班', '假设', '记', '求', '下表列出了', '如果'
    ])
    has_q_action = any(k in txt for k in ['求', '证明', '计算', '为（', '是（', '则（', '（ ）', '？', '率', '______', '分布'])
    return has_tag or (starts_q and has_q_action)

def process_all_chapters():
    total_all = 0
    chapter_results = []
    
    for ch_num, title, p_start, p_end in CHAPTERS:
        ch_dir = os.path.join(base_out, title)
        os.makedirs(ch_dir, exist_ok=True)
        print(f"\n================ Processing {title} ================")
        
        # Special case: Chapter 8 is already verified and perfect
        if ch_num == 8:
            # We already have exact coordinates for CH8
            im82, s82 = render_page(doc[82])
            q1 = crop_question_unit(im82, int(72 * s82), int(142 * s82), '题 01', next_top_px=int(145.0 * s82))
            q1.save(os.path.join(ch_dir, 'pb_08-01_question.png'))
            q2 = crop_question_unit(im82, int(245 * s82), int(330 * s82), '题 02', prev_bottom_px=int(220 * s82), next_top_px=int(370 * s82))
            q2.save(os.path.join(ch_dir, 'pb_08-02_question.png'))
            q3 = crop_question_unit(im82, int(538 * s82), int(606 * s82), '题 03', prev_bottom_px=int(500 * s82), next_top_px=int(630 * s82))
            q3.save(os.path.join(ch_dir, 'pb_08-03_question.png'))
            
            im83, s83 = render_page(doc[83])
            q4 = crop_question_unit(im83, int(72 * s83), int(124 * s83), '题 04', next_top_px=int(140 * s83))
            q4.save(os.path.join(ch_dir, 'pb_08-04_question.png'))
            q5 = crop_question_unit(im83, int(198 * s83), int(370 * s83), '题 05', prev_bottom_px=int(190 * s83), next_top_px=int(380 * s83))
            q5.save(os.path.join(ch_dir, 'pb_08-05_question.png'))
            
            chapter_results.append((ch_num, title, 5))
            total_all += 5
            print(f"Chapter 8: 5 questions cropped successfully.")
            continue
            
        # For Chapters 1~7:
        # Detect questions page by page using continuous ink blocks and question identification
        q_idx = 1
        for pno in range(p_start - 1, p_end):
            page = doc[pno]
            im_page, scale = render_page(page)
            gray = np.array(im_page.convert('L'))
            h, w = gray.shape
            
            y_start = int(68 * scale)
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
                
            # Filter and process question items
            for it_idx, (top_px, bot_px) in enumerate(items):
                rect = fitz.Rect(0, top_px / scale, page.rect.width, bot_px / scale)
                txt = page.get_text('text', clip=rect).strip().replace('\n', ' ')
                
                # check if this is a question
                if not is_question_block(txt):
                    continue
                    
                prev_bot = items[it_idx - 1][1] if it_idx > 0 else int(62 * scale)
                next_top = items[it_idx + 1][0] if it_idx + 1 < len(items) else int(768 * scale)
                
                # Crop and badge
                q_num_str = f"题 {q_idx:02d}"
                q_im = crop_question_unit(im_page, top_px, bot_px, q_num_str, prev_bottom_px=prev_bot, next_top_px=next_top)
                
                filename = f"pb_{ch_num:02d}-{q_idx:02d}_question.png"
                q_im.save(os.path.join(ch_dir, filename))
                print(f"  P{pno+1} [{top_px/scale:.1f}-{bot_px/scale:.1f}]: {filename} -> {txt[:50]}")
                q_idx += 1
                
        count = q_idx - 1
        chapter_results.append((ch_num, title, count))
        total_all += count
        print(f"Chapter {ch_num} ({title}): total {count} questions.")
        
    print(f"\n================ SUMMARY ================")
    for c, t, cnt in chapter_results:
        print(f"CH{c:02d}: {t} -> {cnt} questions")
    print(f"Total across all 8 chapters of 概率论: {total_all} questions.")

if __name__ == '__main__':
    process_all_chapters()
