import os, sys, zipfile, csv

sys.stdout.reconfigure(encoding='utf-8')
base_dir = r'D:\考研题库网站\数一题库\夜雨强化\概率论'
dl_dir = r'D:\antigravityDownload'
os.makedirs(dl_dir, exist_ok=True)

CHAPTERS = [
    (1, '第1章 随机事件及其概率', 46),
    (2, '第2章 一维随机变量及其分布', 28),
    (3, '第3章 二维随机变量及其分布', 32),
    (4, '第4章 随机变量的数字特征', 23),
    (5, '第5章 大数定律和中心极限定理', 7),
    (6, '第6章 数理统计的基本概念', 21),
    (7, '第7章 参数估计', 18),
    (8, '第8章 假设检验与置信区间', 5),
]

# Generate logical_map.csv in each chapter directory
for ch_num, ch_name, count in CHAPTERS:
    ch_path = os.path.join(base_dir, ch_name)
    csv_path = os.path.join(ch_path, 'logical_map.csv')
    with open(csv_path, 'w', encoding='utf-8-sig', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([
            'asset_no', 'chapter_no', 'chapter_name', 'category', 
            'question_type', 'item_no', 'subpart_label', 'question_file', 
            'solution_file', 'solution_page_count'
        ])
        for q_idx in range(1, count + 1):
            q_file = f"pb_{ch_num:02d}-{q_idx:02d}_question.png"
            writer.writerow([
                f"{q_idx:03d}",
                f"{ch_num:02d}",
                ch_name,
                "夜雨强化",
                "习题",
                f"{q_idx:02d}",
                "",
                q_file,
                "",
                0
            ])
    print(f"Generated logical_map.csv for {ch_name}")

# Package consolidated ZIP
zip_name = "夜雨强化_概率论与数理统计_全8章交付包.zip"
zip_path = os.path.join(dl_dir, zip_name)
with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED) as z:
    for ch_num, ch_name, count in CHAPTERS:
        ch_path = os.path.join(base_dir, ch_name)
        for fname in sorted(os.listdir(ch_path)):
            fpath = os.path.join(ch_path, fname)
            arcname = f"{ch_name}/{fname}"
            z.write(fpath, arcname)

zip_size = os.path.getsize(zip_path)
print(f"\nConsolidated ZIP generated: {zip_path}")
print(f"Size: {zip_size:,} bytes ({zip_size / 1024 / 1024:.2f} MB)")
assert zip_size < 40000000, f"ZIP size {zip_size} exceeds 40MB limit!"
print("ZIP SIZE STRICTLY < 40,000,000 BYTES! VALIDATION PASSED!")
