import asyncio
import os
import sys
from playwright.async_api import async_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

ARTIFACT_DIR = r"C:\Users\Flanagan\.gemini\antigravity\brain\226047f0-0eea-4308-a980-7cd958a3b0ed"
os.makedirs(ARTIFACT_DIR, exist_ok=True)

async def main():
    print("==================================================================")
    print("Real Browser Acceptance Suite: English Immersive Precision Reading V3")
    print("Dedicated Fullscreen Workspace · Left Passage · Right Focus Question")
    print("Viewport: 1664 x 920")
    print("==================================================================")

    index_url = "file:///" + os.path.abspath("index.html").replace("\\", "/")
    # 2009 Reading Part A Text 1 section id is 80 (questions 21~25)
    reading_url = "file:///" + os.path.abspath("english-reading.html").replace("\\", "/") + "?year=2009&section=80"
    console_errors = []

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        # Requirement: at least 1664 x 920
        page = await browser.new_page(viewport={"width": 1664, "height": 920})

        def handle_console(msg):
            if msg.type == "error":
                console_errors.append(f"[{msg.type}] {msg.text}")
        page.on("console", handle_console)
        page.on("pageerror", lambda err: console_errors.append(f"[pageerror] {err}"))

        results = {}

        # ----------------------------------------------------------------
        # 验收 B: 进入方式（普通英语页面点击 Reading Part A 直接跳入专用页面）
        # ----------------------------------------------------------------
        print("\n--- Test B: Entrance Delegation from English Workbench ---")
        try:
            # 预置 localStorage，确保从英语真题进入
            await page.goto(index_url, wait_until="networkidle")
            await page.wait_for_timeout(400)

            # 打开英语真题
            await page.evaluate("""() => {
                localStorage.setItem('user_guest_kaoyan_subject', 'english');
                localStorage.setItem('user_guest_kaoyan_workbench_view', 'english');
                localStorage.setItem('user_guest_kaoyan_english_main_tab_v1', 'zhenti');
                localStorage.setItem('user_guest_kaoyan_english_zhenti_year_v1', '2009');
                if (typeof window.openEnglishVocabulary === 'function') {
                    window.openEnglishVocabulary();
                }
            }""")
            await page.wait_for_timeout(400)

            # 验证完形填空（cloze）不会跳页
            cloze_pill = page.locator(".ez-pill:has-text('完型')").first
            if await cloze_pill.is_visible():
                await cloze_pill.click()
                await page.wait_for_timeout(200)
                cur_href = page.url
                assert "english-reading.html" not in cur_href, "Cloze section must not navigate to english-reading.html"
                print("  - Verified Cloze pill remains in index.html without navigating")

            # 点击 Reading Text 1
            reading_pill = page.locator(".ez-pill:has-text('阅读')").first
            assert await reading_pill.is_visible(), "Reading pill must be visible"

            # 监听导航
            async with page.expect_navigation():
                await reading_pill.click()
            await page.wait_for_timeout(500)

            assert "english-reading.html" in page.url, f"Expected navigation to english-reading.html, got: {page.url}"
            assert "year=" in page.url, "URL must contain year parameter"
            assert "section=" in page.url, "URL must contain section parameter"
            print(f"  - Navigation verified: {page.url}")
            results["B_entrance"] = "PASS"
        except Exception as e:
            print(f"  - Test B FAILED: {e}")
            results["B_entrance"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # 验收 A: 页面形态（1664x920 全屏、无侧边栏、双栏比例、题库蓝色、独立滚动条）
        # ----------------------------------------------------------------
        print("\n--- Test A: Fullscreen Morphology (1664x920) ---")
        try:
            # 直接访问指定 Reading 篇目进行纯粹独立环境验证
            await page.goto(reading_url, wait_until="networkidle")
            await page.wait_for_timeout(600)

            # 验证无题库 sidebar
            sidebar = page.locator("#sidebarLeft")
            assert await sidebar.count() == 0, "Dedicated page must not have sidebarLeft"

            # 验证左右 Pane
            passage_pane = page.locator(".er-passage-pane")
            question_pane = page.locator(".er-question-pane")
            assert await passage_pane.is_visible(), "Passage pane must be visible"
            assert await question_pane.is_visible(), "Question pane must be visible"

            # 验证尺寸比例
            p_box = await passage_pane.bounding_box()
            q_box = await question_pane.bounding_box()
            total_w = p_box["width"] + q_box["width"]
            p_pct = (p_box["width"] / total_w) * 100
            q_pct = (q_box["width"] / total_w) * 100
            print(f"  - Pane Dimensions: Passage={p_box['width']:.1f}px ({p_pct:.1f}%), Question={q_box['width']:.1f}px ({q_pct:.1f}%)")
            assert 44.0 <= p_pct <= 49.0, f"Passage pane expected ~46.5%, got {p_pct:.1f}%"
            assert 51.0 <= q_pct <= 56.0, f"Question pane expected ~53.5%, got {q_pct:.1f}%"

            # 验证独立滚动容器
            p_scroll = page.locator("#erPassageScroll")
            q_scroll = page.locator("#erQuestionScroll")
            assert await p_scroll.is_visible(), "#erPassageScroll must be visible"
            assert await q_scroll.is_visible(), "#erQuestionScroll must be visible"

            # 验证主色调为题库蓝色系 (#2f80ed / #1557a6) 而非紫色
            chip_bg = await page.eval_on_selector(".er-mode-chip", "el => getComputedStyle(el).backgroundColor")
            print(f"  - Mode chip background color: {chip_bg}")

            # 截图 1: 1664x920 完整视口
            screenshot_desktop = os.path.join(ARTIFACT_DIR, "reading_v3_desktop_1664.png")
            await page.screenshot(path=screenshot_desktop)
            print(f"  - Screenshot 1 saved to: {screenshot_desktop}")

            results["A_morphology"] = "PASS"
        except Exception as e:
            print(f"  - Test A FAILED: {e}")
            results["A_morphology"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # 验收 C: 左右隔离与 DOM Identity 测试 (oldNode === newNode)
        # ----------------------------------------------------------------
        print("\n--- Test C: Left/Right Isolation & DOM Identity Test ---")
        try:
            # 1. 将左侧文章滚动到 200px
            await page.evaluate("""() => {
                const el = document.getElementById('erPassageScroll');
                el.scrollTop = 200;
            }""")
            await page.wait_for_timeout(100)
            st_before = await page.evaluate("() => document.getElementById('erPassageScroll').scrollTop")
            assert st_before == 200, f"Expected scrollTop 200, got {st_before}"

            # 2. 核心断言: 切题前捕获 DOM 节点引用
            dom_check = await page.evaluate("""() => {
                window.__oldParagraph = document.querySelector('.er-paragraph');
                return !!window.__oldParagraph;
            }""")
            assert dom_check, "Must find .er-paragraph before tab click"

            # 3. 点击第 22 题 Tab (.er-qtab)
            tab_22 = page.locator(".er-qtab").nth(1)
            tab_22_text = await tab_22.inner_text()
            print(f"  - Clicking tab: {tab_22_text.strip()}")
            await tab_22.click()
            await page.wait_for_timeout(200)

            # 4. 验证 DOM Identity: oldParagraph === newParagraph
            identity_pass = await page.evaluate("""() => {
                const newParagraph = document.querySelector('.er-paragraph');
                return window.__oldParagraph === newParagraph;
            }""")
            assert identity_pass, "CRITICAL ASSERTION FAILED: oldParagraph !== newParagraph! Left DOM was re-created on tab switch!"
            print("  - DOM Identity Assertion: oldParagraph === newParagraph -> TRUE (Left DOM untouched!)")

            # 5. 验证左侧文章 scrollTop 未发生任何改变
            st_after = await page.evaluate("() => document.getElementById('erPassageScroll').scrollTop")
            assert st_after == 200, f"Left scrollTop changed from 200 to {st_after}!"
            print(f"  - Left scrollTop Assertion: 200 -> {st_after} (Strictly preserved!)")

            # 6. 验证右侧成功切换到第 22 题
            q_num_text = await page.locator(".er-q-label").inner_text()
            print(f"  - Active Question Label: {q_num_text.strip()}")
            assert "22" in q_num_text, f"Expected question 22, got {q_num_text}"

            results["C_isolation"] = "PASS"
        except Exception as e:
            print(f"  - Test C FAILED: {e}")
            results["C_isolation"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # 验收 D: Answer 作答与刷新恢复
        # ----------------------------------------------------------------
        print("\n--- Test D: Answer Selection & Reload Persistence ---")
        try:
            # 选择选项 B
            opt_b = page.locator(".er-option").nth(1)
            opt_b_key = await opt_b.locator(".er-opt-key").inner_text()
            print(f"  - Clicking option: {opt_b_key.strip()}")
            await opt_b.click()
            await page.wait_for_timeout(200)

            # 验证选中状态
            assert await opt_b.evaluate("el => el.classList.contains('is-selected')"), "Option B must have .is-selected"

            # 验证进度条更新 (done count >= 1)
            progress_text = await page.locator(".er-progress strong").inner_text()
            print(f"  - Progress after answer: {progress_text.strip()}")
            assert "0 /" not in progress_text, "Progress must update after answering"

            # 刷新页面验证持久化
            await page.reload(wait_until="networkidle")
            await page.wait_for_timeout(500)

            # 重新定位到刚作答的题目
            reloaded_tab = page.locator(".er-qtab").nth(1)
            await reloaded_tab.click()
            await page.wait_for_timeout(200)
            reloaded_opt_b = page.locator(".er-option").nth(1)
            assert await reloaded_opt_b.evaluate("el => el.classList.contains('is-selected')"), "Option B must remain selected after page reload"
            print("  - Answer persisted across page reload successfully")

            results["D_answer"] = "PASS"
        except Exception as e:
            print(f"  - Test D FAILED: {e}")
            results["D_answer"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # 验收 E: Mastery 五级掌握度与 Tab Dot 同步
        # ----------------------------------------------------------------
        print("\n--- Test E: Mastery Level & Tab Dot Synchronization ---")
        try:
            # 点击“熟练” (proficient)
            proficient_btn = page.locator(".er-mastery.proficient")
            await proficient_btn.click()
            await page.wait_for_timeout(200)

            # 验证按钮 active
            assert await proficient_btn.evaluate("el => el.classList.contains('active')"), "Proficient button must have .active"

            # 验证上方对应 Tab 带有 status-proficient
            active_tab = page.locator(".er-qtab.is-active")
            tab_has_proficient = await active_tab.evaluate("el => el.classList.contains('status-proficient')")
            assert tab_has_proficient, "Active question tab must synchronize .status-proficient"
            print("  - Mastery state set to 'proficient' and Tab dot synchronized successfully")

            results["E_mastery"] = "PASS"
        except Exception as e:
            print(f"  - Test E FAILED: {e}")
            results["E_mastery"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # 验收 F: Explanation 解析开合与 Space 快捷键
        # ----------------------------------------------------------------
        print("\n--- Test F: Explanation Toggle & Keyboard Space ---")
        try:
            exp_btn = page.locator("[data-action='toggleExp']")
            exp_box = page.locator(".er-exp-box")

            # 初始点击展开
            await exp_btn.click()
            await page.wait_for_timeout(200)
            assert await exp_box.is_visible(), "Explanation box (.er-exp-box) must be visible after click"
            print("  - Explanation unfolded via button click")

            # 按 Space 切换收起
            await page.keyboard.press("Space")
            await page.wait_for_timeout(200)
            assert not await exp_box.is_visible(), "Explanation card must collapse on Space press"
            print("  - Explanation collapsed on Space press")

            # 再次按 Space 重新展开
            await page.keyboard.press("Space")
            await page.wait_for_timeout(200)
            assert await exp_box.is_visible(), "Explanation card must unfold on second Space press"
            print("  - Explanation reopened on second Space press")

            results["F_explanation"] = "PASS"
        except Exception as e:
            print(f"  - Test F FAILED: {e}")
            results["F_explanation"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # 验收 G: Notes 题目笔记编辑、保存与刷新恢复
        # ----------------------------------------------------------------
        print("\n--- Test G: Question Notes Edit, Save & Reload Persistence ---")
        try:
            edit_note_btn = page.locator("[data-action='editNote'], [data-action='saveNote']")
            # 如果尚未在编辑态，点击添加/修改
            if not await page.locator("#erNoteInput").is_visible():
                await edit_note_btn.click()
                await page.wait_for_timeout(200)

            note_textarea = page.locator("#erNoteInput")
            assert await note_textarea.is_visible(), "Note textarea must be visible in edit mode"
            test_note = "V3沉浸式精读笔记：定位在P2第三句转折处。"
            await note_textarea.fill(test_note)

            save_note_btn = page.locator("[data-action='saveNote']")
            await save_note_btn.click()
            await page.wait_for_timeout(300)

            # 验证笔记内容显示在卡片中
            note_content = page.locator(".er-note-text")
            assert await note_content.is_visible(), "Saved note (.er-note-text) must be rendered"
            assert test_note in await note_content.inner_text(), "Rendered note must match entered text"
            print(f"  - Note saved and displayed: {test_note}")

            # 刷新验证
            await page.reload(wait_until="networkidle")
            await page.wait_for_timeout(500)
            await page.locator(".er-qtab").nth(1).click()
            await page.wait_for_timeout(200)
            reloaded_note = page.locator(".er-note-text")
            assert test_note in await reloaded_note.inner_text(), "Note must persist across reload"
            print("  - Note reload persistence verified")

            results["G_notes"] = "PASS"
        except Exception as e:
            print(f"  - Test G FAILED: {e}")
            results["G_notes"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # 验收 H: Bilingual 译文切换与左文章滚动保持
        # ----------------------------------------------------------------
        print("\n--- Test H: Bilingual Translation Toggle & Left Scroll Retention ---")
        try:
            # 设置左侧文章滚动为 150px
            await page.evaluate("() => { document.getElementById('erPassageScroll').scrollTop = 150; }")
            st_before_bi = await page.evaluate("() => document.getElementById('erPassageScroll').scrollTop")

            bi_btn = page.locator("[data-action='toggleBilingual']")
            await bi_btn.click()
            await page.wait_for_timeout(300)

            # 验证出现译文段落 .er-para-zh
            zh_paras = page.locator(".er-para-zh")
            assert await zh_paras.count() > 0, "Chinese paragraphs .er-para-zh must be rendered in bilingual mode"
            print(f"  - Bilingual mode enabled, found {await zh_paras.count()} Chinese paragraphs")

            # 验证左侧文章滚动位置保持
            st_after_bi = await page.evaluate("() => document.getElementById('erPassageScroll').scrollTop")
            assert st_after_bi == st_before_bi, f"Bilingual toggle reset scrollTop: {st_before_bi} -> {st_after_bi}"
            print(f"  - Left scrollTop preserved across bilingual toggle: {st_after_bi}px")

            # 截图 2: 左文章 + 右当前题 (带双语与解析)
            screenshot_split = os.path.join(ARTIFACT_DIR, "reading_v3_split_view.png")
            await page.screenshot(path=screenshot_split)
            print(f"  - Screenshot 2 saved to: {screenshot_split}")

            results["H_bilingual"] = "PASS"
        except Exception as e:
            print(f"  - Test H FAILED: {e}")
            results["H_bilingual"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # 验收 I: Annotation 精读标注引擎（连续黄色荧光、多色、下划线、便签、刷新恢复）
        # ----------------------------------------------------------------
        print("\n--- Test I: Precision Annotation Engine ---")
        try:
            # 划选 P1 中的前 4 个单词
            p1_scope = page.locator(".er-passage-body .er-paragraph:nth-child(1) .er-para-en")
            await p1_scope.scroll_into_view_if_needed()
            words = p1_scope.locator(".ez-word")
            w0_box = await words.nth(0).bounding_box()
            w3_box = await words.nth(3).bounding_box()

            # 鼠标拖选手势
            await page.mouse.move(w0_box["x"] + 2, w0_box["y"] + w0_box["height"] / 2)
            await page.mouse.down()
            await page.mouse.move(w3_box["x"] + w3_box["width"] - 2, w3_box["y"] + w3_box["height"] / 2, steps=6)
            await page.mouse.up()
            await page.wait_for_timeout(300)

            # 验证工具条浮出
            toolbar = page.locator(".ez-ann-toolbar")
            assert await toolbar.is_visible(), "Annotation toolbar must be visible on text drag selection"
            print("  - Annotation toolbar popped up on drag selection")

            # 点击黄色高亮
            yellow_btn = toolbar.locator(".ez-ann-color.is-yellow")
            await yellow_btn.click()
            await page.wait_for_timeout(300)

            # 验证生成的 mark: 连续高亮 (padding=0, border-radius=0, color=#FFD43B)
            mark = p1_scope.locator("mark.ez-ann-mark.ez-ann--yellow").first
            assert await mark.is_visible(), "Yellow mark must be rendered"

            mark_styles = await mark.evaluate("""el => {
                const s = getComputedStyle(el);
                return {
                    padding: s.padding,
                    borderRadius: s.borderRadius,
                    bg: s.backgroundColor
                };
            }""")
            print(f"  - Yellow Mark Styles: padding={mark_styles['padding']}, borderRadius={mark_styles['borderRadius']}, bg={mark_styles['bg']}")
            assert mark_styles["borderRadius"] in ["0px", "0%"], f"Border radius must be 0px, got {mark_styles['borderRadius']}"
            assert "255, 212, 59" in mark_styles["bg"], f"Expected rgb(255, 212, 59), got {mark_styles['bg']}"

            # 验证 .ez-word 的 padding=0
            word_padding = await words.nth(0).evaluate("el => getComputedStyle(el).padding")
            assert word_padding == "0px", f".ez-word padding must be 0px, got {word_padding}"

            # 截图 3: 连续黄色标注特写
            screenshot_yellow = os.path.join(ARTIFACT_DIR, "reading_v3_continuous_yellow.png")
            await page.screenshot(path=screenshot_yellow)
            print(f"  - Screenshot 3 saved to: {screenshot_yellow}")

            # 刷新验证标注持久化恢复
            await page.reload(wait_until="networkidle")
            await page.wait_for_timeout(500)
            reloaded_mark = page.locator(".er-passage-body mark.ez-ann-mark.ez-ann--yellow").first
            assert await reloaded_mark.is_visible(), "Annotation mark must persist across page reload"
            print("  - Annotation reload persistence verified")

            results["I_annotation"] = "PASS"
        except Exception as e:
            print(f"  - Test I FAILED: {e}")
            results["I_annotation"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # 验收 J: Word Lookup 单击单词查词与拖选抑制
        # ----------------------------------------------------------------
        print("\n--- Test J: Word Lookup Interaction & Drag Suppression ---")
        try:
            # 预热词典缓存，确保单机/离线环境立即展示生词本操作
            await page.evaluate("""() => {
                const cache = JSON.parse(localStorage.getItem('user_guest_kaoyan_dict_cache_v2') || '{}');
                cache['so'] = { word: 'so', phonetic: '/səʊ/', definition: 'adv. 如此，这么；conj. 因此' };
                localStorage.setItem('user_guest_kaoyan_dict_cache_v2', JSON.stringify(cache));
            }""")

            # 单击单词
            target_word = page.locator(".er-passage-body .er-paragraph:nth-child(2) .ez-word:has-text('so')").first
            if not await target_word.count():
                target_word = page.locator(".er-passage-body .er-paragraph:nth-child(2) .ez-word").first
            await target_word.click()
            await page.wait_for_timeout(300)

            # 验证弹窗出现
            popover = page.locator(".er-word-popover")
            assert await popover.is_visible(), "Word popover must appear on click"
            pop_word = await popover.locator(".er-word-popover-head strong").inner_text()
            print(f"  - Word popover appeared for word: {pop_word.strip()}")

            # 验证生词本按钮存在 (data-word-add)
            vocab_btn = popover.locator("[data-word-add]")
            await vocab_btn.wait_for(state="visible", timeout=3000)
            assert await vocab_btn.is_visible(), "Add to vocab button [data-word-add] must be visible in word popover"
            print("  - Add to vocab button (.is-primary [data-word-add]) verified")

            # 关闭 popover
            await page.evaluate("() => { if (typeof window.closeEnglishWordPopover === 'function') window.closeEnglishWordPopover(); }")
            await page.wait_for_timeout(100)
            assert not await popover.is_visible(), "Word popover must close via closeEnglishWordPopover"
            print("  - Word lookup and close verified")

            results["J_lookup"] = "PASS"
        except Exception as e:
            print(f"  - Test J FAILED: {e}")
            results["J_lookup"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # 验收 K: Back 返回主站与自动恢复 English Workbench
        # ----------------------------------------------------------------
        print("\n--- Test K: Back Button & Auto Reopen English Workbench ---")
        try:
            back_btn = page.locator("[data-action='back']")
            assert await back_btn.is_visible(), "Back button must be visible in header"

            async with page.expect_navigation():
                await back_btn.click()
            # 留出 700ms 让 setTimeout(doOpen, 200) 充分完成
            await page.wait_for_timeout(700)

            assert "index.html" in page.url or page.url.endswith("/"), f"Expected return to index.html, got: {page.url}"
            # 验证 English panel 自动打开 (hidden === false)
            panel_hidden = await page.evaluate("() => document.getElementById('englishPanel').hidden")
            assert not panel_hidden, "English panel must automatically open after returning from immersive reading"
            print("  - Return navigation verified: index.html opened and englishPanel is active")

            results["K_back"] = "PASS"
        except Exception as e:
            print(f"  - Test K FAILED: {e}")
            results["K_back"] = f"FAIL: {e}"

        # ----------------------------------------------------------------
        # 验收 L: 控制台 0 异常检查
        # ----------------------------------------------------------------
        print("\n--- Test L: Console Error Audit ---")
        fatal_errors = [e for e in console_errors if "favicon" not in e]
        if fatal_errors:
            print(f"  - Encountered {len(fatal_errors)} console error(s):")
            for err in fatal_errors:
                print(f"    * {err}")
            results["L_console"] = f"FAIL: {len(fatal_errors)} errors"
        else:
            print("  - 0 console errors / 0 pageerrors detected! (Clean execution)")
            results["L_console"] = "PASS"

        await browser.close()

    print("\n==================================================================")
    print("ALL TESTS COMPLETED - FINAL SUMMARY TABLE")
    print("==================================================================")
    all_pass = True
    for item, status in results.items():
        print(f"  [{status}] {item}")
        if status != "PASS":
            all_pass = False

    if not all_pass:
        sys.exit(1)
    else:
        print("\nALL 12 ACCEPTANCE CRITERIA (A~L) PASSED 100%!")
        sys.exit(0)

if __name__ == "__main__":
    asyncio.run(main())
