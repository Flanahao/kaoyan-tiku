#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
考研题库 - 李林880优化版全量导入与规范化工具

功能:
1. 从 880题_数学一_全23章切分交付包汇总.zip 中提取全量 23 章、1,408 题及 3,131 张高清切片图片；
2. 规范化归档至 数一题库/李林880优化版/{高数,线代,概率论}/第X章 .../；
3. 解析切片规范化：将交付包中的首切片 _solution_1.png 规范化为题库标准的 _solution.png，
   后续切片保留为 _solution_2.png, _solution_3.png，彻底杜绝切片断层；
4. 针对第 22 章原书缺失的 4 道拓展题题面生成友好清晰的占位提示卡图；
5. 生成 js/lilin880-optimized-chapters.js 章节数据定义文件。
"""

import os
import io
import re
import sys
import csv
import json
import zipfile
from PIL import Image, ImageDraw, ImageFont

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ZIP_PATH = sys.argv[1] if len(sys.argv) > 1 else r'D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-09\880题_数学一_全23章切分交付包汇总.zip'
TARGET_BASE = os.path.join(ROOT_DIR, '数一题库', '李林880优化版')
CHAPTERS_JS_PATH = os.path.join(ROOT_DIR, 'js', 'lilin880-optimized-chapters.js')

CAT_MAP = {'基础': '基', '综合': '综', '拓展': '拓'}
TYPE_MAP = {'选择': '选', '填空': '填', '解答': '解'}

def sort_key(name):
    m = re.search(r'第(\d+)章', name)
    return int(m.group(1)) if m else 999

def get_subj_by_ch(ch_num):
    if ch_num <= 9:
        return '高数'
    elif ch_num <= 15:
        return '线代'
    else:
        return '概率论'

def create_placeholder_image(text_lines, out_path, width=1536, height=400):
    img = Image.new('RGB', (width, height), color=(248, 250, 252))
    draw = ImageDraw.Draw(img)
    
    font_path = "C:/Windows/Fonts/msyh.ttc"
    if not os.path.exists(font_path):
        font_path = "C:/Windows/Fonts/simhei.ttf"
    
    font_title = ImageFont.truetype(font_path, 40) if os.path.exists(font_path) else ImageFont.load_default()
    font_sub = ImageFont.truetype(font_path, 28) if os.path.exists(font_path) else ImageFont.load_default()
    
    draw.rectangle([(20, 20), (width - 20, height - 20)], outline=(203, 213, 225), width=3)
    
    y = 120
    for i, line in enumerate(text_lines):
        font = font_title if i == 0 else font_sub
        bbox = draw.textbbox((0, 0), line, font=font)
        tw = bbox[2] - bbox[0]
        x = (width - tw) // 2
        color = (30, 41, 59) if i == 0 else (100, 116, 139)
        draw.text((x, y), line, font=font, fill=color)
        y += 60
        
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    img.save(out_path, format="PNG")

def process_import():
    print("=== 开始导入李林880优化版 ===")
    print(f"源压缩包: {ZIP_PATH}")
    print(f"目标目录: {TARGET_BASE}")

    if not os.path.exists(ZIP_PATH):
        print(f"错误: 未找到源压缩包: {ZIP_PATH}")
        sys.exit(1)

    os.makedirs(TARGET_BASE, exist_ok=True)

    chapters_config = []
    grand_total_questions = 0
    grand_total_images_written = 0
    grand_total_slices_normalized = 0
    grand_total_placeholders = 0

    with zipfile.ZipFile(ZIP_PATH, 'r') as outer_z:
        inner_zips = sorted([n for n in outer_z.namelist() if n.endswith('.zip')], key=sort_key)
        print(f"发现 {len(inner_zips)} 个章节压缩包")

        for zip_name in inner_zips:
            ch_num = int(re.search(r'第(\d+)章', zip_name).group(1))
            subj = get_subj_by_ch(ch_num)

            inner_bytes = outer_z.read(zip_name)
            with zipfile.ZipFile(io.BytesIO(inner_bytes), 'r') as inner_z:
                if 'logical_map.csv' not in inner_z.namelist():
                    print(f"警告: {zip_name} 中未找到 logical_map.csv，跳过")
                    continue

                csv_text = inner_z.read('logical_map.csv').decode('utf-8-sig')
                reader = list(csv.DictReader(io.StringIO(csv_text)))
                if not reader:
                    print(f"警告: {zip_name} 中的 CSV 无数据，跳过")
                    continue

                ch_name = reader[0]['chapter_name'].strip()
                chapter_rel_dir = f"{subj}/第{ch_num}章 {ch_name}"
                chapter_dest_dir = os.path.join(TARGET_BASE, subj, f"第{ch_num}章 {ch_name}")
                os.makedirs(chapter_dest_dir, exist_ok=True)

                inner_file_set = set(inner_z.namelist())
                labels = []
                file_bases = []

                for r in reader:
                    grand_total_questions += 1
                    cat = r['category'].strip()
                    q_type = r['question_type'].strip()
                    item_no = str(int(r['item_no'].strip()))
                    subpart = r.get('subpart_label', '').strip()

                    cat_abbr = CAT_MAP.get(cat, cat)
                    type_abbr = TYPE_MAP.get(q_type, q_type)
                    if subpart:
                        label = f"{cat_abbr}·{type_abbr}{item_no}{subpart}"
                    else:
                        label = f"{cat_abbr}·{type_abbr}{item_no}"
                    labels.append(label)

                    q_file = r.get('question_file', '').strip()
                    sol_raw = r.get('solution_file', '').strip()
                    sols = [s.strip() for s in re.split(r'[;|]', sol_raw) if s.strip()]

                    # 确定 fileBase
                    if q_file:
                        if q_file.endswith('_question.png'):
                            file_base = q_file[:-13]
                        else:
                            file_base = os.path.splitext(q_file)[0]
                    else:
                        # 针对第22章等无 question_file 的特殊情况，从 solution_file 派生
                        first_sol = sols[0] if sols else f"pb_{ch_num:02d}_{cat}_{q_type}_{item_no}"
                        # 去掉 _solution.png 或 _solution_1.png
                        file_base = re.sub(r'_solution(_\d+)?\.png$', '', first_sol)

                    file_bases.append(file_base)

                    # 1. 写入题干图
                    if q_file and q_file in inner_file_set:
                        q_dest_path = os.path.join(chapter_dest_dir, f"{file_base}_question.png")
                        with open(q_dest_path, 'wb') as f:
                            f.write(inner_z.read(q_file))
                        grand_total_images_written += 1
                    else:
                        # 占位图生成
                        q_dest_path = os.path.join(chapter_dest_dir, f"{file_base}_question.png")
                        create_placeholder_image(
                            ["【原书题面说明】", "原书PDF第4页为空白页，未包含本题题干，请直接参考下方解析"],
                            q_dest_path
                        )
                        grand_total_placeholders += 1
                        grand_total_images_written += 1

                    # 2. 写入解析图切片
                    for s_idx, s_file in enumerate(sols):
                        if s_file in inner_file_set:
                            # 规范化切片文件名：第 1 片无论源文件是否叫 _solution_1.png，均落地为 _solution.png
                            if s_idx == 0:
                                dest_s_name = f"{file_base}_solution.png"
                                if s_file.endswith('_solution_1.png'):
                                    grand_total_slices_normalized += 1
                            else:
                                dest_s_name = f"{file_base}_solution_{s_idx + 1}.png"

                            s_dest_path = os.path.join(chapter_dest_dir, dest_s_name)
                            with open(s_dest_path, 'wb') as f:
                                f.write(inner_z.read(s_file))
                            grand_total_images_written += 1
                        else:
                            print(f"错误: 缺失解析切片: {s_file} (章节 {ch_num})")

                chapter_obj = {
                    "id": f"opt880-ch{ch_num:02d}",
                    "category": "shu1",
                    "number": 300 + ch_num,
                    "name": f"李林880优化版 - {subj} - 第{ch_num}章 {ch_name}",
                    "short": f"第{ch_num}章 {ch_name}",
                    "total": len(labels),
                    "cols": 5,
                    "wb": "李林880优化版",
                    "subj": subj,
                    "relPath": f"李林880优化版/{chapter_rel_dir}",
                    "labels": labels,
                    "fileBases": file_bases
                }
                chapters_config.append(chapter_obj)
                print(f"  ✓ 第{ch_num:02d}章 ({subj}) 导入完成: {len(labels)} 题")

    # 写入章节定义文件
    js_content = "/* 考研题库 - 李林880优化版章节元数据 */\n"
    js_content += "window.LILIN880_OPTIMIZED_CHAPTERS = " + json.dumps(chapters_config, ensure_ascii=False, indent=2) + ";\n"
    
    with open(CHAPTERS_JS_PATH, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print("========================================")
    print("导入全部完成:")
    print(f"  - 章节总数: {len(chapters_config)}")
    print(f"  - 题目总数: {grand_total_questions}")
    print(f"  - 写入图片总数: {grand_total_images_written}")
    print(f"  - 规范化 _solution_1.png 切片数: {grand_total_slices_normalized}")
    print(f"  - 生成占位提示图数: {grand_total_placeholders}")
    print(f"  - 章节元数据已保存至: {CHAPTERS_JS_PATH}")
    print("========================================")

if __name__ == '__main__':
    process_import()
