import asyncio
import contextlib
import functools
import http.server
import json
import re
import threading
from pathlib import Path

from playwright.async_api import async_playwright, expect

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
    await page.wait_for_function(
        """() =>
          !!window.StudyAnalytics &&
          typeof window.StudyAnalytics.getDailyTopicGoals === 'function' &&
          Array.isArray(window.SUBJECTS) &&
          window.SUBJECTS.length >= 2
        """
    )
    await expect(page.locator("#dailyGoalButton")).to_be_visible()
    await expect(page.locator("#dailyTopicGoalButton")).to_be_visible()
    return context, page, unexpected_errors


async def assert_no_horizontal_overflow(page, label):
    dims = await page.evaluate(
        """() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth
        })"""
    )
    assert dims["scrollWidth"] <= dims["clientWidth"] + 1, (
        f"{label}: horizontal overflow {dims}"
    )


async def test_scenario_a_header_initial_state(browser, url):
    print("Testing Scenario A: Header Initial State...")
    context, page, errors = await new_page(browser, url)
    try:
        topic_btn = page.locator("#dailyTopicGoalButton")
        await expect(topic_btn).to_be_visible()
        math_name = page.locator("#dailyTopicMathName")
        major_name = page.locator("#dailyTopicMajorName")
        await expect(math_name).to_have_text("未设置")
        await expect(major_name).to_have_text("未设置")

        await assert_no_horizontal_overflow(page, "Scenario A Header Initial")
        assert not errors, f"Errors in Scenario A: {errors}"
        print("[PASS] Scenario A PASS: Header 初始状态正常")
    finally:
        await context.close()


async def test_scenario_b_set_math_and_major_topic(browser, url):
    print("Testing Scenario B: Set Math & Major Topic Settings...")
    context, page, errors = await new_page(browser, url)
    try:
        await page.click("#dailyTopicGoalButton")
        modal = page.locator("#dailyTopicGoalModal")
        await expect(modal).to_be_visible()

        # 设置数学专题
        await page.fill("#dailyTopicMathTitleInput", "极限与连续")
        await page.select_option("#dailyTopicMathBookSelect", value="基础30讲")
        await page.select_option("#dailyTopicMathChapterSelect", value="ch1")
        await page.fill("#dailyTopicMathTargetInput", "3")

        # 检查开始突破按钮是否出现
        math_start = page.locator("#dailyTopicMathStartBtn")
        await expect(math_start).to_be_visible()

        # 设置专业课专题（暂不绑定章节测试未绑定态）
        await page.fill("#dailyTopicMajorTitleInput", "进程与线程")
        await page.fill("#dailyTopicMajorTargetInput", "5")

        # 保存
        await page.click("#dailyTopicGoalSave")
        await expect(modal).not_to_be_visible()

        # 验证 Header 显示
        await expect(page.locator("#dailyTopicMathName")).to_have_text("极限与连续")
        await expect(page.locator("#dailyTopicMathProgress")).to_have_text("0 / 3")

        await expect(page.locator("#dailyTopicMajorName")).to_have_text("进程与线程")
        await expect(page.locator("#dailyTopicMajorProgress")).to_have_text("未绑定章节")

        # 验证 localStorage schemaVersion 3
        settings = await page.evaluate(
            "() => JSON.parse(localStorage.getItem('user_guest_study_dashboard_settings_v1'))"
        )
        assert settings["schemaVersion"] in (2, 3), f"Expected schemaVersion 2 or 3, got {settings.get('schemaVersion')}"
        assert settings["dailyTopicGoals"]["math"]["title"] == "极限与连续"
        assert settings["dailyTopicGoals"]["math"]["chapterId"] == "ch1"
        assert settings["dailyTopicGoals"]["math"]["target"] == 3
        assert settings["dailyTopicGoals"]["major"]["title"] == "进程与线程"
        assert settings["dailyTopicGoals"]["major"]["chapterId"] == ""

        assert not errors, f"Errors in Scenario B: {errors}"
        print("[PASS] Scenario B PASS: 专题设置与保存正常（含未绑定章节态）")
    finally:
        await context.close()


async def test_scenario_c_to_f_progress_dedup_and_celebration(browser, url):
    print("Testing Scenarios C-F: Real-time Progress, Deduplication, Isolation & Celebration...")
    context, page, errors = await new_page(browser, url)
    try:
        # 先保存专题配置
        await page.evaluate(
            """() => {
              window.StudyAnalytics.saveDailyTopicGoals({
                math: {
                  enabled: true,
                  title: '极限与连续',
                  subjectId: 'shu1',
                  bookId: '基础30讲',
                  chapterId: 'ch1',
                  target: 3
                },
                major: {
                  enabled: true,
                  title: '信号基础',
                  subjectId: 'zhuanye',
                  bookId: '波哥讲义例题',
                  chapterId: 'bg_jy_01',
                  target: 2
                }
              });
              window.StudyAnalytics.renderDailyTopicGoals();
            }"""
        )

        await expect(page.locator("#dailyTopicMathProgress")).to_have_text("0 / 3")
        await expect(page.locator("#dailyTopicMajorProgress")).to_have_text("0 / 2")

        # 1. 在数学 ch1 做 1 题 (idx 0)
        await page.evaluate(
            """() => {
              window.StudyAnalytics.recordStatus({
                group: 'math',
                subjectId: 'shu1',
                chapterId: 'ch1',
                idx: 0,
                status: 'proficient'
              });
            }"""
        )
        await expect(page.locator("#dailyTopicMathProgress")).to_have_text("1 / 3")

        # 2. 对同一题反复打标：proficient -> vague -> wrong，题数应仍为 1 / 3
        await page.evaluate(
            """() => {
              window.StudyAnalytics.recordStatus({
                group: 'math',
                subjectId: 'shu1',
                chapterId: 'ch1',
                idx: 0,
                status: 'vague'
              });
              window.StudyAnalytics.recordStatus({
                group: 'math',
                subjectId: 'shu1',
                chapterId: 'ch1',
                idx: 0,
                status: 'wrong'
              });
            }"""
        )
        await expect(page.locator("#dailyTopicMathProgress")).to_have_text("1 / 3")

        # 3. 在非目标数学章节做题 (ch2) -> 数学专题不增加
        await page.evaluate(
            """() => {
              window.StudyAnalytics.recordStatus({
                group: 'math',
                subjectId: 'shu1',
                chapterId: 'ch2',
                idx: 0,
                status: 'proficient'
              });
            }"""
        )
        await expect(page.locator("#dailyTopicMathProgress")).to_have_text("1 / 3")

        # 4. 英语打标 -> 数学与专业课专题均不增加
        await page.evaluate(
            """() => {
              window.StudyAnalytics.recordStatus({
                group: 'english',
                subjectId: 'english',
                chapterId: 'vocab',
                idx: 0,
                itemKey: 'apple',
                status: 'proficient'
              });
            }"""
        )
        await expect(page.locator("#dailyTopicMathProgress")).to_have_text("1 / 3")
        await expect(page.locator("#dailyTopicMajorProgress")).to_have_text("0 / 2")

        # 5. 专业课独立计数测试
        await page.evaluate(
            """() => {
              window.StudyAnalytics.recordStatus({
                group: 'major',
                subjectId: 'zhuanye',
                chapterId: 'bg_jy_01',
                idx: 0,
                status: 'proficient'
              });
            }"""
        )
        await expect(page.locator("#dailyTopicMajorProgress")).to_have_text("1 / 2")
        await expect(page.locator("#dailyTopicMathProgress")).to_have_text("1 / 3")

        # 6. 数学达成 3/3，触发庆祝与变色
        toast = page.locator("#dailyTopicGoalToast")
        await page.evaluate(
            """() => {
              window.StudyAnalytics.recordStatus({
                group: 'math',
                subjectId: 'shu1',
                chapterId: 'ch1',
                idx: 1,
                status: 'proficient'
              });
              window.StudyAnalytics.recordStatus({
                group: 'math',
                subjectId: 'shu1',
                chapterId: 'ch1',
                idx: 2,
                status: 'proficient'
              });
            }"""
        )
        await expect(page.locator("#dailyTopicMathProgress")).to_have_text("已突破 · 3 / 3")
        math_row = page.locator("#dailyTopicGoalButton .daily-topic-row[data-topic-group='math']")
        await expect(math_row).to_have_class(re.compile(r"daily-topic-complete"))

        # 验证庆祝 Toast 弹出内容
        await expect(toast).to_be_visible()
        toast_text = await toast.text_content()
        assert "🎉 数学今日专题已突破：极限与连续" in toast_text, f"Unexpected toast: {toast_text}"

        # 7. 继续做第 4 题 (4 / 3)，不重复触发庆祝
        await page.evaluate("() => { document.getElementById('dailyTopicGoalToast').hidden = true; }")
        await page.evaluate(
            """() => {
              window.StudyAnalytics.recordStatus({
                group: 'math',
                subjectId: 'shu1',
                chapterId: 'ch1',
                idx: 3,
                status: 'proficient'
              });
            }"""
        )
        await expect(page.locator("#dailyTopicMathProgress")).to_have_text("已突破 · 4 / 3")
        # toast 不应再次变为可见
        await expect(toast).not_to_be_visible()

        assert not errors, f"Errors in Scenarios C-F: {errors}"
        print("[PASS] Scenarios C-F PASS: 实时进度、去重、隔离与完成庆祝正常")
    finally:
        await context.close()


async def test_scenario_g_h_refresh_and_next_day(browser, url):
    print("Testing Scenarios G & H: Page Reload Persistence & Next Day Reset...")
    init_state = r"""
    (() => {
      try {
        const today = new Date();
        const pad2 = (n) => String(n).padStart(2, '0');
        const dayStr = today.getFullYear() + '-' + pad2(today.getMonth() + 1) + '-' + pad2(today.getDate());
        localStorage.setItem('user_guest_study_dashboard_settings_v1', JSON.stringify({
          schemaVersion: 3,
          dailyGoals: { math: 20, major: 20 },
          dailyTopicGoals: {
            math: { enabled: true, title: '极限与连续', subjectId: 'shu1', bookId: '基础30讲', chapterId: 'ch1', target: 3 },
            major: { enabled: false, title: '', subjectId: 'zhuanye', bookId: '', chapterId: '', target: 10 }
          },
          topicGoalCelebrations: {
            math: { date: dayStr, fingerprint: 'shu1|ch1|极限与连续|3' },
            major: null
          }
        }));
        localStorage.setItem('user_guest_study_events_v1', JSON.stringify([
          { id: '1', ts: Date.now(), day: dayStr, type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 0, status: 'proficient' },
          { id: '2', ts: Date.now(), day: dayStr, type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 1, status: 'proficient' },
          { id: '3', ts: Date.now(), day: dayStr, type: 'status', group: 'math', subjectId: 'shu1', chapterId: 'ch1', idx: 2, status: 'proficient' }
        ]));
      } catch (e) {}
    })();
    """
    context, page, errors = await new_page(browser, url, extra_init=init_state)
    try:
        # Scenario G: 刷新页面配置与进度恢复，不重复庆祝
        await expect(page.locator("#dailyTopicMathName")).to_have_text("极限与连续")
        await expect(page.locator("#dailyTopicMathProgress")).to_have_text("已突破 · 3 / 3")
        toast = page.locator("#dailyTopicGoalToast")
        await expect(toast).not_to_be_visible()

        # Scenario H: 模拟次日（事件属于昨天）
        await page.evaluate(
            """() => {
              const yesterday = new Date(Date.now() - 86400000);
              const pad2 = (n) => String(n).padStart(2, '0');
              const yStr = yesterday.getFullYear() + '-' + pad2(yesterday.getMonth() + 1) + '-' + pad2(yesterday.getDate());
              const events = JSON.parse(localStorage.getItem('user_guest_study_events_v1') || '[]');
              events.forEach(e => { e.day = yStr; e.ts = yesterday.getTime(); });
              localStorage.setItem('user_guest_study_events_v1', JSON.stringify(events));
              window.StudyAnalytics.renderDailyTopicGoals();
            }"""
        )

        # 专题配置仍在，但今天进度自动归零 0 / 3
        await expect(page.locator("#dailyTopicMathName")).to_have_text("极限与连续")
        await expect(page.locator("#dailyTopicMathProgress")).to_have_text("0 / 3")
        math_row = page.locator("#dailyTopicGoalButton .daily-topic-row[data-topic-group='math']")
        await expect(math_row).not_to_have_class(re.compile(r"daily-topic-complete"))

        assert not errors, f"Errors in Scenarios G & H: {errors}"
        print("[PASS] Scenarios G & H PASS: 刷新持久化与次日自动归零正常")
    finally:
        await context.close()


async def test_scenario_i_breakthrough_jump(browser, url):
    print("Testing Scenario I: Breakthrough Navigation into Practice View...")
    init_state = r"""
    (() => {
      try {
        localStorage.setItem('user_guest_kaoyan_subject', 'zhuanye');
        localStorage.setItem('user_guest_study_dashboard_settings_v1', JSON.stringify({
          schemaVersion: 3,
          dailyGoals: { math: 20, major: 20 },
          dailyTopicGoals: {
            math: { enabled: true, title: '极限突破', subjectId: 'shu1', bookId: '基础30讲', chapterId: 'ch1', target: 5 },
            major: { enabled: false, title: '', subjectId: 'zhuanye', bookId: '', chapterId: '', target: 10 }
          }
        }));
      } catch (e) {}
    })();
    """
    context, page, errors = await new_page(browser, url, extra_init=init_state)
    try:
        # 先进入 dashboard 视图
        await page.click("#btnDashboard")
        await expect(page.locator("#dashboardPanel")).to_be_visible()

        # 打开专题弹窗
        await page.click("#dailyTopicGoalButton")
        modal = page.locator("#dailyTopicGoalModal")
        await expect(modal).to_be_visible()

        # 点击数学「开始突破」
        await page.click("#dailyTopicMathStartBtn")
        await expect(modal).not_to_be_visible()
        await expect(page.locator("#dashboardPanel")).not_to_be_visible()

        # 验证已进入 practice 模式、科目切到 shu1、章节切到 ch1
        view = await page.evaluate("() => window.getWorkbenchView()")
        assert view == "practice", f"Expected practice, got {view}"

        state = await page.evaluate("() => window.getCurrentPracticeState()")
        assert state["curSubjectId"] == "shu1", f"Expected shu1, got {state['curSubjectId']}"
        assert state["currentChapterId"] == "ch1", f"Expected ch1, got {state['currentChapterId']}"

        sidebar = page.locator("#practiceSidebar")
        await expect(sidebar).to_be_visible()

        assert not errors, f"Errors in Scenario I: {errors}"
        print("[PASS] Scenario I PASS: 开始突破一键跳转并恢复刷题栏正常")
    finally:
        await context.close()


async def test_scenario_j_weak_chapter_quick_set(browser, url):
    print("Testing Scenario J: Weak Chapter Quick Set Linkage...")
    init_state = r"""
    (() => {
      try {
        localStorage.setItem('user_guest_kaoyan_subject', 'shu1');
        localStorage.setItem('user_guest_ch1_s1_status', JSON.stringify({ '0': 'wrong', '1': 'wrong' }));
      } catch (e) {}
    })();
    """
    context, page, errors = await new_page(browser, url, extra_init=init_state)
    try:
        await page.click("#btnDashboard")
        await expect(page.locator("#dashboardPanel")).to_be_visible()

        card = page.locator("#dbWeakMathGrid .db-weak-card").first
        await expect(card).to_be_visible()

        set_topic_btn = card.locator(".db-weak-set-topic-btn")
        await expect(set_topic_btn).to_be_visible()

        # 点击「设为今日专题」
        await set_topic_btn.click()

        # 专题设置弹窗自动打开，且数学专题名称已自动填入章节名
        modal = page.locator("#dailyTopicGoalModal")
        await expect(modal).to_be_visible()

        math_title_val = await page.locator("#dailyTopicMathTitleInput").input_value()
        assert len(math_title_val) > 0, "数学专题标题应已自动填入"

        math_ch_val = await page.locator("#dailyTopicMathChapterSelect").input_value()
        assert math_ch_val == "ch1", f"Expected ch1, got {math_ch_val}"

        # 此时页面仍处于 dashboard，未偷偷跳走
        await page.click("#dailyTopicGoalCloseBtn")
        await expect(modal).not_to_be_visible()
        await expect(page.locator("#dashboardPanel")).to_be_visible()

        assert not errors, f"Errors in Scenario J: {errors}"
        print("[PASS] Scenario J PASS: 薄弱章节快速设为今日专题联动正常")
    finally:
        await context.close()


async def test_scenario_k_responsive_overflow(browser, url):
    print("Testing Scenario K: Multi-resolution & Overflow (1440, 1200, 1024, 768, 620, 390, 320)...")
    resolutions = [1440, 1200, 1024, 768, 620, 390, 320]
    for width in resolutions:
        context, page, errors = await new_page(browser, url, viewport={"width": width, "height": 800})
        try:
            topic_btn = page.locator("#dailyTopicGoalButton")
            await expect(topic_btn).to_be_visible()
            await assert_no_horizontal_overflow(page, f"Resolution {width}px")
            assert not errors, f"Errors in Scenario K ({width}px): {errors}"
        finally:
            await context.close()
    print("[PASS] Scenario K PASS: 各主流分辨率无页面级横向滚动")


async def main():
    print("\n=======================================================")
    print("Starting Daily Topic Goal Browser E2E Tests (Playwright)")
    print("=======================================================\n")
    with serve_repo() as url:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            try:
                await test_scenario_a_header_initial_state(browser, url)
                await test_scenario_b_set_math_and_major_topic(browser, url)
                await test_scenario_c_to_f_progress_dedup_and_celebration(browser, url)
                await test_scenario_g_h_refresh_and_next_day(browser, url)
                await test_scenario_i_breakthrough_jump(browser, url)
                await test_scenario_j_weak_chapter_quick_set(browser, url)
                await test_scenario_k_responsive_overflow(browser, url)
            finally:
                await browser.close()
    print("\n=======================================================")
    print("SUCCESS: ALL_DAILY_TOPIC_GOAL_BROWSER_TESTS_PASSED!")
    print("=======================================================\n")


if __name__ == "__main__":
    asyncio.run(main())
