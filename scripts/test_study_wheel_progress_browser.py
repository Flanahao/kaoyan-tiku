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
    page.on("dialog", lambda dialog: asyncio.create_task(dialog.accept()))

    await page.goto(url, wait_until="domcontentloaded")
    await page.wait_for_timeout(300)
    return page, unexpected_errors


async def main():
    print("================================================================")
    print("🌐 Running scripts/test_study_wheel_progress_browser.py")
    print("================================================================")

    with serve_repo() as url:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)

            # ------------------------------------------------------------------
            # Test 1: 初始状态与双科目 Header 按钮验证
            # ------------------------------------------------------------------
            print("\n--- Test 1: 初始加载与双科目 Header 按钮 ---")
            page, errs = await new_page(browser, url)

            math_btn = page.locator("#dailyMathWheelButton")
            major_btn = page.locator("#dailyMajorWheelButton")

            assert await math_btn.is_visible(), "Header 数学转盘按钮必须可见"
            assert await major_btn.is_visible(), "Header 专业课转盘按钮必须可见"

            math_text = await math_btn.inner_text()
            major_text = await major_btn.inner_text()
            assert "数学" in math_text and "未抽" in math_text, f"数学按钮初始文本应包含'数学'与'未抽'，实际: {math_text}"
            assert "专业课" in major_text and "未抽" in major_text, f"专业课按钮初始文本应包含'专业课'与'未抽'，实际: {major_text}"

            print("✅ Test 1 PASS: 双科目 Header 按钮就绪且状态为未抽")

            # ------------------------------------------------------------------
            # Test 2: 点击专业课按钮打开并激活专业课 Tab
            # ------------------------------------------------------------------
            print("\n--- Test 2: 打开专业课转盘与 Tab 切换 ---")
            await major_btn.click()
            await page.wait_for_timeout(200)

            modal = page.locator("#dailyMathWheelModal")
            assert await modal.is_visible(), "转盘 Modal 必须展示"

            major_tab = page.locator("#studyWheelTabMajor")
            math_tab = page.locator("#studyWheelTabMath")
            major_tab_class = await major_tab.get_attribute("class")
            assert "active" in major_tab_class, "点击专业课按钮打开时，专业课 Tab 应激活"

            # 检查候选池数量
            candidates_major = await page.evaluate(
                "window.DailyStudyWheel && window.DailyStudyWheel.getActiveCandidates ? window.DailyStudyWheel.getActiveCandidates('zhuanye').length : 0"
            )
            assert candidates_major == 20, f"专业课总有效候选章节必须为 20，实际: {candidates_major}"

            # 切换到数学 Tab
            await math_tab.click()
            await page.wait_for_timeout(200)
            candidates_math = await page.evaluate(
                "window.DailyStudyWheel && window.DailyStudyWheel.getActiveCandidates ? window.DailyStudyWheel.getActiveCandidates('shu1').length : 0"
            )
            assert candidates_math == 196, f"数学总有效候选章节必须为 196，实际: {candidates_math}"

            # 切回专业课 Tab 进行后续测试
            await major_tab.click()
            await page.wait_for_timeout(200)
            print("✅ Test 2 PASS: 专业课与数学 Tab 切换及候选池数量验证通过")

            # ------------------------------------------------------------------
            # Test 3: 首次旋转，数据即刻落地 (Anti-Cheat 瞬时写入)
            # ------------------------------------------------------------------
            print("\n--- Test 3: 首次旋转与 50ms 瞬时持久化 ---")
            spin_btn = page.locator("#btnDailyMathWheelSpin")
            complete_btn = page.locator("#btnStudyWheelComplete")
            add_round_btn = page.locator("#btnStudyWheelAddRound")
            start_btn = page.locator("#btnDailyMathWheelStart")

            assert await spin_btn.is_enabled(), "初始未抽取状态下开始旋转必须可用"
            assert not await start_btn.is_enabled(), "初始状态下开始学习应不可用"
            assert not await add_round_btn.is_visible(), "初始未抽取时加量按钮必须隐藏"

            await spin_btn.click()

            # 50ms 内验证 localStorage 已经写入 round 1
            await page.wait_for_timeout(50)
            raw_daily = await page.evaluate(
                "localStorage.getItem('user_guest_daily_study_wheel_daily_v1')"
            )
            assert raw_daily is not None, "点击旋转后 50ms 内，localStorage 必须已持久化"
            daily_data = json.loads(raw_daily)
            assert "major" in daily_data, "专业课数据必须存在 dailyState.major 中"
            rounds = daily_data["major"].get("rounds", [])
            assert len(rounds) == 1, f"应当已生成第 1 轮，实际轮数: {len(rounds)}"
            r1 = rounds[0]
            assert r1.get("status") == "doing", f"第 1 轮初始状态必须为 doing，实际: {r1.get('status')}"
            ch1_id = r1.get("chapterId")
            ch1_book = r1.get("book")
            assert ch1_book in ["波哥讲义例题", "波哥习题集"], f"专业课抽中书籍必须为波哥两本之一: {ch1_book}"
            print(f"   • 第 1 轮瞬时锁定: {ch1_book} - {r1.get('name')} ({ch1_id})")

            # 动画进行中（加量按钮必须依然隐藏，严禁加量）
            assert not await add_round_btn.is_visible(), "进行中严禁解锁继续加量"

            # 等待旋转动画完成 (4.8s)
            await page.wait_for_timeout(4800)

            # 动画完成后，完成按钮应展示，开始学习可用，加量按钮依然不可用（隐藏）
            assert await complete_btn.is_visible(), "第 1 轮抽完后，完成今日任务按钮应可见"
            assert await start_btn.is_enabled(), "第 1 轮抽完后，开始学习按钮应可用"
            assert not await add_round_btn.is_visible(), "doing 状态下继续加量必须保持隐藏"

            print("✅ Test 3 PASS: 首次旋转、瞬时落地与未完成防加量验证通过")

            # ------------------------------------------------------------------
            # Test 4: 刷新页面保持状态 (防刷题与防作弊)
            # ------------------------------------------------------------------
            print("\n--- Test 4: 刷新页面状态保持 ---")
            await page.reload()
            await page.wait_for_timeout(400)

            # 打开专业课弹窗
            await page.locator("#dailyMajorWheelButton").click()
            await page.wait_for_timeout(200)

            # 验证结果保持不变
            r1_card_name = await page.locator("#dailyMathWheelResultName").inner_text()
            assert r1.get("short") in r1_card_name or r1.get("name") in r1_card_name, "刷新后卡片展示应保持第 1 轮抽中章节"
            assert not await page.locator("#btnStudyWheelAddRound").is_visible(), "刷新后 doing 状态下加量依然必须隐藏"

            print("✅ Test 4 PASS: 刷新后状态与防作弊锁定保持一致")

            # ------------------------------------------------------------------
            # Test 5: 手动完成当前任务并解锁继续加量
            # ------------------------------------------------------------------
            print("\n--- Test 5: 手动完成今日任务并解锁加量 ---")
            await page.locator("#btnStudyWheelComplete").click()
            await page.wait_for_timeout(200)

            # 验证第 1 轮状态已变为 completed
            raw_daily_after_comp = await page.evaluate(
                "localStorage.getItem('user_guest_daily_study_wheel_daily_v1')"
            )
            d_after = json.loads(raw_daily_after_comp)
            assert d_after["major"]["rounds"][0]["status"] == "completed", "点击完成后状态必须为 completed"

            # 验证历史存储已记录
            raw_history = await page.evaluate(
                "localStorage.getItem('user_guest_daily_study_wheel_history_v1')"
            )
            assert raw_history is not None, "完成章节必须记录至历史存储"
            h_data = json.loads(raw_history)
            completed_ids = [c["chapterId"] for c in h_data.get("major", {}).get("completed", [])]
            assert ch1_id in completed_ids, "历史完成章节必须包含 ch1"

            # 验证阶段推进为 1/20
            stage_text = await page.locator("#studyWheelStageInfo").inner_text()
            assert "1/20" in stage_text, f"推进进度文本应包含'1/20'，实际: {stage_text}"

            # 验证继续加量按钮已解锁并展示！
            assert await page.locator("#btnStudyWheelAddRound").is_visible(), "完成第 1 轮后继续加量按钮必须展示"
            assert await page.locator("#btnStudyWheelAddRound").is_enabled(), "完成第 1 轮后继续加量按钮必须可用"
            print("✅ Test 5 PASS: 手动完成当前任务与加量解锁验证通过")

            # ------------------------------------------------------------------
            # Test 6: 点击继续加量 (Round 2) 且绝不重复 Round 1 章节
            # ------------------------------------------------------------------
            print("\n--- Test 6: 多轮加量抽选第 2 轮 & 去重验证 ---")
            await page.locator("#btnStudyWheelAddRound").click()
            await page.wait_for_timeout(50)

            # 验证轮次增加为 2
            raw_daily_r2 = await page.evaluate(
                "localStorage.getItem('user_guest_daily_study_wheel_daily_v1')"
            )
            d_r2 = json.loads(raw_daily_r2)
            rounds_r2 = d_r2["major"]["rounds"]
            assert len(rounds_r2) == 2, f"轮数必须增加为 2，实际: {len(rounds_r2)}"
            r2 = rounds_r2[1]
            ch2_id = r2.get("chapterId")
            assert ch2_id != ch1_id, f"第 2 轮章节 ({ch2_id}) 绝对不能与第 1 轮重复 ({ch1_id})"
            print(f"   • 第 2 轮抽取结果: {r2.get('book')} - {r2.get('name')} ({ch2_id})")

            # 等待第 2 轮动画结束
            await page.wait_for_timeout(4800)

            # 检查 kicker 展示第 2 轮进行中
            kicker_text = await page.locator("#studyWheelRoundKicker").inner_text()
            assert "第 2 轮" in kicker_text and "进行中" in kicker_text, f"Kicker 应显示第 2 轮进行中，实际: {kicker_text}"

            print("✅ Test 6 PASS: 多轮加量成功且章节严格去重")

            # ------------------------------------------------------------------
            # Test 7: 点击开始学习精准跳转进入专业课刷题
            # ------------------------------------------------------------------
            print("\n--- Test 7: 开始学习跳转至专业课刷题模式 ---")
            await page.locator("#btnDailyMathWheelStart").click()
            await page.wait_for_timeout(400)

            # 弹窗必须已关闭
            assert not await page.locator("#dailyMathWheelModal").is_visible(), "点击开始学习后弹窗必须关闭"

            # 检查当前学科与章节
            cur_state = await page.evaluate(
                "window.getCurrentPracticeState ? window.getCurrentPracticeState() : null"
            )
            assert cur_state is not None, "getCurrentPracticeState 必须可用"
            assert cur_state["curSubjectId"] == "zhuanye", f"当前学科必须为专业课 zhuanye，实际: {cur_state['curSubjectId']}"
            assert cur_state.get("currentChapterId") == ch2_id, f"当前章节必须为第 2 轮章节 {ch2_id}，实际: {cur_state.get('currentChapterId')}"

            print("✅ Test 7 PASS: 专业课开始学习精准定位到题库并激活刷题侧边栏")

            # ------------------------------------------------------------------
            # Test 8: 阶段全部完成与开启下一阶段
            # ------------------------------------------------------------------
            print("\n--- Test 8: 阶段推进全部完成与开启下一阶段 ---")
            page_stage, _ = await new_page(browser, url)

            # 通过 evaluate 填充专业课 20 章节至历史完成池
            await page_stage.evaluate("""
            () => {
              const cands = window.DailyStudyWheel.getAllCandidates('zhuanye');
              const hist = window.DailyStudyWheel.getHistoryState();
              hist.major.completed = cands.map(c => ({
                chapterId: c.chapterId,
                book: c.book,
                name: c.name,
                short: c.short,
                total: c.total
              }));
              window.DailyStudyWheel.saveHistoryState(hist);
            }
            """)

            await page_stage.locator("#dailyMajorWheelButton").click()
            await page_stage.wait_for_timeout(300)

            # 验证全完成提示框
            stage_box = page_stage.locator("#studyWheelNextStageBox")
            assert await stage_box.is_visible(), "全部推进完成时必须展示下一阶段提示框"
            stage_box_text = await stage_box.inner_text()
            assert "全部推进完成" in stage_box_text, f"提示框文本应包含'全部推进完成'，实际: {stage_box_text}"

            next_stage_btn = page_stage.locator("#btnStudyWheelNextStage")
            assert await next_stage_btn.is_visible(), "开启下一阶段按钮必须可见"

            # 点击开启下一阶段
            await next_stage_btn.click()
            await page_stage.wait_for_timeout(200)

            # 验证历史存储进入第 2 阶段，完成列表重置为空
            raw_hist_s2 = await page_stage.evaluate(
                "localStorage.getItem('user_guest_daily_study_wheel_history_v1')"
            )
            hist_s2 = json.loads(raw_hist_s2)
            assert hist_s2["major"]["round"] == 2, f"阶段必须自增为 2，实际: {hist_s2['major']['round']}"
            assert len(hist_s2["major"]["completed"]) == 0, "开启新阶段后已完成章节应清空重置"

            # 验证提示框消失，转盘重新可用
            assert not await stage_box.is_visible(), "新阶段开启后全完成提示框应隐藏"
            assert await page_stage.locator("#btnDailyMathWheelSpin").is_enabled(), "新阶段开启后转盘应重新可用"

            print("✅ Test 8 PASS: 阶段全部完成提示与进入第 2 阶段轮空重置验证通过")

            # ------------------------------------------------------------------
            # Test 9: 全尺寸响应式无横向溢出 (1440px ~ 320px)
            # ------------------------------------------------------------------
            print("\n--- Test 9: 全尺寸响应式布局测试 ---")
            viewports = [
                (1440, 900),
                (1200, 800),
                (1024, 768),
                (860, 900),
                (768, 1024),
                (620, 900),
                (390, 844),
                (320, 568)
            ]

            for w, h in viewports:
                await page_stage.set_viewport_size({"width": w, "height": h})
                await page_stage.wait_for_timeout(150)

                # 检查页面整体是否溢出
                scroll_w = await page_stage.evaluate("document.documentElement.scrollWidth")
                client_w = await page_stage.evaluate("document.documentElement.clientWidth")
                assert scroll_w <= client_w + 1, f"在 {w}x{h} 下页面出现横向溢出: scrollWidth={scroll_w}, clientWidth={client_w}"

                # 弹窗内画布与按钮可见
                assert await page_stage.locator("#dailyMathWheelCanvas").is_visible(), f"在 {w}x{h} 下画布必须可见"
                assert await page_stage.locator("#btnDailyMathWheelSpin").is_visible(), f"在 {w}x{h} 下旋转按钮必须可见"

            print("✅ Test 9 PASS: 1440px ~ 320px 全分辨率无横向溢出")

            await browser.close()

    print("\n================================================================")
    print("🎉 ALL PLAYWRIGHT STUDY WHEEL PROGRESS TESTS PASSED!")
    print("================================================================")


if __name__ == "__main__":
    asyncio.run(main())
