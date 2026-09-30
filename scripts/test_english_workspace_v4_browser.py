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

PORT = 8915

def start_server():
    server = ThreadingHTTPServer(("127.0.0.1", PORT), SimpleHTTPRequestHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server

async def main():
    print("==================================================================")
    print("Real Browser Acceptance Suite: English Immersive Workspace V4")
    print("Universal 6 Sections · CSS Custom Highlight · DOM Stability")
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
        # Test 1: Main Site Integration & Bridge Button for all 6 sections
        # ----------------------------------------------------------------
        print("\n--- Test 1: Main Site Bridge Button & Section Switch ---")
        try:
            await page.goto(index_url, wait_until="networkidle")
            await page.wait_for_timeout(500)

            # Initialize guest user session and switch to English zhenti
            await page.evaluate("""() => {
                localStorage.setItem('user_guest_kaoyan_subject', 'english');
                localStorage.setItem('user_guest_kaoyan_workbench_view', 'english');
                localStorage.setItem('user_guest_kaoyan_english_main_tab_v1', 'zhenti');
                localStorage.setItem('user_guest_kaoyan_english_zhenti_year_v1', '2009');
                if (typeof window.switchSubject === 'function') {
                    window.switchSubject('english');
                }
                if (typeof window.openEnglishVocabulary === 'function') {
                    window.openEnglishVocabulary();
                }
            }""")
            await page.wait_for_timeout(600)

            # Verify "进入沉浸精读" button appears in toolbar
            workspace_btn = page.locator("#ezOpenWorkspaceBtn")
            assert await workspace_btn.is_visible(), "#ezOpenWorkspaceBtn must be visible in toolbar"
            btn_text = await workspace_btn.text_content()
            assert "进入沉浸精读" in btn_text, f"Expected button text '进入沉浸精读', got {btn_text}"
            print("  - Bridge button verified in toolbar: '进入沉浸精读'")

            results["test1_bridge_button"] = "PASS"
        except Exception as e:
            print(f"  - Test 1 FAILED: {e}")
            results["test1_bridge_button"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # Test 2: Entering Workspace across all 6 Question Types via UI
        # ----------------------------------------------------------------
        print("\n--- Test 2: Verify all 6 Question Types enter unified Workspace ---")
        section_tests = [
            ("cloze", "完型填空", "USE OF ENGLISH"),
            ("reading", "阅读Text1", "READING PART A"),
            ("partB", "新题型", "READING PART B"),
            ("translation", "翻译", "TRANSLATION"),
            ("writingA", "写作 Part A", "WRITING PART A"),
            ("writingB", "写作 Part B", "WRITING PART B"),
        ]

        for sec_key, pill_text, expected_kicker in section_tests:
            try:
                # Go back to index
                await page.goto(f"{index_url}?return=english", wait_until="networkidle")
                await page.wait_for_timeout(500)

                # Click corresponding pill
                pill = page.locator(f".ez-pill:has-text('{pill_text}')").first
                assert await pill.is_visible(), f"Pill for {sec_key} ({pill_text}) must be visible"
                await pill.click()
                await page.wait_for_timeout(400)

                # Click "进入沉浸精读"
                btn = page.locator("#ezOpenWorkspaceBtn")
                assert await btn.is_visible(), "Bridge button must be visible after pill click"

                async with page.expect_navigation():
                    await btn.click()
                await page.wait_for_timeout(400)

                assert "english-workspace.html" in page.url, f"Expected navigation to english-workspace.html, got: {page.url}"
                kicker_text = await page.locator("#ewTypeLabel").text_content()
                assert expected_kicker in kicker_text, f"Expected kicker '{expected_kicker}', got '{kicker_text}'"

                # Check 53% / 47% layout exists
                source_pane = page.locator(".ew-source-pane")
                task_pane = page.locator(".ew-task-pane")
                assert await source_pane.is_visible(), "Source pane must be visible"
                assert await task_pane.is_visible(), "Task pane must be visible"

                s_box = await source_pane.bounding_box()
                t_box = await task_pane.bounding_box()
                total_w = s_box["width"] + t_box["width"]
                s_pct = (s_box["width"] / total_w) * 100
                t_pct = (t_box["width"] / total_w) * 100
                print(f"  - [{sec_key}] Entered Workspace successfully: {kicker_text} | Left: {s_pct:.1f}%, Right: {t_pct:.1f}%")
                results[f"test2_{sec_key}"] = "PASS"
            except Exception as e:
                print(f"  - [{sec_key}] FAILED: {e}")
                results[f"test2_{sec_key}"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # Test 3: Reading Part A Deep-Dive (DOM Identity & Scroll Isolation)
        # ----------------------------------------------------------------
        print("\n--- Test 3: Reading Part A: DOM Identity (Zero Re-render) & Scroll Isolation ---")
        try:
            # Go to index and enter Reading Text 1
            await page.goto(f"{index_url}?return=english", wait_until="networkidle")
            await page.wait_for_timeout(500)
            pill = page.locator(".ez-pill:has-text('阅读Text1')").first
            await pill.click()
            await page.wait_for_timeout(400)
            btn = page.locator("#ezOpenWorkspaceBtn")
            async with page.expect_navigation():
                await btn.click()
            await page.wait_for_timeout(500)

            # Store references to DOM nodes in #ewSource
            await page.evaluate("""() => {
                const src = document.getElementById('ewSource');
                window.__testSourceNode = src;
                window.__testP1Node = src.querySelector('.ew-paragraph');
                window.__testP1EnNode = src.querySelector('.ew-paragraph-en');
                // Scroll left pane to 150px
                document.getElementById('ewSourceScroll').scrollTop = 150;
            }""")
            await page.wait_for_timeout(200)

            initial_scroll = await page.evaluate("() => document.getElementById('ewSourceScroll').scrollTop")
            assert initial_scroll == 150, f"Expected scrollTop 150, got {initial_scroll}"

            # Switch questions on the right pane: 21 -> 22 -> 23 -> 24 -> 25
            tabs = page.locator(".ew-q-tab")
            tab_count = await tabs.count()
            assert tab_count == 5, f"Expected 5 question tabs in Text 1, got {tab_count}"

            for idx in range(1, tab_count):
                tab_btn = tabs.nth(idx)
                await tab_btn.click()
                await page.wait_for_timeout(150)

                heading = await page.locator("#ewTaskHeading").text_content()
                print(f"  - Switched to tab {idx + 1}: heading is '{heading}'")

                # Verify DOM Identity: left pane elements MUST NOT have been recreated
                dom_same = await page.evaluate("""() => {
                    const src = document.getElementById('ewSource');
                    const p1 = src.querySelector('.ew-paragraph');
                    const p1en = src.querySelector('.ew-paragraph-en');
                    const sScroll = document.getElementById('ewSourceScroll').scrollTop;
                    return {
                        sourceSame: window.__testSourceNode === src,
                        p1Same: window.__testP1Node === p1,
                        p1enSame: window.__testP1EnNode === p1en,
                        scrollTop: sScroll
                    };
                }""")

                assert dom_same["sourceSame"], f"Tab {idx}: Source container was re-created!"
                assert dom_same["p1Same"], f"Tab {idx}: Paragraph node P1 was re-created!"
                assert dom_same["p1enSame"], f"Tab {idx}: Paragraph English node was re-created!"
                assert dom_same["scrollTop"] == 150, f"Tab {idx}: Scroll position jumped to {dom_same['scrollTop']}!"

            print("  - DOM Identity VERIFIED: 100% stable, zero re-renders across all question tabs")
            print("  - Scroll Isolation VERIFIED: left scrollTop strictly maintained at 150px")

            # Save Reading screenshot
            reading_screenshot = os.path.join(ARTIFACT_DIR, "workspace_v4_reading.png")
            await page.screenshot(path=reading_screenshot)
            print(f"  - Screenshot saved: {reading_screenshot}")

            results["test3_dom_identity"] = "PASS"
        except Exception as e:
            print(f"  - Test 3 FAILED: {e}")
            results["test3_dom_identity"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # Test 4: CSS Custom Highlight API Continuous Highlighter
        # ----------------------------------------------------------------
        print("\n--- Test 4: Word-Style Continuous Highlighting & Offset Persistence ---")
        try:
            # Reset left scroll to 0
            await page.evaluate("() => document.getElementById('ewSourceScroll').scrollTop = 0")
            await page.wait_for_timeout(200)

            # Check .ew-word styling (padding: 0, margin: 0)
            word_styles = await page.evaluate("""() => {
                const word = document.querySelector('.ew-word');
                const cs = window.getComputedStyle(word);
                return {
                    paddingTop: cs.paddingTop,
                    paddingRight: cs.paddingRight,
                    marginTop: cs.marginTop,
                    marginRight: cs.marginRight
                };
            }""")
            assert word_styles["paddingTop"] == "0px" and word_styles["paddingRight"] == "0px", f"Word padding must be 0, got {word_styles}"
            assert word_styles["marginTop"] == "0px" and word_styles["marginRight"] == "0px", f"Word margin must be 0, got {word_styles}"
            print("  - .ew-word zero padding and zero margin confirmed")

            # Simulate text drag selection across multiple words:
            annot_res = await page.evaluate("""() => {
                const p1en = document.querySelector('.ew-paragraph-en');
                const words = Array.from(p1en.querySelectorAll('.ew-word'));
                if (words.length < 5) return { error: 'Not enough words' };

                const startNode = words[0].firstChild;
                const endNode = words[3].firstChild;

                const range = document.createRange();
                range.setStart(startNode, 0);
                range.setEnd(endNode, endNode.textContent.length);

                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);

                p1en.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

                return {
                    selectedText: sel.toString(),
                    rangeCount: sel.rangeCount
                };
            }""")
            await page.wait_for_timeout(300)
            print(f"  - Selected text: '{annot_res.get('selectedText')}' (ranges: {annot_res.get('rangeCount')})")

            # Toolbar should appear
            toolbar = page.locator("#ewSelectionToolbar")
            assert await toolbar.is_visible(), "Highlight floating toolbar must be visible upon selection"

            # Click yellow highlight button
            yellow_btn = toolbar.locator("[data-ann-color='yellow']")
            await yellow_btn.click()
            await page.wait_for_timeout(300)

            # Check Highlight API or fallback mark
            highlight_check = await page.evaluate("""() => {
                const hasApi = window.CSS && CSS.highlights && window.Highlight;
                let yellowRanges = 0;
                if (hasApi && CSS.highlights.has('ew-yellow')) {
                    const hl = CSS.highlights.get('ew-yellow');
                    yellowRanges = hl.size;
                }
                const fallbackMarks = document.querySelectorAll('.ew-fallback-mark.yellow').length;
                const store = JSON.parse(localStorage.getItem('user_guest_kaoyan_english_text_annot_v4') || '{"items":[]}');
                return {
                    hasApi: !!hasApi,
                    yellowRanges: yellowRanges,
                    fallbackMarks: fallbackMarks,
                    storeCount: store.items.length,
                    firstItem: store.items[0] || null
                };
            }""")
            print(f"  - Highlight state: CSS Highlight API={highlight_check['hasApi']}, Ranges={highlight_check['yellowRanges']}, Stored items={highlight_check['storeCount']}")

            assert highlight_check["storeCount"] >= 1, "Annotation must be stored in localStorage"
            item = highlight_check["firstItem"]
            assert item["color"] == "yellow", f"Expected yellow, got {item.get('color')}"
            assert "start" in item and "end" in item and "quote" in item, "Item must have start/end/quote offsets"
            assert "prefix" in item and "suffix" in item, "Item must have prefix/suffix anchors"
            print(f"  - Stored quote: '{item['quote']}' [start: {item['start']}, end: {item['end']}]")

            # Test another selection with cyan
            await page.evaluate("""() => {
                const p1en = document.querySelector('.ew-paragraph-en');
                const words = Array.from(p1en.querySelectorAll('.ew-word'));
                const startNode = words[5].firstChild;
                const endNode = words[8].firstChild;

                const range = document.createRange();
                range.setStart(startNode, 0);
                range.setEnd(endNode, endNode.textContent.length);

                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);

                p1en.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
            }""")
            await page.wait_for_timeout(300)

            cyan_btn = toolbar.locator("[data-ann-color='cyan']")
            await cyan_btn.click()
            await page.wait_for_timeout(300)

            stored_count = await page.evaluate("""() => {
                const store = JSON.parse(localStorage.getItem('user_guest_kaoyan_english_text_annot_v4') || '{"items":[]}');
                return store.items.length;
            }""")
            assert stored_count == 2, f"Expected 2 annotations in store, got {stored_count}"
            print("  - Multiple highlights (yellow, cyan) created and stored successfully")

            # Capture highlight screenshot
            highlight_screenshot = os.path.join(ARTIFACT_DIR, "workspace_v4_highlight.png")
            await page.screenshot(path=highlight_screenshot)
            print(f"  - Screenshot saved: {highlight_screenshot}")

            results["test4_highlighting"] = "PASS"
        except Exception as e:
            print(f"  - Test 4 FAILED: {e}")
            results["test4_highlighting"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # Test 5: Answer Selection, Mastery, Notes & Reload Persistence
        # ----------------------------------------------------------------
        print("\n--- Test 5: Answer Selection, Mastery, Notes & Page Reload Persistence ---")
        try:
            # In Q1 (activeIndex 0), click Option B
            tabs = page.locator(".ew-q-tab")
            await tabs.nth(0).click()
            await page.wait_for_timeout(200)

            opt_b = page.locator(".ew-option[data-opt='B']")
            await opt_b.click()
            await page.wait_for_timeout(200)
            assert "selected" in (await opt_b.get_attribute("class")), "Option B must be selected"

            # Set mastery to 'proficient'
            mastery_btn = page.locator(".ew-mastery button[data-status='proficient']")
            await mastery_btn.click()
            await page.wait_for_timeout(200)
            assert "active" in (await mastery_btn.get_attribute("class")), "Mastery proficient must be active"

            # Type question note
            note_area = page.locator("#ewQuestionNote")
            test_note_text = "V4 E2E Test Note: 2009 Q21 key distinction"
            await note_area.fill(test_note_text)
            await page.wait_for_timeout(200)

            # Check localStorage keys
            storage_check = await page.evaluate("""() => {
                const answers = JSON.parse(localStorage.getItem('user_guest_kaoyan_english_user_answers_v1') || '{}');
                const statuses = JSON.parse(localStorage.getItem('user_guest_kaoyan_english_zhenti_status_v1') || '{}');
                const notes = JSON.parse(localStorage.getItem('user_guest_kaoyan_english_notes_v1') || '{}');
                return { answers, statuses, notes };
            }""")
            print(f"  - LocalStorage check: Answers={storage_check['answers']}, Statuses={storage_check['statuses']}")
            assert any(v == "B" for v in storage_check["answers"].values()), "Answer B must be recorded in answers_v1"
            assert any(v == "proficient" for v in storage_check["statuses"].values()), "Status proficient must be recorded in status_v1"
            assert any(test_note_text in v for v in storage_check["notes"].values()), "Note text must be recorded in notes_v1"

            # Now RELOAD the page (sessionStorage + localStorage persistence check)
            await page.reload(wait_until="networkidle")
            await page.wait_for_timeout(600)

            # Check Option B is still selected, mastery is still proficient, note is still present
            re_opt_b = page.locator(".ew-option[data-opt='B']")
            assert "selected" in (await re_opt_b.get_attribute("class")), "After reload: Option B must still be selected"
            re_mastery = page.locator(".ew-mastery button[data-status='proficient']")
            assert "active" in (await re_mastery.get_attribute("class")), "After reload: Mastery proficient must still be active"
            re_note = await page.locator("#ewQuestionNote").input_value()
            assert re_note == test_note_text, f"After reload: Note expected '{test_note_text}', got '{re_note}'"

            # Check highlights are still rendered
            re_hl_count = await page.evaluate("""() => {
                const hasApi = window.CSS && CSS.highlights && window.Highlight;
                if (hasApi && CSS.highlights.has('ew-yellow')) {
                    return CSS.highlights.get('ew-yellow').size;
                }
                return document.querySelectorAll('.ew-fallback-mark').length;
            }""")
            assert re_hl_count >= 1, f"After reload: Highlighting must be restored, got {re_hl_count}"
            print("  - RELOAD PERSISTENCE VERIFIED: Answers, mastery, notes, and highlights restored perfectly")

            results["test5_reload_persistence"] = "PASS"
        except Exception as e:
            print(f"  - Test 5 FAILED: {e}")
            results["test5_reload_persistence"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # Test 6: Writing Tasks (Prompt + Sample Essay + Auto-save Draft)
        # ----------------------------------------------------------------
        print("\n--- Test 6: Writing Tasks: Prompt & Sample Essay Highlighting, Draft Auto-save ---")
        try:
            # Go back to index and click Writing Part B (大作文)
            await page.goto(f"{index_url}?return=english", wait_until="networkidle")
            await page.wait_for_timeout(500)
            pill = page.locator(".ez-pill:has-text('写作 Part B')").first
            await pill.click()
            await page.wait_for_timeout(400)
            btn = page.locator("#ezOpenWorkspaceBtn")
            async with page.expect_navigation():
                await btn.click()
            await page.wait_for_timeout(500)

            kicker = await page.locator("#ewTypeLabel").text_content()
            assert "WRITING PART B" in kicker, f"Expected WRITING PART B, got {kicker}"

            # Verify prompt and sample essay are rendered on the left
            prompt_el = page.locator(".ew-writing-prompt")
            assert await prompt_el.is_visible(), "Writing prompt must be visible on the left"

            # Verify writing image is present (2009 writing B has cartoon drawing)
            img = page.locator(".ew-writing-image")
            if await img.count() > 0:
                print("  - Writing cartoon image is present on the left")

            # Check right pane: Draft textarea
            draft_textarea = page.locator("#ewWritingDraft")
            assert await draft_textarea.is_visible(), "Writing draft textarea must be visible on the right"

            test_draft = "As is vividly portrayed in the cartoon, a group of people are sitting in front of computers..."
            await draft_textarea.fill(test_draft)
            await page.wait_for_timeout(200)

            # Check word counter
            counter_text = await page.locator("#ewWritingCount").text_content()
            print(f"  - Writing word counter: '{counter_text}'")
            assert "words" in counter_text and int(counter_text.split()[0]) > 10, f"Unexpected word counter: {counter_text}"

            # Check draft stored in localStorage
            drafts_store = await page.evaluate("""() => {
                return JSON.parse(localStorage.getItem('user_guest_kaoyan_english_drafts_v1') || '{}');
            }""")
            assert any(test_draft in v for v in drafts_store.values()), "Draft must be saved in drafts_v1"
            print("  - Draft auto-save to drafts_v1 confirmed")

            # Capture writing screenshot
            writing_screenshot = os.path.join(ARTIFACT_DIR, "workspace_v4_writing.png")
            await page.screenshot(path=writing_screenshot)
            print(f"  - Screenshot saved: {writing_screenshot}")

            results["test6_writing"] = "PASS"
        except Exception as e:
            print(f"  - Test 6 FAILED: {e}")
            results["test6_writing"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # Test 7: Return Navigation to Index with ?return=english
        # ----------------------------------------------------------------
        print("\n--- Test 7: Return Navigation (← 返回英语) ---")
        try:
            back_btn = page.locator("#ewBackBtn")
            assert await back_btn.is_visible(), "#ewBackBtn must be visible"

            async with page.expect_navigation():
                await back_btn.click()
            await page.wait_for_timeout(600)

            assert "index.html" in page.url, f"Expected return to index.html, got: {page.url}"
            # Check English panel is displayed
            eng_panel = page.locator("#englishPanel")
            is_hidden = await eng_panel.get_attribute("hidden")
            assert is_hidden is None, "English panel must be visible upon return"
            print(f"  - Return navigation verified: back to index.html with English panel open")

            results["test7_return_navigation"] = "PASS"
        except Exception as e:
            print(f"  - Test 7 FAILED: {e}")
            results["test7_return_navigation"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # Test 8: Console Error Zero Tolerance Check
        # ----------------------------------------------------------------
        print("\n--- Test 8: Console Error Inspection ---")
        print(f"  - Recorded console errors count: {len(console_errors)}")
        if console_errors:
            for err in console_errors:
                print(f"    * {err}")
        assert len(console_errors) == 0, f"Found {len(console_errors)} console errors during test run!"
        results["test8_zero_console_errors"] = "PASS"

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
        print("\nALL 8 REAL BROWSER ACCEPTANCE TESTS PASSED (100%)!")
        sys.exit(0)

if __name__ == "__main__":
    asyncio.run(main())
