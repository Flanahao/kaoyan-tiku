import os, sys, csv, json

base_dir = r"D:\考研题库网站\数一题库\夜雨强化"
out_js = r"D:\考研题库网站\js\yeyu-chapters.js"

subjects = [
    ("高数", "高数", "gd"),
    ("线代", "线代", "la"),
    ("概率论", "概率论", "pr")
]

chapters_data = []
global_idx = 1

for subj_dir_name, subj_name, prefix in subjects:
    subj_path = os.path.join(base_dir, subj_dir_name)
    if not os.path.exists(subj_path):
        continue
    
    # Natural sort chapter directories
    dir_names = sorted(os.listdir(subj_path), key=lambda d: int(d.split('章')[0].replace('第', '')) if '第' in d and '章' in d else 999)
    for d in dir_names:
        ch_dir = os.path.join(subj_path, d)
        if not os.path.isdir(ch_dir):
            continue
            
        csv_file = os.path.join(ch_dir, 'logical_map.csv')
        labels = []
        file_bases = []
        
        if os.path.exists(csv_file):
            with open(csv_file, 'r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    qf = row.get('question_file', '')
                    if qf:
                        base = qf.replace('_question.png', '')
                        file_bases.append(base)
                        it = row.get('item_no', '')
                        labels.append(f"题 {it}")
        else:
            pngs = sorted([f for f in os.listdir(ch_dir) if f.endswith('_question.png')])
            for p in pngs:
                base = p.replace('_question.png', '')
                file_bases.append(base)
                # parse number
                num_str = base.split('-')[-1]
                labels.append(f"题 {num_str}")
                
        if len(labels) == 0:
            continue
            
        # extract chapter number from folder name
        ch_num = int(d.split('章')[0].replace('第', '')) if '第' in d and '章' in d else global_idx
        
        entry = {
            "id": f"yeyu_{prefix}_{ch_num:02d}",
            "number": global_idx,
            "name": f"夜雨强化 - {subj_name} - {d}",
            "short": d,
            "total": len(labels),
            "cols": 5,
            "wb": "夜雨强化",
            "subj": subj_name,
            "relPath": f"夜雨强化/{subj_dir_name}/{d}",
            "labels": labels,
            "fileBases": file_bases
        }
        chapters_data.append(entry)
        global_idx += 1

js_content = "// 夜雨强化讲义全科（高数、线代、概率论）章节数据\n"
js_content += "window.YEYU_CHAPTERS = " + json.dumps(chapters_data, ensure_ascii=False, indent=2) + ";\n"

with open(out_js, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Generated {out_js} with {len(chapters_data)} chapters and {sum(c['total'] for c in chapters_data)} total questions.")
