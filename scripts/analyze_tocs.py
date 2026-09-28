import json
import re

with open("scripts/pdf_tocs/all_tocs.json", "r", encoding="utf-8") as f:
    data = json.load(f)

for book_id, info in data.items():
    print(f"=== {book_id}: {info['file_name']} ===")
    level_counts = {}
    for item in info["toc"]:
        lvl = item["level"]
        level_counts[lvl] = level_counts.get(lvl, 0) + 1
    print(f"  Total items: {len(info['toc'])}, Level counts: {level_counts}")
    # Print sample entries at each level
    for lvl in sorted(level_counts.keys()):
        samples = [it['title'] for it in info['toc'] if it['level'] == lvl][:3]
        print(f"    L{lvl} samples: {samples}")
