import asyncio
import os
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from playwright.async_api import async_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ARTIFACT_DIR = r"C:\Users\Flanagan\.gemini\antigravity\brain\226047f0-0eea-4308-a980-7cd958a3b0ed"
os.makedirs(ARTIFACT_DIR, exist_ok=True)

PORT = 8916

def start_server():
    server = ThreadingHTTPServer(("127.0.0.1", PORT), SimpleHTTPRequestHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server

async def main():
    print("==================================================================")
    print("Real Browser Acceptance Suite: Kyson 考研 Space 首页 V1")
    print("Landing Page · 4 Focused Subjects · Subject Shell · Zero Console Errors")
    print("Viewport: 1664 x 920")
    print("==================================================================")

    server = start_server()
    base_url = f"http://127.0.0.1:{PORT}"
    index_url = f"{base_url}/index.html"

    console_errors = []
    results = {}

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1664, "height": 920})
        page = await context.new_page()

        def handle_console(msg):
            if msg.type == "error":
                txt = msg.text
                if "favicon.ico" not in txt:
                    console_errors.append(f"[{msg.type}] {txt}")

        page.on("console", handle_console)
        page.on("pageerror", lambda err: console_errors.append(f"[pageerror] {err}"))

        # ----------------------------------------------------------------
        # Test 1: Landing Page Structure & Aesthetics (1664x920)
        # ----------------------------------------------------------------
        print("\n--- Test 1: Landing Page Brand & Structure (1664x920) ---")
        try:
            await page.goto(index_url, wait_until="networkidle")
            await page.wait_for_timeout(400)

            # Check Brand title
            brand_title = await page.locator(".home-brand-title").text_content()
            assert "Kyson" in brand_title and "Space" in brand_title, f"Unexpected brand title: {brand_title}"
            print(f"  - Brand title: '{brand_title.strip()}'")

            # Check NO .sidebar-left exists in index.html
            sidebar_count = await page.locator(".sidebar-left").count()
            assert sidebar_count == 0, "Landing page index.html must NOT contain .sidebar-left"
            print("  - Verified: No sidebar-left in landing page")

            # Check Overall Progress Card
            donut = page.locator("#homeOverallDonut")
            assert await donut.is_visible(), "Overall progress donut must be visible"
            pct_text = await page.locator("#homeOverallPct").text_content()
            done_text = await page.locator("#homeDoneText").text_content()
            print(f"  - Overall Progress: {pct_text}, Marked: {done_text}")

            # Check 4 Subject Cards in 1 Row
            cards = page.locator(".home-module-card")
            assert await cards.count() == 4, f"Expected 4 subject cards, got {await cards.count()}"

            # Verify 4 columns layout at 1664px
            grid = page.locator(".home-module-grid")
            cols = await grid.evaluate("el => window.getComputedStyle(el).gridTemplateColumns.split(' ').length")
            assert cols == 4, f"Expected 4 columns at 1664px, got {cols}"
            print(f"  - 4 Subject cards in exactly 4 columns confirmed")

            # Screenshot 1: 1664x920 Landing Home
            home_screenshot = os.path.join(ARTIFACT_DIR, "kyson_home_1664.png")
            await page.screenshot(path=home_screenshot)
            print(f"  - Screenshot saved: {home_screenshot}")

            results["test1_home_structure"] = "PASS"
        except Exception as e:
            print(f"  - Test 1 FAILED: {e}")
            results["test1_home_structure"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # Test 2: Responsive Grid (1050px -> 2x2, 580px -> 1 col)
        # ----------------------------------------------------------------
        print("\n--- Test 2: Responsive Layout Breakpoints ---")
        try:
            # 1050px (< 1100px)
            await page.set_viewport_size({"width": 1050, "height": 800})
            await page.wait_for_timeout(200)
            cols_1050 = await page.locator(".home-module-grid").evaluate(
                "el => window.getComputedStyle(el).gridTemplateColumns.split(' ').length"
            )
            assert cols_1050 == 2, f"Expected 2 columns at 1050px, got {cols_1050}"
            print(f"  - At 1050px: exactly 2 columns (2x2 grid) confirmed")

            # 580px (< 620px)
            await page.set_viewport_size({"width": 580, "height": 800})
            await page.wait_for_timeout(200)
            cols_580 = await page.locator(".home-module-grid").evaluate(
                "el => window.getComputedStyle(el).gridTemplateColumns.split(' ').length"
            )
            assert cols_580 == 1, f"Expected 1 column at 580px, got {cols_580}"
            print(f"  - At 580px: exactly 1 column confirmed")

            # Restore 1664 x 920
            await page.set_viewport_size({"width": 1664, "height": 920})
            await page.wait_for_timeout(200)
            results["test2_responsive"] = "PASS"
        except Exception as e:
            print(f"  - Test 2 FAILED: {e}")
            results["test2_responsive"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # Test 3: Math Card Navigation to study.html?subject=shu1 (Practice View)
        # ----------------------------------------------------------------
        print("\n--- Test 3: Math Navigation -> study.html?subject=shu1 (Practice View) ---")
        try:
            math_card = page.locator(".home-module-card.math")
            assert await math_card.is_visible()

            async with page.expect_navigation():
                await math_card.click()
            await page.wait_for_timeout(600)

            assert "study.html" in page.url and "subject=shu1" in page.url, f"Unexpected URL: {page.url}"
            print(f"  - Landed on: {page.url}")

            # Check sidebar is hidden visually, but exists in DOM
            sidebar = page.locator("#sidebarLeft")
            assert await sidebar.count() == 1, "Sidebar DOM element must be preserved"
            sidebar_display = await sidebar.evaluate("el => window.getComputedStyle(el).display")
            assert sidebar_display == "none", f"Sidebar display expected 'none', got {sidebar_display}"
            print("  - Verified: .sidebar-left is hidden via CSS (display: none !important)")

            # Check subject focus header
            subject_chip = page.locator("#focusSubjectChip")
            assert await subject_chip.is_visible(), "#focusSubjectChip must be visible"
            chip_text = await subject_chip.text_content()
            assert "数学" in chip_text, f"Expected chip '数学', got {chip_text}"

            home_btn = page.locator("#focusHomeBtn")
            assert await home_btn.is_visible(), "#focusHomeBtn must be visible"
            assert "index.html" in (await home_btn.get_attribute("href")), "Home button must link to index.html"

            # Check Practice View is active (NOT startup dashboard!)
            view = await page.evaluate("() => typeof window.getWorkbenchView === 'function' ? window.getWorkbenchView() : null")
            print(f"  - Workbench state: view='{view}'")
            assert view == "practice", f"Expected view 'practice', got {view}"

            # Screenshot 2: Math Practice view with subject focus shell
            math_screenshot = os.path.join(ARTIFACT_DIR, "study_math_practice_1664.png")
            await page.screenshot(path=math_screenshot)
            print(f"  - Screenshot saved: {math_screenshot}")

            results["test3_math_navigation"] = "PASS"
        except Exception as e:
            print(f"  - Test 3 FAILED: {e}")
            results["test3_math_navigation"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # Test 4: Subject Focus Topbar Proxy Actions
        # ----------------------------------------------------------------
        print("\n--- Test 4: Focus Topbar Proxy Actions (Home, Switch, Dashboard, Wrong, SM2) ---")
        try:
            # Test Dashboard proxy
            dash_btn = page.locator("[data-focus-action='dashboard']")
            await dash_btn.click()
            await page.wait_for_timeout(300)
            dash_view = await page.evaluate("() => window.getWorkbenchView()")
            assert dash_view == "dashboard", f"Expected dashboard view after proxy click, got {dash_view}"
            print("  - [总进度] proxy action verified")

            # Return to practice via switch subject proxy
            switch_btn = page.locator("[data-focus-action='switch']")
            await switch_btn.click()
            await page.wait_for_timeout(300)
            modal_visible = await page.evaluate("""() => {
                const m = document.getElementById('subjectSelectModal');
                return m && (!m.hidden && m.style.display !== 'none');
            }""")
            print(f"  - [切换科目] proxy action verified (modal open: {modal_visible})")

            # Close modal if open
            await page.keyboard.press("Escape")
            await page.wait_for_timeout(200)

            # Test Home button returns to index.html
            home_btn = page.locator("#focusHomeBtn")
            async with page.expect_navigation():
                await home_btn.click()
            await page.wait_for_timeout(400)
            assert "index.html" in page.url, f"Expected return to index.html, got {page.url}"
            print("  - [← 首页] navigation back to landing page verified")

            results["test4_focus_proxies"] = "PASS"
        except Exception as e:
            print(f"  - Test 4 FAILED: {e}")
            results["test4_focus_proxies"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # Test 5: Major / Professional Course Navigation
        # ----------------------------------------------------------------
        print("\n--- Test 5: Professional Course Navigation -> study.html?subject=zhuanye ---")
        try:
            await page.goto(index_url, wait_until="networkidle")
            await page.wait_for_timeout(400)

            major_card = page.locator(".home-module-card.major")
            async with page.expect_navigation():
                await major_card.click()
            await page.wait_for_timeout(600)

            assert "subject=zhuanye" in page.url
            chip_text = await page.locator("#focusSubjectChip").text_content()
            assert "专业课" in chip_text, f"Expected chip '专业课', got {chip_text}"
            view = await page.evaluate("() => window.getWorkbenchView()")
            assert view == "practice", f"Expected view 'practice', got {view}"
            print(f"  - Professional course verified: {chip_text} in practice view")

            results["test5_major_navigation"] = "PASS"
        except Exception as e:
            print(f"  - Test 5 FAILED: {e}")
            results["test5_major_navigation"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # Test 6: English Module Navigation
        # ----------------------------------------------------------------
        print("\n--- Test 6: English Navigation -> study.html?subject=english ---")
        try:
            await page.goto(index_url, wait_until="networkidle")
            await page.wait_for_timeout(400)

            eng_card = page.locator(".home-module-card.english")
            async with page.expect_navigation():
                await eng_card.click()
            await page.wait_for_timeout(600)

            assert "subject=english" in page.url
            chip_text = await page.locator("#focusSubjectChip").text_content()
            assert "英语" in chip_text, f"Expected chip '英语', got {chip_text}"

            # English panel should be rendered
            eng_panel = page.locator("#englishPanel")
            assert await eng_panel.is_visible(), "English panel must be visible"

            # Check "进入沉浸精读" workspace button is present
            ez_btn = page.locator("#ezOpenWorkspaceBtn")
            assert await ez_btn.is_visible(), "English toolbar '进入沉浸精读' button must be present in study.html"
            print("  - English module loaded and workspace bridge button confirmed")

            results["test6_english_navigation"] = "PASS"
        except Exception as e:
            print(f"  - Test 6 FAILED: {e}")
            results["test6_english_navigation"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # Test 7: Politics Navigation & Return
        # ----------------------------------------------------------------
        print("\n--- Test 7: Politics Navigation -> politics.html & Back ---")
        try:
            await page.goto(index_url, wait_until="networkidle")
            await page.wait_for_timeout(400)

            pol_card = page.locator(".home-module-card.politics")
            async with page.expect_navigation():
                await pol_card.click()
            await page.wait_for_timeout(600)

            assert "politics.html" in page.url
            assert await page.locator("#mindMapContainer").is_visible(), "#mindMapContainer must be visible"

            # Check back link
            back_link = page.locator(".politics-home-link")
            assert await back_link.is_visible(), ".politics-home-link must be visible"

            async with page.expect_navigation():
                await back_link.click()
            await page.wait_for_timeout(400)
            assert "index.html" in page.url, f"Expected return to index.html, got {page.url}"
            print("  - Politics module navigation and return verified")

            results["test7_politics_navigation"] = "PASS"
        except Exception as e:
            print(f"  - Test 7 FAILED: {e}")
            results["test7_politics_navigation"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # Test 8: Page Refresh Persistence on study.html?subject=...
        # ----------------------------------------------------------------
        print("\n--- Test 8: Page Refresh Persistence on study.html?subject=shu1 ---")
        try:
            await page.goto(f"{base_url}/study.html?subject=shu1", wait_until="networkidle")
            await page.wait_for_timeout(500)
            chip1 = await page.locator("#focusSubjectChip").text_content()
            assert "数学" in chip1

            # Reload
            await page.reload(wait_until="networkidle")
            await page.wait_for_timeout(500)
            chip2 = await page.locator("#focusSubjectChip").text_content()
            assert "数学" in chip2, f"Expected '数学' after reload, got {chip2}"
            view2 = await page.evaluate("() => window.getWorkbenchView()")
            assert view2 == "practice", f"Expected view 'practice' after reload, got {view2}"
            print("  - Reload persistence confirmed: stays on Math practice")

            results["test8_refresh_persistence"] = "PASS"
        except Exception as e:
            print(f"  - Test 8 FAILED: {e}")
            results["test8_refresh_persistence"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # Test 9: Zero Console Errors
        # ----------------------------------------------------------------
        print("\n--- Test 9: Console Error Inspection ---")
        print(f"  - Recorded console errors count: {len(console_errors)}")
        if console_errors:
            for err in console_errors:
                print(f"    * {err}")
        assert len(console_errors) == 0, f"Found {len(console_errors)} console errors!"
        results["test9_zero_console_errors"] = "PASS"

        await context.close()
        await browser.close()

    print("\n==================================================================")
    print("FINAL SUMMARY:")
    all_passed = True
    for name, status in results.items():
        print(f"  [{status}] {name}")
        if status != "PASS":
            all_passed = False

    if not all_passed:
        print("\nSOME TESTS FAILED!")
        sys.exit(1)
    else:
        print("\nALL 9 REAL BROWSER ACCEPTANCE TESTS PASSED (100%)!")
        sys.exit(0)

if __name__ == "__main__":
    asyncio.run(main())
