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


async def open_dashboard(browser, url, width, height=1000):
    context = await browser.new_context(
        viewport={"width": width, "height": height}
    )
    await context.add_init_script(script=BASE_INIT)
    page = await context.new_page()
    errors = []

    page.on("pageerror", lambda exc: errors.append(f"pageerror: {exc}"))

    def on_console(msg):
        if msg.type != "error":
            return
        text = msg.text or ""
        # 题库仓库存在审计白名单资源；这里只拦 JS/运行时错误。
        if "Failed to load resource" in text:
            return
        errors.append(f"console.error: {text}")

    page.on("console", on_console)

    await page.goto(url, wait_until="domcontentloaded")
    await page.wait_for_function(
        """() =>
          Array.isArray(window.SUBJECTS) &&
          window.SUBJECTS.length >= 2 &&
          document.getElementById('btnDashboard')
        """
    )

    # 上一轮功能必须保留，防止本次为了改 Dashboard 用旧 index.html 覆盖。
    await expect(page.locator("#dailyGoalButton")).to_be_visible()
    assert await page.locator("#practiceSidebar").count() == 1, (
        "缺少上一轮 #practiceSidebar；不要用旧版 index.html 覆盖当前工作树"
    )

    # 用 DOM click 避免移动端左侧抽屉的可见性影响布局测试本身。
    await page.evaluate("document.getElementById('btnDashboard').click()")
    await expect(page.locator("#dashboardPanel")).to_be_visible()

    await page.wait_for_function(
        "() => document.querySelectorAll('#dbGrid .db-donut-card').length >= 3"
    )

    return context, page, errors


async def assert_no_horizontal_overflow(page, label):
    dims = await page.evaluate(
        """() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth
        })"""
    )
    assert dims["scrollWidth"] <= dims["clientWidth"] + 1, (
        f"{label}: horizontal overflow: {dims}"
    )


async def grid_column_count(page, selector):
    value = await page.locator(selector).evaluate(
        "(el) => getComputedStyle(el).gridTemplateColumns"
    )
    parts = [x for x in value.split(" ") if x.strip()]
    return len(parts)


async def test_desktop_geometry(browser, url):
    context, page, errors = await open_dashboard(browser, url, 1440)

    # Dashboard 总览继续隐藏右侧刷题栏（上一轮修复不得回退）。
    await expect(page.locator("#practiceSidebar")).not_to_be_visible()

    # Hero 必须与全宽 study-insights 左右基本齐平。
    hero = await page.locator("#dbHeroCard").bounding_box()
    insights = await page.locator("#studyInsights").bounding_box()
    assert hero and insights
    assert abs(hero["x"] - insights["x"]) <= 2.5, (hero, insights)
    assert abs(hero["width"] - insights["width"]) <= 3.0, (hero, insights)

    # 旧的左右 2fr/1fr DOM 布局应消失。
    assert await page.locator("#dbOverview .db-two-columns").count() == 0

    # 两张快捷卡必须是唯一节点，不可“复制一份再隐藏旧的”。
    for selector in (
        "#dbQuickGrid",
        "#dbBooksSection",
        "#widgetReviewPlan",
        "#widgetWrongPlan",
        "#btnWidgetReview",
        "#btnWidgetWrong",
        "#dbGrid",
    ):
        assert await page.locator(selector).count() == 1, (
            f"{selector} must exist exactly once"
        )

    assert await page.locator("#dbQuickGrid .db-side-widget").count() == 2

    # 1440 桌面：快捷区和书籍区都采用 3 列轨道。
    assert await grid_column_count(page, "#dbQuickGrid") == 3
    assert await grid_column_count(page, "#dbGrid") == 3

    quick_boxes = await page.locator(
        "#dbQuickGrid .db-side-widget"
    ).evaluate_all(
        """els => els.map(el => {
          const r = el.getBoundingClientRect();
          return {x:r.x, y:r.y, width:r.width, height:r.height};
        })"""
    )
    book_boxes = await page.locator(
        "#dbGrid .db-donut-card"
    ).evaluate_all(
        """els => els.slice(0, 3).map(el => {
          const r = el.getBoundingClientRect();
          return {x:r.x, y:r.y, width:r.width, height:r.height};
        })"""
    )

    assert len(quick_boxes) == 2
    assert len(book_boxes) == 3

    # 两个快捷卡同一行。
    assert abs(quick_boxes[0]["y"] - quick_boxes[1]["y"]) <= 2

    # 书籍前三张同一行。
    assert max(b["y"] for b in book_boxes) - min(b["y"] for b in book_boxes) <= 2

    # 快捷卡正好对齐书籍三列的前两列。
    for i in (0, 1):
        assert abs(quick_boxes[i]["x"] - book_boxes[i]["x"]) <= 3
        assert abs(quick_boxes[i]["width"] - book_boxes[i]["width"]) <= 3

    await assert_no_horizontal_overflow(page, "1440 desktop")
    assert not errors, "unexpected browser errors:\n" + "\n".join(errors)
    await context.close()


async def test_widget_actions(browser, url):
    context, page, errors = await open_dashboard(browser, url, 1440)

    await page.click("#btnWidgetReview")
    await expect(page.locator("#sm2Panel")).to_be_visible()
    await expect(page.locator("#dashboardPanel")).not_to_be_visible()

    # 回到 Dashboard。
    await page.evaluate("document.getElementById('btnDashboard').click()")
    await expect(page.locator("#dashboardPanel")).to_be_visible()
    await page.wait_for_function(
        "() => document.querySelectorAll('#dbGrid .db-donut-card').length >= 3"
    )

    await page.click("#btnWidgetWrong")
    await expect(page.locator("#wrongBookPanel")).to_be_visible()
    await expect(page.locator("#dashboardPanel")).not_to_be_visible()

    assert not errors, "unexpected browser errors:\n" + "\n".join(errors)
    await context.close()


async def test_responsive(browser, url):
    # 规则：>=1200 三列；621..1199 两列；<=620 单列。
    cases = [
        (1280, 3),
        (1200, 3),
        (1024, 2),
        (768, 2),
        (620, 1),
        (390, 1),
        (320, 1),
    ]

    for width, expected_cols in cases:
        context, page, errors = await open_dashboard(browser, url, width, 900)

        assert await grid_column_count(page, "#dbQuickGrid") == expected_cols, (
            width,
            await page.locator("#dbQuickGrid").evaluate(
                "(el) => getComputedStyle(el).gridTemplateColumns"
            ),
        )
        assert await grid_column_count(page, "#dbGrid") == expected_cols, (
            width,
            await page.locator("#dbGrid").evaluate(
                "(el) => getComputedStyle(el).gridTemplateColumns"
            ),
        )

        hero = await page.locator("#dbHeroCard").bounding_box()
        insights = await page.locator("#studyInsights").bounding_box()
        assert hero and insights
        assert abs(hero["width"] - insights["width"]) <= 3.0, (
            f"{width}px hero should fill the row",
            hero,
            insights,
        )

        await assert_no_horizontal_overflow(page, f"{width}px")
        assert not errors, (
            f"{width}px unexpected browser errors:\n" + "\n".join(errors)
        )
        await context.close()


async def main():
    with serve_repo() as url:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            try:
                await test_desktop_geometry(browser, url)
                await test_widget_actions(browser, url)
                await test_responsive(browser, url)
            finally:
                await browser.close()

    print("SUCCESS: DASHBOARD_LAYOUT_V2_E2E_PASSED")


if __name__ == "__main__":
    asyncio.run(main())
