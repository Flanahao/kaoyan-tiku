import os
import json
import fitz

files = {
    "my": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-马原总-净化打印版.pdf",
    "mzt": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-毛中特总-净化打印版.pdf",
    "sg": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-史纲总-净化打印版.pdf",
    "sx": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-思修总-净化打印版.pdf",
    "xg": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-新思想总-净化打印版.pdf"
}

out_dir = r"d:\考研题库网站\scripts\pdf_tocs"
os.makedirs(out_dir, exist_ok=True)

all_tocs = {}

for book_id, path in files.items():
    doc = fitz.open(path)
    toc = doc.get_toc() # list of [lvl, title, pno]
    all_tocs[book_id] = {
        "book_id": book_id,
        "file_name": os.path.basename(path),
        "pages": len(doc),
        "toc_count": len(toc),
        "toc": [{"level": item[0], "title": item[1].strip(), "page": item[2]} for item in toc]
    }
    # Write individual txt for easy human inspection
    txt_path = os.path.join(out_dir, f"{book_id}_toc.txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(f"=== {book_id}: {os.path.basename(path)} ({len(doc)} pages, {len(toc)} TOC entries) ===\n\n")
        for item in toc:
            indent = "  " * (item[0] - 1)
            f.write(f"{indent}L{item[0]}: {item[1].strip()} (p.{item[2]})\n")
    print(f"Exported {book_id}: {len(toc)} TOC entries to {txt_path}")

json_path = os.path.join(out_dir, "all_tocs.json")
with open(json_path, "w", encoding="utf-8") as f:
    json.dump(all_tocs, f, ensure_ascii=False, indent=2)

print(f"Exported all TOCs to {json_path}")
