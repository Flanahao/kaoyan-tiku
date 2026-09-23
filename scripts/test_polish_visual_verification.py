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

INIT_SCRIPT = """
(() => {
  try {
    localStorage.setItem('user_guest_kaoyan_subject', 'english');
    localStorage.setItem('user_guest_kaoyan_english_cur_year', '2026');
  } catch (e) {}
})();
"""

async def main():
    print("====================================================")
    print("🧪 Running Visual Verification for English Polish")
    print("====================================================")

    with serve_repo() as url:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            
            # 1. Desktop 1440x900
            print("--- Step 1: Desktop Viewport (1440x900) ---")
            context = await browser.new_context(viewport={"width": 1440, "height": 900})
            await context.add_init_script(script=INIT_SCRIPT)
            page = await context.new_page()
            await page.goto(url, wait_until="domcontentloaded")
            await page.wait_for_timeout(500)

            # Check bilingual button label
            bilingual_btn = page.locator("#ezBtnBilingual")
            btn_text = await bilingual_btn.inner_text()
            print(f"  - Initial bilingual button text: '{btn_text}'")
            assert "显示中文译文" in btn_text, f"Initial should show 显示中文译文, got {btn_text}"

            # Check hint
            hint = page.locator(".ez-reading-hint")
            assert await hint.is_visible(), "Reading hint should be visible"
            print(f"  - Reading hint: '{await hint.inner_text()}'")

            # Check paragraph numbers
            p1_num = page.locator(".ez-para-number").first
            assert await p1_num.is_visible()
            assert await p1_num.inner_text() == "P1", f"Expected P1, got {await p1_num.inner_text()}"
            print("  - Paragraph number P1 verified")

            # Check options are button elements
            first_opt = page.locator(".ez-option").first
            tag_name = await first_opt.evaluate("el => el.tagName.toLowerCase()")
            btn_type = await first_opt.get_attribute("type")
            assert tag_name == "button", f"Option tag should be button, got {tag_name}"
            assert btn_type == "button", f"Option type should be button, got {btn_type}"
            print("  - Option button semantics (button type=button) verified")

            # Check question nav first item is active
            first_qnav = page.locator(".ez-qnav-btn").first
            nav_classes = await first_qnav.get_attribute("class") or ""
            assert "is-active" in nav_classes, f"First question in nav should be is-active, got {nav_classes}"
            print("  - Initial question nav highlight (is-active) verified")

            # Click option to answer and verify selection
            await first_opt.click()
            await page.wait_for_timeout(300)
            opt_pressed = await first_opt.get_attribute("aria-pressed")
            assert opt_pressed == "true", f"Expected aria-pressed=true, got {opt_pressed}"
            print("  - Option selected successfully (aria-pressed=true)")

            # Click 查看解析 button to test safeRichHtml explanation
            toggle_exp_btn = page.locator('[data-action="toggleExp"]').first
            await toggle_exp_btn.click()
            await page.wait_for_timeout(300)
            exp_box = page.locator(".ez-exp-box").first
            assert await exp_box.is_visible(), "Explanation box should show upon clicking 查看解析"
            exp_content = await page.locator(".ez-exp-content").first.inner_text()
            print(f"  - Explanation revealed via safeRichHtml (length: {len(exp_content)} chars)")

            # Capture desktop screenshot
            desktop_shot = SCREENSHOTS_DIR / "english_reader_polished_desktop.png"
            await page.screenshot(path=str(desktop_shot))
            print(f"  - Saved screenshot: {desktop_shot.name}")

            # Test bilingual toggle
            print("--- Step 2: Test Bilingual Toggle ---")
            await bilingual_btn.click()
            await page.wait_for_timeout(300)
            btn_text_after = await bilingual_btn.inner_text()
            print(f"  - Bilingual button text after toggle: '{btn_text_after}'")
            assert "隐藏中文译文" in btn_text_after, f"Expected 隐藏中文译文, got {btn_text_after}"
            
            zh_paras = page.locator(".ez-para-zh")
            count_zh = await zh_paras.count()
            assert count_zh > 0, f"Chinese translation paragraphs should be visible, got {count_zh}"
            print(f"  - Chinese translations shown: {count_zh} paragraphs")

            toggle_shot = SCREENSHOTS_DIR / "english_reading_bilingual_toggle.png"
            await page.screenshot(path=str(toggle_shot))
            print(f"  - Saved screenshot: {toggle_shot.name}")

            # 2. Mobile 390x844
            print("--- Step 3: Mobile Viewport (390x844) ---")
            m_context = await browser.new_context(viewport={"width": 390, "height": 844})
            await m_context.add_init_script(script=INIT_SCRIPT)
            m_page = await m_context.new_page()
            await m_page.goto(url, wait_until="domcontentloaded")
            await m_page.wait_for_timeout(500)

            mobile_shot = SCREENSHOTS_DIR / "english_reader_polished_mobile.png"
            await m_page.screenshot(path=str(mobile_shot))
            print(f"  - Saved screenshot: {mobile_shot.name}")

            # 3. Test Study Wheel Canvas
            print("--- Step 4: Study Wheel Canvas ---")
            w_context = await browser.new_context(viewport={"width": 1440, "height": 900})
            await w_context.add_init_script(script="""
            (() => {
              try {
                localStorage.setItem('user_guest_kaoyan_subject', 'shu1');
              } catch (e) {}
            })();
            """)
            w_page = await w_context.new_page()
            await w_page.goto(url, wait_until="domcontentloaded")
            await w_page.wait_for_timeout(500)

            wheel_btn = w_page.locator("#dailyMathWheelButton")
            await wheel_btn.click()
            await w_page.wait_for_timeout(500)

            wheel_canvas = w_page.locator("#dailyMathWheelCanvas")
            assert await wheel_canvas.is_visible(), "Wheel canvas should be visible"
            
            wheel_shot = SCREENSHOTS_DIR / "study_wheel_polished.png"
            await w_page.screenshot(path=str(wheel_shot))
            print(f"  - Saved screenshot: {wheel_shot.name}")

            await browser.close()
            print("====================================================")
            print("🎉 ALL VISUAL VERIFICATIONS COMPLETED SUCCESSFULLY!")
            print("====================================================")

if __name__ == "__main__":
    asyncio.run(main())
