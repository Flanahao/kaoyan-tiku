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

        # Wait for question card
        await page.wait_for_selector("#questionTextCard", state="visible", timeout=10000)

        # Check that 4 note zones are rendered
        zones_count = await page.locator("#questionTextCard .politics-choice-note-zone").count()
        print(f"Option note zones count: {zones_count}")
        assert zones_count == 4, f"Expected 4 option note zones, got {zones_count}"

        # Check add buttons
        add_btns = await page.locator("#questionTextCard .politics-choice-note-add:visible").count()
        print(f"Add note buttons visible count: {add_btns}")
        assert add_btns == 4, f"Expected 4 visible add buttons, got {add_btns}"

        # 1. Test clicking option text selects the option
        await page.locator('.q-choice-item[data-choice="A"] .choice-text').click()
        await page.wait_for_timeout(200)
        sel1 = await page.evaluate("""() => [...document.querySelectorAll('.q-choice-item.is-selected')].map(el=>el.dataset.choice).join('')""")
        print(f"Selected after clicking option A: {sel1}")
        assert sel1 == "A", f"Expected A selected, got {sel1}"

        # 2. Click option B's '＋ 添加标注' button - must NOT change selection
        await page.locator('[data-choice-note="B"] .politics-choice-note-add').click()
        await page.wait_for_timeout(200)
        sel2 = await page.evaluate("""() => [...document.querySelectorAll('.q-choice-item.is-selected')].map(el=>el.dataset.choice).join('')""")
        print(f"Selected after clicking Add Note on B: {sel2}")
        assert sel2 == "A", "Clicking note button must NOT alter selected options"

        # Check editor is visible
        assert await page.locator('[data-choice-note="B"] textarea').is_visible(), "Editor textarea should be visible"

        # 3. Enter note text and save
        await page.locator('[data-choice-note="B"] textarea').fill("具体劳动创造使用价值，抽象劳动形成价值。")
        await page.locator('[data-choice-note="B"] .politics-choice-note-save').click()
        await page.wait_for_timeout(300)

        # Verify red text display
        note_b_text = await page.locator('[data-choice-note="B"] .politics-choice-note-text').inner_text()
        print(f"Saved note B text: {note_b_text}")
        assert note_b_text == "具体劳动创造使用价值，抽象劳动形成价值。", f"Unexpected note B text: {note_b_text}"
        assert await page.locator('[data-choice-note="B"] .politics-choice-note-text').is_visible(), "Note B text box must be visible"

        # Verify selection is still A
        sel3 = await page.evaluate("""() => [...document.querySelectorAll('.q-choice-item.is-selected')].map(el=>el.dataset.choice).join('')""")
        assert sel3 == "A", "Saving note must NOT alter selected option"

        # 4. Test PoliticsGrading submit
        grading_btn = page.locator(".politics-grade-submit")
        if await grading_btn.is_visible():
            print("Testing submit grading...")
            await grading_btn.click()
            await page.wait_for_timeout(300)
            status = await page.locator(".politics-grade-result").get_attribute("data-status")
            print(f"Grading status after submit: {status}")
            assert status in ["correct", "incorrect"], "Grading should produce result"

            # Edit note B again - grading result must NOT be wiped out
            await page.locator('[data-choice-note="B"] .politics-choice-note-edit').click()
            await page.wait_for_timeout(200)
            status_after_edit = await page.locator(".politics-grade-result").get_attribute("data-status")
            print(f"Grading status after opening note editor: {status_after_edit}")
            assert status_after_edit == status, "Opening note editor must NOT clear grading result"
            await page.locator('[data-choice-note="B"] .politics-choice-note-cancel').click()
            await page.wait_for_timeout(200)

        # 5. Add multiline note on option D using Ctrl+Enter
        await page.locator('[data-choice-note="D"] .politics-choice-note-add').click()
        await page.wait_for_timeout(200)
        await page.locator('[data-choice-note="D"] textarea').fill("选项D分析：\n第二行关键纠错点")
        await page.locator('[data-choice-note="D"] textarea').press("Control+Enter")
        await page.wait_for_timeout(300)

        note_d_text = await page.locator('[data-choice-note="D"] .politics-choice-note-text').inner_text()
        print(f"Note D text: {note_d_text}")
        assert "第二行关键纠错点" in note_d_text, "Multiline note should be saved via Ctrl+Enter"

        # 6. Take screenshot of the question card with red notes
        os.makedirs(os.path.join(ROOT, "tests/screenshots"), exist_ok=True)
        screenshot_path = os.path.join(ROOT, "tests/screenshots/politics_choice_notes_live.png")
        await page.locator("#questionTextCard").screenshot(path=screenshot_path)
        print(f"Screenshot saved to: {screenshot_path}")

        # 7. Test switching question (press 'd')
        print("Switching to next question...")
        await page.keyboard.press("d")
        await page.wait_for_timeout(800)

        # Verify Q2 has no notes
        q2_visible_notes = await page.locator(".politics-choice-note-text:visible").count()
        print(f"Q2 visible notes count: {q2_visible_notes}")
        assert q2_visible_notes == 0, "Q2 should not inherit notes from Q1"

        # 8. Switch back to Q1 (press 'a')
        print("Switching back to Q1...")
        await page.keyboard.press("a")
        await page.wait_for_timeout(800)

        # Verify Q1 restored notes B and D
        q1_restored_notes = await page.locator(".politics-choice-note-text:visible").count()
        print(f"Q1 restored notes count: {q1_restored_notes}")
        assert q1_restored_notes == 2, f"Expected 2 restored notes on Q1, got {q1_restored_notes}"

        # 9. Test delete confirmation
        await page.evaluate("window.__confirmAllowed = true; window.confirm = () => window.__confirmAllowed;")
        await page.locator('[data-choice-note="B"] .politics-choice-note-delete').click()
        await page.wait_for_timeout(300)
        assert await page.locator('[data-choice-note="B"] .politics-choice-note-add').is_visible(), "B should show add button after deletion"
        assert await page.locator('[data-choice-note="D"] .politics-choice-note-text').is_visible(), "D should still have note"

        # 10. Test subject isolation (math and english)
        print("Checking math (shu1) isolation...")
        await page.goto("http://127.0.0.1:8092/study.html?subject=shu1", wait_until="networkidle")
        await page.wait_for_timeout(800)
        math_notes_count = await page.locator(".politics-choice-note-zone:visible").count()
        print(f"Math choice note zones visible: {math_notes_count}")
        assert math_notes_count == 0, "Choice note zones must NOT be visible on math"

        print("Checking english isolation...")
        await page.goto("http://127.0.0.1:8092/study.html?subject=english", wait_until="networkidle")
        await page.wait_for_timeout(800)
        english_notes_count = await page.locator(".politics-choice-note-zone:visible").count()
        print(f"English choice note zones visible: {english_notes_count}")
        assert english_notes_count == 0, "Choice note zones must NOT be visible on english"

        assert len(errors) == 0, f"Errors encountered: {errors}"
        print("ALL CHOICE NOTES LIVE E2E CHECKS PASSED SUCCESSFULLY!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
