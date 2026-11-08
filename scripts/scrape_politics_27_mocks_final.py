import urllib.request
import urllib.error
import json
import time
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r'D:\考研题库网站'
TOKEN = '8e328300475c4ae083273605ae40b7d1'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Authorization': f'Bearer {TOKEN}',
    'Content-Type': 'application/json'
}

ctx = None
import ssl
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def get_series_name(bank_code, bank_name):
    if 'xt' in bank_code or '徐涛' in bank_name:
        return '徐涛十套卷'
    if 'tj' in bank_code or '腿姐' in bank_name:
        return '腿姐八套卷'
    if 'mp' in bank_code or '米鹏' in bank_name:
        return '米鹏六套卷'
    if 'xdf' in bank_code or '新东方' in bank_name:
        return '新东方五套卷'
    if 'yf' in bank_code or '余峰' in bank_name:
        return '余峰六套卷'
    return '名师模拟卷'

def main():
    print("=" * 60)
    print("🚀 启动 27 届考研政治模拟卷精确抓取与补全流程")
    print("=" * 60)

    # 1. Load mock banks
    banks_path = os.path.join(BASE_DIR, 'scratch', 'all_mock_banks.json')
    with open(banks_path, 'r', encoding='utf-8') as f:
        all_banks = json.load(f)

    e27_banks = [b for b in all_banks if b.get('edition') == '27']
    print(f"确认 27 届模拟卷共计 {len(e27_banks)} 套")

    # 2. Load or initialize answers cache
    cache_path = os.path.join(BASE_DIR, 'scratch', 'mock27_answers_cache.json')
    answers_cache = {}
    if os.path.exists(cache_path):
        try:
            with open(cache_path, 'r', encoding='utf-8') as f:
                answers_cache = json.load(f)
            print(f"已加载持久化答案缓存: {len(answers_cache)} 条")
        except Exception as e:
            print(f"读取缓存警告: {e}")

    # Also harvest from any existing scratch/mock27_cache/*.json
    mock27_dir = os.path.join(BASE_DIR, 'scratch', 'mock27_cache')
    if os.path.exists(mock27_dir):
        for fname in os.listdir(mock27_dir):
            if fname.endswith('.json'):
                try:
                    with open(os.path.join(mock27_dir, fname), 'r', encoding='utf-8') as f:
                        cdata = json.load(f)
                        for q in cdata.get('questions', []):
                            qid_str = str(q['id'])
                            if q.get('answer') and qid_str not in answers_cache:
                                answers_cache[qid_str] = {
                                    'answer': q['answer'],
                                    'analysis': q.get('analysis', '')
                                }
                except Exception:
                    pass
    print(f"整合缓存后有效答案数: {len(answers_cache)} 条")

    def save_cache():
        with open(cache_path, 'w', encoding='utf-8') as f:
            json.dump(answers_cache, f, ensure_ascii=False)

    # 3. Load or fetch chapter structure for each bank
    chapters_meta_file = os.path.join(BASE_DIR, 'scratch', 'mock27_chapters_meta_all.json')
    chapters_meta = {}
    if os.path.exists(chapters_meta_file):
        try:
            with open(chapters_meta_file, 'r', encoding='utf-8') as f:
                chapters_meta = json.load(f)
            print(f"已加载章节结构元数据: {len(chapters_meta)} 套")
        except Exception:
            pass

    # Ensure all 30 banks have their questions list
    for idx, b in enumerate(e27_banks):
        code = b['code']
        name = b['name']
        if code in chapters_meta and len(chapters_meta[code].get('questions', [])) == b.get('qCount', 33):
            continue

        print(f"[{idx+1}/{len(e27_banks)}] 正在获取试卷大纲: {name} ({code})...")
        # Bank detail
        b_url = f'https://yanbrick.com/api/politics/banks/{code}'
        req = urllib.request.Request(b_url, headers=HEADERS)
        with urllib.request.urlopen(req, context=ctx, timeout=12) as resp:
            b_data = json.loads(resp.read().decode('utf-8'))

        ch_code = b_data['chapters'][0]['code']
        ch_url = f'https://yanbrick.com/api/politics/chapters/{ch_code}'
        req_ch = urllib.request.Request(ch_url, headers=HEADERS)
        with urllib.request.urlopen(req_ch, context=ctx, timeout=12) as resp:
            ch_data = json.loads(resp.read().decode('utf-8'))

        chapters_meta[code] = {
            'bank_code': code,
            'name': name,
            'chapter_code': ch_code,
            'series': get_series_name(code, name),
            'questions': ch_data.get('questions', [])
        }
        with open(chapters_meta_file, 'w', encoding='utf-8') as f:
            json.dump(chapters_meta, f, ensure_ascii=False, indent=2)
        time.sleep(0.3)

    # Check answers via bulk /answers endpoint for any new ones
    for code, cm in chapters_meta.items():
        ch_code = cm['chapter_code']
        qs = cm['questions']
        # if all questions already have answers in cache, skip
        if all(str(q['id']) in answers_cache and answers_cache[str(q['id'])].get('answer') for q in qs):
            continue
        try:
            ans_url = f'https://yanbrick.com/api/politics/chapters/{ch_code}/answers'
            req = urllib.request.Request(ans_url, headers=HEADERS)
            with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
                ans_list = json.loads(resp.read().decode('utf-8'))
                for a in ans_list:
                    qid_str = str(a['id'])
                    if a.get('answer'):
                        answers_cache[qid_str] = {
                            'answer': a['answer'],
                            'analysis': a.get('analysis', '')
                        }
        except Exception:
            pass

    save_cache()
    print(f"完成批量答案同步，当前缓存答案数: {len(answers_cache)} 条")

    # Flatten all questions across all 30 papers to find missing
    all_questions_list = []
    for b in e27_banks:
        code = b['code']
        cm = chapters_meta[code]
        for q in cm['questions']:
            all_questions_list.append({
                'bank_code': code,
                'bank_name': cm['name'],
                'chapter_code': cm['chapter_code'],
                'series': cm['series'],
                'question': q
            })

    total_q_count = len(all_questions_list)
    missing_items = [
        item for item in all_questions_list
        if str(item['question']['id']) not in answers_cache or not answers_cache[str(item['question']['id'])].get('answer')
    ]
    print(f"总计题目数: {total_q_count} 题")
    print(f"已就绪答案数: {total_q_count - len(missing_items)} 题")
    print(f"待抓取答案题目数: {len(missing_items)} 题")

    # 4. Fetch missing answers sequentially with gentle pacing
    for idx, item in enumerate(missing_items):
        q = item['question']
        qid = q['id']
        qid_str = str(qid)
        ch_code = item['chapter_code']
        q_type = q.get('type', 'single')
        choice = 'A' if q_type == 'single' else 'AB'

        url = f'https://yanbrick.com/api/politics/questions/{qid}/answer'
        data = json.dumps({'choice': choice, 'chapter': ch_code}).encode('utf-8')

        success = False
        while not success:
            try:
                req = urllib.request.Request(url, data=data, headers=HEADERS)
                with urllib.request.urlopen(req, context=ctx, timeout=10) as resp:
                    res = json.loads(resp.read().decode('utf-8'))
                    if res.get('ok') or 'answer' in res:
                        answers_cache[qid_str] = {
                            'answer': res.get('answer'),
                            'analysis': res.get('analysis', '')
                        }
                        success = True
                        current_done = total_q_count - len(missing_items) + idx + 1
                        pct = (current_done / total_q_count) * 100
                        if (idx + 1) % 10 == 0 or (idx + 1) == len(missing_items):
                            print(f"[{current_done}/{total_q_count}] ({pct:.1f}%) {item['series']} {item['bank_name']} Q{q.get('no')}: 答案={res.get('answer')}", flush=True)
                            save_cache()
                        break
                    else:
                        msg = res.get('message', '')
                        print(f"  [限频等待] QID {qid}: {msg}，休眠 2.5 秒后重试...", flush=True)
                        time.sleep(2.5)
            except urllib.error.HTTPError as e:
                print(f"  [HTTPError {e.code}] QID {qid}，休眠 3 秒后重试...", flush=True)
                time.sleep(3.0)
            except Exception as e:
                print(f"  [网络错误 {e}] QID {qid}，休眠 3 秒后重试...", flush=True)
                time.sleep(3.0)

        # Gentle delay between requests
        time.sleep(0.55)

    save_cache()
    print("\n✅ 所有 990 道题目答案与解析全部采集完毕！")

    # 5. Assemble final dataset
    final_chapters = []
    total_answered = 0
    total_questions = 0

    for b in e27_banks:
        code = b['code']
        cm = chapters_meta[code]
        paper_questions = []
        for q in cm['questions']:
            total_questions += 1
            qid = q['id']
            qid_str = str(qid)
            ans_info = answers_cache.get(qid_str, {})
            ans = ans_info.get('answer', '')
            ana = ans_info.get('analysis', '')
            if ans:
                total_answered += 1

            q_type = q.get('type', 'single')
            type_zh = "单选题" if q_type == 'single' else "多选题"
            paper_questions.append({
                "id": qid,
                "no": q.get('no', 0),
                "type": q_type,
                "type_zh": type_zh,
                "subject": q.get('subject', '模拟'),
                "stem": q.get('stem', ''),
                "choices": q.get('choices', {}),
                "answer": ans,
                "analysis": ana
            })

        final_chapters.append({
            "code": cm['chapter_code'],
            "bank_code": code,
            "name": cm['name'],
            "series": cm['series'],
            "qCount": len(paper_questions),
            "questions": paper_questions
        })

    final_data = {
        "bank_code": "politics-mocks-27",
        "bank_name": "考研政治27模拟卷（徐涛/腿姐/米鹏/新东方/余峰）",
        "edition": "27",
        "total_papers": len(final_chapters),
        "total_questions": total_questions,
        "answered_questions": total_answered,
        "chapters": final_chapters
    }

    # 6. Save JSON
    data_dir = os.path.join(BASE_DIR, 'data', 'politics')
    os.makedirs(data_dir, exist_ok=True)
    json_path = os.path.join(data_dir, 'mocks_27.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
    print(f"✅ 题库 JSON 已写入: {json_path} (试卷: {len(final_chapters)}套, 题目: {total_questions}题, 含解析答案: {total_answered}题)")

    # 7. Save JS
    js_path = os.path.join(BASE_DIR, 'js', 'politics-mocks-chapters.js')
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(f"/* 考研政治 27模拟卷全量题库数据 ({len(final_chapters)}套卷 {total_questions}题，含题干、选项、答案与详解) */\n")
        f.write("window.POLITICS_MOCKS_DATA = ")
        json.dump(final_data, f, ensure_ascii=False)
        f.write(";\n")
    print(f"✅ 前端数据 JS 已写入: {js_path}")

    # Summary by series
    from collections import Counter
    series_cnt = Counter(c['series'] for c in final_chapters)
    print("\n📊 各名师模拟卷套数统计:")
    for s_name, count in series_cnt.items():
        print(f"  - {s_name}: {count} 套 ({count * 33} 题)")

if __name__ == '__main__':
    main()
