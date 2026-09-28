import json
import re

with open("scripts/pdf_tocs/all_tocs.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for book_id in ["sg", "my", "mzt", "sx", "xg"]:
    info = data[book_id]
    toc = info["toc"]
    print(f"\n=================== {book_id}: {info['file_name']} ===================")
    
    # Identify chapters and sections
    chapters = []
    curr_chapter = None
    curr_section = None
    
    for item in toc:
        title = item["title"]
        lvl = item["level"]
        pno = item["page"]
        
        # Check if chapter
        is_chap = False
        if re.search(r"第[一二三四五六七八九十百]+章", title) or "导论" in title or "绪 论" in title or "绪论" in title:
            # Check it's not a subsection
            if not re.search(r"第[一二三四五六七八九十百]+节", title) and not "考点" in title:
                is_chap = True
                
        is_sec = False
        if re.search(r"第[一二三四五六七八九十百]+节", title):
            is_sec = True
            
        is_pt = "考点" in title or re.search(r"^\d+\.", title)
        
        if is_chap:
            curr_chapter = {"title": title, "page": pno, "sections": []}
            chapters.append(curr_chapter)
            curr_section = None
        elif is_sec:
            curr_section = {"title": title, "page": pno, "points": []}
            if curr_chapter:
                curr_chapter["sections"].append(curr_section)
            else:
                # Top level section before any chapter
                curr_chapter = {"title": "导论/绪论", "page": pno, "sections": [curr_section]}
                chapters.append(curr_chapter)
        elif is_pt:
            if curr_section:
                curr_section["points"].append({"title": title, "page": pno})
            elif curr_chapter:
                # Chapter has points directly
                if not curr_chapter["sections"]:
                    curr_section = {"title": "核心考点", "page": pno, "points": []}
                    curr_chapter["sections"].append(curr_section)
                curr_chapter["sections"][-1]["points"].append({"title": title, "page": pno})
    
    print(f"Parsed {len(chapters)} chapters:")
    total_pts = 0
    for idx, c in enumerate(chapters, 1):
        c_pts = sum(len(s["points"]) for s in c["sections"])
        total_pts += c_pts
        sec_titles = [s["title"][:15] for s in c["sections"]]
        print(f"  Ch{idx}: {c['title'][:25]} -> {len(c['sections'])} sections, {c_pts} points ({sec_titles})")
    print(f"Total points parsed: {total_pts}")
