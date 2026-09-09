import os, sys, fitz
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')
base = r'D:\考研题库网站\数一题库\夜雨强化\概率论'

for ch_name in sorted(os.listdir(base)):
    ch_path = os.path.join(base, ch_name)
    if not os.path.isdir(ch_path): continue
    files = sorted(os.listdir(ch_path))
    print(f"\n================ {ch_name} ({len(files)} items) ================")
    for f in files:
        fpath = os.path.join(ch_path, f)
        im = Image.open(fpath)
        print(f"  {f} size={im.size}")
