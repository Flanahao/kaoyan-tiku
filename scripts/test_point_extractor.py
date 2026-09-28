import os
import re
import fitz

def extract_point_content(doc, start_page, point_num, point_title, next_point_num=None):
    # Collect text from start_page - 1 up to start_page + 1
    max_p = min(len(doc), start_page + 2)
    min_p = max(0, start_page - 1)
    combined = []
    for p in range(min_p, max_p):
        txt = doc[p].get_text()
        combined.append(txt)
    full_text = "\n".join(combined)
    
    # Remove junk
    full_text = re.sub(r"[\uf000-\uf8ff]", "", full_text)
    full_text = re.sub(r"\[公众号.*?\]", "", full_text)
    full_text = re.sub(r"公众号.*?[\r\n]", "", full_text)
    full_text = re.sub(r"枯藤看天下", "", full_text)
    
    # Find heading for this point
    # Try '考点X' or '考点 X'
    pat = rf"考点\s*{re.escape(str(point_num))}\b"
    m = re.search(pat, full_text)
    snippet = ""
    if m:
        sub = full_text[m.end():]
        # End at next point if available
        if next_point_num:
            next_pat = rf"考点\s*{re.escape(str(next_point_num))}\b"
            m_next = re.search(next_pat, sub)
            if m_next:
                sub = sub[:m_next.start()]
        snippet = sub.strip()
    else:
        # Fallback to lines on the start_page
        snippet = doc[start_page - 1].get_text()
        snippet = re.sub(r"[\uf000-\uf8ff]", "", snippet)
    
    # Split into clean lines
    lines = [l.strip() for l in snippet.split("\n") if l.strip() and not l.strip().isdigit()]
    
    # Skip any immediate title repeat
    if lines and (point_title in lines[0] or "考点" in lines[0]):
        lines = lines[1:]
    
    # Extract summary: first 1-2 substantial sentences
    summary_parts = []
    for l in lines[:6]:
        if not any(marker in l for marker in ["注意", "区分", "陷阱", "提示", "点拨"]):
            summary_parts.append(l)
            if len("".join(summary_parts)) > 45:
                break
    summary = "".join(summary_parts)[:120]
    if not summary:
        summary = f"{point_title}的核心考点与基本原理要求"
        
    # Extract keyPoints: lines that look like bullet points or numbered items
    key_points = []
    for l in lines:
        if re.search(r"^[①②③④⑤⑥\d+\.一二三四五（\d+）]", l) or "：" in l:
            cleaned_l = re.sub(r"^[①②③④⑤⑥\d+\.一二三四五（\d+）\s]+", "", l).strip()
            if 6 <= len(cleaned_l) <= 70 and cleaned_l not in key_points:
                key_points.append(cleaned_l)
                if len(key_points) >= 3:
                    break
    if not key_points:
        key_points = [summary[:50]]
        
    # Extract traps: lines mentioning 注意, 区分, 陷阱, 根本原因, etc.
    traps = []
    for idx, l in enumerate(lines):
        if any(w in l for w in ["注意", "区分", "陷阱", "不是", "混淆", "切忌", "根本原因"]):
            trap_text = l
            if len(trap_text) < 15 and idx + 1 < len(lines):
                trap_text += ": " + lines[idx + 1]
            if trap_text not in traps:
                traps.append(trap_text[:100])
                if len(traps) >= 2:
                    break
                    
    return {
        "summary": summary,
        "keyPoints": key_points,
        "traps": traps
    }

doc_sg = fitz.open(r"D:\WechatFiles\xwechat_files\wxid_xydesj04h7jn22_d0b0\msg\file\2026-07\27徐涛强化班-史纲总-净化打印版.pdf")
res1 = extract_point_content(doc_sg, 1, "1", "中国封建社会的衰落", "2")
res2 = extract_point_content(doc_sg, 7, "13", "反侵略战争的失败及其原因", "14")
res3 = extract_point_content(doc_sg, 8, "15", "太平天国农民战争", "16")

print("Point 1 extracted:", res1)
print("Point 13 extracted:", res2)
print("Point 15 extracted:", res3)
