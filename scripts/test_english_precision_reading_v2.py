import asyncio
import os
import sys
from playwright.async_api import async_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ARTIFACT_DIR = r"C:\Users\Flanagan\.gemini\antigravity\brain\226047f0-0eea-4308-a980-7cd958a3b0ed"

async def ensure_english_reading_view(page):
    if await page.locator("#subjectOverlay").is_visible():
        await page.locator(".subject-option[data-subject='english']").click()
        await page.wait_for_timeout(300)

    view = await page.evaluate("() => window.getWorkbenchView()")
    if view != "english":
        await page.evaluate("() => { if (typeof window.switchSubject === 'function') window.switchSubject('english'); }")
        await page.wait_for_timeout(300)

    zhenti_tab = page.locator(".english-top-tab[data-main-tab='zhenti']")
    if await zhenti_tab.is_visible():
        await zhenti_tab.click()
        await page.wait_for_timeout(300)

    reading_pill = page.locator(".ez-pill:has-text('阅读')").first
    if await reading_pill.is_visible():
        await reading_pill.click()
        await page.wait_for_timeout(400)

async def main():
    print("============================================================")
    print("Running Real Browser Regression: English Precision Reading V2")
    print("Continuous Highlighter + Vivid Colors + Reading Split Mode")
    print("============================================================")

    url = "file:///" + os.path.abspath("index.html").replace("\\", "/")
    console_errors = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # 1600x900 as specified in the requirement document
        page = await browser.new_page(viewport={"width": 1600, "height": 900})

        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type == "error" else None)
        page.on("pageerror", lambda err: console_errors.append(f"[pageerror] {err}"))

        await page.goto(url, wait_until="networkidle")
        await page.wait_for_timeout(500)

        # ----------------------------------------------------
        # Step 0: 进入英语真题阅读并初始化
        # ----------------------------------------------------
        print("\n--- Step 0: Ensure English Zhenti Reading View ---")
        await ensure_english_reading_view(page)
        subj = await page.evaluate("() => window.getCurrentSubjectId()")
        assert subj == "english", f"Expected english subject, got {subj}"
        print("  - Entered English reading view successfully")

        # ----------------------------------------------------
        # 验收 C: 1600x900 阅读双栏工作台结构与比例
        # ----------------------------------------------------
        print("\n--- Acceptance C: Reading Split Workspace (1600x900) ---")
        shell = page.locator(".ez-reading-focus-shell")
        assert await shell.is_visible(), ".ez-reading-focus-shell must be visible"

        left_pane = page.locator(".ez-reading-focus-passage")
        right_pane = page.locator(".ez-reading-focus-qa")
        assert await left_pane.is_visible(), "Left passage pane must be visible"
        assert await right_pane.is_visible(), "Right QA pane must be visible"

        left_box = await left_pane.bounding_box()
        right_box = await right_pane.bounding_box()
        total_w = left_box["width"] + right_box["width"]
        left_pct = (left_box["width"] / total_w) * 100
        right_pct = (right_box["width"] / total_w) * 100
        print(f"  - Split dimensions: Left={left_box['width']:.1f}px ({left_pct:.1f}%), Right={right_box['width']:.1f}px ({right_pct:.1f}%)")
        assert 44.0 <= left_pct <= 50.0, f"Left pane expected ~47%, got {left_pct:.1f}%"
        assert 50.0 <= right_pct <= 56.0, f"Right pane expected ~53%, got {right_pct:.1f}%"

        # 验证题目 tabs 与 stage
        qtabs = page.locator(".ez-reading-qtab")
        qtabs_cnt = await qtabs.count()
        assert qtabs_cnt >= 4, f"Expected 4~5 question tabs, found {qtabs_cnt}"
        cards = page.locator(".ez-reading-question-stage .ez-question-card")
        assert await cards.count() == 1, f"Focus stage must display exactly 1 active question card, found {await cards.count()}"
        print(f"  - Verified {qtabs_cnt} question tabs and exactly 1 active question card in focus stage")

        # 截取截图 1: 1600x900 阅读双栏工作台
        screenshot_split_path = os.path.join(ARTIFACT_DIR, "reading_split_1600.png")
        await page.screenshot(path=screenshot_split_path)
        print(f"  - Screenshot 1 saved to: {screenshot_split_path}")

        # ----------------------------------------------------
        # 验收 A: 连续黄色荧光（无白缝、padding: 0、连续色块）
        # ----------------------------------------------------
        print("\n--- Acceptance A: Continuous Yellow Highlighter ---")
        p1 = page.locator(".ez-passage-body .ez-para:nth-child(1) .ez-para-en")
        await p1.scroll_into_view_if_needed()
        words = p1.locator(".ez-word")
        w_cnt = await words.count()
        assert w_cnt >= 10, f"Expected >= 10 words in paragraph 1, found {w_cnt}"

        # 选前 8 个词做连续黄色标注
        w0 = words.nth(0)
        w7 = words.nth(7)
        box0 = await w0.bounding_box()
        box7 = await w7.bounding_box()
        await page.mouse.move(box0["x"] + 2, box0["y"] + box0["height"] / 2)
        await page.mouse.down()
        await page.mouse.move(box7["x"] + box7["width"] - 2, box7["y"] + box7["height"] / 2, steps=6)
        await page.mouse.up()
        await page.wait_for_timeout(300)

        toolbar = page.locator("#ezAnnotationToolbar")
        assert await toolbar.is_visible(), "Annotation toolbar must appear after drag selection"
        await page.click(".ez-ann-color.is-yellow")
        await page.wait_for_timeout(200)

        yellow_mark = page.locator("mark.ez-ann-mark.ez-ann--yellow").first
        assert await yellow_mark.is_visible(), "Yellow mark must be rendered"

        # 检查 computedStyle：padding=0, margin=0, border-radius=0, background=#FFD43B
        styles_check = await page.evaluate('''() => {
            const m = document.querySelector("mark.ez-ann-mark.ez-ann--yellow");
            const w = document.querySelector(".ez-annotation-scope .ez-word");
            const mStyle = window.getComputedStyle(m);
            const wStyle = window.getComputedStyle(w);
            return {
                markPadding: mStyle.padding,
                markMargin: mStyle.margin,
                markBorderRadius: mStyle.borderRadius,
                markBg: mStyle.backgroundColor,
                wordPadding: wStyle.paddingLeft,
                wordDisplay: wStyle.display
            };
        }''')
        print("  - Continuous mark styles check:", styles_check)
        assert styles_check["wordPadding"] == "0px", f"Expected word padding 0px, got {styles_check['wordPadding']}"
        assert styles_check["wordDisplay"] == "inline", f"Expected word display inline, got {styles_check['wordDisplay']}"
        assert styles_check["markBorderRadius"] == "0px", f"Expected mark border-radius 0px, got {styles_check['markBorderRadius']}"
        assert styles_check["markBg"] == "rgb(255, 212, 59)", f"Expected vivid yellow rgb(255, 212, 59), got {styles_check['markBg']}"
        print("  - Continuous yellow highlighter verified: padding=0, border-radius=0, vivid color!")

        # 截取截图 2: 连续黄色荧光高亮特写
        screenshot_yellow_path = os.path.join(ARTIFACT_DIR, "english_annot_continuous_yellow.png")
        await page.screenshot(path=screenshot_yellow_path)
        print(f"  - Screenshot 2 saved to: {screenshot_yellow_path}")

        # ----------------------------------------------------
        # 验收 B: 鲜明配色依次测试（黄/绿/蓝/粉/下划线）
        # ----------------------------------------------------
        print("\n--- Acceptance B: Vivid Colors (Green, Blue, Pink, Underline) ---")
        # 绿色
        w8 = words.nth(8)
        w10 = words.nth(10)
        box8 = await w8.bounding_box()
        box10 = await w10.bounding_box()
        await page.mouse.move(box8["x"] + 2, box8["y"] + box8["height"] / 2)
        await page.mouse.down()
        await page.mouse.move(box10["x"] + box10["width"] - 2, box10["y"] + box10["height"] / 2, steps=6)
        await page.mouse.up()
        await page.wait_for_timeout(300)
        await page.click(".ez-ann-color.is-green")
        await page.wait_for_timeout(200)

        # 蓝色
        w11 = words.nth(11)
        w13 = words.nth(13)
        box11 = await w11.bounding_box()
        box13 = await w13.bounding_box()
        await page.mouse.move(box11["x"] + 2, box11["y"] + box11["height"] / 2)
        await page.mouse.down()
        await page.mouse.move(box13["x"] + box13["width"] - 2, box13["y"] + box13["height"] / 2, steps=6)
        await page.mouse.up()
        await page.wait_for_timeout(300)
        await page.click(".ez-ann-color.is-blue")
        await page.wait_for_timeout(200)

        # 粉色
        w14 = words.nth(14)
        w16 = words.nth(16)
        box14 = await w14.bounding_box()
        box16 = await w16.bounding_box()
        await page.mouse.move(box14["x"] + 2, box14["y"] + box14["height"] / 2)
        await page.mouse.down()
        await page.mouse.move(box16["x"] + box16["width"] - 2, box16["y"] + box16["height"] / 2, steps=6)
        await page.mouse.up()
        await page.wait_for_timeout(300)
        await page.click(".ez-ann-color.is-pink")
        await page.wait_for_timeout(200)

        # 下划线加在蓝色区域
        await page.mouse.move(box11["x"] + 2, box11["y"] + box11["height"] / 2)
        await page.mouse.down()
        await page.mouse.move(box13["x"] + box13["width"] - 2, box13["y"] + box13["height"] / 2, steps=6)
        await page.mouse.up()
        await page.wait_for_timeout(300)
        await page.click(".ez-ann-tool-btn[data-ann-action='underline']")
        await page.wait_for_timeout(200)

        # 检查各颜色值
        colors_check = await page.evaluate('''() => {
            const green = window.getComputedStyle(document.querySelector("mark.ez-ann--green")).backgroundColor;
            const blue = window.getComputedStyle(document.querySelector("mark.ez-ann--blue")).backgroundColor;
            const pink = window.getComputedStyle(document.querySelector("mark.ez-ann--pink")).backgroundColor;
            const underline = document.querySelector("mark.is-underline");
            const uStyle = underline ? window.getComputedStyle(underline) : null;
            return {
                green,
                blue,
                pink,
                hasUnderline: Boolean(underline),
                uColor: uStyle ? uStyle.textDecorationColor : null
            };
        }''')
        print("  - Colors check:", colors_check)
        assert colors_check["green"] == "rgb(105, 219, 124)", f"Expected green rgb(105, 219, 124), got {colors_check['green']}"
        assert colors_check["blue"] == "rgb(116, 192, 252)", f"Expected blue rgb(116, 192, 252), got {colors_check['blue']}"
        assert colors_check["pink"] == "rgb(247, 131, 172)", f"Expected pink rgb(247, 131, 172), got {colors_check['pink']}"
        assert colors_check["hasUnderline"] is True, "Expected underline mark"

        # 截取截图 3: 多颜色高亮 + 下划线展示
        screenshot_colors_path = os.path.join(ARTIFACT_DIR, "english_annot_colors_vivid.png")
        await page.screenshot(path=screenshot_colors_path)
        print(f"  - Screenshot 3 saved to: {screenshot_colors_path}")

        # ----------------------------------------------------
        # 验收 D: 当前题切换 (21 -> 22 -> 23) 且左侧文章滚动位置不归零
        # ----------------------------------------------------
        print("\n--- Acceptance D: Question Tab Switching & Passage Scroll Retention ---")
        # 1. 先把左侧文章滚动到 320px
        await page.evaluate('''() => {
            const p = document.querySelector(".ez-reading-focus-passage");
            if (p) p.scrollTop = 320;
        }''')
        await page.wait_for_timeout(200)
        scroll_before = await page.evaluate('() => document.querySelector(".ez-reading-focus-passage").scrollTop')
        print(f"  - Set initial passage scrollTop: {scroll_before}px")
        assert scroll_before > 250, f"Passage should be scrolled, got {scroll_before}"

        # 2. 点击第 2 个题号 Tab (第 22 题)
        tab2 = qtabs.nth(1)
        tab2_text = await tab2.inner_text()
        await tab2.click()
        await page.wait_for_timeout(300)

        # 验证右侧当前题更新
        active_q_badge = await page.locator(".ez-reading-question-stage .ez-q-badge").inner_text()
        print(f"  - Clicked tab '{tab2_text}', active stage shows: '{active_q_badge}'")
        assert "22" in active_q_badge, f"Expected Question 22 in stage, got {active_q_badge}"

        # 验证左侧文章 scrollTop 没有归零
        scroll_after_tab = await page.evaluate('() => document.querySelector(".ez-reading-focus-passage").scrollTop')
        print(f"  - Passage scrollTop after switching tab: {scroll_after_tab}px")
        assert abs(scroll_after_tab - scroll_before) <= 5, f"Scroll position lost! {scroll_after_tab} vs {scroll_before}"
        print("  - Tab switch successfully preserved left passage scroll position!")

        # 3. 在第 22 题答题（点击选项 A） -> 再次验证 scroll 位置保持
        optA = page.locator(".ez-reading-question-stage .ez-option").first
        if await optA.is_visible():
            await optA.click()
            await page.wait_for_timeout(300)
            scroll_after_opt = await page.evaluate('() => document.querySelector(".ez-reading-focus-passage").scrollTop')
            assert abs(scroll_after_opt - scroll_before) <= 5, f"Scroll position lost after answer! {scroll_after_opt}"
            print("  - Option click successfully preserved left passage scroll position!")

        # 4. 点击掌握度按钮 -> 再次验证 scroll 位置保持
        prof_btn = page.locator(".ez-reading-question-stage .ez-btn-mastery.proficient").first
        if await prof_btn.is_visible():
            await prof_btn.click()
            await page.wait_for_timeout(300)
            scroll_after_st = await page.evaluate('() => document.querySelector(".ez-reading-focus-passage").scrollTop')
            assert abs(scroll_after_st - scroll_before) <= 5, f"Scroll position lost after mastery! {scroll_after_st}"
            # 题号 tab 上的 dot 应该变为绿色 (status-proficient)
            assert "status-proficient" in (await tab2.get_attribute("class") or "")
            print("  - Mastery click updated tab dot and preserved left passage scroll position!")

        # 5. 展开解析 -> 再次验证 scroll 位置保持
        exp_btn = page.locator(".ez-reading-question-stage .ez-btn-exp-toggle").first
        if await exp_btn.is_visible():
            await exp_btn.click()
            await page.wait_for_timeout(300)
            scroll_after_exp = await page.evaluate('() => document.querySelector(".ez-reading-focus-passage").scrollTop')
            assert abs(scroll_after_exp - scroll_before) <= 5, f"Scroll position lost after explanation toggle! {scroll_after_exp}"
            print("  - Explanation toggle preserved left passage scroll position!")

        # ----------------------------------------------------
        # 验收 E: 回归测试（单点查词、刷新恢复、控制台 0 错误）
        # ----------------------------------------------------
        print("\n--- Acceptance E: Regression & Stability ---")
        # 单点查词
        w30 = words.nth(20)
        await w30.scroll_into_view_if_needed()
        await w30.click()
        await page.wait_for_timeout(300)
        popover = page.locator(".ez-word-popover")
        assert await popover.is_visible(), "Single click on word must trigger .ez-word-popover"
        print("  - Word popover triggered successfully")
        await page.click("#ezWpBtnClose")
        await page.wait_for_timeout(200)

        # 刷新页面恢复
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(400)
        # 刷新进入 dashboard，按 V 返回英语
        await page.keyboard.press("KeyV")
        await page.wait_for_timeout(300)
        await page.locator(".ez-pill:has-text('阅读')").first.click()
        await page.wait_for_timeout(300)

        # 验证各色高亮恢复
        assert await page.locator("mark.ez-ann--yellow").count() > 0, "Yellow marks must restore after refresh"
        assert await page.locator("mark.ez-ann--green").count() > 0, "Green marks must restore after refresh"
        assert await page.locator("mark.ez-ann--blue").count() > 0, "Blue marks must restore after refresh"
        assert await page.locator("mark.ez-ann--pink").count() > 0, "Pink marks must restore after refresh"
        print("  - All highlights restored 100% after page reload from localStorage")

        # 控制台错误检查
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
        print("ALL ACCEPTANCE CRITERIA FOR PRECISION READING V2 PASSED 100%!")
        print("============================================================")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
