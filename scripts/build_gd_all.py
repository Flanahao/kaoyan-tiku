import fitz, os, sys, re, zipfile, csv
from PIL import Image, ImageDraw, ImageFont
import numpy as np

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'D:\AntigravityChat\夜雨题库_去水印\数一高数 27版 最终版.pdf'
doc = fitz.open(pdf_path)
CANVAS_WIDTH = 1536
base_out = r'D:\考研题库网站\数一题库\夜雨强化\高数'
dl_dir = r'D:\antigravityDownload'
os.makedirs(dl_dir, exist_ok=True)
os.makedirs(base_out, exist_ok=True)

CHAPTERS_GD = [
    (1, "第1章 极限", 11, 53),
    (2, "第2章 导数与高阶导数", 54, 70),
    (3, "第3章 极值点与拐点", 71, 77),
    (4, "第4章 微分中值定理与不等式证明", 78, 119),
    (5, "第5章 不定积分计算方法", 120, 138),
    (6, "第6章 定积分与反常积分", 139, 156),
    (7, "第7章 定积分的几何与物理应用", 157, 165),
    (8, "第8章 多元函数微分学与极值最值", 166, 182),
    (9, "第9章 常微分方程与微分方程综合题", 183, 204),
    (10, "第10章 二重积分计算与对称性", 205, 220),
    (11, "第11章 三重积分计算与柱面球面坐标", 221, 226),
    (12, "第12章 常数项级数与幂级数", 227, 266),
    (13, "第13章 傅里叶级数", 267, 269),
    (14, "第14章 第一类与第二类曲线积分", 270, 282),
    (15, "第15章 第一类与第二类曲面积分及高斯斯托克斯公式", 283, 296),
    (16, "第16章 微分不等式与积分不等式综合", 297, 314),
    (17, "第17章 空间解析几何", 315, 319),
    (18, "第18章 极限概念与选择题特训", 320, 329),
    (19, "第19章 导数概念与选择题特训", 330, 335),
    (20, "第20章 积分概念与选择题特训", 336, 339),
    (21, "第21章 多元微分概念与选择题特训", 340, 343),
    (22, "第22章 级数概念与选择题特训", 344, 353),
]

def render_page(page):
    scale = CANVAS_WIDTH / page.rect.width
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale))
    im = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
    return im, scale

def is_stop_marker(txt):
    if not txt: return False
    if any(txt.startswith(k) for k in [
        '注：', '注1：', '注2：', '注3：', '提示：', '解析：', '解答：', '解：', '故 ', '误区：',
        '例如', '比如', '如果', '类似地', '情形一', '情形二', '情形三',
        '定义', '定理', '性质', '公式', '技巧', '方法', '思路', '原理', '规则', '游戏规则',
        '为什么你学得好', '类型', '步骤', '第一步', '第二步', '第三步', '第四步', '总结', '考法', '题型',
        '充要条件', '充分条件', '蛛网图', '压缩映射', '反解', '常见函数', '导数公式', '积分表',
        '对称性及两点法', '格林公式', '高斯公式', '斯托克斯公式', '奇偶对称性', '轮换对称性',
        '一个特殊的等价关系', '变上限积分求导公式', '含参变量求导公式', '分式分解定理', '因式分解定理',
        '还原法', '做题经验', '特别注意', '常用结论', '常用公式', '拐点的定义', '切平面的定义',
        '偏导数的定义', '全微分的定义', '常数变量化构造', '利用泰勒展开', '利用拉格朗日',
        '利用柯西中值定理', '利用积分第一中值定理', '利用积分中值定理', '高频考点', '级数概念性选择题',
        '原函数的定义', '定积分的线性性质', '线性性质的推论', '定积分的绝对可积性', '原函数存在和不存在',
        '变上限积分函数与原函数的联系', '可积与原函数存在', '积分其他性质', '反常积分敛散性的概念问题',
        '当函数连续时', '当函数有第一类间断时'
    ]):
        return True
    return False

def has_q_tag(txt):
    return bool(re.search(r'[(（]?(19\d\d|20\d\d|\d\d\s*年|张宇|李林|李艳芳|李永乐|超越|合工大|共阳|余炳森|高联|汤家凤|第.*届|880|660|330|1800|数一|数二|数三|真题)', txt))

def is_question_start(txt):
    if is_stop_marker(txt): return False
    if any(txt.startswith(k) for k in ['站在更高', '主讲人', '目录']): return False
    if any(txt.endswith(k) for k in ['公式', '定理', '原理', '法']): return False
    
    if has_q_tag(txt):
        if '不用掌握' in txt or '原理' in txt or txt.startswith('傅里叶'):
            return False
        return True
        
    has_options = bool(re.search(r'[(（][A-D][)）]', txt))
    if has_options:
        return True
        
    starts_imperative = any(txt.startswith(k) for k in [
        '求极限', '求导数', '求高阶导数', '求积分', '求不定积分', '求定积分', '求反常积分', '求微分方程',
        '求', '试求', '计算', '证明', '试证', '求证', '讨论', '问', '子题', '确定常数', '类似题'
    ])
    starts_premise = any(txt.startswith(k) for k in ['设', '已知', '若', '当', '给定', '将', '下面', '下列', '在', '函数', '对', '试'])
    has_question_ask = any(k in txt for k in [
        '求', '证明', '计算', '为（', '是（', '则（', '（ ）', '（  ）', '？', '讨论', '试证', '求证', '确定', '正确的是', '错误的是', '充分必要条件'
    ])
    
    if starts_imperative:
        return True
    if starts_premise and has_question_ask:
        return True
    return False

def crop_with_badge(im_cropped, q_num_str):
    badge_h = 44
    final_im = Image.new('RGB', (CANVAS_WIDTH, im_cropped.height + badge_h), (255, 255, 255))
    draw = ImageDraw.Draw(final_im)
    font_badge = ImageFont.truetype('msyh.ttc', 20)
    
    bx, by = 135, 8
    bw, bh = 88, 30
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=5, fill=(47, 128, 237))
    draw.text((bx + 14, by + 1), q_num_str, fill=(255, 255, 255), font=font_badge)
    final_im.paste(im_cropped, (0, badge_h))
    return final_im

def build_gd_all():
    total_questions = 0
    chapter_summary = []
    
    for ch_num, title, p_start, p_end in CHAPTERS_GD:
        ch_dir = os.path.join(base_out, title)
        if os.path.exists(ch_dir):
            for f in os.listdir(ch_dir):
                os.remove(os.path.join(ch_dir, f))
        os.makedirs(ch_dir, exist_ok=True)
        print(f"\n================ Processing {title} (P{p_start}-P{p_end}) ================")
        
        q_idx = 1
        pno = p_start - 1
        while pno < p_end:
            page = doc[pno]
            scale = CANVAS_WIDTH / page.rect.width
            im_page, _ = render_page(page)
            gray = np.array(im_page.convert('L'))
            
            blocks = [b for b in page.get_text('blocks') if b[1] > 60 and b[3] < 770]
            q_indices = []
            for i, b in enumerate(blocks):
                txt = b[4].strip().replace('\n', ' ')
                if is_question_start(txt):
                    q_indices.append(i)
                    
            for q_i in q_indices:
                b_q = blocks[q_i]
                txt_q = b_q[4].strip().replace('\n', ' ')
                
                # Check cross-page stitching for P104 bottom question
                if (pno + 1) == 104 and b_q[1] > 700:
                    p104_im, s104 = render_page(doc[103])
                    p105_im, s105 = render_page(doc[104])
                    
                    c104 = p104_im.crop((0, int(730 * s104), CANVAS_WIDTH, int(762 * s104)))
                    c105 = p105_im.crop((0, int(74 * s105), CANVAS_WIDTH, int(108 * s105)))
                    
                    stitched = Image.new('RGB', (CANVAS_WIDTH, c104.height + c105.height), (255, 255, 255))
                    stitched.paste(c104, (0, 0))
                    stitched.paste(c105, (0, c104.height))
                    
                    q_num_str = f"题 {q_idx:02d}"
                    final_im = crop_with_badge(stitched, q_num_str)
                    fname = f"pb_{ch_num:02d}-{q_idx:02d}_question.png"
                    final_im.save(os.path.join(ch_dir, fname))
                    print(f"  P104-105 [STITCHED]: {fname} -> {txt_q[:50]}")
                    q_idx += 1
                    continue
                    
                if (pno + 1) == 105 and b_q[1] < 100:
                    continue

                next_stops = [blocks[k][1] for k in range(q_i + 1, len(blocks)) if k in q_indices or is_stop_marker(blocks[k][4].strip().replace('\n', ' '))]
                y_stop_pt = min(next_stops) if next_stops else 765.0
                
                y_start_px = int(b_q[1] * scale) - 6
                y_stop_px = int(y_stop_pt * scale) - 2
                
                q_ink_rows = []
                last_ink = y_start_px
                max_gap = int(22 * scale)
                
                scan_start = max(0, y_start_px - 25)
                for y in range(scan_start, min(im_page.height, y_stop_px)):
                    cnt = np.sum(gray[y, int(CANVAS_WIDTH * 0.05):int(CANVAS_WIDTH * 0.95)] < 240)
                    if cnt >= 3:
                        if y - last_ink > max_gap and len(q_ink_rows) > 0:
                            break
                        q_ink_rows.append(y)
                        last_ink = y
                        
                if not q_ink_rows:
                    continue
                    
                y_min = min(q_ink_rows)
                y_max = max(q_ink_rows)
                
                top_pad = 12
                bot_pad = 12
                crop_top = max(0, y_min - top_pad)
                crop_bot = min(im_page.height, y_max + bot_pad)
                
                cropped = im_page.crop((0, crop_top, CANVAS_WIDTH, crop_bot))
                q_num_str = f"题 {q_idx:02d}"
                final_im = crop_with_badge(cropped, q_num_str)
                
                fname = f"pb_{ch_num:02d}-{q_idx:02d}_question.png"
                final_im.save(os.path.join(ch_dir, fname))
                print(f"  P{pno+1} [{b_q[1]:.0f}pt]: {fname} -> {txt_q[:50]}")
                q_idx += 1
                
            pno += 1
            
        count = q_idx - 1
        chapter_summary.append((ch_num, title, count))
        total_questions += count
        print(f"{title}: total {count} questions.")
        
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

    print(f"\n================ PACKAGING ALL CHAPTERS OF 高数 ================")
    zip_name = "夜雨强化_高等数学_全22章交付包.zip"
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
        print(f"GD{c:02d}: {t} -> {cnt} questions")
    print(f"Total across all 22 chapters of 高数: {total_questions} questions.")
    print(f"Consolidated ZIP: {zip_path}")
    print(f"Size: {zip_size:,} bytes ({zip_size / 1024 / 1024:.2f} MB)")
    if zip_size < 40000000:
        print("高数 ZIP SIZE STRICTLY < 40MB! PERFECT!")
    else:
        print("ZIP exceeds 40MB! Splitting into Part 1 and Part 2...")
        p1_name = "夜雨强化_高等数学_第1至11章交付包.zip"
        p2_name = "夜雨强化_高等数学_第12至22章交付包.zip"
        p1_path = os.path.join(dl_dir, p1_name)
        p2_path = os.path.join(dl_dir, p2_name)
        
        with zipfile.ZipFile(p1_path, 'w', compression=zipfile.ZIP_DEFLATED) as z1:
            for ch_num, title, count in chapter_summary:
                if ch_num <= 11:
                    ch_dir = os.path.join(base_out, title)
                    for fname in sorted(os.listdir(ch_dir)):
                        z1.write(os.path.join(ch_dir, fname), f"{title}/{fname}")
                        
        with zipfile.ZipFile(p2_path, 'w', compression=zipfile.ZIP_DEFLATED) as z2:
            for ch_num, title, count in chapter_summary:
                if ch_num > 11:
                    ch_dir = os.path.join(base_out, title)
                    for fname in sorted(os.listdir(ch_dir)):
                        z2.write(os.path.join(ch_dir, fname), f"{title}/{fname}")
                        
        s1 = os.path.getsize(p1_path)
        s2 = os.path.getsize(p2_path)
        print(f"Part 1: {p1_path} ({s1:,} bytes, {s1/1024/1024:.2f} MB) < 40MB: {s1 < 40000000}")
        print(f"Part 2: {p2_path} ({s2:,} bytes, {s2/1024/1024:.2f} MB) < 40MB: {s2 < 40000000}")

if __name__ == '__main__':
    build_gd_all()
