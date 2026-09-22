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


BASE_INIT = r"""
(() => {
  try {
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      localStorage.setItem('user_guest_kaoyan_subject', 'shu1');
    }
  } catch (e) {}
})();
"""



async def new_page(browser, url, viewport=None, extra_init=None):
    context = await browser.new_context(
        viewport=viewport or {"width": 1440, "height": 1000}
    )
    await context.add_init_script(script=BASE_INIT)
    if extra_init:
        await context.add_init_script(script=extra_init)

    page = await context.new_page()
    unexpected_errors = []

    def on_page_error(exc):
        unexpected_errors.append(f"pageerror: {exc}")

    def on_console(msg):
        if msg.type != "error":
            return
        text = msg.text or ""
        if "Failed to load resource" in text:
            return
        unexpected_errors.append(f"console.error: {text}")

    page.on("pageerror", on_page_error)
    page.on("console", on_console)

    await page.goto(url, wait_until="domcontentloaded")
    await page.wait_for_timeout(300)
    return page, unexpected_errors


async def main():
    print("====================================================")
    print("🌐 Running scripts/test_daily_math_wheel_browser.py")
    print("====================================================")

    with serve_repo() as url:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)

            # ------------------------------------------------------------------
            # Test A: 第一次打开
            # ------------------------------------------------------------------
            print("--- Test A: 首次加载与未抽取初始状态 ---")
            page, errs = await new_page(browser, url)

            header_btn = page.locator("#dailyMathWheelButton")
            assert await header_btn.is_visible(), "Header 转盘按钮必须可见"
            header_text = await header_btn.inner_text()
            assert "未抽取" in header_text, f"初始状态 Header 按钮应包含'未抽取'，实际: {header_text}"

            await header_btn.click()
            await page.wait_for_timeout(200)

            modal = page.locator("#dailyMathWheelModal")
            assert await modal.is_visible(), "点击后转盘弹窗必须展示"

            spin_btn = page.locator("#btnDailyMathWheelSpin")
            start_btn = page.locator("#btnDailyMathWheelStart")

            assert await spin_btn.is_enabled(), "未抽取状态下开始旋转按钮必须可用"
            assert not await start_btn.is_enabled(), "未抽取状态下开始学习按钮应为 disabled"
            print("✅ Test A PASS: 首次打开状态正确")

            # ------------------------------------------------------------------
            # Test B: 首次旋转与动画前锁定
            # ------------------------------------------------------------------
            print("--- Test B: 首次旋转 & 动画结束前数据即刻落地 ---")
            # 点击旋转
            await spin_btn.click()

            # 关键断言：几乎瞬间（50ms 内，动画远未结束），localStorage 必须已经写入结果！
            await page.wait_for_timeout(50)
            raw_stored = await page.evaluate(
                "localStorage.getItem('user_guest_daily_math_wheel_v1')"
            )
            assert raw_stored is not None, "动画进行中，localStorage 必须已经持久化转盘结果"
            stored_data = json.loads(raw_stored)
            assert "result" in stored_data and "chapterId" in stored_data["result"], "转盘结果必须包含 chapterId"
            picked_book = stored_data["result"].get("book")
            assert picked_book in ["李林880", "基础30讲", "强化36讲", "1000题", "夜雨强化"], f"抽中书籍必须在5本内: {picked_book}"
            picked_ch_id = stored_data["result"].get("chapterId")
            print(f"   • 动画开始即刻锁定: {picked_book} ({picked_ch_id})")

            # 等待动画完成（通常 4.3s 左右，等待 4.8s）
            await page.wait_for_timeout(4800)

            # 验证结果卡片
            result_book_text = await page.locator("#dailyMathWheelResultBook").inner_text()
            result_name_text = await page.locator("#dailyMathWheelResultName").inner_text()
            assert picked_book in result_book_text, f"结果卡片书籍应为 {picked_book}，实际: {result_book_text}"
            assert len(result_name_text) > 0, "结果卡片必须显示章节名"

            # 验证按钮变化
            spin_btn_text = await spin_btn.inner_text()
            assert "已抽取" in spin_btn_text or "进行中" in spin_btn_text, f"抽完后旋转按钮文本应为'已抽取'或'进行中'，实际: {spin_btn_text}"
            assert not await spin_btn.is_enabled(), "抽完后旋转按钮必须被禁用"
            assert await start_btn.is_enabled(), "抽完后开始学习按钮必须变为可用"

            print("✅ Test B PASS: 首次旋转与动画前锁定验证通过")

            # ------------------------------------------------------------------
            # Test C: 动画中刷新防重抽
            # ------------------------------------------------------------------
            print("--- Test C: 动画中刷新，依然锁定原结果，不可重抽 ---")
            page_c, _ = await new_page(browser, url)
            await page_c.locator("#dailyMathWheelButton").click()
            await page_c.wait_for_timeout(200)

            # 点击旋转并在动画途中（100ms）强制刷新页面
            await page_c.locator("#btnDailyMathWheelSpin").click()
            await page_c.wait_for_timeout(100)
            raw_during = await page_c.evaluate(
                "localStorage.getItem('user_guest_daily_math_wheel_v1')"
            )
            assert raw_during is not None, "刷新前必须已经保存"
            during_ch_id = json.loads(raw_during)["result"]["chapterId"]

            # 模拟用户在转盘旋转中途刷新网页
            await page_c.reload()
            await page_c.wait_for_timeout(500)

            # 检查刷新后状态
            header_text_c = await page_c.locator("#dailyMathWheelButton").inner_text()
            assert "未抽取" not in header_text_c, f"刷新后 Header 状态不应为'未抽取'，实际: {header_text_c}"

            await page_c.locator("#dailyMathWheelButton").click()
            await page_c.wait_for_timeout(200)

            spin_btn_c = page_c.locator("#btnDailyMathWheelSpin")
            assert not await spin_btn_c.is_enabled(), "刷新后不可再次旋转"
            assert "已抽取" in await spin_btn_c.inner_text() or "进行中" in await spin_btn_c.inner_text()

            # 检查结果依然是动画中锁定的 chapterId
            result_raw_c = await page_c.evaluate(
                "localStorage.getItem('user_guest_daily_math_wheel_v1')"
            )
            assert json.loads(result_raw_c)["result"]["chapterId"] == during_ch_id, "刷新后结果保持不变"
            print("✅ Test C PASS: 动画中刷新防重抽验证通过")

            # ------------------------------------------------------------------
            # Test D: 同日关闭后再次打开 Modal
            # ------------------------------------------------------------------
            print("--- Test D: 同日关闭后再次打开 Modal 状态持久保持 ---")
            await page_c.locator("#btnCloseDailyMathWheel").click()
            await page_c.wait_for_timeout(200)
            assert not await page_c.locator("#dailyMathWheelModal").is_visible(), "弹窗应已关闭"

            await page_c.locator("#dailyMathWheelButton").click()
            await page_c.wait_for_timeout(200)
            assert not await page_c.locator("#btnDailyMathWheelSpin").is_enabled(), "再次打开依然不可旋转"
            assert await page_c.locator("#btnDailyMathWheelStart").is_enabled(), "再次打开依然可以直接开始学习"
            print("✅ Test D PASS: 同日再次打开状态保持正确")

            # ------------------------------------------------------------------
            # Test E: 点击开始学习，精准进入对应章节和 Workbench 刷题栏
            # ------------------------------------------------------------------
            print("--- Test E: 点击开始学习跳转 ---")
            await page_c.locator("#btnDailyMathWheelStart").click()
            await page_c.wait_for_timeout(400)

            # 弹窗已关闭
            assert not await page_c.locator("#dailyMathWheelModal").is_visible(), "跳转后弹窗必须自动关闭"

            # 检查当前科目与章节状态
            cur_state = await page_c.evaluate(
                "typeof window.getCurrentPracticeState === 'function' ? window.getCurrentPracticeState() : null"
            )
            assert cur_state is not None, "getCurrentPracticeState 必须可调用"
            assert cur_state["curSubjectId"] == "shu1", f"科目必须为数学 shu1，实际: {cur_state['curSubjectId']}"
            assert cur_state.get("currentChapterId") == during_ch_id, f"当前章节必须为抽中章节: {during_ch_id}，实际: {cur_state.get('currentChapterId')}"

            # 检查刷题栏显示
            sidebar = page_c.locator("#practiceSidebar")
            if await sidebar.count() > 0:
                is_visible = await sidebar.is_visible()
                assert is_visible, "刷题侧边栏必须为可见状态"

            print("✅ Test E PASS: 开始学习跳转准确进入章节与刷题模式")

            # ------------------------------------------------------------------
            # Test F: 从专业课切回数学
            # ------------------------------------------------------------------
            print("--- Test F: 当前在专业课时，抽完转盘点击开始学习切回数学 ---")
            # 切换到专业课
            await page_c.evaluate(
                "typeof window.switchSubject === 'function' && window.switchSubject('zhuanye')"
            )
            await page_c.wait_for_timeout(300)

            cur_subj = await page_c.evaluate(
                "window.getCurrentPracticeState ? window.getCurrentPracticeState().curSubjectId : ''"
            )
            assert cur_subj == "zhuanye", f"当前已切入专业课，实际: {cur_subj}"


            # 打开转盘点击开始学习
            await page_c.locator("#dailyMathWheelButton").click()
            await page_c.wait_for_timeout(200)
            await page_c.locator("#btnDailyMathWheelStart").click()
            await page_c.wait_for_timeout(400)

            after_state = await page_c.evaluate("window.getCurrentPracticeState()")
            assert after_state["curSubjectId"] == "shu1", f"点击开始学习后必须自动切回数学 shu1，实际: {after_state['curSubjectId']}"
            assert after_state.get("currentChapterId") == during_ch_id, "切回数学后章节正确"
            print("✅ Test F PASS: 从专业课跨学科自动切回数学并正确定位章节")

            # ------------------------------------------------------------------
            # Test G: 次日自动解锁
            # ------------------------------------------------------------------
            print("--- Test G: 次日自然日自动解锁重抽 ---")
            yesterday_init = r"""
            (() => {
              try {
                localStorage.setItem('user_guest_daily_math_wheel_v1', JSON.stringify({
                  schemaVersion: 1,
                  date: '2026-09-20',
                  rolledAt: 1789900000000,
                  result: {
                    subjectId: 'shu1',
                    chapterId: 'ch1',
                    book: '基础30讲',
                    subject: '高数',
                    name: '基础30讲 - 高数 - 第1讲 函数极限与连续',
                    short: '第1讲 函数极限与连续',
                    total: 50
                  }
                }));
              } catch (e) {}
            })();
            """
            page_g, _ = await new_page(browser, url, extra_init=yesterday_init)
            header_text_g = await page_g.locator("#dailyMathWheelButton").inner_text()
            assert "未抽取" in header_text_g, f"跨日后 Header 状态应自动重置为未抽取，实际: {header_text_g}"

            await page_g.locator("#dailyMathWheelButton").click()
            await page_g.wait_for_timeout(200)

            spin_btn_g = page_g.locator("#btnDailyMathWheelSpin")
            assert await spin_btn_g.is_enabled(), "次日弹窗中的开始旋转按钮应重新变为可用"
            print("✅ Test G PASS: 次日自然日自动解锁验证通过")

            # ------------------------------------------------------------------
            # Test H: 候选池与 DOM 排除验证
            # ------------------------------------------------------------------
            print("--- Test H: 严格书籍排除验证 ---")
            candidates = await page_g.evaluate(
                "window.DailyMathWheelBridge && window.DailyMathWheelBridge.getCandidates ? window.DailyMathWheelBridge.getCandidates() : []"
            )
            assert len(candidates) > 0, "候选池不能为空"
            books = set(c["book"] for c in candidates)
            forbidden = ["李林880优化版", "李艳芳900", "李范全书", "历年真题", "波哥讲义例题", "852真题"]
            for fb in forbidden:
                assert fb not in books, f"候选池禁止出现书籍: {fb}"

            print(f"   • 候选池包含书籍: {sorted(list(books))}")
            print("✅ Test H PASS: 严格书籍排除验证通过")

            # ------------------------------------------------------------------
            # Test I: 多分辨率响应式与 320px 无横向溢出
            # ------------------------------------------------------------------
            print("--- Test I: 多尺寸响应式布局测试 ---")
            viewports = [
                (1440, 900),
                (1200, 800),
                (1024, 768),
                (768, 1024),
                (620, 900),
                (390, 844),
                (320, 568)
            ]

            for w, h in viewports:
                await page_g.set_viewport_size({"width": w, "height": h})
                await page_g.wait_for_timeout(150)

                # 检查页面是否出现横向滚动溢出
                scroll_w = await page_g.evaluate("document.documentElement.scrollWidth")
                client_w = await page_g.evaluate("document.documentElement.clientWidth")
                assert scroll_w <= client_w + 1, f"在 {w}x{h} 下页面出现横向滚动条: scrollWidth={scroll_w}, clientWidth={client_w}"

                # 弹窗内控件是否正常展示
                canvas = page_g.locator("#dailyMathWheelCanvas")
                assert await canvas.is_visible(), f"在 {w}x{h} 下转盘 canvas 必须可见"
                assert await spin_btn_g.is_visible(), f"在 {w}x{h} 下操作按钮必须可见"

            print("✅ Test I PASS: 1440 ~ 320px 全尺寸响应式无横向溢出")

            await browser.close()

    print("====================================================")
    print("🎉 ALL PLAYWRIGHT BROWSER E2E TESTS PASSED!")
    print("====================================================")


if __name__ == "__main__":
    asyncio.run(main())
