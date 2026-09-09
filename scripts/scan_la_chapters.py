import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\夜雨线代强化讲义.pdf')

# The 12 Chapters of 线代:
# LA01: 行列式的计算与性质
# LA02: 向量与线性相关性
# LA03: 常见矩阵的性质与运算
# LA04: 特征值与特征向量
# LA05: 矩阵 An 次方计算
# LA06: 矩阵及分块矩阵的秩
# LA07: 线性方程组所有考法
# LA08: 相似的所有考法
# LA09: 二次型的所有考法
# LA10: 专题一：AB=BA 专题（矩阵可交换）
# LA11: 专题二：AB=0 专题
# LA12: 专题三：分块矩阵初等变换专题（AB=C）

titles = [
    '行列式',
    '向量与线性相关性',
    '常见矩阵的性质与运算',
    '特征值与特征向量',
    '矩阵 An 次方计算',
    '矩阵及分块矩阵的秩',
    '线性方程组所有考法',
    '相似的所有考法',
    '二次型的所有考法',
    'AB=BA',
    'AB=0',
    '分块矩阵初等变换',
]

print('=== Scanning 线代 pages for chapter titles ===')
for pno in range(4, len(doc)):
    txt = doc[pno].get_text()
    lines = [l.strip() for l in txt.split('\n') if l.strip()]
    for l in lines[:5]:
        if any(t in l for t in titles):
            print(f'Page {pno} (printed {pno-4}): {l}')
            break
