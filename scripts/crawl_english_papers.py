import os
import sys
import json
import time
import urllib.request
import re

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CACHE_DIR = os.path.join(ROOT_DIR, '.cache', 'kaoyansou_raw')
OUTPUT_DIR = os.path.join(ROOT_DIR, 'data', 'english')

os.makedirs(CACHE_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

def fetch_json(url, retries=3, delay=0.3):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    req = urllib.request.Request(url, headers=headers)
    for attempt in range(retries):
        try:
            with urllib.request.urlopen(req, timeout=20) as response:
                return json.loads(response.read().decode('utf-8'))
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(1 + attempt)
            else:
                raise e

def clean_tokens(tokens, is_cloze=False):
    if not tokens:
        return ""
    if isinstance(tokens, str):
        return tokens.strip()
    if not isinstance(tokens, list):
        return str(tokens).strip()

    words = []
    for t in tokens:
        if isinstance(t, dict):
            # 内部句序标记（state == 3，如 1, 2, 3... 句序），必须跳过
            if t.get('state') == 3:
                continue

            name = str(t.get('name') or t.get('text') or t.get('value') or '')
            # 数字 token 在完形中且 types == 'number' 就是题号占位符。旧逻辑直接丢弃，导致 1~20 空格消失。
            if is_cloze and t.get('types') == 'number' and name.isdigit() and len(name) <= 2:
                words.append(f"___({name})___")
                continue
            words.append(name)
        elif isinstance(t, str):
            words.append(t)
        elif isinstance(t, (int, float)):
            words.append(str(t))

    text = " ".join(words)
    # Fix punctuation spacing: "word ," -> "word,", "word ." -> "word."
    text = re.sub(r'\s+([,.:;?!%\'\"])', r'\1', text)
    text = re.sub(r'([\'\"])\s+', r'\1', text)
    text = re.sub(r'\s+(___\(\d{1,2}\)___)\s+', r' \1 ', text)
    # 来源 token 偶尔会在完整句末重复附加问号，生成 ".?"、"!?" 或 "??"。
    # 这些不是原文标点，保留会破坏阅读排版与朗读停顿。
    text = text.replace('.?', '.').replace('!?', '!').replace('??', '?')
    return text.strip()

def parse_section(data):
    section_id = data.get('id')
    year = str(data.get('year') or '')
    sec_name = str(data.get('sectionName') or '').strip()
    content_raw = data.get('contentJson')
    timu_raw = data.get('tiMuJson')
    key_sentence_raw = data.get('keySentenceJson')

    # Standardize section type and display title
    sec_type = 'reading'
    display_title = sec_name

    # 1. 写作 (Writing)
    if '写作' in sec_name or '作文' in sec_name:
        if 'A' in sec_name or '小作文' in sec_name:
            sec_type = 'writingA'
            display_title = '应用文写作 (小作文 Part A)'
        else:
            sec_type = 'writingB'
            display_title = '短文写作 (大作文 Part B)' if int(year or 0) >= 2005 else '短文写作 (大作文)'
    # 2. 完形 / 完型 (Cloze)
    elif '完形' in sec_name or '完型' in sec_name:
        sec_type = 'cloze'
        display_title = '英语知识运用 (完形填空)'
    # 3. 新题型 / Part B (非写作)
    elif '新题型' in sec_name or 'Part B' in sec_name:
        sec_type = 'partB'
        display_title = '阅读理解 Part B (新题型)'
    # 4. 翻译 (Translation)
    elif '翻译' in sec_name:
        sec_type = 'translation'
        display_title = '英译汉 (翻译)'
    # 5. 阅读理解 (Reading)
    elif '阅读' in sec_name:
        sec_type = 'reading'
        match = re.search(r'Text\s*(\d)', sec_name, re.IGNORECASE)
        text_num = match.group(1) if match else '1'
        display_title = f"阅读理解 Part A - Text {text_num}"
    else:
        sec_type = 'reading'
        display_title = sec_name

    result = {
        'id': section_id,
        'year': year,
        'sectionName': sec_name,
        'displayTitle': display_title,
        'type': sec_type,
        'beform': '',
        'paragraphs': [],
        'questions': [],
        'keySentences': [],
        'writing': None
    }

    # Parse content
    if content_raw:
        try:
            c_obj = json.loads(content_raw)
            c_data = c_obj.get('data') if isinstance(c_obj, dict) else None
            if isinstance(c_data, dict):
                result['beform'] = c_data.get('beform') or ''
                conts = c_data.get('conts', [])
                if isinstance(conts, list):
                    for p in conts:
                        if not isinstance(p, dict):
                            continue
                        duanluo = p.get('duanluo') or (len(result['paragraphs']) + 1)
                        zcont = str(p.get('zcont') or '').strip()
                        econt = p.get('econt') or []
                        if isinstance(econt, dict) and 'cont' in econt:
                            econt = econt['cont']
                        eng_text = clean_tokens(econt, is_cloze=(sec_type == 'cloze')) if isinstance(econt, list) else str(econt).strip()
                        if eng_text or zcont:
                            result['paragraphs'].append({
                                'duanluo': duanluo,
                                'english': eng_text,
                                'chinese': zcont
                            })

                # Check writing prompt info
                if sec_type in ['writingA', 'writingB']:
                    result['writing'] = {
                        'prompt': c_data.get('tigan') or '',
                        'imageUrl': c_data.get('imgurl') or '',
                        'analysis': c_data.get('jiexi') or '',
                        'sampleEssay': [
                            {
                                'duanluo': p.get('duanluo', idx + 1),
                                'english': clean_tokens(p.get('econt', {}).get('cont') if isinstance(p.get('econt'), dict) else p.get('econt')),
                                'chinese': p.get('zcont', '')
                            }
                            for idx, p in enumerate(conts) if isinstance(p, dict)
                        ]
                    }
        except Exception as e:
            print(f"Warning: error parsing contentJson for {sec_name}: {e}")

    # Parse questions
    if timu_raw:
        try:
            t_obj = json.loads(timu_raw)
            t_items = t_obj.get('data', []) if isinstance(t_obj, dict) else []
            for q_idx, item in enumerate(t_items):
                q_data = item.get('data', item) if isinstance(item, dict) else {}
                num = str(q_data.get('num') or (q_idx + 1)).strip()

                # stem
                tigan_tokens = q_data.get('tigan', {}).get('cont', []) if isinstance(q_data.get('tigan'), dict) else []
                stem = clean_tokens(tigan_tokens)
                if not stem and q_data.get('title'):
                    stem = str(q_data.get('title')).strip()
                if not stem and sec_type == 'cloze':
                    stem = f"第 {num} 空"

                # options
                opts = []
                xuanxiang = q_data.get('xuanxiang', [])
                if isinstance(xuanxiang, list):
                    for idx, opt_tokens in enumerate(xuanxiang):
                        opt_key = chr(65 + idx)
                        opt_text = clean_tokens(opt_tokens)
                        if opt_text:
                            opts.append({'key': opt_key, 'text': opt_text})

                # 翻译题不是选择题；来源偶尔带一个空 A 选项，前端会误渲染为空按钮。
                if sec_type == 'translation':
                    opts = []

                # answer
                ans_raw = str(q_data.get('zhengque') if q_data.get('zhengque') is not None else '').strip()
                if ans_raw.isdigit() and 1 <= int(ans_raw) <= 8:
                    ans_char = chr(64 + int(ans_raw))
                elif ans_raw.upper() in ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']:
                    ans_char = ans_raw.upper()
                else:
                    ans_char = ans_raw

                result['questions'].append({
                    'id': f"{year}_{section_id}_{num}",
                    'num': num,
                    'stem': stem,
                    'options': opts,
                    'answer': ans_char,
                    'explanation': q_data.get('jiexi') or ''
                })
        except Exception as e:
            print(f"Warning: error parsing tiMuJson for {sec_name}: {e}")

    # Parse keySentence
    if key_sentence_raw:
        try:
            k_obj = json.loads(key_sentence_raw)
            k_list = k_obj.get('data', []) if isinstance(k_obj, dict) else []
            if isinstance(k_list, list):
                for k in k_list:
                    if isinstance(k, dict):
                        sent = k.get('sentence') or k.get('econt') or ''
                        analysis = k.get('analysis') or k.get('jiexi') or k.get('zcont') or ''
                        if sent or analysis:
                            result['keySentences'].append({
                                'sentence': clean_tokens(sent) if isinstance(sent, list) else str(sent).strip(),
                                'analysis': str(analysis).strip()
                            })
        except Exception:
            pass

    return result

def main():
    print("============================================================")
    print("Starting Crawl: Kaoyan English True Exam Papers (1998-2026)")
    print("============================================================")

    # 1. Fetch paper list
    list_url = 'https://english.kaoyansou.cn/api/paper/list?page=1&size=2000'
    list_cache_file = os.path.join(CACHE_DIR, 'paper_list.json')

    if os.path.exists(list_cache_file):
        print("Loading paper list from local cache...")
        with open(list_cache_file, 'r', encoding='utf-8') as f:
            list_data = json.load(f)
    else:
        print("Fetching paper list from remote API...")
        list_data = fetch_json(list_url)
        with open(list_cache_file, 'w', encoding='utf-8') as f:
            json.dump(list_data, f, ensure_ascii=False, indent=2)

    records = (list_data.get('data') or {}).get('records', [])
    yi_records = [r for r in records if r.get('englishType') == '英一']
    print(f"Found {len(records)} total records, filtered {len(yi_records)} 'English 1' records.")

    # Sort records: Year descending (2026 -> 1998)
    def sort_key(r):
        y = int(r.get('year') or 0)
        s_name = str(r.get('sectionName') or '')
        order = 99
        if '完形' in s_name or '完型' in s_name: order = 1
        elif 'Text1' in s_name or 'Text 1' in s_name: order = 2
        elif 'Text2' in s_name or 'Text 2' in s_name: order = 3
        elif 'Text3' in s_name or 'Text 3' in s_name: order = 4
        elif 'Text4' in s_name or 'Text 4' in s_name: order = 5
        elif 'Text5' in s_name or 'Text 5' in s_name: order = 6
        elif '新题型' in s_name or ('Part B' in s_name and '写作' not in s_name and '作文' not in s_name): order = 7
        elif '翻译' in s_name: order = 8
        elif ('写作' in s_name or '作文' in s_name) and ('A' in s_name or '小作文' in s_name): order = 9
        elif ('写作' in s_name or '作文' in s_name): order = 10
        return (-y, order)

    yi_records.sort(key=sort_key)

    parsed_papers_by_year = {}
    total_sections = len(yi_records)

    for idx, r in enumerate(yi_records):
        sid = r['id']
        year = str(r['year'])
        sec_name = r['sectionName']
        cache_file = os.path.join(CACHE_DIR, f"section_{sid}.json")

        if os.path.exists(cache_file):
            with open(cache_file, 'r', encoding='utf-8') as f:
                sec_raw = json.load(f)
        else:
            sec_url = f"https://english.kaoyansou.cn/api/paper/{sid}"
            try:
                sec_raw = fetch_json(sec_url)
                with open(cache_file, 'w', encoding='utf-8') as f:
                    json.dump(sec_raw, f, ensure_ascii=False)
                time.sleep(0.1)
            except Exception as e:
                print(f"[{idx+1}/{total_sections}] FAILED {sid} ({year} {sec_name}): {e}")
                continue

        sec_data = (sec_raw.get('data') or {})
        parsed = parse_section(sec_data)

        if year not in parsed_papers_by_year:
            parsed_papers_by_year[year] = {
                'year': year,
                'sections': []
            }
        parsed_papers_by_year[year]['sections'].append(parsed)

        if (idx + 1) % 25 == 0 or idx + 1 == total_sections:
            print(f"Progress: [{idx+1}/{total_sections}] processed ({year} {sec_name})")

    # Generate Manifest
    years_manifest = []
    for y, y_data in parsed_papers_by_year.items():
        years_manifest.append({
            'year': y,
            'sectionCount': len(y_data['sections']),
            'sections': [
                {
                    'id': s['id'],
                    'name': s['sectionName'],
                    'displayTitle': s['displayTitle'],
                    'type': s['type'],
                    'questionCount': len(s['questions'])
                }
                for s in y_data['sections']
            ]
        })

    # Write Manifest JS & JSON
    manifest_json_path = os.path.join(OUTPUT_DIR, 'english-zhenti-manifest.json')
    manifest_js_path = os.path.join(OUTPUT_DIR, 'english-zhenti-manifest.js')
    data_js_path = os.path.join(OUTPUT_DIR, 'english-zhenti-data.js')

    with open(manifest_json_path, 'w', encoding='utf-8') as f:
        json.dump(years_manifest, f, ensure_ascii=False, indent=2)

    with open(manifest_js_path, 'w', encoding='utf-8') as f:
        f.write("/* 考研英语一真题 (1998-2026) 模块目录清单 */\n")
        f.write("window.ENGLISH_ZHENTI_MANIFEST = " + json.dumps(years_manifest, ensure_ascii=False) + ";\n")

    with open(data_js_path, 'w', encoding='utf-8') as f:
        f.write("/* 考研英语一真题 (1998-2026 全29年完整题库数据) */\n")
        f.write("window.ENGLISH_ZHENTI_PAPERS = " + json.dumps(parsed_papers_by_year, ensure_ascii=False) + ";\n")

    data_size_mb = os.path.getsize(data_js_path) / 1024 / 1024
    print("\n============================================================")
    print("Crawl and packaging complete!")
    print(f"Total Years: {len(parsed_papers_by_year)} (1998 - 2026)")
    print(f"Total Sections: {total_sections}")
    print("Output files:")
    print(f"  - {manifest_js_path}")
    print(f"  - {data_js_path} ({data_size_mb:.2f} MB)")
    print("============================================================")

if __name__ == '__main__':
    main()
