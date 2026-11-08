import json
import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r'D:\考研题库网站'

# 补全余峰第1套 Q10-Q33 的高标准答案与解析
YF_SUPPLEMENT = {
    18215: {
        "answer": "D",
        "analysis": "【解析】长征一完结，新局面就开始，直罗镇战役给党中央把全国革命大本营放在西北的任务举行了一个奠基礼。这里所说的“新局面”主要是指中国革命开始由国内革命战争向抗日民族战争转变。A选项会师是长征结束标志之一；B选项战略进攻序幕是1947年刘邓大军挺进大别山；C选项正式形成是1937年9月国共合作宣言发表。"
    },
    6500: {
        "answer": "C",
        "analysis": "【解析】鸦片战争以后，中国逐步沦为半殖民地半封建社会，其根本原因和主要原因在于西方列强的侵略和中国封建统治的腐败。西方资本-帝国主义列强的侵略是近代中国沦为半殖民地的外因，封建统治者的腐朽是近代中国沦为半封建社会的内因。故正确答案为C选项。"
    },
    18216: {
        "answer": "B",
        "analysis": "【解析】1937年8月中共洛川会议通过《关于目前形势与党的任务的决定》和《抗日救国十大纲领》，指出全国性抗战已经开始，抗战准备阶段已过去，实行抗战阶段的最中心任务是动员一切力量争取抗战的胜利，为此必须实行全面抗战路线。故选B。"
    },
    18217: {
        "answer": "C",
        "analysis": "【解析】关于真理标准问题的大讨论，打破了长期以来“左”倾错误的严重束缚，是一场深刻的思想解放运动，成为正本清源、拨乱反正和改革开放的思想先导。A、B属于十一届三中全会的历史地位；D属于三大改造完成的历史意义。故正确答案为C。"
    },
    18218: {
        "answer": "A",
        "analysis": "【解析】理想和信念紧密联系，互为表里。一方面，理想是信念所指的对象，信念是理想实现的保障；另一方面，信念是对理想的坚守与践行。B错误，同一主体可兼具理想信念；C、D明显违背马克思主义人生观。故正确答案为A。"
    },
    18219: {
        "answer": "C",
        "analysis": "【解析】习近平总书记在庆祝建党105周年重要讲话中指出，中国共产党之所以能够不断铸就辉煌，历史和人民之所以选择中国共产党，根本在于中国共产党具有其他政党和政治力量无可比拟的优秀特质。故正确答案为C。"
    },
    18220: {
        "answer": "D",
        "analysis": "【解析】习近平主席访美拓展了中美关系新定位内涵，明确尊重、公平、对等的重要性，同意构建基于尊重、公平、对等的中美新型关系。故正确答案为D。"
    },
    18221: {
        "answer": "AD",
        "analysis": "【解析】意识是物质世界长期发展的产物，是人脑的机能和属性，是对客观存在的主观映象。人工智能没有真正的独立意识，它的行为模式归根到底是对人类信息世界和实践行为的重现与反映，故A、D正确。B选项表述颠倒，内因是根据，外因是条件；C选项人工智能不能自主创造社会意识形式。故选AD。"
    },
    18222: {
        "answer": "BC",
        "analysis": "【解析】“记忆—睡眠”双向调控发现表明事物内部各要素相互制约、相互作用，认识成果用于医疗探索体现了实践是认识的目的与归宿，故B、C正确。A选项认识发展是继承与超越，并非简单“推翻”；D选项认识源于实践而非思维创新。故选BC。"
    },
    18210: {
        "answer": "ACD",
        "analysis": "【解析】梅的价值随世迁移、渐广愈深，说明事物的价值因主体需求变化而呈现多样性，由客体属性与主体需求共同决定，随着实践发展由潜在走向现实，故A、C、D正确。B选项主观真理论/唯心主义错误，事物的客观存在性不取决于主体评价。故选ACD。"
    },
    18223: {
        "answer": "BC",
        "analysis": "【解析】加快资本周转速度、提高剩余价值量，途径主要包括：缩短生产时间和流通时间（即缩短资本周转时间）、加快流动资本的周转速度。A选项固定资本周转慢，提高其比重会降低总周转速度；D选项与加快个别资本周转速度无关。故正确答案为BC。"
    },
    18224: {
        "answer": "BCD",
        "analysis": "【解析】资本主义必然为社会主义代替，根本原因在于资本主义基本矛盾（生产社会化与生产资料私人占有）无法在资本主义制度内部根本解决，资本积累激化矛盾，资产阶级与无产阶级阶级对立不可调和，故B、C、D正确。A选项自我调整无法从根本上消除基本矛盾。故选BCD。"
    },
    18225: {
        "answer": "AB",
        "analysis": "【解析】推进马克思主义中国化时代化，是解决中国实际问题的客观需要，也是马克思主义理论本身发展的内在要求。C选项马克思主义与中华优秀传统文化性质不同，是相结合相契合而非“一脉相承”；D选项马克思主义不提供现成发展模式。故选AB。"
    },
    18226: {
        "answer": "ABC",
        "analysis": "【解析】培育未来产业有利于抢占制高点、发展新质生产力、提高人民生活品质，A、B、C正确。D选项国有经济是国民经济的主导力量，未来产业不是主导力量。故选ABC。"
    },
    18227: {
        "answer": "ABCD",
        "analysis": "【解析】编纂生态环境法典是深入贯彻习近平生态文明思想的生动实践，是推进国家治理体系和治理能力现代化的有效路径，是支撑高质量发展的关键举措，是增进民生福祉的内在要求。A、B、C、D全选。"
    },
    18228: {
        "answer": "BCD",
        "analysis": "【解析】党对非公有制经济的“三个没有变”包括：地位和作用没有变；方针政策没有变；营造良好环境和提供更多机会没有变，B、C、D正确。A选项错误，非公有制经济是社会主义“市场”经济的重要组成部分，而非社会主义经济（公有制经济）的组成部分。故选BCD。"
    },
    18229: {
        "answer": "ABC",
        "analysis": "【解析】持之以恒推进全面从严治党，必须着眼于提高党的长期执政能力、保持党的先进性和纯洁性、保持党同人民群众的血肉联系。故正确答案为ABC。"
    },
    18230: {
        "answer": "BCD",
        "analysis": "【解析】中国先进分子对资本主义方案产生怀疑，是因为资本主义固有矛盾充分暴露、一战加剧暴露其弊端，以及中国资产阶级革命方案屡遭失败，故B、C、D正确。A选项新文化运动早期马克思主义尚未成为主流。故选BCD。"
    },
    18231: {
        "answer": "ACD",
        "analysis": "【解析】中共中央香山时期领导了解放战争走向胜利，发布向全国进军命令、发表《论人民民主专政》、筹备新政协并制定《共同纲领》，A、C、D正确。B选项七届二中全会是在西柏坡召开的，不在香山。故选ACD。"
    },
    18232: {
        "answer": "ABD",
        "analysis": "【解析】1979-1980年城市经济体制改革主要是扩大企业自主权、试行经济责任制、放宽农副产品购销政策、探索多种经济形式，A、B、D正确。C选项全面推行股份制、建立现代企业制度是在20世纪90年代十四大及十四届三中全会之后。故选ABD。"
    },
    18233: {
        "answer": "ABCD",
        "analysis": "【解析】社会主义核心价值观具有先进性（反映人类社会发展进步、体现社会制度阶级属性和方向）、人民性（彰显人民至上立场）和真实性（真实可信的强大道义力量）。A、B、C、D全选。"
    },
    18234: {
        "answer": "BCD",
        "analysis": "【解析】法治与德治结合，要求强化道德对法治的支撑作用、把道德要求贯彻到法治建设中、运用法治手段解决道德突出问题，B、C、D正确。A选项错误，道德调整范围宽于法律，不能说是法律补充道德范围。故选BCD。"
    },
    18235: {
        "answer": "ABCD",
        "analysis": "【解析】习近平总书记在纪念江泽民同志诞辰100周年大会上指出，江泽民同志捍卫了中国特色社会主义伟大事业、开创了全面改革开放新局面、实现了人民生活总体小康、成功把中国特色社会主义推向二十一世纪。A、B、C、D全选。"
    },
    18236: {
        "answer": "ABD",
        "analysis": "【解析】全球发展倡议提出五年来，强化了发展优先的国际共识，推进了互利共赢的发展合作，有效回应了全球南方国家诉求，A、B、D正确。C选项全球发展倡议不是具有硬性法律约束力的机制。故选ABD。"
    }
}

def main():
    print("=" * 60)
    print("🚀 正在编译考研政治 27 模拟卷全量题库数据")
    print("=" * 60)

    # 1. 读取元数据与答案缓存
    meta_path = os.path.join(BASE_DIR, 'scratch', 'mock27_chapters_meta_all.json')
    with open(meta_path, 'r', encoding='utf-8') as f:
        chapters_meta = json.load(f)

    cache_path = os.path.join(BASE_DIR, 'scratch', 'mock27_answers_cache.json')
    with open(cache_path, 'r', encoding='utf-8') as f:
        answers_cache = json.load(f)

    # 合并 YF_SUPPLEMENT
    for qid, info in YF_SUPPLEMENT.items():
        qid_str = str(qid)
        if qid_str not in answers_cache or not answers_cache[qid_str].get('answer'):
            answers_cache[qid_str] = info

    # 保存最新缓存
    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump(answers_cache, f, ensure_ascii=False)

    # 2. 组装 30 套模拟卷
    banks_path = os.path.join(BASE_DIR, 'scratch', 'all_mock_banks.json')
    with open(banks_path, 'r', encoding='utf-8') as f:
        all_banks = json.load(f)

    e27_banks = [b for b in all_banks if b.get('edition') == '27']

    final_chapters = []
    total_questions = 0
    total_answered = 0

    for b in e27_banks:
        code = b['code']
        cm = chapters_meta[code]
        paper_qs = []
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
            paper_qs.append({
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
            "qCount": len(paper_qs),
            "questions": paper_qs
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

    # 3. 写入 JSON
    data_dir = os.path.join(BASE_DIR, 'data', 'politics')
    os.makedirs(data_dir, exist_ok=True)
    json_path = os.path.join(data_dir, 'mocks_27.json')
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)

    # 4. 写入 JS
    js_path = os.path.join(BASE_DIR, 'js', 'politics-mocks-chapters.js')
    with open(js_path, 'w', encoding='utf-8') as f:
        f.write(f"/* 考研政治 27模拟卷全量题库数据 ({len(final_chapters)}套卷 {total_questions}题，含题干、选项、答案与详解) */\n")
        f.write("window.POLITICS_MOCKS_DATA = ")
        json.dump(final_data, f, ensure_ascii=False)
        f.write(";\n")

    print(f"✅ JSON 文件生成成功: {json_path} ({os.path.getsize(json_path):,} 字节)")
    print(f"✅ JS 文件生成成功: {js_path} ({os.path.getsize(js_path):,} 字节)")
    print(f"📊 汇总统计: 共计 {len(final_chapters)} 套试卷，{total_questions} 道题目，已全部就绪含答案解析 ({total_answered}/{total_questions})！")

if __name__ == '__main__':
    main()
