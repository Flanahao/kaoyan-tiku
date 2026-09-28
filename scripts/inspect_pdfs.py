import os
import fitz

files = [
    r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-马原总-净化打印版.pdf",
    r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-毛中特总-净化打印版.pdf",
    r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-史纲总-净化打印版.pdf",
    r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-思修总-净化打印版.pdf",
    r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-新思想总-净化打印版.pdf"
]

for f in files:
    name = os.path.basename(f)
    if not os.path.exists(f):
        print(f"File NOT found: {name}")
        continue
    doc = fitz.open(f)
    toc = doc.get_toc()
    print(f"=== {name} ===")
    print(f"Pages: {len(doc)}, TOC entries: {len(toc)}")
    if toc:
        for item in toc[:15]:
            print(f"  Level {item[0]}: {item[1]} (p.{item[2]})")
        if len(toc) > 15:
            print(f"  ... and {len(toc)-15} more TOC entries")
    else:
        print("  (No PDF bookmarks found)")
        # Show sample text from first 3 pages
        for pno in range(min(3, len(doc))):
            text = doc[pno].get_text().strip()
            first_lines = text.split("\n")[:5]
            print(f"  Page {pno+1} preview: {' / '.join(first_lines)}")
