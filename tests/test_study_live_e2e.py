import asyncio
import os
import shutil
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent

async def run():
    async with async_playwright() as pw:
        win_chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        chrome_path = (os.environ.get("CHROMIUM_PATH") or shutil.which("chromium")
                       or shutil.which("chromium-browser") or shutil.which("google-chrome")
                       or (win_chrome if os.path.exists(win_chrome) else None))
        launch_args = dict(headless=True, args=[
            "--no-sandbox", "--disable-gpu", "--no-zygote",
            "--disable-dev-shm-usage", "--disable-breakpad"
        ])
        if chrome_path:
            launch_args["executable_path"] = chrome_path
        browser = await pw.chromium.launch(**launch_args)
        context = await browser.new_context(viewport={"width": 1280, "height": 900})
        page = await context.new_page()

        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.on("console", lambda msg: print(f"[{msg.type}] {msg.text}") if msg.type in ["error", "warning"] else None)

        print("Navigating to http://127.0.0.1:8092/study.html?subject=politics ...")
        await page.goto("http://127.0.0.1:8092/study.html?subject=politics", wait_until="networkidle")

        # Wait for app to initialize
        await page.wait_for_selector("#questionTextCard", state="visible", timeout=10000)
        
        # Toggle solution card visible by pressing Space
        await page.keyboard.press("Space")
        await page.wait_for_selector("#solutionTextCard", state="visible", timeout=5000)

        # Check if highlighter controls exist
        controls = await page.locator(".politics-hl-controls").is_visible()
        print(f"Controls visible: {controls}")
        assert controls, "PoliticsTextHighlighter controls should be visible in solution card"

        # Check sol-analysis-content
        content_text = await page.locator(".sol-analysis-content").text_content()
        print(f"Analysis content length: {len(content_text)} chars")
        assert len(content_text) > 10, "Analysis content should have text"

        # Select text in analysis content using real mouse drag
        await page.locator(".sol-analysis-content").scroll_into_view_if_needed()
        await page.wait_for_timeout(300)

        coords = await page.evaluate("""() => {
            const el = document.querySelector('.sol-analysis-content p') || document.querySelector('.sol-analysis-content');
            let textNode = null;
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                if (walker.currentNode.nodeValue.trim().length >= 6) {
                    textNode = walker.currentNode;
                    break;
                }
            }
            if (!textNode) textNode = el.firstChild;
            function caret(offset) {
                const r = document.createRange();
                r.setStart(textNode, offset);
                r.collapse(true);
                const rect = r.getBoundingClientRect();
                return {x: Math.round(rect.x + 2), y: Math.round(rect.y + rect.height / 2)};
            }
            return {
                start: caret(0), 
                end: caret(Math.min(5, textNode.nodeValue.length)),
                text: textNode.nodeValue
            };
        }""")
        print(f"Coords: {coords}")

        await page.mouse.move(coords["start"]["x"], coords["start"]["y"])
        await page.mouse.down()
        await page.mouse.move(coords["end"]["x"], coords["end"]["y"], steps=10)
        await page.mouse.up()
        await page.wait_for_timeout(300)

        debug_info = await page.evaluate("""() => ({
            sel: window.getSelection()?.toString(),
            target: document.elementFromPoint(window.innerWidth / 2, window.innerHeight / 2)?.tagName,
            popupHidden: document.querySelector('.politics-hl-popup')?.hidden,
            activeExists: !!window.PoliticsTextHighlighter
        })""")
        print(f"Debug info after mouseup: {debug_info}")

        popup_visible = await page.locator(".politics-hl-popup").is_visible()
        print(f"Popup visible after drag: {popup_visible}")
        assert popup_visible, "Popup toolbar should appear after text selection"

        # Click blue swatch
        await page.locator(".politics-hl-popup .is-blue").click()
        await page.wait_for_timeout(300)

        # Verify blue highlight registered
        hl_state = await page.evaluate("""() => ({
            blue: CSS.highlights.get('politics-hl-blue')?.size || 0,
            count: document.querySelector('.politics-hl-count')?.textContent
        })""")
        print(f"Highlight state after blue: {hl_state}")
        assert hl_state["blue"] == 1, "Native highlight 'politics-hl-blue' should have 1 range"
        assert "1" in hl_state["count"], "Count should say '已标注 1 处'"

        # Select another piece of text and click yellow
        coords2 = await page.evaluate("""() => {
            const el = document.querySelector('.sol-analysis-content p') || document.querySelector('.sol-analysis-content');
            let textNode = null;
            const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
            while (walker.nextNode()) {
                if (walker.currentNode.nodeValue.trim().length >= 15) {
                    textNode = walker.currentNode;
                    break;
                }
            }
            if (!textNode) textNode = el.firstChild;
            const startOff = Math.min(6, textNode.nodeValue.length - 2);
            const endOff = Math.min(12, textNode.nodeValue.length);
            function caret(offset) {
                const r = document.createRange();
                r.setStart(textNode, offset);
                r.collapse(true);
                const rect = r.getBoundingClientRect();
                return {x: rect.x + 2, y: rect.y + rect.height / 2};
            }
            return {start: caret(startOff), end: caret(endOff)};
        }""")
        await page.mouse.move(coords2["start"]["x"], coords2["start"]["y"])
        await page.mouse.down()
        await page.mouse.move(coords2["end"]["x"], coords2["end"]["y"], steps=10)
        await page.mouse.up()
        await page.wait_for_timeout(300)
        assert await page.locator(".politics-hl-popup").is_visible(), "Popup should appear for 2nd selection"
        await page.locator(".politics-hl-popup .is-yellow").click()
        await page.wait_for_timeout(300)

        hl_state2 = await page.evaluate("""() => ({
            blue: CSS.highlights.get('politics-hl-blue')?.size || 0,
            yellow: CSS.highlights.get('politics-hl-yellow')?.size || 0,
            count: document.querySelector('.politics-hl-count')?.textContent
        })""")
        print(f"Highlight state after yellow: {hl_state2}")
        assert hl_state2["blue"] == 1 and hl_state2["yellow"] == 1, "Both blue and yellow should be present"
        assert "2" in hl_state2["count"], "Count should say '已标注 2 处'"

        # Test undo
        await page.locator(".politics-hl-undo").click()
        await page.wait_for_timeout(300)
        hl_state_undo = await page.evaluate("""() => ({
            blue: CSS.highlights.get('politics-hl-blue')?.size || 0,
            yellow: CSS.highlights.get('politics-hl-yellow')?.size || 0,
            count: document.querySelector('.politics-hl-count')?.textContent
        })""")
        print(f"Highlight state after undo: {hl_state_undo}")
        assert hl_state_undo["blue"] == 1 and hl_state_undo["yellow"] == 0, "Undo should remove yellow mark"
        assert "1" in hl_state_undo["count"], "Count should say '已标注 1 处'"

        # Test selection on sol-answer-banner does NOT trigger popup
        banner_coords = await page.evaluate("""() => {
            const b = document.querySelector('.sol-answer-banner');
            const rect = b.getBoundingClientRect();
            return {start: {x: rect.x + 5, y: rect.y + 10}, end: {x: rect.x + 60, y: rect.y + 10}};
        }""")
        await page.mouse.move(banner_coords["start"]["x"], banner_coords["start"]["y"])
        await page.mouse.down()
        await page.mouse.move(banner_coords["end"]["x"], banner_coords["end"]["y"])
        await page.mouse.up()
        await page.wait_for_timeout(300)
        popup_after_banner = await page.locator(".politics-hl-popup").is_visible()
        print(f"Popup visible after selecting banner: {popup_after_banner}")
        assert not popup_after_banner, "Selecting answer banner MUST NOT show highlighter popup"

        # Test switching question
        print("Testing question switch...")
        # Press Right Arrow or 'd' to switch to next question
        await page.keyboard.press("d")
        await page.wait_for_timeout(800)

        q2_state = await page.evaluate("""() => ({
            blue: CSS.highlights.get('politics-hl-blue')?.size || 0,
            yellow: CSS.highlights.get('politics-hl-yellow')?.size || 0,
            count: document.querySelector('.politics-hl-count')?.textContent
        })""")
        print(f"Q2 state: {q2_state}")
        assert q2_state["blue"] == 0 and q2_state["yellow"] == 0, "Q2 should not have Q1's marks"
        assert "0" in q2_state["count"], "Q2 count should be 0"

        # Switch back to Q1
        await page.keyboard.press("a")
        await page.wait_for_timeout(800)

        q1_restored = await page.evaluate("""() => ({
            blue: CSS.highlights.get('politics-hl-blue')?.size || 0,
            count: document.querySelector('.politics-hl-count')?.textContent
        })""")
        print(f"Q1 restored state: {q1_restored}")
        assert q1_restored["blue"] == 1, "Q1 blue mark should be restored"
        assert "1" in q1_restored["count"], "Q1 count should be restored to 1"

        # Verify mastery status independence
        # Click #btnVague (模糊)
        # Existing logic: on first rating, it auto-advances to next question.
        await page.locator("#btnVague").click()
        await page.wait_for_timeout(500)

        # Switch back to Q1 to inspect Q1
        await page.keyboard.press("a")
        await page.wait_for_timeout(500)

        # Ensure solution is shown on Q1
        await page.evaluate("""() => {
            const area = document.getElementById('solutionArea');
            if (!area.classList.contains('show')) {
                document.getElementById('btnToggle').click();
            }
        }""")
        await page.wait_for_timeout(500)

        # Verify Q1 status is still 模糊, and highlighter is still intact
        q1_final = await page.evaluate("""() => ({
            vagueActive: document.getElementById('btnVague')?.classList.contains('active'),
            blue: CSS.highlights.get('politics-hl-blue')?.size || 0,
            count: document.querySelector('.politics-hl-count')?.textContent
        })""")
        print(f"Q1 final state: {q1_final}")
        assert q1_final["vagueActive"], "Mastery '模糊' must remain active for Q1"
        assert q1_final["blue"] == 1, "Highlighter must remain intact after setting mastery"
        assert "1" in q1_final["count"], "Count must remain 1"

        # Take screenshot of the solution area
        os.makedirs(os.path.join(ROOT, "tests/screenshots"), exist_ok=True)
        screenshot_path = os.path.join(ROOT, "tests/screenshots/politics_highlighter_live.png")
        await page.locator("#solutionArea").screenshot(path=screenshot_path)
        print(f"Screenshot saved to: {screenshot_path}")

        # Test subject isolation: navigate to math (shu1) and english
        print("Testing math (shu1) subject isolation...")
        await page.goto("http://127.0.0.1:8092/study.html?subject=shu1", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        math_visible = await page.locator(".politics-hl-controls").is_visible()
        popup_visible = await page.locator(".politics-hl-popup").is_visible()
        print(f"Math politics-hl-controls visible: {math_visible}, popup visible: {popup_visible}")
        assert not math_visible and not popup_visible, "Highlighter controls must NOT be visible in math"

        print("Testing english subject isolation...")
        await page.goto("http://127.0.0.1:8092/study.html?subject=english", wait_until="networkidle")
        await page.wait_for_timeout(1000)
        english_visible = await page.locator(".politics-hl-controls").is_visible()
        popup_visible_eng = await page.locator(".politics-hl-popup").is_visible()
        print(f"English politics-hl-controls visible: {english_visible}, popup visible: {popup_visible_eng}")
        assert not english_visible and not popup_visible_eng, "Highlighter controls must NOT be visible in english"

        # Check errors
        assert len(errors) == 0, f"Encountered browser errors: {errors}"
        print("ALL LIVE END-TO-END CHECKS (INCLUDING ISOLATION) PASSED SUCCESSFULLY!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
