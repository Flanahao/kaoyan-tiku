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


async def open_dashboard(browser, url, width=1440, height=1000):
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

    await expect(page.locator("#dailyGoalButton")).to_be_visible()
    assert await page.locator("#practiceSidebar").count() == 1

    await page.evaluate("document.getElementById('btnDashboard').click()")
    await expect(page.locator("#dashboardPanel")).to_be_visible()
    await page.wait_for_function(
        "() => document.querySelectorAll('#dbGrid .db-donut-card canvas').length >= 3"
    )

    return context, page, errors


async def assert_no_horizontal_overflow(page, tag=""):
    dims = await page.evaluate(
        """() => ({
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          innerWidth: window.innerWidth,
          hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 2
        })"""
    )
    assert not dims["hasOverflow"], (
        f"[{tag}] Horizontal overflow detected: scrollWidth={dims['scrollWidth']} > innerWidth={dims['innerWidth']}"
    )


async def test_donut_rendering_and_legend(browser, url):
    context, page, errors = await open_dashboard(browser, url, 1440)

    # 1. 验证图例正确渲染
    legend = page.locator(".db-books-legend")
    await expect(legend).to_be_visible()
    await expect(page.locator(".db-books-legend .dot-mastered")).to_be_visible()
    await expect(page.locator(".db-books-legend .dot-fuzzy")).to_be_visible()
    await expect(page.locator(".db-books-legend .dot-wrong")).to_be_visible()
    await expect(page.locator(".db-books-legend .dot-unmarked")).to_be_visible()

    # 2. 验证卡片与 canvas
    cards = page.locator("#dbGrid .book-progress-card")
    card_count = await cards.count()
    assert card_count >= 3, f"Expected at least 3 book cards, got {card_count}"

    # 3. 验证 _donutData 数据契约
    donut_payloads = await page.evaluate(
        """() => {
          const canvases = Array.from(document.querySelectorAll('#dbGrid .book-progress-card canvas'));
          return canvases.map(c => c._donutData);
        }"""
    )

    assert len(donut_payloads) == card_count
    for idx, d in enumerate(donut_payloads):
        assert d is not None, f"Card #{idx} canvas._donutData should not be null"
        assert "total" in d
        assert "mastered" in d
        assert "fuzzy" in d
        assert "wrong" in d
        assert "marked" in d
        assert "unmarked" in d
        assert "percent" in d
        assert "label" in d

        expected_marked = d["mastered"] + d["fuzzy"] + d["wrong"]
        assert d["marked"] == expected_marked
        expected_pct = round((expected_marked / d["total"]) * 100) if d["total"] > 0 else 0
        assert d["percent"] == expected_pct, f"Card #{idx} pct mismatch: {d['percent']} vs {expected_pct}"

    # 4. 验证函数单独调用与 Section 8.3 数据验收标准
    mock_test_result = await page.evaluate(
        """() => {
          const canvas = document.createElement('canvas');
          document.body.appendChild(canvas);
          window.drawBookSegmentedDonut(canvas, {
            mastered: 10,
            fuzzy: 5,
            wrong: 3,
            total: 100
          }, '测试书籍');

          const d = canvas._donutData;
          document.body.removeChild(canvas);
          return d;
        }"""
    )
    assert mock_test_result["mastered"] == 10
    assert mock_test_result["fuzzy"] == 5
    assert mock_test_result["wrong"] == 3
    assert mock_test_result["total"] == 100
    assert mock_test_result["unmarked"] == 82
    assert mock_test_result["percent"] == 18

    zero_test_result = await page.evaluate(
        """() => {
          const canvas = document.createElement('canvas');
          document.body.appendChild(canvas);
          window.drawBookSegmentedDonut(canvas, {
            mastered: 0,
            fuzzy: 0,
            wrong: 0,
            total: 0
          }, '空白书籍');

          const d = canvas._donutData;
          document.body.removeChild(canvas);
          return d;
        }"""
    )
    assert zero_test_result["total"] == 0
    assert zero_test_result["percent"] == 0

    await assert_no_horizontal_overflow(page, "1440 desktop")
    assert not errors, "unexpected browser errors:\n" + "\n".join(errors)
    await context.close()


async def test_card_navigation(browser, url):
    context, page, errors = await open_dashboard(browser, url, 1440)

    # 点击书籍卡片进入章节详情
    first_book = page.locator('#dbGrid .book-progress-card[data-wb]').first
    await expect(first_book).to_be_visible()
    await first_book.click()

    # 详情展示，总览隐藏
    await expect(page.locator("#dbDetail")).to_be_visible()
    await expect(page.locator("#dbOverview")).not_to_be_visible()
    await expect(page.locator("#btnBackDashboard")).to_be_visible()

    # 验证章节卡片中的圆点颜色规范存在
    ch_cards = page.locator("#dbDetailList .db-chapter-card")
    await expect(ch_cards.first).to_be_visible()
    dot_mastered = page.locator("#dbDetailList .dot-mastered").first
    await expect(dot_mastered).to_be_visible()

    # 点击返回按钮回到总览
    await page.click("#btnBackDashboard")
    await expect(page.locator("#dbOverview")).to_be_visible()
    await expect(page.locator("#dbDetail")).not_to_be_visible()
    await expect(page.locator("#btnBackDashboard")).not_to_be_visible()

    assert not errors, "unexpected browser errors:\n" + "\n".join(errors)
    await context.close()


async def test_responsiveness(browser, url):
    viewports = [1440, 1280, 1024, 768, 620, 390, 320]
    for w in viewports:
        context, page, errors = await open_dashboard(browser, url, w, 800)
        await assert_no_horizontal_overflow(page, f"{w}px")

        await expect(page.locator("#dailyGoalButton")).to_be_visible()
        await expect(page.locator("#dbGrid")).to_be_visible()

        assert not errors, f"{w}px unexpected browser errors:\n" + "\n".join(errors)
        await context.close()


async def main():
    with serve_repo() as url:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            try:
                print("Running test_donut_rendering_and_legend...")
                await test_donut_rendering_and_legend(browser, url)
                print("Running test_card_navigation...")
                await test_card_navigation(browser, url)
                print("Running test_responsiveness...")
                await test_responsiveness(browser, url)
            finally:
                await browser.close()

    print("SUCCESS: BOOK_PROGRESS_MULTICOLOR_E2E_PASSED")


if __name__ == "__main__":
    asyncio.run(main())
