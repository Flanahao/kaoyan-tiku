import fitz, os, sys, re

sys.stdout.reconfigure(encoding='utf-8')
doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\夜雨线代强化讲义.pdf')

CHAPTERS_LA = [
    (1, "第1章 行列式的计算与性质", 6, 24),
    (2, "第2章 向量与线性相关性", 25, 41),
    (3, "第3章 常见矩阵的性质与运算", 42, 56),
    (4, "第4章 特征值与特征向量", 57, 59),
    (5, "第5章 矩阵 An 次方计算", 60, 66),
    (6, "第6章 矩阵及分块矩阵的秩", 67, 73),
    (7, "第7章 线性方程组所有考法", 74, 100),
    (8, "第8章 相似的所有考法", 101, 124),
    (9, "第9章 二次型的所有考法", 125, 148),
    (10, "第10章 专题一：AB=BA 专题（矩阵可交换）", 149, 153),
    (11, "第11章 专题二：AB=0 专题", 154, 155),
    (12, "第12章 专题三：分块矩阵初等变换专题（AB=C）", 156, 156),
]

for ch_num, title, ps, pe in CHAPTERS_LA:
    print(f"\n================ {title} (Pages {ps}~{pe}) ================")
    q_count = 0
    for p in range(ps - 1, pe):
        page = doc[p]
        blocks = [b for b in page.get_text('blocks') if b[1] >= 65 and b[3] <= 765 and b[4].strip()]
        for b in blocks:
            txt = b[4].strip().replace('\n', ' ')
            has_tag = bool(re.search(r'（(19\d\d|20\d\d|张宇|李林|李永乐|超越|合工大|共阳|余炳森|余丙森|高联|汤家凤|第.*届)', txt))
            starts_q = any(txt.startswith(k) for k in [
                '设', '已知', '计算', '证明', '求', '试求', '类似题', '给定', '将', '若', '求解', '问', '判'
            ])
            has_action = any(k in txt for k in ['计算', '求', '证明', '为（', '是（', '则（', '（ ）', '？', '行列式', '特征值', '基础解系', '通解', '可逆', '相似', '秩'])
            is_theory = any(txt.startswith(k) for k in [
                '定义', '定理', '性质', '考法', '题型', '结论', '方法', '公式', '做题经验', '注：', '注一', '注二',
                '主讲人', '为什么你学得好', '目录', '第一步', '第二步', '第三步'
            ])
            if (has_tag or (starts_q and has_action)) and not is_theory:
                q_count += 1
                print(f"  P{p+1} [{b[1]:.0f}-{b[3]:.0f}]: {txt[:65]}")
    print(f"Total potential questions in {title}: {q_count}")
