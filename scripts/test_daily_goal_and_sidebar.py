import asyncio
import contextlib
import functools
import http.server
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


PICK_REFS_JS = r"""
() => {
  const pick = (group, count) => {
    const subject = window.SUBJECTS.find((s) => s && s.analyticsGroup === group);
    if (!subject) return [];
    const refs = [];
    for (const ch of (subject.chapters || [])) {
      const total = Number(ch && ch.total) || 0;
      for (let i = 0; i < total && refs.length < count; i += 1) {
        refs.push({ subjectId: subject.id, chapterId: ch.id, idx: i });
      }
      if (refs.length >= count) break;
    }
    return refs;
  };
  return { math: pick('math', 3), major: pick('major', 3) };
}
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
        # 题库审计允许仓库内声明过的 expected-missing 图片；浏览器可能打印资源加载错误。
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
          Array.isArray(window.SUBJECTS) &&
          window.SUBJECTS.length >= 2
        """
    )
    await expect(page.locator("#dailyGoalButton")).to_be_visible()
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


async def test_sidebar_modes(browser, url):
    context, page, errors = await new_page(browser, url)

    await assert_sidebar(page, True, "初始刷题页应显示右侧刷题栏")

    # 错题本总览隐藏；从错题本进入具体题目后恢复；返回错题本后再次隐藏。
    await page.click("#btnWrong")
    await page.click("#btnWrongBook")
    await assert_sidebar(page, False, "错题本总览不应显示刷题栏")
    wrong_item = page.locator(".wrongbook-q-item").first
    await expect(wrong_item).to_be_visible()
    await wrong_item.click()
    await assert_sidebar(page, True, "错题本进入具体题目后应显示刷题栏")
    await expect(page.locator("#btnBackWrongBook")).to_be_visible()
    await page.click("#btnBackWrongBook")
    await assert_sidebar(page, False, "返回错题本总览后应隐藏刷题栏")
    await page.click("#btnWrongBook")
    await assert_sidebar(page, True, "关闭错题本回到刷题页后应显示刷题栏")

    # 全局进度总览隐藏。
    await page.click("#btnDashboard")
    await assert_sidebar(page, False, "全局进度总览不应显示刷题栏")
    await assert_no_horizontal_overflow(page, "dashboard overview")

    # 特别覆盖“从数学总览点进专业课书籍”的路径：
    # switchSubject() 会恢复刷题视图，所以 openDashboardBook() 必须在其后再次隐藏刷题栏。
    pro_card = page.locator(
        '#dbGrid .db-donut-card[data-subject-id="zhuanye"][data-wb]'
    ).first
    await expect(pro_card).to_be_visible()
    await pro_card.click()
    await assert_sidebar(page, False, "全局进度专业课书籍详情仍应隐藏刷题栏")
    detail_card = page.locator("#dbDetailList .db-chapter-card").first
    await expect(detail_card).to_be_visible()
    await detail_card.click()
    await assert_sidebar(page, True, "从全局进度点章节进入刷题后应显示刷题栏")

    # SM-2 调度总览隐藏，退出调度回刷题恢复。
    await page.click("#btnSm2PanelSidebar")
    await assert_sidebar(page, False, "SM-2 调度总览不应显示刷题栏")
    await page.click("#btnSm2PanelSidebar")
    await assert_sidebar(page, True, "退出 SM-2 调度总览后应显示刷题栏")

    # 英语词汇不是题目刷题页，隐藏；退出英语后恢复。
    await page.click("#btnEnglish")
    await expect(page.locator("#englishPanel")).to_be_visible()
    await assert_sidebar(page, False, "英语词汇页不应显示刷题栏")
    await page.click("#btnEnglish")
    await assert_sidebar(page, True, "退出英语词汇后应显示刷题栏")

    assert not errors, "unexpected browser errors:\n" + "\n".join(errors)
    await context.close()


async def record_status(page, ref, status="wrong", source="mark"):
    await page.evaluate(
        """({ ref, status, source }) => {
          window.StudyAnalytics.recordStatus({
            subjectId: ref.subjectId,
            chapterId: ref.chapterId,
            idx: ref.idx,
            status,
            source
          });
        }""",
        {"ref": ref, "status": status, "source": source},
    )


async def get_counts(page):
    return await page.evaluate(
        "() => window.StudyAnalytics.getDailyGoalCounts(Date.now())"
    )


async def wait_toast_hidden(page):
    await expect(page.locator("#dailyGoalToast")).not_to_be_visible(timeout=4000)


async def test_daily_goals(browser, url):
    context, page, errors = await new_page(browser, url)

    # 无旧设置时默认 20 / 20。
    await page.click("#dailyGoalButton")
    await expect(page.locator("#siMathDailyGoalInput")).to_have_value("20")
    await expect(page.locator("#siMajorDailyGoalInput")).to_have_value("20")

    # 设为 2 / 2，顺便验证考试日期与目标共存。
    await page.locator("#siExamDateInput").fill("2026-12-19")
    await page.locator("#siMathDailyGoalInput").fill("2")
    await page.locator("#siMajorDailyGoalInput").fill("2")
    await page.click("#siSettingsSave")
    await expect(page.locator("#studySettingsModal")).not_to_be_visible()

    stored = await page.evaluate(
        "() => JSON.parse(localStorage.getItem('user_guest_study_dashboard_settings_v1'))"
    )
    assert stored["schemaVersion"] == 2
    assert stored["examDate"] == "2026-12-19"
    assert stored["dailyGoals"] == {"math": 2, "major": 2}

    refs = await page.evaluate(PICK_REFS_JS)
    assert len(refs["math"]) >= 3, "数学题库不足 3 题，无法运行目标测试"
    assert len(refs["major"]) >= 3, "专业课题库不足 3 题，无法运行目标测试"

    # 数学：同一题重复改状态只算 1 题。
    await record_status(page, refs["math"][0], "wrong", "mark")
    assert await get_counts(page) == {"math": 1, "major": 0}

    await record_status(page, refs["math"][0], "vague", "mark")
    assert await get_counts(page) == {"math": 1, "major": 0}

    # 第 2 道唯一数学题跨过目标，只庆祝一次。
    await record_status(page, refs["math"][1], "proficient", "mark")
    assert await get_counts(page) == {"math": 2, "major": 0}
    await page.wait_for_function(
        "() => document.getElementById('dailyGoalToast').classList.contains('is-visible')"
    )
    await expect(page.locator("#dailyGoalToast")).to_contain_text("数学今日目标完成")
    await expect(page.locator("#dailyGoalMathItem")).to_have_class(
        re.compile(r"\bis-complete\b")
    )
    await expect(page.locator("#dailyGoalMathText")).to_contain_text("已完成")
    await expect(page.locator("#dailyGoalMathPct")).to_have_text("100%")

    await wait_toast_hidden(page)
    await record_status(page, refs["math"][2], "familiar", "sm2")
    assert await get_counts(page) == {"math": 3, "major": 0}
    await page.wait_for_timeout(250)
    await expect(page.locator("#dailyGoalToast")).not_to_be_visible()

    # 专业课独立累计；第 2 道跨线后独立庆祝。
    await record_status(page, refs["major"][0], "wrong", "mark")
    assert await get_counts(page) == {"math": 3, "major": 1}
    await record_status(page, refs["major"][1], "proficient", "sm2")
    assert await get_counts(page) == {"math": 3, "major": 2}
    await page.wait_for_function(
        "() => document.getElementById('dailyGoalToast').classList.contains('is-visible')"
    )
    await expect(page.locator("#dailyGoalToast")).to_contain_text("专业课今日目标完成")
    await expect(page.locator("#dailyGoalMajorItem")).to_have_class(
        re.compile(r"\bis-complete\b")
    )
    await wait_toast_hidden(page)

    # 刷新后进度保留，但绝不能因为 render/reload 再弹庆祝。
    await page.reload(wait_until="domcontentloaded")
    await page.wait_for_function(
        """() =>
          !!window.StudyAnalytics &&
          typeof window.StudyAnalytics.getDailyGoalCounts === 'function'
        """
    )
    assert await get_counts(page) == {"math": 3, "major": 2}
    await expect(page.locator("#dailyGoalMathText")).to_contain_text("3/2")
    await expect(page.locator("#dailyGoalMajorText")).to_contain_text("2/2")
    await expect(page.locator("#dailyGoalToast")).not_to_be_visible()

    # 把目标调低到已完成值，只变 UI，不庆祝。
    await page.click("#dailyGoalButton")
    await page.locator("#siMathDailyGoalInput").fill("1")
    await page.locator("#siMajorDailyGoalInput").fill("1")
    await page.click("#siSettingsSave")
    await page.wait_for_timeout(250)
    await expect(page.locator("#dailyGoalToast")).not_to_be_visible()

    assert not errors, "unexpected browser errors:\n" + "\n".join(errors)
    await context.close()


async def test_legacy_settings_migration(browser, url):
    legacy_init = r"""
    (() => {
      try {
        if (location.protocol === 'http:' || location.protocol === 'https:') {
          localStorage.setItem(
            'user_guest_study_dashboard_settings_v1',
            JSON.stringify({ schemaVersion: 1, examDate: '2026-12-19' })
          );
        }
      } catch (e) {}
    })();
    """
    context, page, errors = await new_page(browser, url, extra_init=legacy_init)

    await page.click("#dailyGoalButton")
    await expect(page.locator("#siExamDateInput")).to_have_value("2026-12-19")
    await expect(page.locator("#siMathDailyGoalInput")).to_have_value("20")
    await expect(page.locator("#siMajorDailyGoalInput")).to_have_value("20")

    await page.locator("#siMathDailyGoalInput").fill("7")
    await page.locator("#siMajorDailyGoalInput").fill("9")
    await page.click("#siSettingsSave")

    migrated = await page.evaluate(
        "() => JSON.parse(localStorage.getItem('user_guest_study_dashboard_settings_v1'))"
    )
    assert migrated["schemaVersion"] == 2
    assert migrated["examDate"] == "2026-12-19"
    assert migrated["dailyGoals"] == {"math": 7, "major": 9}

    assert not errors, "unexpected browser errors:\n" + "\n".join(errors)
    await context.close()


async def test_responsive(browser, url):
    for width in (1440, 1024, 768, 390, 320):
        context, page, errors = await new_page(
            browser,
            url,
            viewport={"width": width, "height": 900},
        )

        await expect(page.locator("#dailyGoalButton")).to_be_visible()
        await assert_no_horizontal_overflow(page, f"{width}px practice")

        if width <= 768:
            await page.click("#btnMobileMenu")
            await page.click("#btnDashboard")
            await page.evaluate("document.body.classList.remove('sidebar-open')")
        else:
            await page.click("#btnDashboard")

        await assert_sidebar(page, False, f"{width}px dashboard sidebar")
        await assert_no_horizontal_overflow(page, f"{width}px dashboard")

        if width <= 480:
            await expect(page.locator("#syncStatus")).not_to_be_visible()

        assert not errors, (
            f"{width}px unexpected browser errors:\n" + "\n".join(errors)
        )
        await context.close()


async def main():
    with serve_repo() as url:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            try:
                await test_sidebar_modes(browser, url)
                await test_daily_goals(browser, url)
                await test_legacy_settings_migration(browser, url)
                await test_responsive(browser, url)
            finally:
                await browser.close()

    print("SUCCESS: DAILY_GOAL_AND_SIDEBAR_E2E_PASSED")


if __name__ == "__main__":
    asyncio.run(main())

