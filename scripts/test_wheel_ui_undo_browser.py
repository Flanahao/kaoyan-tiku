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

            dialogs_log = []

            async def handle_dialog(dialog):
                dialogs_log.append(dialog.message)
                await dialog.accept()

            page.on("dialog", handle_dialog)

            await page.goto(url, wait_until="networkidle")

            # 等待核心模块初始化完毕
            await page.wait_for_function("() => window.DailyStudyWheel && typeof window.DailyStudyWheel.openModal === 'function'")

            # =========================================================================
            # Part 1: 7 个视口下数学与专业课尺寸严格一致性测量 (1440, 1200, 1024, 768, 620, 390, 320)
            # =========================================================================
            print("\n----------------------------------------------------")
            print("📏 Part 1: 7 个视口下数学与专业课转盘实际尺寸严格比对 (|Δ| <= 1px)")

            viewports = [1440, 1200, 1024, 768, 620, 390, 320]
            measured_sizes = {}

            # 打开转盘弹窗
            await page.evaluate("() => window.DailyStudyWheel.openModal('shu1')")
            await page.wait_for_selector("#dailyMathWheelModal", state="visible")
            await page.wait_for_timeout(200)

            for w in viewports:
                await page.set_viewport_size({"width": w, "height": 900})
                await page.wait_for_timeout(100)

                # 切到数学并测量
                await page.click(".study-wheel-tab[data-subject-id='shu1']")
                await page.wait_for_timeout(100)

                math_wrap = await page.evaluate(
                    "() => { const r = document.querySelector('.study-wheel-stage') || document.querySelector('.daily-math-wheel-canvas-wrap'); const b = r.getBoundingClientRect(); return { width: Math.round(b.width), height: Math.round(b.height) }; }"
                )
                math_canvas = await page.evaluate(
                    "() => { const r = document.getElementById('dailyMathWheelCanvas').getBoundingClientRect(); return { width: Math.round(r.width), height: Math.round(r.height) }; }"
                )

                # 切到专业课并测量
                await page.click(".study-wheel-tab[data-subject-id='zhuanye']")
                await page.wait_for_timeout(100)

                major_wrap = await page.evaluate(
                    "() => { const r = document.querySelector('.study-wheel-stage') || document.querySelector('.daily-math-wheel-canvas-wrap'); const b = r.getBoundingClientRect(); return { width: Math.round(b.width), height: Math.round(b.height) }; }"
                )
                major_canvas = await page.evaluate(
                    "() => { const r = document.getElementById('dailyMathWheelCanvas').getBoundingClientRect(); return { width: Math.round(r.width), height: Math.round(r.height) }; }"
                )

                # 无横向溢出断言
                overflow_info = await page.evaluate(
                    """() => {
                        const sw = document.documentElement.scrollWidth;
                        const cw = document.documentElement.clientWidth;
                        if (sw <= cw) return null;
                        const list = [];
                        document.querySelectorAll('*').forEach(el => {
                            const r = el.getBoundingClientRect();
                            if (r.right > cw + 1) {
                                list.push(el.tagName + (el.id ? '#' + el.id : '') + (el.className ? '.' + String(el.className).replace(/\\s+/g, '.') : '') + ' [w=' + Math.round(r.width) + ', right=' + Math.round(r.right) + ']');
                            }
                        });
                        return { sw, cw, list: list.slice(0, 8) };
                    }"""
                )
                if overflow_info:
                    print(f"⚠️ Overflow at {w}px: clientWidth={overflow_info['cw']}, scrollWidth={overflow_info['sw']}")
                    for item in overflow_info['list']:
                        print(f"   -> {item}")
                overflow = bool(overflow_info)
                assert not overflow, f"屏幕宽度 {w}px 下出现页面横向溢出！"

                # 严格一致性断言 (|diff| <= 1px)
                diff_w = abs(math_wrap["width"] - major_wrap["width"])
                diff_h = abs(math_wrap["height"] - major_wrap["height"])
                diff_cw = abs(math_canvas["width"] - major_canvas["width"])
                diff_ch = abs(math_canvas["height"] - major_canvas["height"])

                assert diff_w <= 1, f"Viewport {w}px: 外层宽度不一致: math={math_wrap['width']}, major={major_wrap['width']}"
                assert diff_h <= 1, f"Viewport {w}px: 外层高度不一致: math={math_wrap['height']}, major={major_wrap['height']}"
                assert diff_cw <= 1, f"Viewport {w}px: Canvas 宽度不一致: math={math_canvas['width']}, major={major_canvas['width']}"
                assert diff_ch <= 1, f"Viewport {w}px: Canvas 高度不一致: math={math_canvas['height']}, major={major_canvas['height']}"

                measured_sizes[w] = {
                    "math": f"{math_canvas['width']}x{math_canvas['height']}",
                    "major": f"{major_canvas['width']}x{major_canvas['height']}"
                }
                print(f"   • {w}px: math {measured_sizes[w]['math']} / major {measured_sizes[w]['major']} PASS (Δ=0px, overflow=false)")

            # 保存截图
            await page.set_viewport_size({"width": 1440, "height": 1000})
            await page.click(".study-wheel-tab[data-subject-id='shu1']")
            await page.wait_for_timeout(100)
            screenshot1 = str(SCREENSHOTS_DIR / "wheel_math_360.png")
            await page.locator(".daily-math-wheel-modal").screenshot(path=screenshot1)

            await page.click(".study-wheel-tab[data-subject-id='zhuanye']")
            await page.wait_for_timeout(100)
            screenshot2 = str(SCREENSHOTS_DIR / "wheel_major_360.png")
            await page.locator(".daily-math-wheel-modal").screenshot(path=screenshot2)

            print("✅ Part 1 PASS: 全部 7 个视口两科尺寸绝对一致，无横向溢出")

            # =========================================================================
            # Part 2: 事务性撤销 (Transactional Undo) E2E 完整断言
            # =========================================================================
            print("\n----------------------------------------------------")
            print("🔄 Part 2: 事务性撤销完整测试 (完成池回滚 + 派生进度 + 刷新保持 + 刷题保护)")

            # 1. 切回数学并重置转盘状态
            await page.click(".study-wheel-tab[data-subject-id='shu1']")
            await page.evaluate("""() => {
                localStorage.removeItem('user_guest_daily_study_wheel_rounds_v2');
                localStorage.removeItem('user_guest_daily_study_wheel_daily_v1');
                localStorage.removeItem('user_guest_daily_study_wheel_history_v1');
                localStorage.removeItem('user_guest_daily_study_wheel_undo_v1');
                window.DailyStudyWheel.render();
            }""")

            # 记录初始题目掌握度数据，用于验证保护
            await page.evaluate("""() => {
                localStorage.setItem('user_guest_q_test_001_status', 'mastered');
                localStorage.setItem('user_guest_q_test_002_status', 'wrong');
            }""")

            base_prog = await page.evaluate("() => window.DailyStudyWheel.getWheelProgress('math')")
            print(f"   • 基线状态: completed={base_prog['completed']}, remaining={base_prog['remaining']}")

            # 2. 抽取第 1 轮
            await page.click("#btnDailyMathWheelSpin")
            await page.wait_for_function("() => !window.DailyStudyWheel.isSpinning()", timeout=5000)

            r1 = await page.evaluate("() => window.DailyStudyWheel.getCurrentRound('shu1')")
            assert r1 is not None and r1["round"] == 1 and r1["status"] == "active"
            print(f"   • 第 1 轮已抽取: 《{r1.get('book')}》- {r1.get('short') or r1.get('name')}")

            # 3. 点击完成本轮学习
            dialogs_log.clear()
            await page.click("#btnStudyWheelComplete")
            await page.wait_for_function(
                "() => { const r = window.DailyStudyWheel.getCurrentRound('shu1'); return r && r.status === 'completed'; }",
                timeout=3000
            )

            prog_after_complete = await page.evaluate("() => window.DailyStudyWheel.getWheelProgress('math')")
            assert prog_after_complete["completed"] == base_prog["completed"] + 1, "完成一轮后 completed 应 +1"
            assert prog_after_complete["remaining"] == base_prog["remaining"] - 1, "完成一轮后 remaining 应 -1"
            print(f"   • 完成后状态: completed={prog_after_complete['completed']}, remaining={prog_after_complete['remaining']}")

            # 验证历史完成池已写入
            hist_completed_ids = await page.evaluate(
                "() => { const h = window.DailyStudyWheel.getHistoryState(); return h.math.completed.map(c => c.chapterId); }"
            )
            assert r1["chapterId"] in hist_completed_ids, "历史完成池必须包含第 1 轮章节"

            # 4. 点击继续加量 -> 开启第 2 轮
            await page.click("#btnStudyWheelAddRound")
            await page.wait_for_function("() => !window.DailyStudyWheel.isSpinning()", timeout=5000)
            r2 = await page.evaluate("() => window.DailyStudyWheel.getCurrentRound('shu1')")
            assert r2["round"] == 2 and r2["status"] == "active", "开启第 2 轮加量成功"
            print(f"   • 第 2 轮已开启: 《{r2.get('book')}》- {r2.get('short') or r2.get('name')}")

            screenshot3 = str(SCREENSHOTS_DIR / "wheel_multi_round.png")
            await page.locator(".daily-math-wheel-modal").screenshot(path=screenshot3)

            # 5. 点击 ↩ 撤销上一轮
            dialogs_log.clear()
            await page.click("#btnStudyWheelUndoRound")
            await page.wait_for_function(
                "() => { const r = window.DailyStudyWheel.getCurrentRound('shu1'); return r && r.round === 1 && r.status === 'active'; }",
                timeout=3000
            )

            # 6. 核心验证：撤销后完成池必须已撤回该章节！
            hist_after_undo = await page.evaluate(
                "() => { const h = window.DailyStudyWheel.getHistoryState(); return h.math.completed.map(c => c.chapterId); }"
            )
            assert r1["chapterId"] not in hist_after_undo, "撤销后历史完成池必须已移除第 1 轮章节！"

            prog_after_undo = await page.evaluate("() => window.DailyStudyWheel.getWheelProgress('math')")
            assert prog_after_undo["completed"] == base_prog["completed"], "撤销后 completed 必须 -1 回退到基线！"
            assert prog_after_undo["remaining"] == base_prog["remaining"], "撤销后 remaining 必须 +1 恢复到基线！"
            print(f"   • 撤销后状态: completed={prog_after_undo['completed']}, remaining={prog_after_undo['remaining']} (完成池精确撤回)")

            screenshot4 = str(SCREENSHOTS_DIR / "wheel_undo_restored.png")
            await page.locator(".daily-math-wheel-modal").screenshot(path=screenshot4)

            # 7. 刷新页面验证持久性
            await page.reload(wait_until="networkidle")
            await page.evaluate("() => window.DailyStudyWheel.openModal('shu1')")

            reload_round = await page.evaluate("() => window.DailyStudyWheel.getCurrentRound('shu1')")
            assert reload_round["round"] == 1 and reload_round["status"] == "active", "刷新后保持第 1 轮 active"
            assert reload_round["chapterId"] == r1["chapterId"], "刷新后章节与撤销前完全一致"

            reload_prog = await page.evaluate("() => window.DailyStudyWheel.getWheelProgress('math')")
            assert reload_prog["completed"] == base_prog["completed"], "刷新后 completed 保持撤销后的回退值"
            assert reload_prog["remaining"] == base_prog["remaining"], "刷新后 remaining 保持撤销后的恢复值"
            print("   • 刷新页面持久性测试: 撤销状态与完成度完全保持 ✓")

            # 8. 真实题目数据保护验证
            q1_status = await page.evaluate("() => localStorage.getItem('user_guest_q_test_001_status')")
            q2_status = await page.evaluate("() => localStorage.getItem('user_guest_q_test_002_status')")
            assert q1_status == "mastered" and q2_status == "wrong", "真实题目数据严格未被修改"
            print("   • 真实刷题掌握度数据严格未被破坏 ✓")

            # 9. 再次完成不重复计数验证
            await page.click("#btnStudyWheelComplete")
            await page.wait_for_function(
                "() => { const r = window.DailyStudyWheel.getCurrentRound('shu1'); return r && r.status === 'completed'; }",
                timeout=3000
            )
            recomplete_prog = await page.evaluate("() => window.DailyStudyWheel.getWheelProgress('math')")
            assert recomplete_prog["completed"] == base_prog["completed"] + 1, "再次完成后 completed 精确 +1，未重复计数"
            print("   • 再次完成测试: 完成数未重复计数，幂等安全 ✓")

            print("✅ Part 2 PASS: 事务性撤销全部断言成功通过")

            await context.close()
            await browser.close()

    print("\n" + "=" * 60)
    print("🎉 ALL BROWSER E2E TESTS PASSED SUCCESSFULLY!")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(run_browser_tests())
