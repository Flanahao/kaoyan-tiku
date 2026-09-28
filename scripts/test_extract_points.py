import os
import re
import fitz

def test_extract_points(book_id, pdf_path):
    doc = fitz.open(pdf_path)
    toc = doc.get_toc()
    print(f"\n=================== {book_id} ===================")
    print(f"Total pages: {len(doc)}, TOC entries: {len(toc)}")
    
    # Find all point-like TOC entries
    points = []
    for item in toc:
        lvl, title, pno = item
        # Match '考点' or similar
        m = re.search(r"考点\s*(\d+(?:-\d+)?)[\s:：]*(.*)", title)
        if m:
            points.append({
                "num": m.group(1),
                "title": m.group(2).strip(),
                "raw_title": title,
                "page": pno
            })
    print(f"Identified {len(points)} points in {book_id}")
    if points:
        p0 = points[0]
        print(f"First point: 考点{p0['num']} {p0['title']} (p.{p0['page']})")
        # Extract page text
        txt = doc[p0['page'] - 1].get_text()
        clean_lines = [l.strip() for l in txt.split('\n') if l.strip()]
        print("Page preview snippet:")
        for l in clean_lines[:8]:
            print(f"  {l}")

files = {
    "sg": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-史纲总-净化打印版.pdf",
    "my": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-马原总-净化打印版.pdf",
    "mzt": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-毛中特总-净化打印版.pdf",
    "sx": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-思修总-净化打印版.pdf",
    "xg": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-新思想总-净化打印版.pdf"
}

with open("scripts/extract_points_summary.txt", "w", encoding="utf-8") as out_f:
    for bid, p in files.items():
        doc = fitz.open(p)
        toc = doc.get_toc()
        out_f.write(f"\n=================== {bid}: {os.path.basename(p)} ===================\n")
        out_f.write(f"Pages: {len(doc)}, TOC: {len(toc)}\n")
        for lvl, title, pno in toc:
            out_f.write(f"{'  '*lvl}[L{lvl}] {title} (p.{pno})\n")

print("Dumped complete raw TOC hierarchy to scripts/extract_points_summary.txt")
