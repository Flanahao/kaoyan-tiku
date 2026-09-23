import os
import sys
import json
import glob
import re
import urllib.request
import time

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_DIR = os.path.join(ROOT_DIR, '.cache', 'kaoyansou_raw')
IMG_DIR = os.path.join(ROOT_DIR, 'data', 'english', 'images')
DATA_JS_PATH = os.path.join(ROOT_DIR, 'data', 'english', 'english-zhenti-data.js')

os.makedirs(IMG_DIR, exist_ok=True)

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
}

def download_image(url, save_path, retries=3):
    if os.path.exists(save_path) and os.path.getsize(save_path) > 500:
        return True
    req = urllib.request.Request(url, headers=headers)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=15) as resp:
                data = resp.read()
                if len(data) > 200:
                    with open(save_path, 'wb') as f:
                        f.write(data)
                    return True
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(1)
            else:
                print(f"  [ERROR] Failed to download {url}: {e}")
                return False
    return False

def main():
    print("============================================================")
    print("Downloading English Writing Images (1998-2026)")
    print("============================================================")

    # 1. Scan raw cached JSON files for writing sections
    cache_files = glob.glob(os.path.join(CACHE_DIR, 'section_*.json'))
    writing_tasks = []

    for cf in cache_files:
        try:
            with open(cf, 'r', encoding='utf-8') as f:
                raw = json.load(f)
            d = raw.get('data', {})
            sec_name = d.get('sectionName', '')
            if '写作' in sec_name or '作文' in sec_name or 'Part A' in sec_name or 'Part B' in sec_name:
                year = str(d.get('year', '')).strip()
                sec_id = d.get('id')
                cj_str = d.get('contentJson', '')
                if not cj_str:
                    continue
                cj = json.loads(cj_str).get('data', {})
                imgurl = cj.get('imgurl') or ''
                
                # Check all image urls in json
                raw_str = json.dumps(raw)
                all_imgs = re.findall(r'https?://[^\s"\'<>]+\.(?:png|jpg|jpeg|gif|webp)', raw_str, re.IGNORECASE)
                
                part_type = 'partB'
                if 'A' in sec_name or '小作文' in sec_name:
                    part_type = 'partA'

                target_img_url = None
                # Primary choice: en1_large.png for Part B, or imgurl
                for u in all_imgs:
                    if 'en1_large.png' in u:
                        target_img_url = u
                        break
                if not target_img_url and imgurl:
                    target_img_url = imgurl
                if not target_img_url and all_imgs:
                    target_img_url = all_imgs[0]

                if target_img_url:
                    ext = os.path.splitext(target_img_url.split('?')[0])[1].lower() or '.png'
                    local_filename = f"writing_{year}_{part_type}{ext}"
                    local_filepath = os.path.join(IMG_DIR, local_filename)
                    rel_path = f"data/english/images/{local_filename}"
                    writing_tasks.append({
                        'year': year,
                        'sec_id': sec_id,
                        'sec_name': sec_name,
                        'part_type': part_type,
                        'url': target_img_url,
                        'local_path': local_filepath,
                        'rel_path': rel_path
                    })
        except Exception as e:
            print(f"Error reading {cf}: {e}")

    # Deduplicate tasks by local_path
    unique_tasks = {}
    for t in writing_tasks:
        unique_tasks[t['local_path']] = t
    tasks = list(unique_tasks.values())
    tasks.sort(key=lambda x: (x['year'], x['part_type']), reverse=True)

    print(f"Found {len(tasks)} writing images to download.")
    success_count = 0
    mapping = {} # (year, sec_id) -> rel_path

    for idx, t in enumerate(tasks):
        ok = download_image(t['url'], t['local_path'])
        if ok:
            success_count += 1
            mapping[(t['year'], t['sec_id'])] = t['rel_path']
            print(f"  [{idx+1}/{len(tasks)}] Downloaded {t['year']} {t['sec_name']} -> {t['rel_path']}")
        else:
            print(f"  [{idx+1}/{len(tasks)}] FAILED {t['year']} {t['sec_name']} from {t['url']}")

    print(f"\nDownload finished: {success_count}/{len(tasks)} succeeded.")

    # 2. Update english-zhenti-data.js with local image paths
    print(f"\nUpdating {DATA_JS_PATH} with local image URLs...")
    with open(DATA_JS_PATH, 'r', encoding='utf-8') as f:
        data_content = f.read()

    prefix = "window.ENGLISH_ZHENTI_PAPERS = "
    if data_content.startswith("/*"):
        start_idx = data_content.find(prefix)
        data_json_str = data_content[start_idx + len(prefix):].rstrip(';\n ')
    else:
        data_json_str = data_content.replace(prefix, '').rstrip(';\n ')

    data_obj = json.loads(data_json_str)

    # Walk through sections and update writing.imageUrl
    updated_sections = 0
    for y_key, y_val in data_obj.items():
        sections = y_val.get('sections', [])
        for s in sections:
            s_type = s.get('type')
            if s_type in ['writingA', 'writingB']:
                w_info = s.get('writing') or {}
                s_id = s.get('id')
                target_rel = mapping.get((y_key, s_id))
                if not target_rel:
                    # try by part_type
                    part = 'partA' if s_type == 'writingA' else 'partB'
                    # check if file exists
                    for ext in ['.png', '.jpg', '.jpeg']:
                        candidate = f"data/english/images/writing_{y_key}_{part}{ext}"
                        if os.path.exists(os.path.join(ROOT_DIR, candidate)):
                            target_rel = candidate
                            break
                if target_rel:
                    w_info['imageUrl'] = target_rel
                    s['writing'] = w_info
                    updated_sections += 1

    # Write back
    new_data_content = "/* 考研英语一真题 (1998-2026 全29年完整题库数据) */\n" + \
                       "window.ENGLISH_ZHENTI_PAPERS = " + \
                       json.dumps(data_obj, ensure_ascii=False) + ";\n"

    with open(DATA_JS_PATH, 'w', encoding='utf-8') as f:
        f.write(new_data_content)

    print(f"Updated {updated_sections} writing sections in {DATA_JS_PATH}.")
    print("Writing images update complete!")

if __name__ == '__main__':
    main()
