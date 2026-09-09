import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\概率论数理统计讲义.pdf')

# Catalog from prompt:
# PR01: 第1章 随机事件及其概率 (starts ~ p. 5)
# PR02: 第2章 一维随机变量及其分布 (starts ~ p. 17)
# PR03: 第3章 二维随机变量及其分布 (starts ~ p. 29)
# PR04: 第4章 随机变量的数字特征 (starts ~ p. 46)
# PR05: 第5章 大数定律和中心极限定理 (starts ~ p. 59)
# PR06: 第6章 数理统计的基本概念 (starts ~ p. 62)
# PR07: 第7章 参数估计 (starts ~ p. 70)
# PR08: 第8章 假设检验与置信区间 (starts ~ p. 79)

print('=== Scanning 概率论 pages for chapter headers ===')
for pno in range(4, len(doc)):
    txt = doc[pno].get_text()
    lines = [l.strip() for l in txt.split('\n') if l.strip()]
    if lines:
        for l in lines[:4]:
            if any(k in l for k in ['随机事件及其概率', '一维随机变量', '二维随机变量', '数字特征', '大数定律', '数理统计的基本概念', '参数估计', '假设检验与置信区间']):
                print(f'Page {pno} (printed {pno - 4}): {l}')
