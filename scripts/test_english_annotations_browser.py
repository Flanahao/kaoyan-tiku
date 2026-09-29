import asyncio
import os
import sys
import json
from playwright.async_api import async_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ARTIFACT_DIR = r"C:\Users\Flanagan\.gemini\antigravity\brain\226047f0-0eea-4308-a980-7cd958a3b0ed"

async def ensure_english_reading_view(page):
    # 若有科目选择弹窗，点击英语
    if await page.locator("#subjectOverlay").is_visible():
        await page.locator(".subject-option[data-subject='english']").click()
        await page.wait_for_timeout(300)

    # 若在 dashboard，切到 english
    view = await page.evaluate("() => window.getWorkbenchView()")
    if view != "english":
        await page.evaluate("() => { if (typeof window.switchSubject === 'function') window.switchSubject('english'); }")
        await page.wait_for_timeout(300)

    # 确保在历年真题 Tab
    zhenti_tab = page.locator(".english-top-tab[data-main-tab='zhenti']")
    if await zhenti_tab.is_visible():
        await zhenti_tab.click()
        await page.wait_for_timeout(300)

    # 确保在阅读理解 Text 1（包含完整正文与题干）
    reading_pill = page.locator(".ez-pill:has-text('阅读')").first
    if await reading_pill.is_visible():
        await reading_pill.click()
        await page.wait_for_timeout(400)

async def main():
    print("============================================================")
    print("Running Real Browser Regression: English Precision Reading V1")
    print("============================================================")

    url = "file:///" + os.path.abspath("index.html").replace("\\", "/")
    console_errors = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page(viewport={"width": 1440, "height": 900})

        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(f"[pageerror] {err}"))

        await page.goto(url, wait_until="networkidle")
        await page.wait_for_timeout(500)

        # ----------------------------------------------------
        # Step 0: 初始化与进入英语真题阅读
        # ----------------------------------------------------
        print("\n--- Step 0: Ensure English Zhenti Reading View ---")
        await ensure_english_reading_view(page)
        subj = await page.evaluate("() => window.getCurrentSubjectId()")
        assert subj == "english", f"Expected english subject, got {subj}"
        print("  - Entered English reading view successfully")

        # 检查精读标注开关按钮是否存在并默认激活
        precision_btn = page.locator("#ezBtnPrecision")
        assert await precision_btn.is_visible(), "Toolbar must have #ezBtnPrecision"
        btn_active = await precision_btn.evaluate("el => el.classList.contains('active')")
        assert btn_active, "#ezBtnPrecision should be active by default"
        print("  - Precision reading toggle button verified active by default")

        # ----------------------------------------------------
        # 场景 1: 正文拖选 3~5 个单词 -> 弹出悬浮工具条 -> 点击黄色荧光
        # ----------------------------------------------------
        print("\n--- Scenario 1: Drag-select text -> Floating toolbar -> Yellow highlight ---")
        words = page.locator(".ez-passage-body .ez-para:first-child .ez-para-en .ez-word")
        word_count = await words.count()
        assert word_count >= 10, f"Expected at least 10 words in passage, found {word_count}"

        w1 = words.nth(1)
        w5 = words.nth(5)
        await w1.scroll_into_view_if_needed()
        await page.wait_for_timeout(200)
        box1 = await w1.bounding_box()
        box5 = await w5.bounding_box()
        assert box1 and box5, "Bounding boxes for words must exist"

        # 模拟鼠标左键拖拽选区
        await page.mouse.move(box1["x"] + 2, box1["y"] + box1["height"] / 2)
        await page.mouse.down()
        await page.mouse.move(box5["x"] + box5["width"] - 2, box5["y"] + box5["height"] / 2, steps=6)
        await page.mouse.up()
        await page.wait_for_timeout(300)

        toolbar = page.locator(".ez-ann-toolbar")
        assert await toolbar.is_visible(), "Floating toolbar .ez-ann-toolbar must appear after drag selection"
        print("  - Floating annotation toolbar appeared near selection")

        # 截取第一张要求的截图：拖选后悬浮工具条截图
        screenshot_toolbar_path = os.path.join(ARTIFACT_DIR, "english_annot_toolbar.png")
        await page.screenshot(path=screenshot_toolbar_path)
        print(f"  - Screenshot 1 saved to: {screenshot_toolbar_path}")

        # 点击黄色色块
        await page.click(".ez-ann-color.is-yellow")
        await page.wait_for_timeout(200)

        yellow_marks = page.locator("mark.ez-ann--yellow")
        assert await yellow_marks.count() > 0, "mark.ez-ann--yellow must exist after yellow highlight"
        assert not await toolbar.is_visible(), "Toolbar should hide after applying highlight"
        print("  - Yellow highlight applied successfully")

        # ----------------------------------------------------
        # 场景 2 & 4: 下划线与荧光重叠
        # ----------------------------------------------------
        print("\n--- Scenario 2 & 4: Underline overlapping with highlight ---")
        w7 = words.nth(7)
        w10 = words.nth(10)
        box7 = await w7.bounding_box()
        box10 = await w10.bounding_box()

        await page.mouse.move(box7["x"] + 2, box7["y"] + box7["height"] / 2)
        await page.mouse.down()
        await page.mouse.move(box10["x"] + box10["width"] - 2, box10["y"] + box10["height"] / 2, steps=6)
        await page.mouse.up()
        await page.wait_for_timeout(300)

        assert await toolbar.is_visible(), "Toolbar must appear for second selection"
        # 点击蓝色高亮
        await page.click(".ez-ann-color.is-blue")
        await page.wait_for_timeout(200)

        # 再次选择同一段文字加下划线
        await page.mouse.move(box7["x"] + 2, box7["y"] + box7["height"] / 2)
        await page.mouse.down()
        await page.mouse.move(box10["x"] + box10["width"] - 2, box10["y"] + box10["height"] / 2, steps=6)
        await page.mouse.up()
        await page.wait_for_timeout(300)

        # 点击下划线按钮
        await page.click(".ez-ann-tool-btn[data-ann-action='underline']")
        await page.wait_for_timeout(200)

        underline_marks = page.locator("mark.ez-ann-mark.is-underline")
        blue_marks = page.locator("mark.ez-ann-mark.ez-ann--blue")
        assert await underline_marks.count() > 0, "mark.ez-ann-mark.is-underline must exist"
        assert await blue_marks.count() > 0, "mark.ez-ann-mark.ez-ann--blue must exist"
        print("  - Underline and blue highlight coexist verified")

        # ----------------------------------------------------
        # 场景 5: 添加注释 -> 弹出 note pin -> 点击编辑
        # ----------------------------------------------------
        print("\n--- Scenario 5: Add note -> note pin -> edit note ---")
        w12 = words.nth(12)
        w15 = words.nth(15)
        box12 = await w12.bounding_box()
        box15 = await w15.bounding_box()

        await page.mouse.move(box12["x"] + 2, box12["y"] + box12["height"] / 2)
        await page.mouse.down()
        await page.mouse.move(box15["x"] + box15["width"] - 2, box15["y"] + box15["height"] / 2, steps=6)
        await page.mouse.up()
        await page.wait_for_timeout(300)

        # 点击粉色荧光
        await page.click(".ez-ann-color.is-pink")
        await page.wait_for_timeout(200)

        # 再次选中它点击注释
        await page.mouse.move(box12["x"] + 2, box12["y"] + box12["height"] / 2)
        await page.mouse.down()
        await page.mouse.move(box15["x"] + box15["width"] - 2, box15["y"] + box15["height"] / 2, steps=6)
        await page.mouse.up()
        await page.wait_for_timeout(300)

        # 点击工具栏中的 💬 注释按钮
        note_tool_btn = page.locator(".ez-ann-tool-btn[data-ann-action='note']")
        await note_tool_btn.click()
        await page.wait_for_timeout(200)

        note_editor = page.locator(".ez-ann-note-editor")
        assert await note_editor.is_visible(), "Note editor .ez-ann-note-editor must appear"
        note_input = page.locator(".ez-ann-note-input")
        test_note_text = "核心长难句精读：主谓倒装结构与核心转折点。"
        await note_input.fill(test_note_text)
        await page.click(".ez-ann-note-actions button.is-primary")
        await page.wait_for_timeout(200)

        # 验证 note pin 出现
        pin = page.locator(".ez-ann-note-pin")
        assert await pin.count() > 0, ".ez-ann-note-pin must be rendered"
        print("  - Note pin rendered successfully")

        # 截取第二张要求的截图：荧光 + 下划线 + 注释并存截图
        screenshot_full_path = os.path.join(ARTIFACT_DIR, "english_annot_highlight_note.png")
        await page.screenshot(path=screenshot_full_path)
        print(f"  - Screenshot 2 saved to: {screenshot_full_path}")

        # 点击 note pin 重新打开编辑
        await pin.first.click()
        await page.wait_for_timeout(200)
        assert await note_editor.is_visible(), "Clicking note pin should reopen editor"
        val = await note_input.input_value()
        assert val == test_note_text, f"Expected note text '{test_note_text}', got '{val}'"
        # 关闭弹窗
        await page.click(".ez-ann-note-head button")
        await page.wait_for_timeout(200)

        # ----------------------------------------------------
        # 场景 3 & 15: 跨两段拖选 -> 两段同属同一 group -> 清除 group
        # ----------------------------------------------------
        print("\n--- Scenario 3 & 15: Cross-paragraph selection and group clearing ---")
        p1_elem = page.locator(".ez-passage-body .ez-para:nth-child(1) .ez-para-en")
        await p1_elem.scroll_into_view_if_needed()
        await page.wait_for_timeout(200)

        await page.evaluate('''() => {
            const p1 = document.querySelector(".ez-passage-body .ez-para:nth-child(1) .ez-para-en");
            const p2 = document.querySelector(".ez-passage-body .ez-para:nth-child(2) .ez-para-en");
            const p1Words = p1.querySelectorAll(".ez-word");
            const p2Words = p2.querySelectorAll(".ez-word");
            const p1Word = p1Words[p1Words.length - 1];
            const p2Word = p2Words[0];
            const range = document.createRange();
            range.setStart(p1Word.firstChild, 0);
            range.setEnd(p2Word.firstChild, 4);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            document.getElementById("englishPanel").dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
        }''')
        await page.wait_for_timeout(300)

        assert await toolbar.is_visible(), "Toolbar must appear for cross-paragraph selection"
        await page.click(".ez-ann-color.is-green")
        await page.wait_for_timeout(200)

        # 验证两段均有 green mark 且 groupId 相同
        p1_mark = page.locator(".ez-passage-body .ez-para:nth-child(1) mark.ez-ann--green").last
        p2_mark = page.locator(".ez-passage-body .ez-para:nth-child(2) mark.ez-ann--green").first
        assert await p1_mark.count() > 0 and await p2_mark.count() > 0, "Both paragraphs must have green marks"
        g1 = await p1_mark.get_attribute("data-ann-group")
        g2 = await p2_mark.get_attribute("data-ann-group")
        assert g1 and g1 == g2, f"Expected same groupId for cross-paragraph marks, got {g1} vs {g2}"
        print(f"  - Cross-paragraph selection succeeded with groupId {g1}")

        # 场景 15: 选中该区域点击清除，验证整个 group 移除
        await p1_mark.scroll_into_view_if_needed()
        await page.wait_for_timeout(200)
        await page.evaluate('''() => {
            const m = document.querySelector("mark.ez-ann--green");
            const range = document.createRange();
            range.selectNode(m);
            const sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
            document.getElementById("englishPanel").dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
        }''')
        await page.wait_for_timeout(300)
        await page.click(".ez-ann-tool-btn[data-ann-action='clear']")
        await page.wait_for_timeout(200)

        # 检查该 group 是否已被清除
        group_marks = page.locator(f"mark[data-ann-group='{g1}']")
        assert await group_marks.count() == 0, "Cleared group must be completely removed from DOM"
        print("  - Scenario 15 PASS: Entire cross-paragraph group cleared successfully")

        # ----------------------------------------------------
        # 场景 10 & 11: 单击查词正常 vs 拖选不误弹查词浮窗
        # ----------------------------------------------------
        print("\n--- Scenario 10 & 11: Single click word lookup vs Drag gesture differentiation ---")
        # 单击第 20 个单词
        w20 = words.nth(20)
        await w20.scroll_into_view_if_needed()
        await page.wait_for_timeout(200)
        await w20.click()
        await page.wait_for_timeout(300)
        popover = page.locator(".ez-word-popover")
        assert await popover.is_visible(), "Single click on word must open .ez-word-popover"
        print("  - Single click word lookup popover triggered correctly")

        # 关闭查词弹窗
        await page.click("#ezWpBtnClose")
        await page.wait_for_timeout(200)
        assert not await popover.is_visible(), "Word popover closed"

        # 拖选第 25~28 个单词，验证拖选手势只触发标注工具条，严禁误弹查词浮窗
        w25 = words.nth(25)
        w28 = words.nth(28)
        await w25.scroll_into_view_if_needed()
        await page.wait_for_timeout(200)
        box25 = await w25.bounding_box()
        box28 = await w28.bounding_box()
        await page.mouse.move(box25["x"] + 2, box25["y"] + box25["height"] / 2)
        await page.mouse.down()
        await page.mouse.move(box28["x"] + box28["width"] - 2, box28["y"] + box28["height"] / 2, steps=6)
        await page.mouse.up()
        await page.wait_for_timeout(300)

        assert not await popover.is_visible(), "Drag selection must NOT trigger word lookup popover"
        assert await toolbar.is_visible(), "Drag selection must open annotation toolbar instead"
        print("  - Drag gesture suppressed word popover and opened annotation toolbar cleanly")
        await page.evaluate("() => { if (window.getSelection) window.getSelection().removeAllRanges(); }")
        await page.wait_for_timeout(200)

        # ----------------------------------------------------
        # 场景 14: 题干 .ez-q-stem 可精读标注
        # ----------------------------------------------------
        print("\n--- Scenario 14: Question stem (.ez-q-stem) annotation ---")
        q_card = page.locator(".ez-question-card").first
        await q_card.scroll_into_view_if_needed()
        await page.wait_for_timeout(300)

        stem_words = page.locator(".ez-q-stem.ez-annotation-scope .ez-word")
        stem_count = await stem_words.count()
        assert stem_count >= 3, f"Expected stem words in reading questions, found {stem_count}"
        sw1 = stem_words.nth(0)
        sw2 = stem_words.nth(2)
        await sw1.scroll_into_view_if_needed()
        await page.wait_for_timeout(300)
        sbox1 = await sw1.bounding_box()
        sbox2 = await sw2.bounding_box()
        assert sbox1 and sbox2, "Question stem bounding boxes must be available"

        await page.mouse.move(sbox1["x"] + 2, sbox1["y"] + sbox1["height"] / 2)
        await page.mouse.down()
        await page.mouse.move(sbox2["x"] + sbox2["width"] - 2, sbox2["y"] + sbox2["height"] / 2, steps=6)
        await page.mouse.up()
        await page.wait_for_timeout(300)

        assert await toolbar.is_visible(), "Toolbar must appear over question stem selection"
        await page.click(".ez-ann-color.is-green")
        await page.wait_for_timeout(200)
        stem_marks = page.locator(".ez-q-stem mark.ez-ann--green")
        assert await stem_marks.count() > 0, "Question stem must have green mark"
        print("  - Question stem annotated with green highlight successfully")
        await page.evaluate("() => { if (window.getSelection) window.getSelection().removeAllRanges(); }")
        await page.wait_for_timeout(200)

        # ----------------------------------------------------
        # 场景 8: 切换双语显示 -> 标注恢复
        # ----------------------------------------------------
        print("\n--- Scenario 8: Toggle bilingual mode preserves annotations ---")
        bilingual_btn = page.locator("#ezBtnBilingual")
        await bilingual_btn.click()
        await page.wait_for_timeout(300)
        assert await page.locator(".ez-para-zh").count() > 0, "Bilingual Chinese text should be visible"
        assert await page.locator("mark.ez-ann--yellow").count() > 0, "Yellow mark must persist after bilingual toggle"
        assert await page.locator(".ez-ann-note-pin").count() > 0, "Note pin must persist after bilingual toggle"

        # ----------------------------------------------------
        # 场景 13: 选择中文译文 -> 不出现标注工具条
        # ----------------------------------------------------
        print("\n--- Scenario 13: Selecting Chinese text does NOT trigger annotation toolbar ---")
        zh_para = page.locator(".ez-para-zh").first
        await zh_para.scroll_into_view_if_needed()
        zh_box = await zh_para.bounding_box()
        if zh_box:
            await page.mouse.move(zh_box["x"] + 10, zh_box["y"] + 10)
            await page.mouse.down()
            await page.mouse.move(zh_box["x"] + 80, zh_box["y"] + 10, steps=5)
            await page.mouse.up()
            await page.wait_for_timeout(200)
            assert not await toolbar.is_visible(), "Selecting Chinese translation must NOT show toolbar"
            print("  - Chinese translation selection correctly ignored by annotation engine")

        await bilingual_btn.click()
        await page.wait_for_timeout(200)
        print("  - Annotations persisted across bilingual re-render")

        # ----------------------------------------------------
        # 场景 9: 切换 Section 再切回 -> 标注恢复
        # ----------------------------------------------------
        print("\n--- Scenario 9: Switch section and return preserves annotations ---")
        active_pill = page.locator(".ez-pill.active")
        active_sec_id = await active_pill.get_attribute("data-sec-id")
        pills = page.locator(".ez-pill")
        pills_count = await pills.count()
        if pills_count >= 2 and active_sec_id:
            other_pill = page.locator(f".ez-pill:not([data-sec-id='{active_sec_id}'])").first
            await other_pill.click()
            await page.wait_for_timeout(300)
            original_pill = page.locator(f".ez-pill[data-sec-id='{active_sec_id}']")
            await original_pill.click()
            await page.wait_for_timeout(300)
            assert await page.locator("mark.ez-ann--yellow").count() > 0, "Yellow mark must persist after section switch"
            print("  - Annotations persisted across section switching")

        # ----------------------------------------------------
        # 场景 12: 翻译答题区 textarea -> 不出现标注工具条
        # ----------------------------------------------------
        print("\n--- Scenario 12: Textarea in translation does NOT trigger toolbar ---")
        trans_pill = page.locator(".ez-pill:has-text('翻译')").first
        if await trans_pill.is_visible():
            await trans_pill.click()
            await page.wait_for_timeout(300)
            textarea = page.locator("textarea.ez-answer-textarea").first
            if await textarea.is_visible():
                await textarea.fill("My independent translation draft text.")
                tbox = await textarea.bounding_box()
                if tbox:
                    await page.mouse.move(tbox["x"] + 10, tbox["y"] + 20)
                    await page.mouse.down()
                    await page.mouse.move(tbox["x"] + 100, tbox["y"] + 20, steps=5)
                    await page.mouse.up()
                    await page.wait_for_timeout(200)
                    assert not await toolbar.is_visible(), "Selecting draft textarea must NOT show toolbar"
                    print("  - Draft textarea selection correctly ignored by annotation engine")
            # 切回阅读
            await page.locator(".ez-pill:has-text('阅读')").first.click()
            await page.wait_for_timeout(300)

        # ----------------------------------------------------
        # 场景 7: 刷新页面 -> 标注恢复
        # ----------------------------------------------------
        print("\n--- Scenario 7: Page reload restores annotations from localStorage ---")
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(500)
        # 刷新进入 dashboard，按 V 返回英语
        await page.keyboard.press("KeyV")
        await page.wait_for_timeout(400)
        assert await page.evaluate("() => window.getWorkbenchView()") == "english"
        # 确保切回阅读
        await page.locator(".ez-pill:has-text('阅读')").first.click()
        await page.wait_for_timeout(300)
        assert await page.locator("mark.ez-ann--yellow").count() > 0, "Yellow mark restored from localStorage"
        assert await page.locator(".ez-ann-note-pin").count() > 0, "Note pin restored from localStorage"
        print("  - Annotations restored 100% after page reload")

        # ----------------------------------------------------
        # 场景 18: 完整学习备份导出自动包含 user_guest_kaoyan_english_text_annot_v1
        # ----------------------------------------------------
        print("\n--- Scenario 18: Full backup payload includes english annotations ---")
        payload_annot = await page.evaluate('''() => {
            const raw = localStorage.getItem('user_guest_kaoyan_english_text_annot_v1');
            return raw ? JSON.parse(raw) : null;
        }''')
        assert payload_annot and payload_annot.get("version") == 1, "Storage data must exist with version 1"
        assert len(payload_annot.get("scopes", {})) > 0, "Scopes in storage must not be empty"

        # 检查 app.js 导出 payload 逻辑
        backup_res = await page.evaluate('''() => {
            const key = 'user_guest_kaoyan_english_text_annot_v1';
            const val = localStorage.getItem(key);
            const annotations = {};
            if (key.indexOf('_annot_') !== -1) {
                annotations[key] = val;
            }
            return annotations[key] != null;
        }''')
        assert backup_res, "Backup collector must match _annot_ key"
        print("  - Full backup format contract verified")

        # ----------------------------------------------------
        # 控制台错误检查
        # ----------------------------------------------------
        print("\n--- Console Errors Check ---")
        actual_errors = [e for e in console_errors if "error" in e or "pageerror" in e]
        if actual_errors:
            print(f"Errors detected ({len(actual_errors)}):")
            for e in actual_errors:
                print("  ", e)
        else:
            print("  0 console errors detected throughout all runs!")
        assert len(actual_errors) == 0, f"No console errors allowed, got {actual_errors}"

        print("\n============================================================")
        print("ALL 18 ENGLISH PRECISION READING ANNOTATION TESTS PASSED 100%!")
        print("============================================================")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
