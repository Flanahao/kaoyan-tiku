import os
import re
import json
import fitz

BASE_DIR = r"d:\考研题库网站"
DATA_DIR = os.path.join(BASE_DIR, "data", "politics")
NODES_DIR = os.path.join(DATA_DIR, "nodes")
os.makedirs(NODES_DIR, exist_ok=True)

PDF_FILES = {
    "sg": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-史纲总-净化打印版.pdf",
    "my": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-马原总-净化打印版.pdf",
    "mzt": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-毛中特总-净化打印版.pdf",
    "sx": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-思修总-净化打印版.pdf",
    "xg": r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-新思想总-净化打印版.pdf"
}

def clean_text(text):
    text = re.sub(r"[\uf000-\uf8ff]", "", text)
    text = re.sub(r"\[公众号.*?\]", "", text)
    text = re.sub(r"公众号.*?[\r\n]", "", text)
    text = re.sub(r"枯藤看天下", "", text)
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
    t = t.strip()
    return t

def make_short_title(title):
    cleaned = clean_point_title(title)
    # If still too long, take core phrase
    cleaned = re.sub(r"——.*$", "", cleaned)
    cleaned = re.sub(r"：.*$", "", cleaned)
    cleaned = re.sub(r"、.*$", "", cleaned)
    if len(cleaned) > 12:
        return cleaned[:12]
    return cleaned if cleaned else title[:12]

print("Module setup complete.")
