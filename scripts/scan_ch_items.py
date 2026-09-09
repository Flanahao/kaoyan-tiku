import fitz
import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r'D:\AntigravityChat\夜雨题库_去水印\概率论数理统计讲义.pdf')

def scan_chapter_items(p_start, p_end):
    items = []
    for pno in range(p_start, p_end + 1):
        page = doc[pno]
        blocks = page.get_text('blocks')
        for i, b in enumerate(blocks):
            txt = b[4].strip().replace('\n', ' ')
            if b[1] < 62 or b[3] > 760 or not txt: continue
            
            # Exclusion keywords for theory/definitions
            if any(txt.startswith(k) for k in [
                '性质', '定理', '定义', '大纲', '公式', '做题经验', '重要结论', '二级结论', 
                '特别注意', '对偶律', '差：', '和：', '与包含相关性质', '条件概率', '事件与概率',
                '独立的判定', '判定一', '判定二', '判定三', '判定四', '判定五', '判定六', '由判定',
                '古典概型', '抽签原理', '伯努利概型', '定义：', '分布函数', '离散型随机变量',
                '连续型随机变量', '常见离散型', '常见连续型', '二维随机变量', '边缘分布', '条件分布',
                '卷积公式', '最值函数的分布', '数学期望', '方差', '协方差', '相关系数', '大数定律',
                '中心极限定理', '切比雪夫不等式', '数理统计的基本概念', '正态分布的样本均值', '矩估计法',
                '最大似然估计法', '估计量的评选标准', '假设检验与置信区间', '双边检验', '单边检验', '两类错误',
                '提示：', '注：', '注一', '注二', '特别地', '反过来', '证明方法'
            ]):
                continue
                
            # Question detection rules
            is_q = False
            if re.search(r'（\s*(19\d\d|20\d\d|张宇|超越|李林|李永乐|合工大|共阳|余炳森|高联|汤家凤)[^）]*）', txt):
                is_q = True
            elif any(txt.startswith(k) for k in [
                '已知', '设总体', '已知总体', '设数', '设随机变量', '设二维', '已知随机', 
                '某人', '某班', '袋中', '袋子', '从数', '将编号', '将五个', '寝室', '三十名', 
                '设系统', '设一系统', '设甲', '设两两', '设两个', '设三个', '类似题', '计算', '试求', '下表列出了'
            ]):
                # Make sure it actually contains a question demand
                if any(w in txt for w in ['求', '证明', '计算', '则有', '则（', '为（', '是（', '试将', '间断点']):
                    is_q = True
            
            if is_q:
                items.append({'pno': pno, 'y0': b[1], 'y1': b[3], 'text': txt})
    return items

for ch in range(1, 9):
    # Chapter page ranges
    ranges = [
        (5, 20), (21, 31), (32, 47), (48, 58), (59, 61), (62, 69), (70, 78), (79, 83)
    ]
    p_s, p_e = ranges[ch - 1]
    res = scan_chapter_items(p_s, p_e)
    print(f'Chapter {ch}: found {len(res)} question items')
