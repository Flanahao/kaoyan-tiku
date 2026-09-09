import fitz
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

SRC_DIR = r'D:\AntigravityChat\夜雨题库'
DST_DIR = r'D:\AntigravityChat\夜雨题库_去水印'

os.makedirs(DST_DIR, exist_ok=True)

PDF_FILES = [
    '概率论数理统计讲义.pdf',
    '夜雨线代强化讲义.pdf',
    '数一高数 27版 最终版.pdf'
]

def dewatermark_pdf(fname):
    src_path = os.path.join(SRC_DIR, fname)
    dst_path = os.path.join(DST_DIR, fname)
    print(f'=== 开始去水印处理: {fname} ===')
    doc = fitz.open(src_path)
    total_pages = len(doc)
    print(f'总页数: {total_pages}')

    # 1. 检测并清空所有带有 /Watermark 或 /PieceInfo 的 XObject (主要用于夜雨线代的大粉红中心水印)
    wm_xrefs = set()
    for pno in range(total_pages):
        page = doc[pno]
        for x in page.get_xobjects():
            xref = x[0]
            obj_str = doc.xref_object(xref)
            if '/Watermark' in obj_str or '/PieceInfo' in obj_str:
                wm_xrefs.add(xref)

    if wm_xrefs:
        print(f'  [线代] 发现并清空 {len(wm_xrefs)} 个水印 XObject 流...')
        for xref in wm_xrefs:
            doc.update_stream(xref, b'q Q\n')

    # 2. 针对除封面外的所有正文页 (pno >= 1)，消除顶部水印广告横幅 (y < 62)
    # 正文内容与题干全部位于 y >= 65，因此清除 [0, 0, width, 62] 区域绝对不伤及任何公式、题干与版面
    print('  正在清理正文页顶部广告横幅...')
    for pno in range(1, total_pages):
        page = doc[pno]
        rect = fitz.Rect(0, 0, page.rect.width, 62)
        page.add_redact_annot(rect, fill=(1, 1, 1))
        page.apply_redactions(images=fitz.PDF_REDACT_IMAGE_NONE)
        if (pno + 1) % 50 == 0 or pno + 1 == total_pages:
            print(f'    已处理 {pno + 1}/{total_pages} 页')

    print(f'  正在保存无损洁净版 PDF: {dst_path} ...')
    doc.save(dst_path, garbage=4, deflate=True)
    doc.close()
    print(f'✅ 完成: {dst_path} (文件大小: {os.path.getsize(dst_path) / 1024 / 1024:.2f} MB)\n')

if __name__ == '__main__':
    for f in PDF_FILES:
        dewatermark_pdf(f)
    print('🎉 全部 3 本讲义 PDF 去水印处理圆满完成！')
