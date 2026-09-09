import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\概率论数理统计讲义.pdf')

# 8 Chapters:
# PR01: 5 ~ 20 (随机事件及其概率)
# PR02: 21 ~ 31 (一维随机变量及其分布)
# PR03: 32 ~ 47 (二维随机变量及其分布)
# PR04: 48 ~ 58 (随机变量的数字特征)
# PR05: 59 ~ 61 (大数定律和中心极限定理)
# PR06: 62 ~ 69 (数理统计的基本概念)
# PR07: 70 ~ 78 (参数估计)
# PR08: 79 ~ 83 (假设检验与置信区间)

CHAPTERS = [
    (1, '第1章 随机事件及其概率', 5, 20),
    (2, '第2章 一维随机变量及其分布', 21, 31),
    (3, '第3章 二维随机变量及其分布', 32, 47),
    (4, '第4章 随机变量的数字特征', 48, 58),
    (5, '第5章 大数定律和中心极限定理', 59, 61),
    (6, '第6章 数理统计的基本概念', 62, 69),
    (7, '第7章 参数估计', 70, 78),
    (8, '第8章 假设检验与置信区间', 79, 83),
]

def is_question_start(txt):
    # Strip whitespace
    s = txt.strip()
    if not s: return False
    # If starts with question keywords
    patterns = [
        r'^(类似题|计算|证明|试求|求解|判别|判断)',
        r'^(已知|设|若|从|将|某|袋|今|在|对|一|二|三|四|五|六|七|八|九|十|\d+)',
    ]
    # Check for theory headings to exclude
    theory_keywords = [
        '性质', '定理', '定义', '大纲', '公式', '做题经验', '重要结论', '二级结论', 
        '基本概念', '大数定律', '中心极限定理', '双边检验', '单边检验', '两类错误',
        '估计量的评选标准', '无偏性', '有效性', '相合性', '矩估计法', '最大似然估计法',
        '常见一维', '不相关的充要条件', '协方差', '方差', '数学期望', '二维离散', '二维连续',
        '边缘分布', '条件分布', '卷积公式', '相互独立', '正态分布', '泊松分布', '二项分布',
        '几何分布', '超几何分布', '均匀分布', '指数分布', '分布函数', '概率密度', '离散型',
        '连续型', '事件的运算规则', '对偶律', '抽签问题', '摸球问题', '排序问题', '放球入箱',
        '配对问题', '分组问题', '伯努利概型', '古典概型', '几何概型', '加法公式', '乘法公式',
        '全概率公式', '贝叶斯公式', '独立的判定'
    ]
    # If it is an exact or short theory title
    if any(s == k or s.startswith(k + '：') or s.startswith(k + '（') for k in theory_keywords):
        return False
    return True

print('=== Scanning PR Chapters ===')
for ch_num, ch_name, p_start, p_end in CHAPTERS:
    print(f'\n--- {ch_name} (Pages {p_start} ~ {p_end}) ---')
    ch_questions = []
    for pno in range(p_start, p_end + 1):
        page = doc[pno]
        blocks = page.get_text('blocks')
        for b in blocks:
            txt = b[4].strip().replace('\n', ' ')
            # Filter footer / header
            if b[1] < 62 or b[3] > 760: continue
            # Check if block has question indicators: e.g. year, source, or question query
            has_source = bool(re.search(r'（\s*(19\d\d|20\d\d|张宇|超越|李林|李永乐|合工大|共阳|余炳森)[^）]*）', txt))
            has_ask = any(k in txt for k in ['求', '证明', '计算', '则有（', '则（', '为（', '是（'])
            if (has_source or has_ask) and is_question_start(txt):
                ch_questions.append((pno, b[1], b[3], txt[:60]))
    print(f'Total question blocks detected: {len(ch_questions)}')
    for i, (pno, y0, y1, sample) in enumerate(ch_questions[:8]):
        print(f'  Q{i+1:02d} [P{pno} y={y0:.1f}~{y1:.1f}]: {sample}')
