import os
import re
import json
import fitz

BASE_DIR = r"d:\考研题库网站"
DATA_DIR = os.path.join(BASE_DIR, "data", "politics")
NODES_DIR = os.path.join(DATA_DIR, "nodes")
os.makedirs(NODES_DIR, exist_ok=True)

PDF_PATHS = {
    "sg": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-史纲总-净化打印版.pdf",
    "my": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-马原总-净化打印版.pdf",
    "mzt": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-毛中特总-净化打印版.pdf",
    "sx": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-思修总-净化打印版.pdf",
    "xg": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-新思想总-净化打印版.pdf"
}

BOOK_META = {
    "sg": { "id": "sg", "title": "中国近现代史纲要", "shortTitle": "史纲", "order": 1, "summary": "考研政治中央历史时间轴基准学科", "keyPoints": ["旧民主主义革命", "新民主主义革命", "社会主义建设", "改革开放与新时代"] },
    "my": { "id": "my", "title": "马克思主义基本原理", "shortTitle": "马原", "order": 2, "summary": "考研政治哲学与政治经济学基石理论体系", "keyPoints": ["辩证唯物论", "唯物辩证法", "认识论", "唯物史观", "资本主义本质与趋势", "科学社会主义"] },
    "mzt": { "id": "mzt", "title": "毛泽东思想和中国特色社会主义理论体系概论", "shortTitle": "毛中特", "order": 3, "summary": "马克思主义中国化时代化的理论飞跃与历史探索", "keyPoints": ["毛泽东思想", "新民主主义革命理论", "社会主义改造理论", "邓小平理论"] },
    "xs": { "id": "xs", "title": "形势与政策与当代世界经济与政治", "shortTitle": "当代", "order": 4, "summary": "当代世界经济、政治演变趋势与中国特色大国外交", "keyPoints": ["世界多极化", "经济全球化", "大国关系", "人类命运共同体"] },
    "xg": { "id": "xg", "title": "习近平新时代中国特色社会主义思想概论", "shortTitle": "习概", "order": 5, "summary": "当代中国马克思主义、二十一世纪马克思主义的科学体系", "keyPoints": ["两个结合", "中国式现代化", "高质量发展", "全过程人民民主", "全面从严治党"] },
    "sx": { "id": "sx", "title": "思想道德与法治", "shortTitle": "思法", "order": 6, "summary": "青年学子世界观、人生观、价值观与法治素养培育体系", "keyPoints": ["人生观", "理想信念", "中国精神", "社会主义核心价值观", "社会主义道德", "全面依法治国"] }
}

PERIODS = [
    {
        "id": "period-01",
        "title": "旧民主主义革命时期",
        "dateRange": "1840—1919",
        "order": 1,
        "rankStart": 1000,
        "rankEnd": 1999,
        "description": "鸦片战争至五四运动前夕，中国逐步沦为半殖民地半封建社会，农民阶级、地主洋务派、资产阶级维新派与革命派先后探索救国救民道路"
    },
    {
        "id": "period-02",
        "title": "新民主主义革命时期",
        "dateRange": "1919—1949",
        "order": 2,
        "rankStart": 2000,
        "rankEnd": 2999,
        "description": "五四运动至新中国成立，中国共产党诞生并领导中国人民开辟农村包围城市道路，夺取抗日战争和解放战争胜利，建立新中国"
    },
    {
        "id": "period-03",
        "title": "社会主义革命和建设时期",
        "dateRange": "1949—1978",
        "order": 3,
        "rankStart": 3000,
        "rankEnd": 3999,
        "description": "新中国成立、巩固政权、过渡时期总路线与社会主义三大改造完成，全面确立社会主义基本制度并开启建设道路艰辛探索"
    },
    {
        "id": "period-04",
        "title": "改革开放和社会主义现代化建设新时期",
        "dateRange": "1978—2012",
        "order": 4,
        "rankStart": 4000,
        "rankEnd": 4999,
        "description": "中共十一届三中全会实现伟大转折，确立社会主义初级阶段理论与市场经济体制，成功开创、坚持和发展中国特色社会主义"
    },
    {
        "id": "period-05",
        "title": "中国特色社会主义新时代",
        "dateRange": "2012—至今",
        "order": 5,
        "rankStart": 5000,
        "rankEnd": 5999,
        "description": "中共十八大以来，党领导人民推动党和国家事业取得历史性成就、发生历史性变革，以中国式现代化全面推进中华民族伟大复兴"
    }
]

def clean_text(text):
    text = re.sub(r"[\uf000-\uf8ff]", "", text)
    text = re.sub(r"\[公众号.*?\]", "", text)
    text = re.sub(r"公众号.*?[\r\n]", "", text)
    text = re.sub(r"枯藤看天下.*?", "", text)
    text = re.sub(r"枯藤.*?", "", text)
    return text

def parse_importance(title):
    if "超高频" in title or "★" in title or "重点论述" in title or "选+论" in title:
        return 5
    if "重点选择" in title or "重点" in title or "高频" in title or "必考" in title:
        return 4
    if "非重点" in title or "了解" in title or "不常考" in title:
        return 2
    return 3

def clean_point_title(title):
    t = re.sub(r"^考点\s*\d+(?:-\d+)?\s*", "", title)
    t = re.sub(r"^\d+\.\s*", "", t)
    t = re.sub(r"[（\(].*?[）\)]", "", t)
    t = re.sub(r"[【\[].*?[】\]]", "", t)
    t = re.sub(r"[★\(\)]+", "", t)
    return t.strip()

def make_short_title(title):
    t = clean_point_title(title)
    # Strip boilerplate subject prefixes so cards are distinct
    t = re.sub(r"^习近平新时代中国特色社会主义思想(?:的|是)?", "", t)
    t = re.sub(r"^中国特色社会主义理论体系(?:的|是)?", "", t)
    t = re.sub(r"^中国特色社会主义(?:的|是)?", "", t)
    t = re.sub(r"^毛泽东思想(?:的|是)?", "", t)
    t = re.sub(r"^马克思主义(?:基本原理|中国化)?(?:的|是)?", "", t)
    t = re.sub(r"^全面推进", "", t)
    t = re.sub(r"^加快建设", "", t)
    t = re.sub(r"^坚定不移", "", t)
    t = re.sub(r"^坚持和完善", "", t)
    t = re.sub(r"——.*$", "", t)
    t = re.sub(r"：.*$", "", t)
    t = re.sub(r"、.*$", "", t)
    t = t.strip()
    return t[:14] if len(t) > 14 else (t or title[:14])

def extract_point_details(doc, start_page, point_num, point_title, next_point_num=None, book_title=""):
    max_p = min(len(doc), start_page + 2)
    min_p = max(0, start_page - 1)
    combined = []
    for p in range(min_p, max_p):
        combined.append(doc[p].get_text())
    full_text = "\n".join(combined)
    full_text = clean_text(full_text)
    
    pat = rf"考点\s*{re.escape(str(point_num))}\b"
    m = re.search(pat, full_text)
    snippet = ""
    if m:
        sub = full_text[m.end():]
        # Stop at ANY subsequent point or chapter/section boundary
        boundary_m = re.search(r"(?:\n\s*考点\s*\d+|\n\s*第[一二三四五六七八九十百]+[章节])", sub)
        if boundary_m:
            sub = sub[:boundary_m.start()]
        if next_point_num:
            next_pat = rf"考点\s*{re.escape(str(next_point_num))}\b"
            m_next = re.search(next_pat, sub)
            if m_next:
                sub = sub[:m_next.start()]
        snippet = sub.strip()
    else:
        snippet = doc[max(0, start_page - 1)].get_text()
        snippet = clean_text(snippet)
        
    lines = [l.strip() for l in snippet.split("\n") if l.strip() and not l.strip().isdigit()]
    clean_p_title = clean_point_title(point_title)
    if lines and (
        "考点" in lines[0] or
        clean_p_title in lines[0] or
        lines[0] in clean_p_title or
        any(k in lines[0] for k in ["重点选择", "重点论述", "了解", "超高频"])
    ):
        lines = lines[1:]
        
    summary_parts = []
    for l in lines[:6]:
        if not any(marker in l for marker in ["注意", "区分", "陷阱", "提示", "点拨", "切忌"]):
            clean_l = re.sub(r"^[①②③④⑤⑥\d+\.一二三四五（\d+）\s\*\-]+", "", l).strip()
            if clean_l:
                summary_parts.append(clean_l)
            if len("".join(summary_parts)) > 45:
                break
    summary = "；".join(summary_parts)[:140] if summary_parts else ""
    if not summary:
        summary = f"{clean_point_title(point_title)}的理论核心与考点分析"
        
    key_points = []
    for l in lines:
        if re.search(r"^[①②③④⑤⑥\d+\.一二三四五（\d+）]", l) or "：" in l:
            cleaned_l = re.sub(r"^[①②③④⑤⑥\d+\.一二三四五（\d+）\s\*\-]+", "", l).strip()
            if 6 <= len(cleaned_l) <= 75 and cleaned_l not in key_points:
                key_points.append(cleaned_l)
                if len(key_points) >= 3:
                    break
    if not key_points:
        key_points = [summary[:50]]
        
    traps = []
    for idx, l in enumerate(lines):
        if any(w in l for w in ["注意", "区分", "陷阱", "不是", "混淆", "切忌", "根本原因", "重要原因"]):
            trap_text = re.sub(r"^[①②③④⑤⑥\d+\.\s\*\-]+", "", l).strip()
            if len(trap_text) < 15 and idx + 1 < len(lines):
                trap_text += ": " + lines[idx + 1].strip()
            if trap_text not in traps:
                traps.append(trap_text[:120])
                if len(traps) >= 2:
                    break
                    
    tags = []
    if "超高频" in point_title: tags.append("超高频")
    elif "重点论述" in point_title or "选+论" in point_title: tags.extend(["重点论述", "分析题"])
    elif "重点选择" in point_title: tags.append("重点选择")
    elif "了解" in point_title or "非重点" in point_title: tags.append("理解了解")
    else: tags.append("高频考点")
    
    c_title = clean_point_title(point_title)
    for kw, tag in [("革命", "革命史"), ("矛盾", "主要矛盾"), ("制度", "基本制度"), ("现代化", "中国式现代化"), 
                    ("经济", "经济体制"), ("精神", "中国精神"), ("法治", "法治建设"), ("哲学", "哲学原理"),
                    ("唯物", "唯物主义"), ("真理", "真理检验"), ("群众", "群众观点"), ("党", "党的领导")]:
        if kw in c_title and tag not in tags:
            tags.append(tag)

    return {
        "summary": summary,
        "keyPoints": key_points,
        "traps": traps,
        "compare": [],
        "mnemonic": "",
        "sourceRefs": [f"2027徐涛强化班 {book_title} p.{start_page}"],
        "tags": tags
    }

def parse_book_toc(book_id, pdf_path):
    doc = fitz.open(pdf_path)
    toc = doc.get_toc()
    
    chapters = []
    curr_chapter = None
    curr_section = None
    
    chap_idx = 0
    sec_idx = 0
    pt_idx = 0
    
    for idx, (lvl, title, pno) in enumerate(toc):
        t = title.strip()
        
        # Check if book title or part header
        if re.match(r"^第[一二三四五]部分", t):
            continue
            
        # Check point FIRST so that points like "考点 86 法治中国建设的工作布局【见思修-第六章】" are never misclassified as chapters!
        is_point = "考点" in t or bool(re.match(r"^\d+\.", t))
        
        # Check section
        is_section = not is_point and bool(re.search(r"第[一二三四五六七八九十百]+节", t))
        
        # Check chapter
        is_chapter = not is_point and not is_section and bool(
            re.search(r"第[一二三四五六七八九十百]+章", t)
            or ("导论" in t and "节" not in t and "考点" not in t)
            or ("绪" in t and "论" in t and "节" not in t and "考点" not in t)
        )
        
        if is_chapter:
            chap_idx += 1
            sec_idx = 0
            curr_chapter = {
                "idx": chap_idx,
                "title": t,
                "page": pno,
                "sections": []
            }
            chapters.append(curr_chapter)
            curr_section = None
        elif is_section:
            if not curr_chapter:
                chap_idx += 1
                curr_chapter = {
                    "idx": chap_idx,
                    "title": "导论/概述",
                    "page": pno,
                    "sections": []
                }
                chapters.append(curr_chapter)
            sec_idx += 1
            curr_section = {
                "idx": sec_idx,
                "title": t,
                "page": pno,
                "points": []
            }
            curr_chapter["sections"].append(curr_section)
        elif is_point:
            if not curr_chapter:
                chap_idx += 1
                curr_chapter = {
                    "idx": chap_idx,
                    "title": "导论/绪论",
                    "page": pno,
                    "sections": []
                }
                chapters.append(curr_chapter)
            if not curr_section:
                sec_idx += 1
                curr_section = {
                    "idx": sec_idx,
                    "title": "核心考点概览",
                    "page": pno,
                    "points": []
                }
                curr_chapter["sections"].append(curr_section)
            pt_idx += 1
            
            m_num = re.search(r"考点\s*(\d+(?:-\d+)?)", t)
            pt_num = m_num.group(1) if m_num else str(pt_idx)
            
            curr_section["points"].append({
                "raw_title": t,
                "point_num": pt_num,
                "page": pno,
                "index": pt_idx
            })
            
    return doc, chapters

print("Building data structures...")

# 1. Build Periods
periods_path = os.path.join(DATA_DIR, "periods.json")
with open(periods_path, "w", encoding="utf-8") as f:
    json.dump(PERIODS, f, ensure_ascii=False, indent=2)
print("Generated periods.json")

# 2. Build SG (史纲)
doc_sg, sg_chapters = parse_book_toc("sg", PDF_PATHS["sg"])

sg_period_map = {
    1: ("period-01", 1050),
    2: ("period-01", 1400),
    3: ("period-01", 1700),
    4: ("period-02", 2050),
    5: ("period-02", 2300),
    6: ("period-02", 2500),
    7: ("period-02", 2750),
    8: ("period-03", 3050),
    9: ("period-04", 4050)
}

sg_nodes = []
# Book node
sg_nodes.append({
    "id": "pol.sg",
    "bookId": "sg",
    "parentId": None,
    "kind": "book",
    "depth": 0,
    "order": 1,
    "title": "中国近现代史纲要",
    "shortTitle": "史纲",
    "timelineRank": 900,
    "tags": ["主轴", "历史纵深", "中央时间轴"],
    "importance": 5,
    "detail": {
        "summary": "考研政治中央历史时间轴基准学科，贯穿近代以来救国、兴国、强国史实",
        "keyPoints": ["旧民主主义革命", "新民主主义革命", "社会主义革命和建设", "改革开放与中国特色社会主义新时代"],
        "traps": [],
        "compare": [],
        "mnemonic": "",
        "sourceRefs": ["2027徐涛强化班 史纲讲义"]
    }
})

sg_point_id_map = {} # point_num or idx -> node_id
global_pt_count = 0

for c in sg_chapters:
    c_idx = c["idx"]
    cid = f"pol.sg.c{c_idx:02d}"
    period_id, base_rank = sg_period_map.get(c_idx, ("period-01", 1000 + c_idx * 200))
    c_short = make_short_title(c["title"])
    
    rank_cursor = base_rank
    sg_nodes.append({
        "id": cid,
        "bookId": "sg",
        "parentId": "pol.sg",
        "kind": "chapter",
        "depth": 1,
        "order": c_idx,
        "title": c["title"],
        "shortTitle": c_short,
        "periodId": period_id,
        "timelineRank": rank_cursor,
        "tags": ["史纲章节", period_id],
        "importance": 5,
        "detail": {
            "summary": f"{c['title']}的历史方位与关键演进",
            "keyPoints": [s["title"] for s in c["sections"][:3]],
            "traps": [],
            "compare": [],
            "mnemonic": "",
            "sourceRefs": [f"2027徐涛强化班 史纲 p.{c['page']}"]
        }
    })
    
    for s in c["sections"]:
        s_idx = s["idx"]
        sid = f"{cid}.s{s_idx:02d}"
        rank_cursor += 10
        s_rank = rank_cursor
        s_short = make_short_title(s["title"])
        
        sg_nodes.append({
            "id": sid,
            "bookId": "sg",
            "parentId": cid,
            "kind": "section",
            "depth": 2,
            "order": s_idx,
            "title": s["title"],
            "shortTitle": s_short,
            "periodId": period_id,
            "timelineRank": s_rank,
            "tags": ["史纲小节"],
            "importance": 4,
            "detail": {
                "summary": f"{s['title']}的核心史实脉络",
                "keyPoints": [p["raw_title"] for p in s["points"][:3]],
                "traps": [],
                "compare": [],
                "mnemonic": "",
                "sourceRefs": [f"2027徐涛强化班 史纲 p.{s['page']}"]
            }
        })
        
        for p_i, p in enumerate(s["points"], 1):
            global_pt_count += 1
            pid = f"{sid}.p{p['index']:03d}"
            rank_cursor += 2
            p_rank = rank_cursor
            
            # Extract point details
            next_num = s["points"][p_i]["point_num"] if p_i < len(s["points"]) else None
            p_details = extract_point_details(doc_sg, p["page"], p["point_num"], p["raw_title"], next_num, "史纲")
            
            node_detail = {k: v for k, v in p_details.items() if k != "tags"}
            sg_nodes.append({
                "id": pid,
                "bookId": "sg",
                "parentId": sid,
                "kind": "point",
                "depth": 3,
                "order": p_i,
                "title": p["raw_title"],
                "shortTitle": make_short_title(p["raw_title"]),
                "periodId": period_id,
                "timelineRank": p_rank,
                "tags": p_details.get("tags", ["考点"]),
                "importance": parse_importance(p["raw_title"]),
                "detail": node_detail
            })
            sg_point_id_map[p["point_num"]] = pid
            sg_point_id_map[p["index"]] = pid

# Add SG Chapter 10 (中国特色社会主义新时代 - period-05) to complete the 5th period timeline
c10_id = "pol.sg.c10"
s10_id = "pol.sg.c10.s01"
sg_nodes.append({
    "id": c10_id,
    "bookId": "sg",
    "parentId": "pol.sg",
    "kind": "chapter",
    "depth": 1,
    "order": 10,
    "title": "第十章 中国特色社会主义进入新时代",
    "shortTitle": "新时代伟大变革",
    "periodId": "period-05",
    "timelineRank": 5050,
    "tags": ["史纲章节", "period-05", "新时代"],
    "importance": 5,
    "detail": {
        "summary": "中共十八大以来中国特色社会主义进入新时代的历史方位、伟大成就与历史性变革",
        "keyPoints": ["新时代十年的伟大变革", "以中国式现代化全面推进中华民族伟大复兴", "新时代推进全面从严治党与自我革命"],
        "traps": ["区分新时代社会主要矛盾的转化并未改变我国仍处于社会主义初级阶段的基本国情"],
        "compare": [],
        "mnemonic": "",
        "sourceRefs": ["2027徐涛强化班 史纲讲义/新思想贯通"]
    }
})

sg_nodes.append({
    "id": s10_id,
    "bookId": "sg",
    "parentId": c10_id,
    "kind": "section",
    "depth": 2,
    "order": 1,
    "title": "第一节 开创和发展中国特色社会主义新时代",
    "shortTitle": "开创发展新时代",
    "periodId": "period-05",
    "timelineRank": 5060,
    "tags": ["史纲小节", "period-05"],
    "importance": 4,
    "detail": {
        "summary": "新时代十年的战略部署与历史性伟大变革",
        "keyPoints": ["十八大以来的历史性成就", "新时代十年的伟大变革", "中国式现代化的推进"],
        "traps": [],
        "compare": [],
        "mnemonic": "",
        "sourceRefs": ["2027徐涛强化班 史纲讲义/新思想贯通"]
    }
})

sg_c10_points = [
    {
        "title": "考点112 中共十八大以来的历史性成就与历史性变革（超高频）",
        "shortTitle": "新时代成就与变革",
        "rank": 5100,
        "tags": ["超高频", "新时代成就", "十八大以来"],
        "importance": 5,
        "detail": {
            "summary": "中共十八大以来，党和国家事业取得历史性成就、发生历史性变革，推动我国迈上全面建设社会主义现代化国家新征程",
            "keyPoints": [
                "解决了许多长期想解决而没有解决的难题，办成了许多过去想办而没有办成的大事",
                "经济实力、科技实力、综合国力跃上新台阶，进入创新型国家行列",
                "历史性地解决了绝对贫困问题，如期全面建成小康社会"
            ],
            "traps": ["注意区分社会主要矛盾的转化并未改变我国仍处于社会主义初级阶段的基本国情"],
            "compare": [],
            "mnemonic": "",
            "sourceRefs": ["2027徐涛强化班 史纲讲义/新思想贯通"]
        }
    },
    {
        "title": "考点113 新时代十年的伟大变革及其里程碑意义（重点论述）",
        "shortTitle": "十年伟大变革",
        "rank": 5200,
        "tags": ["重点论述", "伟大变革", "里程碑意义"],
        "importance": 5,
        "detail": {
            "summary": "新时代十年的伟大变革，在党史、新中国史、改革开放史、社会主义发展史、中华民族发展史上具有里程碑意义",
            "keyPoints": [
                "锻造了走在时代前列的中国共产党，显著增强了党的政治领导力、思想引领力、群众组织力",
                "中国人民焕发出更为强烈的历史自觉和主动精神",
                "实现了马克思主义中国化时代化新的飞跃，中国特色社会主义展现出强大生机活力"
            ],
            "traps": ["伟大变革不仅具有国内历史意义，还在科学社会主义和世界现代化史上具有深远全球影响"],
            "compare": [],
            "mnemonic": "",
            "sourceRefs": ["2027徐涛强化班 史纲讲义/新思想贯通"]
        }
    },
    {
        "title": "考点114 以中国式现代化全面推进中华民族伟大复兴（超高频）",
        "shortTitle": "中国式现代化道路",
        "rank": 5300,
        "tags": ["超高频", "中国式现代化", "民族复兴"],
        "importance": 5,
        "detail": {
            "summary": "以中国式现代化全面推进中华民族伟大复兴，开创了人类文明新形态，拓展了发展中国家走向现代化的途径",
            "keyPoints": [
                "中国式现代化是人口规模巨大的现代化、全体人民共同富裕的现代化",
                "物质文明和精神文明相协调、人与自然和谐共生的现代化",
                "走和平发展道路的现代化"
            ],
            "traps": ["中国式现代化既有各国现代化的共同特征，更有基于自己国情的中国特色"],
            "compare": [],
            "mnemonic": "",
            "sourceRefs": ["2027徐涛强化班 史纲讲义/新思想贯通"]
        }
    },
    {
        "title": "考点115 新时代推进全面从严治党与自我革命（重点论述）",
        "shortTitle": "全面从严治党",
        "rank": 5400,
        "tags": ["重点论述", "自我革命", "从严治党"],
        "importance": 5,
        "detail": {
            "summary": "勇于自我革命是中国共产党区别于其他政党的显著标志，全面从严治党是新时代党的自我革命的伟大实践",
            "keyPoints": [
                "找到了自我革命这一跳出治乱兴衰历史周期率的第二个答案",
                "全面加强党的领导，把党的政治建设摆在首位",
                "持之以恒正风肃纪，以零容忍态度反腐惩恶"
            ],
            "traps": ["区分跳出历史周期率的“第一个答案（毛泽东：民主）”与“第二个答案（自我革命）”"],
            "compare": [],
            "mnemonic": "",
            "sourceRefs": ["2027徐涛强化班 史纲讲义/新思想贯通"]
        }
    }
]

for p_i, p in enumerate(sg_c10_points, 1):
    pid = f"{s10_id}.p{108 + p_i:03d}"
    sg_nodes.append({
        "id": pid,
        "bookId": "sg",
        "parentId": s10_id,
        "kind": "point",
        "depth": 3,
        "order": p_i,
        "title": p["title"],
        "shortTitle": p["shortTitle"],
        "periodId": "period-05",
        "timelineRank": p["rank"],
        "tags": p["tags"],
        "importance": p["importance"],
        "detail": p["detail"]
    })
    sg_point_id_map[str(111 + p_i)] = pid

print(f"Generated {len(sg_nodes)} nodes for SG (史纲). Point map keys: {len(sg_point_id_map)}")

sg_path = os.path.join(NODES_DIR, "sg.json")
with open(sg_path, "w", encoding="utf-8") as f:
    json.dump(sg_nodes, f, ensure_ascii=False, indent=2)

# Helper to find closest SG point by target rank
def find_sg_anchor(target_rank):
    best_id = None
    best_diff = 999999
    for n in sg_nodes:
        if n["kind"] == "point":
            diff = abs(n["timelineRank"] - target_rank)
            if diff < best_diff:
                best_diff = diff
                best_id = n["id"]
    return best_id

# 3. Build Non-SG Books
def build_subject_nodes(book_id, pdf_path, chapter_rank_anchors):
    doc, chapters = parse_book_toc(book_id, pdf_path)
    meta = BOOK_META[book_id]
    
    nodes = []
    # Book node
    book_node_id = f"pol.{book_id}"
    nodes.append({
        "id": book_node_id,
        "bookId": book_id,
        "parentId": None,
        "kind": "book",
        "depth": 0,
        "order": meta["order"],
        "title": meta["title"],
        "shortTitle": meta["shortTitle"],
        "tags": [meta["shortTitle"], "学科主干"],
        "importance": 5,
        "detail": {
            "summary": meta["summary"],
            "keyPoints": meta["keyPoints"],
            "traps": [],
            "compare": [],
            "mnemonic": "",
            "sourceRefs": [f"2027徐涛强化班 {meta['shortTitle']}讲义"]
        }
    })
    
    for c in chapters:
        c_idx = c["idx"]
        cid = f"pol.{book_id}.c{c_idx:02d}"
        c_short = make_short_title(c["title"])
        
        # Get target anchor rank for chapter
        target_sg_rank = chapter_rank_anchors.get(c_idx, 2000 + c_idx * 150)
        default_anchor = find_sg_anchor(target_sg_rank)
        
        nodes.append({
            "id": cid,
            "bookId": book_id,
            "parentId": book_node_id,
            "kind": "chapter",
            "depth": 1,
            "order": c_idx,
            "title": c["title"],
            "shortTitle": c_short,
            "tags": [meta["shortTitle"], "章节"],
            "importance": 5,
            "detail": {
                "summary": f"{c['title']}的科学体系与考点构架",
                "keyPoints": [s["title"] for s in c["sections"][:3]],
                "traps": [],
                "compare": [],
                "mnemonic": "",
                "sourceRefs": [f"2027徐涛强化班 {meta['shortTitle']} p.{c['page']}"]
            }
        })
        
        for s in c["sections"]:
            s_idx = s["idx"]
            sid = f"{cid}.s{s_idx:02d}"
            s_short = make_short_title(s["title"])
            
            nodes.append({
                "id": sid,
                "bookId": book_id,
                "parentId": cid,
                "kind": "section",
                "depth": 2,
                "order": s_idx,
                "title": s["title"],
                "shortTitle": s_short,
                "tags": [meta["shortTitle"], "小节"],
                "importance": 4,
                "detail": {
                    "summary": f"{s['title']}的核心考点与知识要点",
                    "keyPoints": [p["raw_title"] for p in s["points"][:3]],
                    "traps": [],
                    "compare": [],
                    "mnemonic": "",
                    "sourceRefs": [f"2027徐涛强化班 {meta['shortTitle']} p.{s['page']}"]
                }
            })
            
            for p_i, p in enumerate(s["points"], 1):
                pid = f"{sid}.p{p['index']:03d}"
                next_num = s["points"][p_i]["point_num"] if p_i < len(s["points"]) else None
                p_details = extract_point_details(doc, p["page"], p["point_num"], p["raw_title"], next_num, meta["shortTitle"])
                
                # Anchor key points
                anchors = []
                if default_anchor:
                    anchors = [default_anchor]
                    
                node_detail = {k: v for k, v in p_details.items() if k != "tags"}
                nodes.append({
                    "id": pid,
                    "bookId": book_id,
                    "parentId": sid,
                    "kind": "point",
                    "depth": 3,
                    "order": p_i,
                    "title": p["raw_title"],
                    "shortTitle": make_short_title(p["raw_title"]),
                    "layoutAnchorIds": anchors,
                    "tags": p_details.get("tags", ["考点"]),
                    "importance": parse_importance(p["raw_title"]),
                    "detail": node_detail
                })
                
    out_path = os.path.join(NODES_DIR, f"{book_id}.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(nodes, f, ensure_ascii=False, indent=2)
    print(f"Generated {len(nodes)} nodes for {book_id.upper()} at {out_path}")
    return nodes

# Define chronological target ranks for each book's chapters
# SG timeline: 1050 (1840) -> 2050 (1919) -> 3050 (1949) -> 4050 (1978) -> 5100-5400 (2012+)
my_chapter_anchors = {
    1: 1100, # 导论: 创立于1840年代工业革命
    2: 1150, # 辩证唯物论
    3: 1300, # 唯物辩证法: 内外因分析
    4: 1500, # 认识论: 早期救亡实践
    5: 2100, # 唯物史观: 五四工人阶级登场
    6: 2200, # 资本主义本质: 帝国主义侵略
    7: 2600, # 资本主义趋势: 二战与世界格局
    8: 3200, # 科学社会主义: 制度建立
    9: 4100  # 共产主义理想: 共同理想
}

mzt_chapter_anchors = {
    1: 2100, # 导论: 马克思主义中国化飞跃 (五四/建党)
    2: 2200, # 毛泽东思想历史地位 (大革命到延安)
    3: 2400, # 新民主主义革命理论 (农村包围城市)
    4: 3100, # 社会主义改造理论 (1949-1956)
    5: 3500, # 初步探索成果 (1956-1976)
    6: 4100, # 中特理论体系形成 (1978-)
    7: 4300  # 邓小平理论 (1982-1992)
}

sx_chapter_anchors = {
    1: 2100, # 绪论: 时代新人 (五四爱国青年)
    2: 2150, # 人生观 (五四青年的人生追求)
    3: 2250, # 理想信念 (早期共产党人革命理想)
    4: 2650, # 中国精神 (伟大抗战精神)
    5: 4200, # 核心价值观 (改革开放精神文明)
    6: 2450, # 道德规范 (长征精神与革命道德)
    7: 3150  # 法治思想 (新中国法制奠基)
}

xg_chapter_anchors = {
    1: 5050,  # 导论 (新时代历史方位)
    2: 5080,  # 新时代坚持和发展中特
    3: 5120,  # 中国式现代化
    4: 5150,  # 党的全面领导
    5: 5180,  # 坚持以人民为中心
    6: 5200,  # 全面深化改革开放
    7: 5220,  # 高质量发展
    8: 5240,  # 教育科技人才战略
    9: 5260,  # 全过程人民民主
    10: 5280, # 全面依法治国
    11: 5300, # 文化强国
    12: 5320, # 保障改善民生
    13: 5340, # 生态文明
    14: 5360, # 国家安全
    15: 5380, # 强大军队
    16: 5400, # 一国两制
    17: 5420, # 大国外交
    18: 5450  # 全面从严治党
}

my_nodes = build_subject_nodes("my", PDF_PATHS["my"], my_chapter_anchors)
mzt_nodes = build_subject_nodes("mzt", PDF_PATHS["mzt"], mzt_chapter_anchors)
sx_nodes = build_subject_nodes("sx", PDF_PATHS["sx"], sx_chapter_anchors)
xg_nodes = build_subject_nodes("xg", PDF_PATHS["xg"], xg_chapter_anchors)

# 4. Build XS (当代 - 国际格局与大国外交)
xs_nodes = [
    {
        "id": "pol.xs",
        "bookId": "xs",
        "parentId": None,
        "kind": "book",
        "depth": 0,
        "order": 4,
        "title": "形势与政策与当代世界经济与政治",
        "shortTitle": "当代",
        "tags": ["国际格局", "全球治理", "大国关系"],
        "importance": 4,
        "detail": {
            "summary": "当代世界经济、政治演变趋势与中国外交战略方针",
            "keyPoints": ["多极化趋势", "经济全球化", "人类命运共同体"],
            "traps": [],
            "compare": [],
            "mnemonic": "",
            "sourceRefs": ["2027徐涛强化班 当代讲义"]
        }
    },
    {
        "id": "pol.xs.c01",
        "bookId": "xs",
        "parentId": "pol.xs",
        "kind": "chapter",
        "depth": 1,
        "order": 1,
        "title": "经济全球化与世界多极化",
        "shortTitle": "国际格局演进",
        "tags": ["百年变局", "多极化", "经济治理"],
        "importance": 4,
        "detail": {
            "summary": "冷战后国际战略格局的重大调整与新兴市场国家群体的崛起",
            "keyPoints": ["多极化不可逆转", "经济全球化曲折发展", "百年未有之大变局"],
            "traps": [],
            "compare": [],
            "mnemonic": "",
            "sourceRefs": ["2027徐涛强化班 当代 p.1"]
        }
    },
    {
        "id": "pol.xs.c01.s01",
        "bookId": "xs",
        "parentId": "pol.xs.c01",
        "kind": "section",
        "depth": 2,
        "order": 1,
        "title": "当代国际格局的演进",
        "shortTitle": "国际秩序与格局",
        "tags": ["霸权主义", "国际多极化"],
        "importance": 4,
        "detail": {
            "summary": "从近代殖民霸权秩序向平等有序的世界多极化演进",
            "keyPoints": ["殖民体系的瓦解", "冷战及其终结", "真正多边主义"],
            "traps": [],
            "compare": [],
            "mnemonic": "",
            "sourceRefs": ["2027徐涛强化班 当代 p.2"]
        }
    },
    {
        "id": "pol.xs.c01.s01.p001",
        "bookId": "xs",
        "parentId": "pol.xs.c01.s01",
        "kind": "point",
        "depth": 3,
        "order": 1,
        "title": "百年未有之大变局与国际秩序",
        "shortTitle": "百年未有之大变局",
        "layoutAnchorIds": ["pol.sg.c10.s01.p109"], # anchor to SG new era point
        "tags": ["百年变局", "东升西降", "多边主义"],
        "importance": 4,
        "detail": {
            "summary": "国际力量对比发生深刻变化，东升西降是大势所趋，推进国际关系民主化",
            "keyPoints": ["大变局的核心特征", "新兴经济体群体性崛起", "反对霸权主义和强权政治"],
            "traps": ["区分百年变局与世纪疫情的交织影响，认清霸权主义仍是世界和平主要威胁"],
            "compare": [],
            "mnemonic": "",
            "sourceRefs": ["2027徐涛强化班 当代 p.3"]
        }
    }
]

xs_path = os.path.join(NODES_DIR, "xs.json")
with open(xs_path, "w", encoding="utf-8") as f:
    json.dump(xs_nodes, f, ensure_ascii=False, indent=2)
print("Generated xs.json")

# 5. Build Cross-Subject Relations
def get_first_point(node_list, chap_idx):
    cid = f"{node_list[0]['id']}.c{chap_idx:02d}"
    for n in node_list:
        if n["kind"] == "point" and n["parentId"].startswith(cid):
            return n["id"]
    return None

sg_c01_p = get_first_point(sg_nodes, 1) or sg_nodes[3]["id"]
sg_c02_p = get_first_point(sg_nodes, 2) or sg_nodes[3]["id"]
sg_c04_p = get_first_point(sg_nodes, 4) or sg_nodes[3]["id"]
sg_c05_p = get_first_point(sg_nodes, 5) or sg_nodes[3]["id"]
sg_c06_p = get_first_point(sg_nodes, 6) or sg_nodes[3]["id"]
sg_c08_p = get_first_point(sg_nodes, 8) or sg_nodes[3]["id"]
sg_c09_p = get_first_point(sg_nodes, 9) or sg_nodes[3]["id"]
sg_c10_p = "pol.sg.c10.s01.p109"

my_c01_p = get_first_point(my_nodes, 1) or my_nodes[3]["id"]
my_c02_p = get_first_point(my_nodes, 2) or my_nodes[3]["id"]
my_c03_p = get_first_point(my_nodes, 3) or my_nodes[3]["id"]
my_c04_p = get_first_point(my_nodes, 4) or my_nodes[3]["id"]
my_c05_p = get_first_point(my_nodes, 5) or my_nodes[3]["id"]

mzt_c01_p = get_first_point(mzt_nodes, 1) or mzt_nodes[3]["id"]
mzt_c02_p = get_first_point(mzt_nodes, 2) or mzt_nodes[3]["id"]
mzt_c03_p = get_first_point(mzt_nodes, 3) or mzt_nodes[3]["id"]
mzt_c04_p = get_first_point(mzt_nodes, 4) or mzt_nodes[3]["id"]
mzt_c06_p = get_first_point(mzt_nodes, 6) or mzt_nodes[3]["id"]

xg_c01_p = get_first_point(xg_nodes, 1) or xg_nodes[3]["id"]
xg_c02_p = get_first_point(xg_nodes, 2) or xg_nodes[3]["id"]
xg_c03_p = get_first_point(xg_nodes, 3) or xg_nodes[3]["id"]
xg_c04_p = get_first_point(xg_nodes, 4) or xg_nodes[3]["id"]
xg_c05_p = get_first_point(xg_nodes, 5) or xg_nodes[3]["id"]
xg_c10_p = get_first_point(xg_nodes, 10) or xg_nodes[3]["id"]

sx_c01_p = get_first_point(sx_nodes, 1) or sx_nodes[3]["id"]
sx_c02_p = get_first_point(sx_nodes, 2) or sx_nodes[3]["id"]
sx_c03_p = get_first_point(sx_nodes, 3) or sx_nodes[3]["id"]
sx_c04_p = get_first_point(sx_nodes, 4) or sx_nodes[3]["id"]
sx_c07_p = get_first_point(sx_nodes, 7) or sx_nodes[3]["id"]

relations = [
    {
        "id": "rel-000001",
        "source": my_c03_p,
        "target": sg_c01_p,
        "type": "theory_application",
        "label": "理论应用",
        "directed": False,
        "strength": 1,
        "visibility": "context",
        "meta": { "note": "反侵略战争失败根本原因在社会制度腐败（内因），印证内因为事物变化根据之唯物辩证法原理" }
    },
    {
        "id": "rel-000002",
        "source": my_c05_p,
        "target": sg_c02_p,
        "type": "historical_context",
        "label": "历史印证",
        "directed": False,
        "strength": 1,
        "visibility": "context",
        "meta": { "note": "太平天国农民起义印证了阶级斗争是阶级对立社会发展的直接动力" }
    },
    {
        "id": "rel-000003",
        "source": mzt_c01_p,
        "target": sg_c04_p,
        "type": "evolution",
        "label": "理论演变",
        "directed": False,
        "strength": 1,
        "visibility": "context",
        "meta": { "note": "马克思主义在中国的早期传播为毛泽东思想的萌芽和第一次历史性飞跃奠定理论基础" }
    },
    {
        "id": "rel-000004",
        "source": mzt_c03_p,
        "target": sg_c01_p,
        "type": "cause",
        "label": "因果溯源",
        "directed": False,
        "strength": 1,
        "visibility": "context",
        "meta": { "note": "列强对华武装侵略使中国沦为半殖民地，决定了帝国主义是新民主主义革命的首要对象" }
    },
    {
        "id": "rel-000005",
        "source": my_c05_p,
        "target": sg_c04_p,
        "type": "theory_application",
        "label": "群众主体",
        "directed": False,
        "strength": 1,
        "visibility": "context",
        "meta": { "note": "五四运动中中国工人阶级登上历史舞台，展现了人民群众创造历史的唯物史观力量" }
    },
    {
        "id": "rel-000006",
        "source": my_c04_p,
        "target": sg_c09_p,
        "type": "theory_application",
        "label": "真理标准",
        "directed": False,
        "strength": 1,
        "visibility": "context",
        "meta": { "note": "1978年关于真理标准问题的讨论，生动践行了实践是检验真理的唯一标准认识论原理" }
    },
    {
        "id": "rel-000007",
        "source": mzt_c04_p,
        "target": sg_c08_p,
        "type": "historical_context",
        "label": "制度奠基",
        "directed": False,
        "strength": 1,
        "visibility": "context",
        "meta": { "note": "社会主义改造的顺利完成确立了社会主义基本经济政治制度，为当代中国一切发展奠基" }
    },
    {
        "id": "rel-000008",
        "source": mzt_c06_p,
        "target": sg_c09_p,
        "type": "evolution",
        "label": "理论创新",
        "directed": False,
        "strength": 1,
        "visibility": "context",
        "meta": { "note": "邓小平南方谈话推动了社会主义市场经济体制的建立与改革开放新高潮" }
    },
    {
        "id": "rel-000009",
        "source": xg_c02_p,
        "target": sg_c10_p,
        "type": "evolution",
        "label": "时代飞跃",
        "directed": False,
        "strength": 1,
        "visibility": "context",
        "meta": { "note": "新时代伟大变革实现了马克思主义中国化时代化新的历史性飞跃" }
    },
    {
        "id": "rel-000010",
        "source": xg_c05_p,
        "target": my_c05_p,
        "type": "theory_application",
        "label": "人民至上",
        "directed": False,
        "strength": 1,
        "visibility": "context",
        "meta": { "note": "坚持以人民为中心的发展思想是对唯物史观人民主体地位的创新升华" }
    },
    {
        "id": "rel-000011",
        "source": sx_c02_p,
        "target": sg_c04_p,
        "type": "historical_context",
        "label": "理想传承",
        "directed": False,
        "strength": 1,
        "visibility": "context",
        "meta": { "note": "五四青年把个人前途与拯救民族危亡紧密结合，生动诠释了个人理想与社会理想的高度统一" }
    },
    {
        "id": "rel-000012",
        "source": sx_c04_p,
        "target": sg_c06_p,
        "type": "historical_context",
        "label": "精神弘扬",
        "directed": False,
        "strength": 1,
        "visibility": "context",
        "meta": { "note": "全民族抗战铸就的伟大抗战精神是中国精神在抗战时期的最高升华" }
    },
    {
        "id": "rel-000013",
        "source": "pol.xs.c01.s01.p001",
        "target": sg_c01_p,
        "type": "compare",
        "label": "秩序演进",
        "directed": False,
        "strength": 1,
        "visibility": "context",
        "meta": { "note": "从近代西方殖民霸权秩序，到当代百年未有之大变局下推动平等有序的世界多极化" }
    },
    {
        "id": "rel-000014",
        "source": xg_c03_p,
        "target": "pol.sg.c10.s01.p111",
        "type": "evolution",
        "label": "现代化推进",
        "directed": False,
        "strength": 1,
        "visibility": "context",
        "meta": { "note": "以中国式现代化全面推进中华民族伟大复兴，开创人类文明新形态" }
    },
    {
        "id": "rel-000015",
        "source": sx_c07_p,
        "target": xg_c10_p,
        "type": "theory_application",
        "label": "法治思想",
        "directed": False,
        "strength": 1,
        "visibility": "context",
        "meta": { "note": "思法法治素养培育与习近平法治思想的科学体系紧密对接，指引全面依法治国实践" }
    }
]

rel_path = os.path.join(DATA_DIR, "relations.json")
with open(rel_path, "w", encoding="utf-8") as f:
    json.dump(relations, f, ensure_ascii=False, indent=2)
print(f"Generated relations.json with {len(relations)} relations.")

print("\nALL CANONICAL DATA GENERATED SUCCESSFULLY!")
