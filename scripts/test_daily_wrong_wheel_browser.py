import asyncio
import contextlib
import functools
import http.server
import json
import sys
import threading
from pathlib import Path

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
SCREENSHOTS_DIR = ROOT / "screenshots"
SCREENSHOTS_DIR.mkdir(exist_ok=True)

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass

@contextlib.contextmanager
def serve_repo():
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}/index.html"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)

INIT_SCRIPT = """
(() => {
  try {
    localStorage.setItem('user_guest_kaoyan_subject', 'shu1');
    // 给数学李林880 第一章 (ch163) 注入 3 道错题 (1, 2, 4 为 wrong)
    localStorage.setItem('user_guest_ch163_s1_status', JSON.stringify({
      "0": "proficient",
      "1": "wrong",
      "2": "wrong",
      "3": "vague",
      "4": "wrong"
    }));
    // 给专业课 波哥讲义例题 (bg_jy_01) 注入 2 道错题
    localStorage.setItem('user_guest_bg_jy_01_zhuanye_status', JSON.stringify({
      "0": "wrong",
      "1": "vague"
    }));
  } catch (e) {}
})();
"""

async def main():
    print("====================================================")
    print("🧪 Running Browser E2E Test for Daily Wrong Wheel")
    print("====================================================")

    with serve_repo() as url:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(viewport={"width": 1440, "height": 900})
            await context.add_init_script(script=INIT_SCRIPT)
            page = await context.new_page()

            # 1. 打开页面并检查 Header 错题转盘按钮
            print("--- Step 1: 检查 Header 错题转盘小部件 ---")
            await page.goto(url, wait_until="domcontentloaded")
            await page.wait_for_timeout(500)

            wrong_wheel_btn = page.locator("#dailyWrongWheelButton")
            assert await wrong_wheel_btn.is_visible(), "Header 错题转盘按钮必须可见"
            summary_text = await page.locator("#dailyWrongWheelSummary").inner_text()
            print(f"  - 初始 Summary 文案: '{summary_text}'")
            assert "未抽取" in summary_text

            # 2. 点击打开模态框
            print("--- Step 2: 打开错题转盘模态框 ---")
            await wrong_wheel_btn.click()
            await page.wait_for_timeout(400)

            modal = page.locator("#dailyWrongWheelModal")
            assert await modal.is_visible(), "错题转盘模态框必须显示"

            canvas = page.locator("#dailyWrongWheelCanvas")
            assert await canvas.is_visible(), "转盘 Canvas 必须可见"

            # 3. 检查范围筛选（默认全部候选章节，兼容错题章节）
            print("--- Step 3: 检查默认全量候选章节与错题计数 ---")
            btn_all = page.locator("#btnWrongScopeAll")
            btn_all_classes = await btn_all.get_attribute("class") or ""
            assert "active" in btn_all_classes, "默认应激活【全部候选章节】"

            all_count_text = await page.locator("#wrongScopeAllCount").inner_text()
            print(f"  - 当前数学全部候选章节数: {all_count_text}")
            assert int(all_count_text) >= 196, f"数学应包含全部候选章节(196)，实际: {all_count_text}"

            mistake_count_text = await page.locator("#wrongScopeMistakeCount").inner_text()
            print(f"  - 当前数学有错题章节数: {mistake_count_text}")
            assert int(mistake_count_text) >= 1, f"应至少检测到 1 个错题章节，实际: {mistake_count_text}"

            # 切换到仅错题范围
            btn_mistakes = page.locator("#btnWrongScopeMistakes")
            await btn_mistakes.click()
            await page.wait_for_timeout(300)

            # 截图保存数学错题转盘
            shot_math = SCREENSHOTS_DIR / "wrong_wheel_modal_math.png"
            await page.screenshot(path=str(shot_math))
            print(f"  - 保存截图: {shot_math.name}")

            # 4. 切换到专业课错题转盘
            print("--- Step 4: 切换到专业课错题转盘 ---")
            tab_major = page.locator("#wrongWheelTabMajor")
            await tab_major.click()
            await page.wait_for_timeout(400)

            major_all_count = await page.locator("#wrongScopeAllCount").inner_text()
            print(f"  - 专业课全量候选章节数: {major_all_count}")
            assert int(major_all_count) >= 20

            major_mistake_count = await page.locator("#wrongScopeMistakeCount").inner_text()
            print(f"  - 专业课有错题章节数: {major_mistake_count}")
            assert int(major_mistake_count) >= 1

            shot_major = SCREENSHOTS_DIR / "wrong_wheel_modal_major.png"
            await page.screenshot(path=str(shot_major))
            print(f"  - 保存截图: {shot_major.name}")

            # 5. 切回数学并旋转抽中有错题章节 (李林880重积分)
            print("--- Step 5: 切回数学错题转盘并开始旋转 ---")
            tab_math = page.locator("#wrongWheelTabMath")
            await tab_math.click()
            await page.wait_for_timeout(300)

            spin_btn = page.locator("#btnDailyWrongWheelSpin")
            assert await spin_btn.is_enabled()
            await spin_btn.click()

            # 等待旋转动画完成
            print("  - 正在旋转中...")
            await page.wait_for_timeout(4500)

            result_book = await page.locator("#dailyWrongWheelResultBook").inner_text()
            result_name = await page.locator("#dailyWrongWheelResultName").inner_text()
            print(f"  - 抽中章节: 《{result_book}》{result_name}")
            assert "李林880" in result_book

            # 验证【消灭错题】与【全章正常刷题】双按钮并存
            start_btn = page.locator("#btnDailyWrongWheelStart")
            practice_btn = page.locator("#btnDailyWrongWheelPractice")
            assert await start_btn.is_visible(), "有错题时【消灭错题】按钮必须可见"
            assert await practice_btn.is_visible(), "有错题时【全章正常刷题】按钮必须兼容并存"
            practice_text = await practice_btn.inner_text()
            print(f"  - 伴随按钮文案: '{practice_text}'")
            assert "刷题" in practice_text

            # 6. 点击“开始消灭错题”并验证自动激活“不会”筛选
            print("--- Step 6: 点击【🎯 消灭错题】一键直达并自动过滤错题 ---")
            await start_btn.click()
            await page.wait_for_timeout(500)

            # 模态框应已关闭
            assert not await modal.is_visible(), "跳转后模态框必须自动关闭"

            # 验证侧边栏过滤器自动高亮“不会”
            wrong_filter = page.locator('.filter-btn[data-filter="wrong"]')
            wrong_classes = await wrong_filter.get_attribute("class") or ""
            assert "active" in wrong_classes, f"侧边栏【不会】筛选按钮应处于激活状态，实际: {wrong_classes}"
            print("  - 侧边栏【不会】筛选按钮已自动激活！")

            # 截图保存错题刷题视图
            shot_practice = SCREENSHOTS_DIR / "wrong_wheel_jump_mistake_practice.png"
            await page.screenshot(path=str(shot_practice))
            print(f"  - 保存截图: {shot_practice.name}")

            # 7. 验证未做章节点击【先去刷题完成这章】流转
            print("--- Step 7: 验证未做章节点击【先去刷题完成这章】---")
            # 重新打开模态框并模拟抽取一个从未做过的章节
            await wrong_wheel_btn.click()
            await page.wait_for_timeout(400)

            # 通过在当前轮次完成并注入一个未做的章节轮次来测试
            await page.evaluate("""() => {
              const daily = {
                schemaVersion: 1,
                date: (new Date()).toISOString().slice(0, 10),
                math: [{
                  round: 2,
                  chapterId: 'ch1',
                  book: '基础30讲',
                  name: '基础30讲 - 高数 - 第1章 极限',
                  short: '第1章 极限',
                  total: 25,
                  status: 'active'
                }],
                major: []
              };
              localStorage.setItem('user_guest_daily_wrong_wheel_daily_v1', JSON.stringify(daily));
              window.DailyWrongWheel.renderAll();
            }""")
            await page.wait_for_timeout(300)

            # 验证界面状态
            meta_text = await page.locator("#dailyWrongWheelResultMeta").inner_text()
            print(f"  - 未做章节 Meta 提示: '{meta_text}'")
            assert "尚未开始" in meta_text or "暂无错题" in meta_text

            assert not await start_btn.is_visible(), "无错题未做章节下【消灭错题】应隐藏"
            assert await practice_btn.is_visible(), "无错题未做章节下【先去刷题完成这章】必须显示"
            practice_text_unstarted = await practice_btn.inner_text()
            print(f"  - 按钮文案: '{practice_text_unstarted}'")
            assert "先去刷题完成这章" in practice_text_unstarted

            # 截图保存未做章节的模态框
            shot_unstarted = SCREENSHOTS_DIR / "wrong_wheel_unstarted_chapter.png"
            await page.screenshot(path=str(shot_unstarted))
            print(f"  - 保存截图: {shot_unstarted.name}")

            # 点击【先去刷题完成这章】
            await practice_btn.click()
            await page.wait_for_timeout(500)

            # 验证模态框关闭，且侧边栏过滤器处于“全部”筛选状态
            assert not await modal.is_visible()
            all_filter = page.locator('.filter-btn[data-filter="all"]')
            all_classes = await all_filter.get_attribute("class") or ""
            assert "active" in all_classes, f"全章刷题模式下应激活【全部】筛选，实际: {all_classes}"
            print("  - 侧边栏【全部】筛选已激活，可正常开始完成该章！")

            await browser.close()
            print("====================================================")
            print("🎉 ALL BROWSER E2E TESTS FOR WRONG WHEEL PASSED!")
            print("====================================================")

if __name__ == "__main__":
    asyncio.run(main())
