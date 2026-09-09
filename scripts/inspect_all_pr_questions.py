import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\概率论数理统计讲义.pdf')

CHAPTER_BOUNDS = [
    (1, '第1章 随机事件及其概率', 6, 21),
    (2, '第2章 一维随机变量及其分布', 22, 32),
    (3, '第3章 二维随机变量及其分布', 33, 48),
    (4, '第4章 随机变量的数字特征', 49, 59),
    (5, '第5章 大数定律和中心极限定理', 60, 62),
    (6, '第6章 数理统计的基本概念', 63, 70),
    (7, '第7章 参数估计', 71, 79),
    (8, '第8章 假设检验与置信区间', 80, 84),
]

# Let's inspect each page in detail
for ch_num, title, p_start, p_end in CHAPTER_BOUNDS:
    print(f"\n{'='*25} CH{ch_num}: {title} (Pages {p_start}~{p_end}) {'='*25}")
    for pno in range(p_start - 1, p_end):
        page = doc[pno]
        blocks = page.get_text("blocks")
        # filter out header and footer
        blocks = [b for b in blocks if b[1] >= 65 and b[3] <= 765 and b[4].strip()]
        blocks.sort(key=lambda b: b[1])
        
        # print blocks that might be questions
        for b in blocks:
            txt = b[4].strip().replace('\n', ' ')
            # if contains year tag or question marker
            has_tag = bool(re.search(r'（(19\d\d|20\d\d|张宇|李林|李永乐|超越|合工大|共阳|余炳森|余丙森|高联|汤家凤|第.*届)', txt))
            starts_q = any(txt.startswith(k) for k in [
                '设', '已知', '从', '某', '袋', '将', '寝室', '三十名', '下表', '类似题', '证明：', '试求', '计算', 
                '一生产线', '一个班', '假设', '记', '求'
            ])
            has_q_action = any(k in txt for k in ['求', '证明', '计算', '为（', '是（', '则（', '（ ）', '？', '率', '______'])
            
            # exclude theory definitions
            is_theory = any(txt.startswith(k) for k in [
                '性质', '定理', '定义', '大纲', '公式', '做题经验', '重要结论', '二级结论', 
                '特别注意', '对偶律', '差：', '和：', '与包含相关性质', '条件概率', '事件与概率',
                '独立的判定', '判定一', '判定二', '判定三', '判定四', '判定五', '判定六', '由判定',
                '古典概型', '抽签原理', '伯努利概型', '常见离散型', '常见连续型', '二维随机变量',
                '卷积公式', '最值函数的分布', '数学期望', '方差', '协方差', '相关系数', '大数定律',
                '中心极限定理', '切比雪夫不等式', '数理统计的基本概念', '正态分布的样本均值', '矩估计法',
                '最大似然估计法', '估计量的评选标准', '假设检验与置信区间', '双边检验', '单边检验', '两类错误',
                '提示：', '注：', '注一', '注二', '特别地', '反过来', '证明方法', '由概率无法推出',
                '分布函数', '离散型随机变量', '连续型随机变量', '边缘分布', '条件分布'
            ])
            
            if (has_tag or (starts_q and has_q_action)) and not is_theory:
                print(f"  P{pno+1} [{b[1]:.1f}-{b[3]:.1f}]: {txt[:75]}")
