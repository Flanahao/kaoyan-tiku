import os
import re
import fitz

def clean_text(text):
    # Remove weird font private-use icons
    text = re.sub(r"[\uf000-\uf8ff]", "", text)
    # Remove watermarks
    text = re.sub(r"\[公众号.*?\]", "", text)
    text = re.sub(r"公众号.*?[\r\n]", "", text)
    text = re.sub(r"枯藤看天下", "", text)
    return text

doc = fitz.open(r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-史纲总-净化打印版.pdf")

# Test extracting point 13 & 14 (p.7)
txt = clean_text(doc[6].get_text()) # page 7
lines = [l.strip() for l in txt.split("\n") if l.strip()]

with open("scripts/test_p7_clean.txt", "w", encoding="utf-8") as f:
    f.write(f"--- Page 7 text ({len(lines)} lines) ---\n")
    for l in lines:
        f.write(f"  {l}\n")

print("Dumped page 7 clean text to scripts/test_p7_clean.txt")
