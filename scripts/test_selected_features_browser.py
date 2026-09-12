import asyncio
import contextlib
import functools
import http.server
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
          typeof window.StudyAnalytics.getDailyGoalCounts === 'function' &&
          typeof window.StudyAnalytics.getStudyStreak === 'function' &&
          typeof window.getWorkbenchView === 'function' &&
          typeof window.getCurrentPracticeState === 'function' &&
          Array.isArray(window.SUBJECTS) &&
          window.SUBJECTS.length >= 2
        """
    )
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


async def assert_sidebar(page, visible, label):
    sidebar = page.locator("#practiceSidebar")
    if visible:
        await expect(sidebar, message=label).to_be_visible()
        assert await sidebar.get_attribute("aria-hidden") in (None, "false")
    else:
        await expect(sidebar, message=label).not_to_be_visible()
        assert await sidebar.get_attribute("aria-hidden") == "true"


async def test_behavior_1_dashboard_hides_sidebar(browser, url):
    print("Running test_behavior_1_dashboard_hides_sidebar...")
    context, page, errors = await new_page(browser, url)
    try:
        assert await page.evaluate("() => window.getWorkbenchView()") == "practice"
        await assert_sidebar(page, True, "初始刷题页应显示右侧刷题栏")

        await page.click("#btnDashboard")
        await expect(page.locator("#dashboardPanel")).to_be_visible()
        assert await page.evaluate("() => window.getWorkbenchView()") == "dashboard"
        await assert_sidebar(page, False, "打开 Dashboard 后应隐藏刷题栏")
        assert not errors, f"Unexpected errors: {errors}"
    finally:
        await context.close()


async def test_behavior_2_dashboard_weak_chapter_restores_sidebar(browser, url):
    print("Running test_behavior_2_dashboard_weak_chapter_restores_sidebar...")
    extra = r"""
    (() => {
      try {
        const mathSubj = 'shu1';
        const chId = 'ch1';
        // 标记 3 道错题，2 道模糊题
        const statusMap = { '0': 'wrong', '1': 'wrong', '2': 'wrong', '3': 'vague', '4': 'vague' };
        localStorage.setItem('user_guest_' + chId + '_s1_status', JSON.stringify(statusMap));
        // 添加 1 个 SM-2 到期题
        const sm2Map = { '0': { nextReview: Date.now() - 10000, interval: 1, reps: 1, ef: 2.5 } };
        localStorage.setItem('user_guest_sm2_shu1_' + chId, JSON.stringify(sm2Map));
      } catch (e) {}
    })();
    """
    context, page, errors = await new_page(browser, url, extra_init=extra)
    try:
        await page.click("#btnDashboard")
        await expect(page.locator("#dashboardPanel")).to_be_visible()

        weak_cards = page.locator("#dbWeakMathGrid .db-weak-card")
        await expect(weak_cards.first).to_be_visible()
        card_ch = await weak_cards.first.get_attribute("data-chapter-id")
        assert card_ch == "ch1", f"Expected ch1 in weak top card, got {card_ch}"

        await weak_cards.first.click()
        assert await page.evaluate("() => window.getWorkbenchView()") == "practice"
        await expect(page.locator("#dashboardPanel")).not_to_be_visible()
        await assert_sidebar(page, True, "从薄弱章节返回后应恢复刷题栏")

        state = await page.evaluate("() => window.getCurrentPracticeState()")
        assert state["curSubjectId"] == "shu1", f"Expected subject shu1, got {state['curSubjectId']}"
        assert state["currentChapterId"] == "ch1", f"Expected chapter ch1, got {state['currentChapterId']}"
        assert not errors, f"Unexpected errors: {errors}"
    finally:
        await context.close()


async def test_behavior_3_cross_subject_weak_chapter_jump(browser, url):
    print("Running test_behavior_3_cross_subject_weak_chapter_jump...")
    extra = r"""
    (() => {
      try {
        localStorage.setItem('user_guest_kaoyan_subject', 'shu1');
        // 专业课注入大量错题，使其弱点分排在第一位（专业课第一章为 bg_jy_01）
        const proChId = 'bg_jy_01';
        const proStatus = { '0': 'wrong', '1': 'wrong', '2': 'wrong', '3': 'wrong', '4': 'wrong' };
        localStorage.setItem('user_guest_' + proChId + '_zhuanye_status', JSON.stringify(proStatus));
        const proSm2 = { '0': { nextReview: Date.now() - 10000, interval: 1, reps: 1, ef: 2.5 } };
        localStorage.setItem('user_guest_sm2_zhuanye_' + proChId, JSON.stringify(proSm2));
      } catch (e) {}
    })();
    """
    context, page, errors = await new_page(browser, url, extra_init=extra)
    try:
        initial_state = await page.evaluate("() => window.getCurrentPracticeState()")
        assert initial_state["curSubjectId"] == "shu1"

        await page.click("#btnDashboard")
        await expect(page.locator("#dashboardPanel")).to_be_visible()

        weak_cards = page.locator("#dbWeakMajorGrid .db-weak-card")
        await expect(weak_cards.first).to_be_visible()
        card_subj = await weak_cards.first.get_attribute("data-subject-id")
        card_ch = await weak_cards.first.get_attribute("data-chapter-id")
        assert card_subj == "zhuanye", f"Expected major card first, got {card_subj}"
        assert card_ch == "bg_jy_01", f"Expected bg_jy_01, got {card_ch}"

        await weak_cards.first.click()
        assert await page.evaluate("() => window.getWorkbenchView()") == "practice"
        await expect(page.locator("#dashboardPanel")).not_to_be_visible()
        await assert_sidebar(page, True, "跨科目跳转后应显示刷题栏")

        state = await page.evaluate("() => window.getCurrentPracticeState()")
        assert state["curSubjectId"] == "zhuanye", f"Expected switched to zhuanye, got {state['curSubjectId']}"
        assert state["currentChapterId"] == "bg_jy_01", f"Expected chapter bg_jy_01, got {state['currentChapterId']}"
        assert not errors, f"Unexpected errors: {errors}"
    finally:
        await context.close()


async def test_behavior_4_sm2_overview_hides_sidebar(browser, url):
    print("Running test_behavior_4_sm2_overview_hides_sidebar...")
    context, page, errors = await new_page(browser, url)
    try:
        await page.evaluate("() => window.toggleSm2Panel()")
        await expect(page.locator("#sm2Panel")).to_be_visible()
        assert await page.evaluate("() => window.getWorkbenchView()") == "sm2"
        await assert_sidebar(page, False, "SM-2 总览应隐藏刷题栏")

        await page.keyboard.press("Escape")
        assert await page.evaluate("() => window.getWorkbenchView()") == "practice"
        await expect(page.locator("#sm2Panel")).not_to_be_visible()
        await assert_sidebar(page, True, "退出 SM-2 后应恢复刷题栏")
        assert not errors, f"Unexpected errors: {errors}"
    finally:
        await context.close()


async def test_behavior_5_sm2_start_review_restores_workbench(browser, url):
    print("Running test_behavior_5_sm2_start_review_restores_workbench...")
    extra = r"""
    (() => {
      try {
        localStorage.setItem('user_guest_kaoyan_subject', 'shu1');
        const sm2Map = {
          '0': { nextReview: Date.now() - 20000, interval: 1, reps: 1, ef: 2.5 },
          '1': { nextReview: Date.now() - 10000, interval: 1, reps: 1, ef: 2.5 }
        };
        localStorage.setItem('user_guest_sm2_shu1_ch1', JSON.stringify(sm2Map));
      } catch (e) {}
    })();
    """
    context, page, errors = await new_page(browser, url, extra_init=extra)
    try:
        await page.evaluate("() => window.toggleSm2Panel()")
        await expect(page.locator("#sm2Panel")).to_be_visible()
        assert await page.evaluate("() => window.getWorkbenchView()") == "sm2"

        start_btn = page.locator("#btnSm2StartAll")
        await expect(start_btn).to_be_visible()
        await start_btn.click()

        assert await page.evaluate("() => window.getWorkbenchView()") == "practice"
        await expect(page.locator("#sm2Panel")).not_to_be_visible()
        await assert_sidebar(page, True, "开始复习后应显示刷题栏")

        # 核心验证：SM-2 复习队列保留，当前题目来自 review queue，并未被普通章节覆盖
        state = await page.evaluate("() => window.getCurrentPracticeState()")
        review_session = state.get("reviewSession")
        assert review_session is not None, "reviewSession 应该存在"
        assert review_session["queueLength"] >= 1, "reviewSession.queue 应该至少有到期题"
        panel_visible = await page.evaluate("() => document.getElementById('reviewQueuePanel').style.display !== 'none'")
        assert panel_visible is True, "reviewQueuePanel 应该处于显示状态"
        assert not errors, f"Unexpected errors: {errors}"
    finally:
        await context.close()


async def test_behavior_6_english_esc_preserves_practice_position(browser, url):
    print("Running test_behavior_6_english_esc_preserves_practice_position...")
    context, page, errors = await new_page(browser, url)
    try:
        # 切到非默认章节及非第 1 题
        await page.evaluate("""() => {
          window.switchChapter('ch3');
          window.switchTo(4);
        }""")
        before = await page.evaluate("() => window.getCurrentPracticeState()")
        assert before["currentChapterId"] == "ch3" and before["current"] == 4

        # 打开英语
        await page.click("#btnEnglish")
        await expect(page.locator("#englishPanel")).to_be_visible()
        assert await page.evaluate("() => window.getWorkbenchView()") == "english"

        # 按 Esc
        await page.keyboard.press("Escape")
        assert await page.evaluate("() => window.getWorkbenchView()") == "practice"
        await expect(page.locator("#englishPanel")).not_to_be_visible()

        after = await page.evaluate("() => window.getCurrentPracticeState()")
        assert after["curSubjectId"] == before["curSubjectId"]
        assert after["currentChapterId"] == before["currentChapterId"]
        assert after["current"] == before["current"]
        assert not errors, f"Unexpected errors: {errors}"
    finally:
        await context.close()


async def test_behavior_7_english_status_updates_all_site_not_daily_goals(browser, url):
    print("Running test_behavior_7_english_status_updates_all_site_not_daily_goals...")
    context, page, errors = await new_page(browser, url)
    try:
        initial = await page.evaluate("""() => ({
          totals: window.StudyAnalytics.getSubjectTotals(),
          daily: window.StudyAnalytics.getDailyGoalCounts(),
          streak: window.StudyAnalytics.getStudyStreak(),
          todayTrend: window.StudyAnalytics.getTrendCounts().counts.slice(-1)[0]
        })""")

        await page.click("#btnEnglish")
        await expect(page.locator("#englishPanel")).to_be_visible()

        # 点击第一个单词的「不会」状态
        status_btn = page.locator(".english-status.wrong").first
        await expect(status_btn).to_be_visible()
        await status_btn.click()

        after_mark = await page.evaluate("""() => ({
          totals: window.StudyAnalytics.getSubjectTotals(),
          daily: window.StudyAnalytics.getDailyGoalCounts(),
          streak: window.StudyAnalytics.getStudyStreak(),
          todayTrend: window.StudyAnalytics.getTrendCounts().counts.slice(-1)[0]
        })""")

        # 验证全站及英语计数增加
        assert after_mark["totals"]["english"]["done"] == initial["totals"]["english"]["done"] + 1, "英语已标记应 +1"
        assert after_mark["totals"]["all"]["done"] == initial["totals"]["all"]["done"] + 1, "全站已标记应 +1"
        assert after_mark["todayTrend"] == initial["todayTrend"] + 1, "14天今日趋势应 +1"
        assert after_mark["streak"] >= 1, "streak 应计入今日"

        # 核心验证：数学与专业课每日目标严禁受英语影响
        assert after_mark["daily"]["math"] == initial["daily"]["math"], "数学每日目标不应增加"
        assert after_mark["daily"]["major"] == initial["daily"]["major"], "专业课每日目标不应增加"

        # 再次点击取消状态（un-mark）
        active_btn = page.locator(".english-status.wrong.active").first
        await expect(active_btn).to_be_visible()
        await active_btn.click()

        after_unmark = await page.evaluate("""() => ({
          totals: window.StudyAnalytics.getSubjectTotals(),
          daily: window.StudyAnalytics.getDailyGoalCounts(),
          todayTrend: window.StudyAnalytics.getTrendCounts().counts.slice(-1)[0]
        })""")

        # 统计回退，但今天学习过的 event 不丢失
        assert after_unmark["totals"]["english"]["done"] == initial["totals"]["english"]["done"], "取消后英语已标记应回退"
        assert after_unmark["totals"]["all"]["done"] == initial["totals"]["all"]["done"], "取消后全站已标记应回退"
        assert after_unmark["todayTrend"] == after_mark["todayTrend"], "取消后今日学习 event 应该保留"
        assert not errors, f"Unexpected errors: {errors}"
    finally:
        await context.close()


async def test_behavior_8_streak_boundary_cases(browser, url):
    print("Running test_behavior_8_streak_boundary_cases...")
    context, page, errors = await new_page(browser, url)
    try:
        results = await page.evaluate("""() => {
          function toKey(d) {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return y + '-' + m + '-' + day;
          }
          const now = new Date();
          const today = toKey(now);
          const yesterday = toKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1));
          const day2 = toKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2));
          const day3 = toKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3));

          // Case A: 今天、昨天、前天（涵盖 math, major, english）
          const streakA = window.StudyAnalytics.getStudyStreak(null, [
            { day: today, group: 'math' },
            { day: yesterday, group: 'major' },
            { day: day2, group: 'english' }
          ]);

          // Case B: 今天无、昨天、前天
          const streakB = window.StudyAnalytics.getStudyStreak(null, [
            { day: yesterday, group: 'math' },
            { day: day2, group: 'english' }
          ]);

          // Case C: 今天无、昨天无、前天有
          const streakC = window.StudyAnalytics.getStudyStreak(null, [
            { day: day2, group: 'math' },
            { day: day3, group: 'major' }
          ]);

          // Case D: 很多历史完成题，但今天昨天都无 event
          const streakD = window.StudyAnalytics.getStudyStreak({ totalDone: 888 }, []);

          return { streakA, streakB, streakC, streakD };
        }""")

        assert results["streakA"] == 3, f"Case A expected 3, got {results['streakA']}"
        assert results["streakB"] == 2, f"Case B expected 2, got {results['streakB']}"
        assert results["streakC"] == 0, f"Case C expected 0, got {results['streakC']}"
        assert results["streakD"] == 0, f"Case D expected 0, got {results['streakD']}"
        assert not errors, f"Unexpected errors: {errors}"
    finally:
        await context.close()


async def test_weak_chapters_split_cases_a_to_f(browser, url):
    print("Running test_weak_chapters_split_cases_a_to_f...")

    # Case A: 数学和专业课都有薄弱数据
    extra_a = r"""
    (() => {
      try {
        localStorage.setItem('user_guest_kaoyan_subject', 'shu1');
        ['ch1', 'ch2', 'ch3', 'ch4'].forEach((ch, idx) => {
          const st = {};
          for (let i = 0; i <= idx + 1; i++) st[String(i)] = 'wrong';
          localStorage.setItem('user_guest_' + ch + '_s1_status', JSON.stringify(st));
        });
        ['bg_jy_01', 'bg_jy_02', 'bg_jy_03', 'bg_jy_04'].forEach((ch, idx) => {
          const st = {};
          for (let i = 0; i <= idx + 1; i++) st[String(i)] = 'wrong';
          localStorage.setItem('user_guest_' + ch + '_zhuanye_status', JSON.stringify(st));
        });
      } catch (e) {}
    })();
    """
    context, page, errors = await new_page(browser, url, extra_init=extra_a)
    try:
        await page.click("#btnDashboard")
        await expect(page.locator("#dashboardPanel")).to_be_visible()

        math_block = page.locator('.db-weak-subject-block[data-weak-subject="math"]')
        major_block = page.locator('.db-weak-subject-block[data-weak-subject="major"]')
        await expect(math_block.locator("h4")).to_have_text("数学薄弱章节 Top 3")
        await expect(major_block.locator("h4")).to_have_text("专业课薄弱章节 Top 3")

        math_cards = page.locator("#dbWeakMathGrid .db-weak-card")
        major_cards = page.locator("#dbWeakMajorGrid .db-weak-card")
        assert await math_cards.count() == 3, f"Expected 3 math cards in Case A, got {await math_cards.count()}"
        assert await major_cards.count() == 3, f"Expected 3 major cards in Case A, got {await major_cards.count()}"

        for i in range(3):
            subj_m = await math_cards.nth(i).get_attribute("data-subject-id")
            assert subj_m == "shu1", f"Math card #{i} expected shu1, got {subj_m}"
            subj_p = await major_cards.nth(i).get_attribute("data-subject-id")
            assert subj_p == "zhuanye", f"Major card #{i} expected zhuanye, got {subj_p}"

        assert not errors, f"Unexpected errors in Case A: {errors}"
    finally:
        await context.close()

    # Case B: 数学弱项很多 (10个)，专业课有 3 个弱项 -> 数学不挤占专业课
    extra_b = r"""
    (() => {
      try {
        localStorage.setItem('user_guest_kaoyan_subject', 'shu1');
        for (let c = 1; c <= 10; c++) {
          const ch = 'ch' + c;
          const st = { '0': 'wrong', '1': 'wrong', '2': 'wrong', '3': 'wrong', '4': 'wrong' };
          localStorage.setItem('user_guest_' + ch + '_s1_status', JSON.stringify(st));
        }
        ['bg_jy_01', 'bg_jy_02', 'bg_jy_03'].forEach(ch => {
          const st = { '0': 'wrong' };
          localStorage.setItem('user_guest_' + ch + '_zhuanye_status', JSON.stringify(st));
        });
      } catch (e) {}
    })();
    """
    context, page, errors = await new_page(browser, url, extra_init=extra_b)
    try:
        await page.click("#btnDashboard")
        await expect(page.locator("#dashboardPanel")).to_be_visible()

        math_cards = page.locator("#dbWeakMathGrid .db-weak-card")
        major_cards = page.locator("#dbWeakMajorGrid .db-weak-card")
        assert await math_cards.count() == 3, f"Case B: Math must be capped at 3, got {await math_cards.count()}"
        assert await major_cards.count() == 3, f"Case B: Major must display all 3 cards, not squeezed out, got {await major_cards.count()}"
        for i in range(3):
            assert await major_cards.nth(i).get_attribute("data-subject-id") == "zhuanye"
        assert not errors, f"Unexpected errors in Case B: {errors}"
    finally:
        await context.close()

    # Case C: 专业课弱项很多 (5个)，数学只有 1 个弱项 -> 不拿专业课填补数学名额
    extra_c = r"""
    (() => {
      try {
        localStorage.setItem('user_guest_kaoyan_subject', 'shu1');
        localStorage.setItem('user_guest_ch1_s1_status', JSON.stringify({ '0': 'wrong', '1': 'wrong' }));
        ['bg_jy_01', 'bg_jy_02', 'bg_jy_03', 'bg_jy_04', 'bg_jy_05'].forEach(ch => {
          localStorage.setItem('user_guest_' + ch + '_zhuanye_status', JSON.stringify({ '0': 'wrong' }));
        });
      } catch (e) {}
    })();
    """
    context, page, errors = await new_page(browser, url, extra_init=extra_c)
    try:
        await page.click("#btnDashboard")
        await expect(page.locator("#dashboardPanel")).to_be_visible()

        math_cards = page.locator("#dbWeakMathGrid .db-weak-card")
        major_cards = page.locator("#dbWeakMajorGrid .db-weak-card")
        assert await math_cards.count() == 1, f"Case C: Math must have exactly 1 card, got {await math_cards.count()}"
        assert await major_cards.count() == 3, f"Case C: Major must have Top 3 cards, got {await major_cards.count()}"
        assert await math_cards.first.get_attribute("data-chapter-id") == "ch1"
        assert await math_cards.first.get_attribute("data-subject-id") == "shu1"
        assert not errors, f"Unexpected errors in Case C: {errors}"
    finally:
        await context.close()

    # Case D: 专业课没有弱项 -> 专业课独立展示空状态，数学正常
    extra_d = r"""
    (() => {
      try {
        localStorage.setItem('user_guest_kaoyan_subject', 'shu1');
        localStorage.setItem('user_guest_ch1_s1_status', JSON.stringify({ '0': 'wrong' }));
      } catch (e) {}
    })();
    """
    context, page, errors = await new_page(browser, url, extra_init=extra_d)
    try:
        await page.click("#btnDashboard")
        await expect(page.locator("#dashboardPanel")).to_be_visible()

        math_cards = page.locator("#dbWeakMathGrid .db-weak-card")
        assert await math_cards.count() == 1
        major_cards = page.locator("#dbWeakMajorGrid .db-weak-card")
        assert await major_cards.count() == 0

        major_empty = page.locator("#dbWeakMajorGrid .db-weak-empty")
        await expect(major_empty).to_be_visible()
        text = await major_empty.inner_text()
        assert "专业课目前暂无薄弱章节" in text, f"Expected major empty text, got {text}"
        assert not errors, f"Unexpected errors in Case D: {errors}"
    finally:
        await context.close()

    # Case E: 点击专业课薄弱章节卡片 -> 正确切换到专业课且处于 practice 视图，显示侧边栏
    extra_e = r"""
    (() => {
      try {
        localStorage.setItem('user_guest_kaoyan_subject', 'shu1');
        localStorage.setItem('user_guest_bg_jy_02_zhuanye_status', JSON.stringify({ '0': 'wrong', '1': 'wrong' }));
      } catch (e) {}
    })();
    """
    context, page, errors = await new_page(browser, url, extra_init=extra_e)
    try:
        await page.click("#btnDashboard")
        await expect(page.locator("#dashboardPanel")).to_be_visible()

        card = page.locator("#dbWeakMajorGrid .db-weak-card").first
        await expect(card).to_be_visible()
        target_ch = await card.get_attribute("data-chapter-id")
        assert target_ch == "bg_jy_02"

        await card.click()
        assert await page.evaluate("() => window.getWorkbenchView()") == "practice"
        await expect(page.locator("#dashboardPanel")).not_to_be_visible()
        await assert_sidebar(page, True, "进入专业课薄弱章节后应恢复刷题栏")

        state = await page.evaluate("() => window.getCurrentPracticeState()")
        assert state["curSubjectId"] == "zhuanye", f"Expected zhuanye, got {state['curSubjectId']}"
        assert state["currentChapterId"] == "bg_jy_02", f"Expected bg_jy_02, got {state['currentChapterId']}"
        assert not errors, f"Unexpected errors in Case E: {errors}"
    finally:
        await context.close()

    # Case F: 点击数学薄弱章节卡片 (从专业课当前状态切入) -> 正确切换到数学且处于 practice 视图，显示侧边栏
    extra_f = r"""
    (() => {
      try {
        localStorage.setItem('user_guest_kaoyan_subject', 'zhuanye');
        localStorage.setItem('user_guest_ch3_s1_status', JSON.stringify({ '0': 'wrong', '1': 'wrong' }));
      } catch (e) {}
    })();
    """
    context, page, errors = await new_page(browser, url, extra_init=extra_f)
    try:
        initial_state = await page.evaluate("() => window.getCurrentPracticeState()")
        assert initial_state["curSubjectId"] == "zhuanye"

        await page.click("#btnDashboard")
        await expect(page.locator("#dashboardPanel")).to_be_visible()

        card = page.locator("#dbWeakMathGrid .db-weak-card").first
        await expect(card).to_be_visible()
        target_ch = await card.get_attribute("data-chapter-id")
        assert target_ch == "ch3"

        await card.click()
        assert await page.evaluate("() => window.getWorkbenchView()") == "practice"
        await expect(page.locator("#dashboardPanel")).not_to_be_visible()
        await assert_sidebar(page, True, "进入数学薄弱章节后应恢复刷题栏")

        state = await page.evaluate("() => window.getCurrentPracticeState()")
        assert state["curSubjectId"] == "shu1", f"Expected shu1, got {state['curSubjectId']}"
        assert state["currentChapterId"] == "ch3", f"Expected ch3, got {state['currentChapterId']}"
        assert not errors, f"Unexpected errors in Case F: {errors}"
    finally:
        await context.close()


async def test_multi_resolution_and_overflow(browser, url):
    print("Running test_multi_resolution_and_overflow...")
    viewports = [
        {"width": 1440, "height": 900},
        {"width": 1200, "height": 800},
        {"width": 1024, "height": 768},
        {"width": 768, "height": 1024},
        {"width": 620, "height": 900},
        {"width": 390, "height": 844},
        {"width": 320, "height": 568},
    ]
    for vp in viewports:
        context, page, errors = await new_page(browser, url, viewport=vp)
        try:
            w = vp["width"]
            await assert_no_horizontal_overflow(page, f"practice w={w}")
            await page.evaluate("document.getElementById('btnDashboard').click()")
            await expect(page.locator("#dashboardPanel")).to_be_visible()
            await assert_no_horizontal_overflow(page, f"dashboard w={w}")
            await expect(page.locator("#dbHeroCard")).to_be_visible()
            await expect(page.locator("#dbWeakSection")).to_be_visible()
            assert not errors, f"Errors at viewport {vp}: {errors}"
        finally:
            await context.close()


async def main():
    with serve_repo() as test_url:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            try:
                await test_behavior_1_dashboard_hides_sidebar(browser, test_url)
                await test_behavior_2_dashboard_weak_chapter_restores_sidebar(browser, test_url)
                await test_behavior_3_cross_subject_weak_chapter_jump(browser, test_url)
                await test_behavior_4_sm2_overview_hides_sidebar(browser, test_url)
                await test_behavior_5_sm2_start_review_restores_workbench(browser, test_url)
                await test_behavior_6_english_esc_preserves_practice_position(browser, test_url)
                await test_behavior_7_english_status_updates_all_site_not_daily_goals(browser, test_url)
                await test_behavior_8_streak_boundary_cases(browser, test_url)
                await test_weak_chapters_split_cases_a_to_f(browser, test_url)
                await test_multi_resolution_and_overflow(browser, test_url)
                print("SUCCESS: ALL_SELECTED_FEATURES_BROWSER_TESTS_PASSED")
            finally:
                await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
