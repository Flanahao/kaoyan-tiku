import asyncio
import os
import sys

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from playwright.async_api import async_playwright

async def main():
    print("============================================================")
    print("Testing English UI V2: 4 Viewports & 6 Section Workspaces")
    print("============================================================")

    url = "file:///" + os.path.abspath("index.html").replace("\\", "/")
    viewports = [
        ("desktop_1440", 1440, 900),
        ("laptop_1024", 1024, 768),
        ("tablet_768", 768, 1024),
        ("mobile_390", 390, 844)
    ]

    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)

        for vp_name, width, height in viewports:
            print(f"\n--- Testing Viewport: {vp_name} ({width}x{height}) ---")
            page = await browser.new_page(viewport={"width": width, "height": height})
            await page.goto(url, wait_until="networkidle")
            await page.keyboard.press("KeyG")
            await page.wait_for_timeout(200)

            # Switch to English
            english_opt = page.locator(".subject-option:has-text('考研英语')").first
            await english_opt.click()
            await page.wait_for_timeout(500)

            # Check horizontal overflow
            scroll_w, client_w = await page.evaluate("() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]")
            print(f"  - Horizontal overflow check: scrollWidth={scroll_w}, clientWidth={client_w}")
            assert scroll_w <= client_w + 1, f"Horizontal overflow detected at {vp_name}: {scroll_w} > {client_w}"

            # 1. Test Cloze
            cloze_pill = page.locator(".ez-pill").filter(has_text="完").first
            if await cloze_pill.count() > 0:
                await cloze_pill.click()
                await page.wait_for_timeout(300)
                para_text = await page.inner_text(".ez-para-en")
                assert "Advances in artificial intelligence" in para_text, "Cloze text must have proper word spacing"
                assert "Advancesin" not in para_text, "Cloze text must not stick words together"
                assert ".?" not in para_text, "No .? in cloze text"

                if width == 1440:
                    await page.screenshot(path="screenshots/v2_cloze_desktop_1440.png")
                    print("  - Saved screenshots/v2_cloze_desktop_1440.png")
                elif width == 390:
                    await page.screenshot(path="screenshots/v2_cloze_mobile_390.png")
                    print("  - Saved screenshots/v2_cloze_mobile_390.png")

            # 2. Test Reading Text 1
            reading_pill = page.locator(".ez-pill:has-text('阅读Text1')").first
            if await reading_pill.count() > 0:
                await reading_pill.click()
                await page.wait_for_timeout(300)
                read_para = await page.inner_text(".ez-para-en")
                assert "For thousands of years" in read_para, "Reading text must have proper word spacing"
                assert "Forthousands" not in read_para, "No sticky words in reading"
                assert ".?" not in read_para, "No .? in reading"

                if width == 1440:
                    await page.screenshot(path="screenshots/v2_reading_desktop_1440.png")
                    print("  - Saved screenshots/v2_reading_desktop_1440.png")

            # 3. Test Part B (New Question Type)
            partb_pill = page.locator(".ez-pill:has-text('Part B')").first
            if await partb_pill.count() > 0:
                await partb_pill.click()
                await page.wait_for_timeout(300)
                lead_count = await page.locator(".ez-partb-lead").count()
                assert lead_count == 1, "Part B lead should only render once"
                if width == 1440:
                    await page.screenshot(path="screenshots/v2_partb_desktop_1440.png")
                    print("  - Saved screenshots/v2_partb_desktop_1440.png")

            # 4. Test Translation (with draft typing & persistence)
            trans_pill = page.locator(".ez-pill").filter(has_text="翻译").first
            if await trans_pill.count() > 0:
                await trans_pill.click()
                await page.wait_for_timeout(300)
                textarea = page.locator(".ez-answer-textarea").first
                assert await textarea.count() > 0, "Translation textarea must exist"

                test_trans_str = "科学教育的定义随着时间而演变。"
                await textarea.fill(test_trans_str)
                await page.wait_for_timeout(200)

                # Check character count
                count_txt = await page.inner_text(".ez-draft-status")
                assert f"{len(test_trans_str)} 字" in count_txt, f"Expected {len(test_trans_str)} 字, got {count_txt}"

                # Test reload persistence
                await page.reload(wait_until="networkidle")
                await page.wait_for_timeout(300)
                val_after_reload = await page.locator(".ez-answer-textarea").first.input_value()
                assert val_after_reload == test_trans_str, "Translation draft must persist after reload"

                if width == 1440:
                    # Toggle explanation to check 参考译文
                    btn_exp = page.locator(".ez-btn-exp-toggle").first
                    await btn_exp.click()
                    await page.wait_for_timeout(200)
                    exp_ans = await page.inner_text(".ez-exp-answer-row")
                    assert "参考译文" in exp_ans, "Explanation should say 参考译文 for translation"
                    await page.screenshot(path="screenshots/v2_trans_desktop_1440.png")
                    print("  - Saved screenshots/v2_trans_desktop_1440.png")

            # 5. Test Writing Part A
            write_pill = page.locator(".ez-pill:has-text('写作 Part A')").first
            if await write_pill.count() > 0:
                await write_pill.click()
                await page.wait_for_timeout(300)

                # Check rail does not show "0 题"
                rail = page.locator(".ez-sidebar-rail")
                assert await rail.count() == 0, "Writing workspace should not render empty sidebar rail"

                # Check writing textarea & word count
                write_area = page.locator(".ez-writing-textarea").first
                assert await write_area.count() > 0, "Writing textarea must exist"
                await write_area.fill("Dear Mr. Smith, I am writing this letter to invite you.")
                await page.wait_for_timeout(200)

                word_count_txt = await page.inner_text(".ez-writing-draft-footer strong")
                assert "11 words" in word_count_txt, f"Expected '11 words', got {word_count_txt}"

                # Check details collapsed
                details = page.locator(".ez-writing-reference")
                details_count = await details.count()
                assert details_count >= 1, "Writing sample essay details must exist"
                is_open = await details.first.get_attribute("open")
                assert is_open is None, "Sample essay should be collapsed by default"

                if width == 1440:
                    await page.screenshot(path="screenshots/v2_writing_desktop_1440.png")
                    print("  - Saved screenshots/v2_writing_desktop_1440.png")

            await page.close()

        await browser.close()
        print("\n============================================================")
        print("ALL VIEWPORT & WORKSPACE TESTS PASSED 100%!")
        print("============================================================")

if __name__ == "__main__":
    asyncio.run(main())
