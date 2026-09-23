import asyncio
import os
import sys

# Configure UTF-8 stdout/stderr on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")

from playwright.async_api import async_playwright

async def main():
    print("============================================================")
    print("Running Full E2E Test: English Subject, 3 Tabs, Zhenti Vocab, & Dashboard")
    print("============================================================")

    url = "file:///" + os.path.abspath("index.html").replace("\\", "/")
    screenshot_dir = os.path.join(os.path.abspath("screenshots"))
    os.makedirs(screenshot_dir, exist_ok=True)

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        page.on("console", lambda msg: print(f"  [Browser Console] {msg.type}: {msg.text}") if msg.type == 'error' else None)

        print("\n--- Step 1: Load Page & Test Subject Picker Modal ---")
        await page.goto(url, wait_until="networkidle")
        await page.wait_for_timeout(300)

        # Open subject picker
        await page.keyboard.press("KeyG")
        await page.wait_for_timeout(200)

        # Check options in subject picker
        subject_options = await page.query_selector_all(".subject-option")
        opt_texts = [await opt.text_content() for opt in subject_options]
        print(f"  - Subject options available: {opt_texts}")
        assert any("考研英语" in t for t in opt_texts), "Subject picker must include 考研英语"
        assert any("数学" in t for t in opt_texts), "Subject picker must include 数学"
        assert any("专业课" in t for t in opt_texts), "Subject picker must include 专业课"

        # Click 考研英语
        english_opt = page.locator(".subject-option:has-text('考研英语')").first
        await english_opt.click()
        await page.wait_for_timeout(300)

        # Verify current section breadcrumb & workbench view
        crumb = await page.text_content("#headerCurrentSection")
        print(f"  - Header Section Breadcrumb: {crumb}")
        assert crumb == "考研英语", f"Expected '考研英语', got {crumb}"

        cur_subj = await page.evaluate("() => curSubjectId")
        print(f"  - Current Subject ID: {cur_subj}")
        assert cur_subj == "english", f"Expected 'english', got {cur_subj}"

        # Verify #btnEnglish is removed from sidebar under 统计
        btn_en = await page.query_selector("#btnEnglish")
        assert btn_en is None, "Sidebar #btnEnglish must be removed from sidebar"
        print("  - Verified #btnEnglish is cleanly removed from sidebar under 统计")

        await page.screenshot(path=os.path.join(screenshot_dir, "english_subject_switch.png"))
        print("  - Saved screenshot: screenshots/english_subject_switch.png")

        # -------------------------------------------------------------------------
        # Step 2: Test the Three Top Tabs
        # -------------------------------------------------------------------------
        print("\n--- Step 2: Verify the Three Parallel Top Tabs ---")
        tabs = await page.query_selector_all(".english-top-tab")
        tab_texts = [await t.text_content() for t in tabs]
        print(f"  - Three Top Tabs: {tab_texts}")
        assert len(tabs) == 3, f"Expected 3 tabs, got {len(tabs)}"
        assert any("历年真题" in t for t in tab_texts), "Tab 1 must be 历年真题"
        assert any("真题生词本" in t for t in tab_texts), "Tab 2 must be 真题生词本"
        assert any("考研核心词汇" in t for t in tab_texts), "Tab 3 must be 考研核心词汇背诵"

        # -------------------------------------------------------------------------
        # Step 3: Test Word Click, Popover & Add to Zhenti Vocab
        # -------------------------------------------------------------------------
        print("\n--- Step 3: Test Word Click, Popover & Add to Zhenti Vocab ---")
        # Navigate to 2026 Text 1
        text1_pill = page.locator(".ez-pill:has-text('Text 1'), .ez-pill:has-text('Text1')").first
        await text1_pill.click()
        await page.wait_for_timeout(200)

        # Click on a word in paragraph
        words = await page.query_selector_all(".ez-para-en .ez-word")
        assert len(words) > 0, "English words must be wrapped in clickable spans"
        target_word_el = words[0]
        word_text = await target_word_el.text_content()
        print(f"  - Clicking word: '{word_text}'")
        await target_word_el.click()
        await page.wait_for_timeout(400)

        # Check popover appeared
        popover = await page.query_selector("#ezWordPopover")
        assert popover is not None, "Word popover must appear"
        pop_word = await page.text_content(".ez-wp-word")
        print(f"  - Popover displayed word: '{pop_word}'")

        # Click Add to Vocab button
        btn_add = page.locator("#ezWpBtnAdd")
        btn_add_text_before = await btn_add.text_content()
        print(f"  - Add button text before: '{btn_add_text_before}'")
        await btn_add.click()
        await page.wait_for_timeout(200)

        btn_add_text_after = await btn_add.text_content()
        print(f"  - Add button text after: '{btn_add_text_after}'")
        assert "已在真题生词本" in btn_add_text_after or "已在生词卡" in btn_add_text_after

        # Verify storage content
        zhenti_vocab = await page.evaluate("() => JSON.parse(localStorage.getItem('user_guest_kaoyan_english_zhenti_vocab_v1') || '{\"items\":[]}')")
        items = zhenti_vocab.get("items", [])
        print(f"  - Items in zhenti vocab localStorage: {len(items)}")
        assert len(items) >= 1, "Word must be saved in user_guest_kaoyan_english_zhenti_vocab_v1"
        saved_item = items[0]
        print(f"  - Saved Item: word='{saved_item.get('word')}', year='{saved_item.get('year')}', sourceTitle='{saved_item.get('sourceTitle')}'")
        assert saved_item.get("sentence"), "Sentence context must be saved"

        await page.screenshot(path=os.path.join(screenshot_dir, "english_word_popover.png"))
        print("  - Saved screenshot: screenshots/english_word_popover.png")

        # -------------------------------------------------------------------------
        # Step 4: Test Zhenti Vocab Module (真题生词本 Tab)
        # -------------------------------------------------------------------------
        print("\n--- Step 4: Switch to 真题生词本 Tab & Test Features ---")
        zv_tab = page.locator(".english-top-tab:has-text('真题生词本')").first
        await zv_tab.click()
        await page.wait_for_timeout(300)

        # Verify cards grid rendered
        zv_cards = await page.query_selector_all(".zv-card")
        print(f"  - Rendered Zhenti Vocab Cards: {len(zv_cards)}")
        assert len(zv_cards) >= 1, "Added word must appear as a card in 真题生词本"

        card_word = await page.text_content(".zv-card .zv-word")
        card_year = await page.text_content(".zv-card .zv-badge-year")
        print(f"  - Card Word: '{card_word}', Badge: '{card_year}'")

        # Test mastery buttons in Zhenti Vocab
        prof_btn = page.locator(".zv-card .zv-btn-mastery.proficient").first
        await prof_btn.click()
        await page.wait_for_timeout(200)

        has_active = await page.evaluate("() => document.querySelector('.zv-btn-mastery.proficient').classList.contains('active')")
        assert has_active, "Mastery button must have active class after clicking"
        print("  - Mastery state marked as 'proficient' successfully")

        # Test hide Chinese / test mode toggle
        btn_hide_zh = page.locator("#btnToggleZvChinese")
        await btn_hide_zh.click()
        await page.wait_for_timeout(200)

        is_blurred = await page.evaluate("() => document.querySelector('.zv-meaning-box').classList.contains('blurred')")
        assert is_blurred, "Meaning box must be blurred in test mode"
        print("  - Test mode (blur meaning) active")

        # Click meaning box to reveal
        await page.click(".zv-meaning-box")
        await page.wait_for_timeout(200)
        is_blurred_after = await page.evaluate("() => document.querySelector('.zv-meaning-box').classList.contains('blurred')")
        assert not is_blurred_after, "Meaning box must be unblurred after clicking reveal"
        print("  - Single word meaning revealed successfully on click")

        await page.screenshot(path=os.path.join(screenshot_dir, "english_zhenti_vocab_tab.png"))
        print("  - Saved screenshot: screenshots/english_zhenti_vocab_tab.png")

        # -------------------------------------------------------------------------
        # Step 5: Test Core Vocabulary Tab Isolation
        # -------------------------------------------------------------------------
        print("\n--- Step 5: Test Core Vocabulary Tab Isolation ---")
        vocab_tab = page.locator(".english-top-tab:has-text('核心词汇')").first
        await vocab_tab.click()
        await page.wait_for_timeout(300)

        vocab_cards = await page.query_selector_all(".english-card")
        print(f"  - Core Vocab Cards count: {len(vocab_cards)} (Synonyms list)")
        assert len(vocab_cards) > 0, "Core vocabulary items must remain intact"

        # -------------------------------------------------------------------------
        # Step 6: Test Global Progress Dashboard & Books Progress Grid
        # -------------------------------------------------------------------------
        print("\n--- Step 6: Test Data Dashboard Overview & Books Progress Grid ---")
        # Open Dashboard
        await page.evaluate("() => toggleDashboard()")
        await page.wait_for_timeout(400)

        cur_view = await page.evaluate("() => getWorkbenchView()")
        print(f"  - Workbench View: '{cur_view}'")
        assert cur_view == "dashboard", "Workbench view must be dashboard"
        print("  - Dashboard view opened successfully")

        # Check Books in #dbGrid
        cards = await page.query_selector_all(".db-donut-card")
        print(f"  - Dashboard book cards count: {len(cards)}")

        # Check if 历年真题 (考研英语) card is present
        en_zhenti_card = await page.query_selector(".db-donut-card[data-subject-id='english'][data-wb='历年真题']")
        assert en_zhenti_card is not None, "Must have '历年真题' (考研英语) progress card in #dbGrid"
        print("  - Found '历年真题' (考研英语) donut progress card in Books Grid!")

        # Check if 英语词汇 card is also present
        en_vocab_card = await page.query_selector(".db-donut-card[data-card-key='english-vocabulary']")
        assert en_vocab_card is not None, "Must have '英语词汇' progress card in #dbGrid"
        print("  - Found '英语词汇' progress card in Books Grid!")

        # Verify StudyAnalytics subject totals include English Zhenti 1,390 questions
        totals = await page.evaluate("() => window.StudyAnalytics ? window.StudyAnalytics.getSubjectTotals() : null")
        if totals:
            en_totals = totals.get("english", {})
            print(f"  - StudyAnalytics English totals: total={en_totals.get('total')}, done={en_totals.get('done')}")
            # English total should be >= 1390 (zhenti) + vocabulary items
            assert en_totals.get("total", 0) >= 1390, f"English total questions should be >= 1390, got {en_totals.get('total')}"
            all_totals = totals.get("all", {})
            print(f"  - StudyAnalytics All totals: total={all_totals.get('total')}, done={all_totals.get('done')}")
            assert all_totals.get("total", 0) > en_totals.get("total", 0), "All totals must combine math, major and english"

        await page.screenshot(path=os.path.join(screenshot_dir, "english_dashboard_books.png"))
        print("  - Saved screenshot: screenshots/english_dashboard_books.png")

        # Test clicking English Zhenti card from dashboard opens English module
        await en_zhenti_card.click()
        await page.wait_for_timeout(300)

        # Dashboard closes and workbench is in english
        cur_view = await page.evaluate("() => typeof getWorkbenchView === 'function' ? getWorkbenchView() : ''")
        print(f"  - Workbench View after clicking book card: '{cur_view}'")
        assert cur_view == "english", "Clicking English Zhenti book card must open english workbench"

        print("\n============================================================")
        print("🎉 ALL TESTS PASSED SUCCESSFULLY! 100% VERIFIED!")
        print("============================================================")

        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
