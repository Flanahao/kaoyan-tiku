#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
考研题库 - 李艳芳900题全量导入与格式化工具

功能:
1. 从 题库.zip 中提取全量 23 章、900 题；
2. 规范化归档至 数一题库/李艳芳900/{高数,线代,概率论}/第X章 .../；
3. 针对 53 道跨页题（含 _question_2.png）使用 Pillow 自动无损垂直拼接为单一题干图；
4. 规范化第 13 章的文件名为 pb_13-XXX；
5. 提取全部解析切片 (_solution.png, _solution_2.png ...)；
6. 生成 js/lyf900-chapters.js 章节数据定义。
"""

import os
import io
import re
import sys
import json
import zipfile
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ZIP_PATH = sys.argv[1] if len(sys.argv) > 1 else r'D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-09\题库.zip'
TARGET_BASE = os.path.join(ROOT_DIR, '数一题库', '李艳芳900')
CHAPTERS_JS_PATH = os.path.join(ROOT_DIR, 'js', 'lyf900-chapters.js')

CHAPTER_META = [
    # (ch_idx, zip_subname, subj, chapter_name, rel_dir)
    (1, '900_第01章_函数、极限、连续.zip', '高数', '第1章 函数、极限、连续', '高数/第1章 函数、极限、连续'),
    (2, '900_第02章_一元函数微分学.zip', '高数', '第2章 一元函数微分学', '高数/第2章 一元函数微分学'),
    (3, '900_第03章_一元函数积分学.zip', '高数', '第3章 一元函数积分学', '高数/第3章 一元函数积分学'),
    (4, '900_第04章_向量代数与空间解析几何.zip', '高数', '第4章 向量代数与空间解析几何', '高数/第4章 向量代数与空间解析几何'),
    (5, '900_第05章_多元函数微分学.zip', '高数', '第5章 多元函数微分学', '高数/第5章 多元函数微分学'),
    (6, '900_第06章_重积分及其应用.zip', '高数', '第6章 重积分及其应用', '高数/第6章 重积分及其应用'),
    (7, '900_第07章_常微分方程.zip', '高数', '第7章 常微分方程', '高数/第7章 常微分方程'),
    (8, '900_第08章_无穷级数.zip', '高数', '第8章 无穷级数', '高数/第8章 无穷级数'),
    (9, '900_第09章_曲线积分与曲面积分.zip', '高数', '第9章 曲线积分与曲面积分', '高数/第9章 曲线积分与曲面积分'),
    (10, '900_第10章_行列式.zip', '线代', '第10章 行列式', '线代/第10章 行列式'),
    (11, '900_第11章_矩阵.zip', '线代', '第11章 矩阵', '线代/第11章 矩阵'),
    (12, '900_第12章_向量.zip', '线代', '第12章 向量', '线代/第12章 向量'),
    (13, '900_第13章_线性方程组.zip', '线代', '第13章 线性方程组', '线代/第13章 线性方程组'),
    (14, '900_第14章_矩阵的特征值与特征向量.zip', '线代', '第14章 矩阵的特征值与特征向量', '线代/第14章 矩阵的特征值与特征向量'),
    (15, '900_第15章_二次型.zip', '线代', '第15章 二次型', '线代/第15章 二次型'),
    (16, '900_第16章_随机事件及其概率.zip', '概率论', '第16章 随机事件及其概率', '概率论/第16章 随机事件及其概率'),
    (17, '900_第17章_随机变量及其分布.zip', '概率论', '第17章 随机变量及其分布', '概率论/第17章 随机变量及其分布'),
    (18, '900_第18章_多维随机变量及其分布.zip', '概率论', '第18章 多维随机变量及其分布', '概率论/第18章 多维随机变量及其分布'),
    (19, '900_第19章_随机变量的数字特征.zip', '概率论', '第19章 随机变量的数字特征', '概率论/第19章 随机变量的数字特征'),
    (20, '900_第20章_大数定律与中心极限定理.zip', '概率论', '第20章 大数定律与中心极限定理', '概率论/第20章 大数定律与中心极限定理'),
    (21, '900_第21章_数理统计的基本概念.zip', '概率论', '第21章 数理统计的基本概念', '概率论/第21章 数理统计的基本概念'),
    (22, '900_第22章_参数估计.zip', '概率论', '第22章 参数估计', '概率论/第22章 参数估计'),
    (23, '900_第23章_假设检验.zip', '概率论', '第23章 假设检验', '概率论/第23章 假设检验'),
]

def stitch_images_vertically(img_bytes_list):
    """垂直缝合多张切片为一张连续图片"""
    pil_imgs = []
    for b in img_bytes_list:
        im = Image.open(io.BytesIO(b))
        if im.mode in ('RGBA', 'LA'):
            bg = Image.new('RGB', im.size, (255, 255, 255))
            bg.paste(im, mask=im.split()[-1])
            pil_imgs.append(bg)
        elif im.mode != 'RGB':
            pil_imgs.append(im.convert('RGB'))
        else:
            pil_imgs.append(im)
    
    max_w = max(im.width for im in pil_imgs)
    tot_h = sum(im.height for im in pil_imgs)
    stitched = Image.new('RGB', (max_w, tot_h), (255, 255, 255))
    curr_y = 0
    for im in pil_imgs:
        stitched.paste(im, (0, curr_y))
        curr_y += im.height
    
    out_io = io.BytesIO()
    stitched.save(out_io, format='PNG', optimize=True)
    return out_io.getvalue()

def process_import():
    print(f"=== 开始导入李艳芳900题 ===")
    print(f"源压缩包: {ZIP_PATH}")
    print(f"目标目录: {TARGET_BASE}")

    if not os.path.exists(ZIP_PATH):
        print(f"错误: 未找到源压缩包: {ZIP_PATH}")
        sys.exit(1)

    os.makedirs(TARGET_BASE, exist_ok=True)

    chapters_config = []
    grand_total_questions = 0
    grand_total_stitched = 0
    grand_total_solution_slices = 0

    with zipfile.ZipFile(ZIP_PATH, 'r') as outer_z:
        outer_names = outer_z.namelist()

        for ch_num, zip_subname, subj, chapter_title, rel_dir in CHAPTER_META:
            # 找到匹配的内部 zip
            matched_z = [n for n in outer_names if n.endswith(zip_subname)]
            if not matched_z:
                raise FileNotFoundError(f"内部未找到压缩包: {zip_subname}")
            
            inner_zip_name = matched_z[0]
            print(f"\n正在处理 [{ch_num}/23] {chapter_title} ({subj})...")
            
            dest_dir = os.path.join(TARGET_BASE, rel_dir)
            os.makedirs(dest_dir, exist_ok=True)

            with outer_z.open(inner_zip_name) as inner_bytes:
                with zipfile.ZipFile(io.BytesIO(inner_bytes.read())) as iz:
                    iz_names = iz.namelist()

                    # 提取题目图片与解析图片
                    png_files = [n for n in iz_names if n.lower().endswith('.png')]

                    # 题目分组：base -> { 'q': [path1, path2...], 's': [path1, path2...] }
                    # 注意：第13章内部命名前缀为 pb_04-XXX，需统一规范映射为 pb_13-XXX
                    items = {}
                    for p in png_files:
                        fname = os.path.basename(p)
                        m = re.match(r'^(pb_\d+-\d+)(_(question|solution)(?:_(\d+))?)\.png$', fname)
                        if not m:
                            continue
                        
                        raw_base = m.group(1) # pb_XX-YYY
                        frag_type = m.group(3) # question or solution
                        frag_num = int(m.group(4)) if m.group(4) else 1 # 1, 2, 3...

                        # 规范化 base：第13章若为 pb_04-XXX，转换为 pb_13-XXX
                        if ch_num == 13 and raw_base.startswith('pb_04-'):
                            norm_base = 'pb_13-' + raw_base[6:]
                        else:
                            norm_base = raw_base

                        if norm_base not in items:
                            items[norm_base] = {'q': {}, 's': {}}

                        if frag_type == 'question':
                            items[norm_base]['q'][frag_num] = p
                        elif frag_type == 'solution':
                            items[norm_base]['s'][frag_num] = p

                    # 排序题目：按 base 序号排序
                    def parse_sort_key(b):
                        m = re.match(r'pb_(\d+)-(\d+)', b)
                        if m:
                            return (int(m.group(1)), int(m.group(2)))
                        return (999, 999)

                    sorted_bases = sorted(items.keys(), key=parse_sort_key)
                    ch_total = len(sorted_bases)
                    ch_stitched = 0
                    ch_solutions = 0

                    labels = []
                    file_bases = []

                    for idx, base in enumerate(sorted_bases):
                        q_map = items[base]['q']
                        s_map = items[base]['s']

                        # 1. 处理题目
                        if not q_map:
                            print(f"  警告: {base} 缺少题目图片！")
                            continue

                        sorted_q_nums = sorted(q_map.keys())
                        out_q_name = f"{base}_question.png"
                        out_q_path = os.path.join(dest_dir, out_q_name)

                        if len(sorted_q_nums) == 1:
                            # 单图直接保存
                            q_bytes = iz.read(q_map[sorted_q_nums[0]])
                            with open(out_q_path, 'wb') as f:
                                f.write(q_bytes)
                        else:
                            # 多图垂直拼合
                            q_bytes_list = [iz.read(q_map[k]) for k in sorted_q_nums]
                            stitched_bytes = stitch_images_vertically(q_bytes_list)
                            with open(out_q_path, 'wb') as f:
                                f.write(stitched_bytes)
                            ch_stitched += 1

                        # 2. 处理解析
                        sorted_s_nums = sorted(s_map.keys())
                        for s_num in sorted_s_nums:
                            suffix = f"_solution_{s_num}.png" if s_num > 1 else "_solution.png"
                            out_s_name = f"{base}{suffix}"
                            out_s_path = os.path.join(dest_dir, out_s_name)
                            s_bytes = iz.read(s_map[s_num])
                            with open(out_s_path, 'wb') as f:
                                f.write(s_bytes)
                            ch_solutions += 1

                        # 记录题号与 base
                        labels.append(str(idx + 1))
                        file_bases.append(base)

                    print(f"  完成: 题量={ch_total}, 跨页拼合题={ch_stitched}, 解析切片={ch_solutions}")
                    grand_total_questions += ch_total
                    grand_total_stitched += ch_stitched
                    grand_total_solution_slices += ch_solutions

                    # 章节 ID 规划: ch261 ~ ch283
                    chapter_id = f"ch{260 + ch_num}"
                    chapter_number = 260 + ch_num
                    rel_path = f"李艳芳900/{rel_dir}"

                    chapter_obj = {
                        "id": chapter_id,
                        "category": "shu1",
                        "number": chapter_number,
                        "name": f"李艳芳900 - {subj} - {chapter_title}",
                        "short": chapter_title,
                        "total": ch_total,
                        "cols": 5,
                        "wb": "李艳芳900",
                        "subj": subj,
                        "relPath": rel_path,
                        "labels": labels,
                        "fileBases": file_bases
                    }
                    chapters_config.append(chapter_obj)

    # 写入 js/lyf900-chapters.js
    js_content = "/* 考研题库 - 李艳芳900题章节元数据 */\n"
    js_content += "window.LYF900_CHAPTERS = " + json.dumps(chapters_config, ensure_ascii=False, indent=2) + ";\n"
    
    with open(CHAPTERS_JS_PATH, 'w', encoding='utf-8') as f:
        f.write(js_content)

    print(f"\n==========================================")
    print(f"✅ 李艳芳900题导入与构建完毕！")
    print(f"   总章节数: {len(chapters_config)}")
    print(f"   总题量: {grand_total_questions}")
    print(f"   跨页垂直拼合题目数: {grand_total_stitched}")
    print(f"   总解析切片数: {grand_total_solution_slices}")
    print(f"   章节元数据写入: {CHAPTERS_JS_PATH}")
    print(f"==========================================")

if __name__ == '__main__':
    process_import()
