import os
import re
import fitz

doc = fitz.open(r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-马原总-净化打印版.pdf")
print("Total pages in MY:", len(doc))

# Let's inspect page 7 (ch1 p7) and page 15 (ch2 p15)
for pno in [7, 15, 27]:
    txt = doc[pno - 1].get_text()
    lines = [l.strip() for l in txt.split("\n") if l.strip()]
    print(f"\n--- Page {pno} (first 10 non-empty lines) ---")
    for l in lines[:10]:
        print(" ", repr(l))
