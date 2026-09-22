import asyncio
import contextlib
import functools
import http.server
import json
import os
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


BASE_INIT = r"""
(() => {
  try {
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      localStorage.setItem('user_guest_kaoyan_subject', 'shu1');
    }
  } catch (e) {}
})();
"""


async def run_browser_tests():
    print("=" * 60)
    print("🌐 Running scripts/test_wheel_ui_undo_browser.py")
    print("=" * 60)

    with serve_repo() as url:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            context = await browser.new_context(
                viewport={"width": 1440, "height": 1000},
                reduced_motion="reduce"
            )
            await context.add_init_script(script=BASE_INIT)

            page = await context.new_page()

            # 自动处理所有的 confirm / alert 弹窗
            dialogs_log = []

            async def handle_dialog(dialog):
                dialogs_log.append(dialog.message)
                await dialog.accept()

            page.on("dialog", handle_dialog)

            await page.goto(url, wait_until="networkidle")

            # 等待核心模块初始化完毕
            await page.wait_for_function("() => window.DailyStudyWheel && typeof window.DailyStudyWheel.openModal === 'function'")

            # =========================================================================
            # Case 1 & 2: 尺寸规格统一测量 (数学转盘 vs 专业课转盘)
            # =========================================================================
            print("\n----------------------------------------------------")
            print("📏 Case 1 & 2: 数学转盘与专业课转盘 UI 规格统一测量")

            # 打开数学转盘
            await page.evaluate("() => window.DailyStudyWheel.openModal('shu1')")
            await page.wait_for_selector("#dailyMathWheelModal", state="visible")
            await page.wait_for_timeout(300)

            # 测量数学转盘 wrap 和 canvas 尺寸
            math_wrap_rect = await page.evaluate(
                "() => { const r = document.querySelector('.daily-math-wheel-canvas-wrap').getBoundingClientRect(); return { width: Math.round(r.width), height: Math.round(r.height) }; }"
            )
            math_canvas_rect = await page.evaluate(
                "() => { const r = document.getElementById('dailyMathWheelCanvas').getBoundingClientRect(); return { width: Math.round(r.width), height: Math.round(r.height) }; }"
            )
            print(f"   • 数学转盘 Wrap 尺寸: {math_wrap_rect['width']}px × {math_wrap_rect['height']}px")
            print(f"   • 数学转盘 Canvas 尺寸: {math_canvas_rect['width']}px × {math_canvas_rect['height']}px")

            assert math_wrap_rect["width"] == 360, f"数学转盘 Wrap 宽度应为 360px，实际: {math_wrap_rect['width']}px"
            assert math_wrap_rect["height"] == 360, f"数学转盘 Wrap 高度应为 360px，实际: {math_wrap_rect['height']}px"
            assert math_canvas_rect["width"] == math_canvas_rect["height"], "数学转盘宽与高必须严格相等 (1:1)"

            # 保存截图 1: 数学转盘
            screenshot1 = str(SCREENSHOTS_DIR / "wheel_math_360.png")
            await page.locator(".daily-math-wheel-modal").screenshot(path=screenshot1)
            print(f"   📸 截图已保存: {screenshot1}")

            # 切换到专业课 Tab
            await page.click(".study-wheel-tab[data-subject-id='zhuanye']")
            await page.wait_for_timeout(300)

            # 测量专业课转盘 wrap 和 canvas 尺寸
            major_wrap_rect = await page.evaluate(
                "() => { const r = document.querySelector('.daily-math-wheel-canvas-wrap').getBoundingClientRect(); return { width: Math.round(r.width), height: Math.round(r.height) }; }"
            )
            major_canvas_rect = await page.evaluate(
                "() => { const r = document.getElementById('dailyMathWheelCanvas').getBoundingClientRect(); return { width: Math.round(r.width), height: Math.round(r.height) }; }"
            )
            print(f"   • 专业课转盘 Wrap 尺寸: {major_wrap_rect['width']}px × {major_wrap_rect['height']}px")
            print(f"   • 专业课转盘 Canvas 尺寸: {major_canvas_rect['width']}px × {major_canvas_rect['height']}px")

            assert major_wrap_rect["width"] == math_wrap_rect["width"], "数学与专业课转盘宽度必须 100% 一致"
            assert major_wrap_rect["height"] == math_wrap_rect["height"], "数学与专业课转盘高度必须 100% 一致"
            assert major_canvas_rect["width"] == major_canvas_rect["height"], "专业课转盘宽与高必须严格相等 (1:1)"

            # 保存截图 2: 专业课转盘
            screenshot2 = str(SCREENSHOTS_DIR / "wheel_major_360.png")
            await page.locator(".daily-math-wheel-modal").screenshot(path=screenshot2)
            print(f"   📸 截图已保存: {screenshot2}")
            print("✅ Case 1 & 2 PASS: 数学与专业课转盘尺寸规格完全一致 (360×360px)")

            # =========================================================================
            # Case 3: 第一轮完成 -> 提示与继续加量按钮
            # =========================================================================
            print("\n----------------------------------------------------")
            print("🎯 Case 3: 第一轮学习抽取与完成二次确认")

            # 切回数学转盘，重置当天状态
            await page.click(".study-wheel-tab[data-subject-id='shu1']")
            await page.evaluate("""() => {
                localStorage.removeItem('user_guest_daily_study_wheel_rounds_v2');
                localStorage.removeItem('user_guest_daily_study_wheel_daily_v1');
                localStorage.removeItem('user_guest_daily_study_wheel_history_v1');
                window.DailyStudyWheel.render();
            }""")

            # 点击开始旋转
            await page.click("#btnDailyMathWheelSpin")
            # 等待旋转动画结束
            await page.wait_for_function("() => !window.DailyStudyWheel.isSpinning()", timeout=5000)

            round1_data = await page.evaluate("() => window.DailyStudyWheel.getCurrentRound('shu1')")
            assert round1_data is not None, "第一轮必须已生成"
            assert round1_data["round"] == 1, "轮次编号应为 1"
            assert round1_data["status"] == "active", f"初始状态应为 active，实际: {round1_data['status']}"
            print(f"   • 第 1 轮抽取完成: 《{round1_data.get('book')}》- {round1_data.get('short') or round1_data.get('name')}")

            # 验证完成按钮文案为 '完成本轮学习'
            complete_btn_text = await page.locator("#btnStudyWheelComplete").text_content()
            assert "完成本轮学习" in complete_btn_text, f"按钮文字应包含'完成本轮学习'，实际: {complete_btn_text}"

            # 点击完成本轮学习 (二次确认由 dialog 自动捕获并 accept)
            dialogs_log.clear()
            await page.click("#btnStudyWheelComplete")
            await page.wait_for_function(
                "() => { const r = window.DailyStudyWheel.getCurrentRound('shu1'); return r && r.status === 'completed'; }",
                timeout=3000
            )
            assert any("确认已完成本轮学习" in msg for msg in dialogs_log), f"必须弹出二次确认提示，实际: {dialogs_log}"

            # 验证完成后的 UI 状态
            result_title = await page.locator("#dailyMathWheelResultName").text_content()
            assert "🎉 本轮完成，继续挑战下一轮？" in result_title, f"应显示完成挑战提示，实际: {result_title}"

            # 验证按钮状态
            add_round_visible = await page.locator("#btnStudyWheelAddRound").is_visible()
            later_close_visible = await page.locator("#btnStudyWheelLaterClose").is_visible()
            undo_visible = await page.locator("#btnStudyWheelUndoRound").is_visible()

            assert add_round_visible, "继续加量按钮应显示"
            assert later_close_visible, "稍后结束按钮应显示"
            assert undo_visible, "撤销上一轮按钮应显示"
            print("   • 完成本轮学习后，成功显示「🔥 继续加量」、「稍后结束」以及「↩ 撤销上一轮」按钮")

            # =========================================================================
            # Case 4: 误点继续加量 -> 进入第 2 轮 -> 撤销上一轮恢复
            # =========================================================================
            print("\n----------------------------------------------------")
            print("🔄 Case 4: 点击继续加量开启第 2 轮，并执行撤销上一轮")

            # 点击继续加量开启第 2 轮
            await page.click("#btnStudyWheelAddRound")
            # 等待加量旋转动画完成
            await page.wait_for_function("() => !window.DailyStudyWheel.isSpinning()", timeout=5000)

            round2_data = await page.evaluate("() => window.DailyStudyWheel.getCurrentRound('shu1')")
            assert round2_data is not None
            assert round2_data["round"] == 2, f"轮次应为 2，实际: {round2_data['round']}"
            assert round2_data["status"] == "active", f"第 2 轮状态应为 active，实际: {round2_data['status']}"
            print(f"   • 第 2 轮已开启: 《{round2_data.get('book')}》- {round2_data.get('short') or round2_data.get('name')}")

            # 截图 3: 多轮进行中状态
            screenshot3 = str(SCREENSHOTS_DIR / "wheel_multi_round.png")
            await page.locator(".daily-math-wheel-modal").screenshot(path=screenshot3)
            print(f"   📸 截图已保存: {screenshot3}")

            # 点击 ↩ 撤销上一轮
            dialogs_log.clear()
            await page.click("#btnStudyWheelUndoRound")
            await page.wait_for_function(
                "() => { const r = window.DailyStudyWheel.getCurrentRound('shu1'); return r && r.round === 1 && r.status === 'active'; }",
                timeout=3000
            )
            assert any("撤销" in msg for msg in dialogs_log), "撤销操作应有确认拦截"

            # 验证撤销后的状态恢复
            restored_round = await page.evaluate("() => window.DailyStudyWheel.getCurrentRound('shu1')")
            assert restored_round["round"] == 1, f"撤销后当前轮次应为 1，实际: {restored_round['round']}"
            assert restored_round["status"] == "active", f"撤销后第 1 轮应恢复为 active，实际: {restored_round['status']}"
            assert restored_round["chapterId"] == round1_data["chapterId"], "章节应保持第 1 轮原本章节"

            # 截图 4: 撤销恢复后的第 1 轮状态
            screenshot4 = str(SCREENSHOTS_DIR / "wheel_undo_restored.png")
            await page.locator(".daily-math-wheel-modal").screenshot(path=screenshot4)
            print(f"   📸 截图已保存: {screenshot4}")
            print("✅ Case 4 PASS: 撤销上一轮成功恢复第 1 轮 active 状态")

            # =========================================================================
            # Case 5: 章节完成池保护验证
            # =========================================================================
            print("\n----------------------------------------------------")
            print("🛡️ Case 5: 章节完成池保护验证")

            active_pool_ids = await page.evaluate(
                "() => window.DailyStudyWheel.getActiveCandidates('shu1').map(c => c.chapterId)"
            )
            assert round1_data["chapterId"] not in active_pool_ids, (
                f"撤销回到第 1 轮进行中时，章节 {round1_data['chapterId']} 绝不得重进随机池！"
            )
            print(f"   • 正在学习的第 1 轮章节 {round1_data['chapterId']} 已从随机池安全隔离")
            print("✅ Case 5 PASS: 章节完成池保护规则严格生效")

            # =========================================================================
            # Case 6: 全分辨率自适应无横向溢出 (1440px -> 320px)
            # =========================================================================
            print("\n----------------------------------------------------")
            print("📱 Case 6: 全分辨率自适应无横向溢出测试 (1440px ~ 320px)")

            test_widths = [1440, 1024, 768, 480, 390, 360, 320]
            for w in test_widths:
                await page.set_viewport_size({"width": w, "height": 900})
                await page.wait_for_timeout(100)

                overflow = await page.evaluate(
                    "() => document.documentElement.scrollWidth > document.documentElement.clientWidth"
                )
                assert not overflow, f"屏幕宽度 {w}px 下出现横向溢出！"

                wrap_width = await page.evaluate(
                    "() => Math.round(document.querySelector('.daily-math-wheel-canvas-wrap').getBoundingClientRect().width)"
                )
                assert wrap_width <= w, f"转盘宽度 {wrap_width}px 超出了视口宽度 {w}px！"
                print(f"   • {w}px 视口: 转盘宽度 {wrap_width}px，页面横向无溢出 ✓")

            print("✅ Case 6 PASS: 1440px 到 320px 任意分辨率均无横向溢出")

            # =========================================================================
            # Case 7: 刷新页面持久性校验
            # =========================================================================
            print("\n----------------------------------------------------")
            print("🔄 Case 7: 刷新页面持久性校验")

            await page.set_viewport_size({"width": 1440, "height": 1000})
            await page.reload(wait_until="networkidle")
            await page.evaluate("() => window.DailyStudyWheel.openModal('shu1')")
            persisted_round = await page.evaluate("() => window.DailyStudyWheel.getCurrentRound('shu1')")
            assert persisted_round is not None, "刷新后当天轮次必须保持"
            assert persisted_round["round"] == 1, "刷新后保持在第 1 轮"
            assert persisted_round["chapterId"] == round1_data["chapterId"], "刷新后保持相同章节"
            print("✅ Case 7 PASS: 页面刷新后轮次状态保持一致")

            # =========================================================================
            # Case 8: 次日自然日解锁与开启新的第 1 轮
            # =========================================================================
            print("\n----------------------------------------------------")
            print("🌅 Case 8: 次日自然日重置校验")

            next_day_round = await page.evaluate("""() => {
                const RealDate = Date;
                const tomorrow = new RealDate();
                tomorrow.setDate(tomorrow.getDate() + 1);

                class MockDate extends RealDate {
                    constructor(...args) {
                        if (args.length === 0) {
                            super(tomorrow.getTime());
                        } else {
                            super(...args);
                        }
                    }
                    static now() {
                        return tomorrow.getTime();
                    }
                }
                window.Date = MockDate;
                window.DailyStudyWheel.render();
                return window.DailyStudyWheel.getCurrentRound('shu1');
            }""")
            assert next_day_round is None, "次日自然日初始应无轮次记录，可重新开启第 1 轮"
            print("✅ Case 8 PASS: 次日自然日自动重置，允许开启新的第 1 轮")

            await context.close()
            await browser.close()

    print("\n" + "=" * 60)
    print("🎉 ALL BROWSER E2E TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_browser_tests())
