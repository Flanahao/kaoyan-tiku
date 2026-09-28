import re
import fitz

def parse_book_toc(book_id, pdf_path):
    doc = fitz.open(pdf_path)
    toc = doc.get_toc() # [lvl, title, pno]
    
    chapters = []
    curr_chapter = None
    curr_section = None
    
    chap_idx = 0
    sec_idx = 0
    pt_idx = 0
    
    for idx, (lvl, title, pno) in enumerate(toc):
        t = title.strip()
        
        # Check if book title
        if re.match(r"^第[一二三四五]部分", t):
            continue
            
        # Check chapter
        is_chapter = False
        if re.search(r"第[一二三四五六七八九十百]+章", t) or ("导论" in t and "节" not in t and "考点" not in t) or ("绪" in t and "论" in t and "节" not in t and "考点" not in t):
            is_chapter = True
            
        # Check section
        is_section = False
        if re.search(r"第[一二三四五六七八九十百]+节", t):
            is_section = True
            
        # Check point
        is_point = "考点" in t or re.search(r"^\d+\.", t)
        
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
            
            # Extract point number if any
            m_num = re.search(r"考点\s*(\d+(?:-\d+)?)", t)
            pt_num = m_num.group(1) if m_num else str(pt_idx)
            
            curr_section["points"].append({
                "raw_title": t,
                "point_num": pt_num,
                "page": pno,
                "index": pt_idx
            })
            
    return chapters

PDF_PATHS = {
    "sg": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-史纲总-净化打印版.pdf",
    "my": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-马原总-净化打印版.pdf",
    "mzt": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-毛中特总-净化打印版.pdf",
    "sx": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-思修总-净化打印版.pdf",
    "xg": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-新思想总-净化打印版.pdf"
}

with open("scripts/tree_walk_result.txt", "w", encoding="utf-8") as out_f:
    for bid, path in PDF_PATHS.items():
        chaps = parse_book_toc(bid, path)
        total_p = sum(sum(len(s["points"]) for s in c["sections"]) for c in chaps)
        total_s = sum(len(c["sections"]) for c in chaps)
        out_f.write(f"\n=== {bid} ({len(chaps)} chaps, {total_s} secs, {total_p} points) ===\n")
        for c in chaps:
            out_f.write(f"  Ch{c['idx']}: {c['title']} (p.{c['page']})\n")
            for s in c["sections"]:
                out_f.write(f"    Sec{s['idx']}: {s['title']} ({len(s['points'])} pts, p.{s['page']})\n")

print("Tree walk test finished, wrote to scripts/tree_walk_result.txt")
