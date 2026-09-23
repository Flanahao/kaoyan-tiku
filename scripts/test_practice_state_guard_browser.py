import asyncio
import os
import sys
from playwright.async_api import async_playwright

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

async def ensure_practice_view(page):
    # 若有科目选择弹窗，先选择数学一
    if await page.locator("#subjectOverlay").is_visible():
        await page.locator(".subject-option[data-subject='shu1']").click()
        await page.wait_for_timeout(300)

    # 若在 dashboard，切换到 practice
    if await page.evaluate("() => window.getWorkbenchView() === 'dashboard'"):
        await page.keyboard.press("KeyV")
        await page.wait_for_timeout(300)
        if await page.evaluate("() => window.getWorkbenchView() === 'dashboard'"):
            continue_btn = page.locator("#btnHeroContinue, #btnDashboard").first
            await continue_btn.click()
            await page.wait_for_timeout(300)

async def main():
    print("============================================================")
    print("Running Real Browser Regression: State Guard Paths A ~ H")
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
        # Path A: 数学打标 → 进入英语 → 点击“返回刷题”
        # ----------------------------------------------------
        print("\n--- Testing Path A: Math mark -> Enter English -> Click '返回刷题' ---")
        await ensure_practice_view(page)
        subj = await page.evaluate("() => window.getCurrentSubjectId()")
        assert subj == "shu1", f"Expected shu1, got {subj}"

        # 标记当前题为熟练
        await page.click("#btnProficient")
        await page.wait_for_timeout(200)

        # 进入英语
        await page.click("#btnSwitchSubject")
        await page.wait_for_timeout(200)
        await page.click(".subject-option[data-subject='english']")
        await page.wait_for_timeout(400)
        view = await page.evaluate("() => window.getWorkbenchView()")
        assert view == "english", f"Expected english view, got {view}"
        crumb = await page.inner_text("#headerCurrentSection")
        assert "考研英语" in crumb, f"Expected 考研英语, got {crumb}"

        # 点击返回刷题
        back_btn = page.locator("button.ez-btn-back, button.english-back-btn, button[data-action='back']").first
        await back_btn.click()
        await page.wait_for_timeout(400)
        view_after = await page.evaluate("() => window.getWorkbenchView()")
        assert view_after == "practice", f"Expected practice view, got {view_after}"
        subj_after = await page.evaluate("() => window.getCurrentSubjectId()")
        assert subj_after == "shu1", f"Expected shu1 after return, got {subj_after}"
        crumb_after = await page.inner_text("#headerCurrentSection")
        assert "刷题工作台" in crumb_after, f"Expected 刷题工作台, got {crumb_after}"

        # 检查题号与图片是否正常存在（非空壳）
        q_label = await page.inner_text("#qLabel")
        assert len(q_label.strip()) > 0, "qLabel must not be empty"
        img_src = await page.evaluate("() => document.getElementById('questionImg').src")
        assert img_src and "data:image/svg+xml" not in img_src, f"Question image should be valid, got {img_src}"
        print("  - Path A PASS: Successfully returned to math practice with full UI integrity")

        # ----------------------------------------------------
        # Path B: 数学打标 → 进入英语 → 按 Esc 键返回
        # ----------------------------------------------------
        print("\n--- Testing Path B: Math mark -> Enter English -> Press Esc ---")
        # 切到第 2 题并打标
        await page.evaluate("() => window.switchTo(2)")
        await page.wait_for_timeout(200)
        await page.click("#btnVague")
        await page.wait_for_timeout(200)

        # 记录打标并自动流转后停靠的题目索引
        docked_idx = await page.evaluate("() => window.getCurrentPracticeState().current")

        # 进入英语
        await page.click("#btnSwitchSubject")
        await page.wait_for_timeout(200)
        await page.click(".subject-option[data-subject='english']")
        await page.wait_for_timeout(400)
        assert await page.evaluate("() => window.getWorkbenchView()") == "english"

        # 按 Esc 键
        await page.keyboard.press("Escape")
        await page.wait_for_timeout(400)
        assert await page.evaluate("() => window.getWorkbenchView()") == "practice"
        curr_idx = await page.evaluate("() => window.getCurrentPracticeState().current")
        assert curr_idx == docked_idx, f"Expected return to docked question {docked_idx}, got {curr_idx}"
        print(f"  - Path B PASS: Esc returned to math practice at docked question {docked_idx}")

        # ----------------------------------------------------
        # Path C: 专业课 → 数学 → 连续打标，核对两科 SM-2 互不改变
        # ----------------------------------------------------
        print("\n--- Testing Path C: Isolation of SM-2 across zhuanye and shu1 ---")
        await page.evaluate("() => window.switchSubject('zhuanye')")
        await page.wait_for_timeout(300)
        assert await page.evaluate("() => window.getCurrentSubjectId()") == "zhuanye"

        # 专业课第 0 题打标 wrong
        await page.evaluate("() => window.switchTo(0)")
        await page.click("#btnWrong")
        await page.wait_for_timeout(200)

        # 读取专业课 SM-2 存储快照
        zy_chapter_id = await page.evaluate("() => window.getCurrentPracticeState().currentChapterId")
        zy_storage_key = f"user_guest_sm2_zhuanye_{zy_chapter_id}"
        zy_sm2_before = await page.evaluate(f"() => localStorage.getItem('{zy_storage_key}')")
        assert zy_sm2_before and '"0"' in zy_sm2_before, f"Zhuanye SM-2 ({zy_storage_key}) must have record for question 0, got: {zy_sm2_before}"

        # 切换到数学，打标数学第 1 题
        await page.evaluate("() => window.switchSubject('shu1')")
        await page.wait_for_timeout(300)
        assert await page.evaluate("() => window.getCurrentSubjectId()") == "shu1"
        await page.evaluate("() => window.switchTo(1)")
        await page.click("#btnProficient")
        await page.wait_for_timeout(200)

        # 再次检查专业课 SM-2 存储未受任何改变
        zy_sm2_after = await page.evaluate(f"() => localStorage.getItem('{zy_storage_key}')")
        assert zy_sm2_before == zy_sm2_after, "Zhuanye SM-2 storage must remain completely untouched by shu1 marking"
        print("  - Path C PASS: SM-2 state perfectly isolated across subjects")

        # ----------------------------------------------------
        # Path D: “不会”筛选中把当前题改为熟练，应自动进入下一道不会题
        # ----------------------------------------------------
        print("\n--- Testing Path D: Filter mutation relocation (wrong -> proficient) ---")
        # 在数学中给 0, 3 打标 wrong
        await page.evaluate('''() => {
            window.switchSubject('shu1');
            window.applyFilter('all');
            window.switchTo(0);
            window.setStatus('wrong');
            window.switchTo(3);
            window.setStatus('wrong');
        }''')
        await page.wait_for_timeout(200)

        # 应用 'wrong' 筛选
        await page.evaluate("() => window.applyFilter('wrong')")
        await page.wait_for_timeout(200)
        curr = await page.evaluate("() => window.getCurrentPracticeState().current")
        assert curr == 0, f"Expected wrong filter to start at 0, got {curr}"

        # 把当前题 (0) 改为熟练
        await page.click("#btnProficient")
        await page.wait_for_timeout(200)
        # 应自动重定位到下一道不会题 (3)
        curr_after_d = await page.evaluate("() => window.getCurrentPracticeState().current")
        assert curr_after_d == 3, f"Expected relocation to next wrong item (3), got {curr_after_d}"

        # 把题目 3 也改为熟练（集合变为空）
        await page.click("#btnProficient")
        await page.wait_for_timeout(200)
        # 应自动切回全部并停在 3
        is_all = await page.evaluate("() => window.isAllFilterActive()")
        assert is_all, "Filter should automatically reset to 'all' when empty"
        curr_empty = await page.evaluate("() => window.getCurrentPracticeState().current")
        assert curr_empty == 3, f"Expected to remain on 3, got {curr_empty}"
        print("  - Path D PASS: Relocation to next visible question & fallback to 'all' verified")

        # ----------------------------------------------------
        # Path E: 未标记题首次打标，应自动进入下一题
        # ----------------------------------------------------
        print("\n--- Testing Path E: Unmarked question first-time mark auto-advance ---")
        await page.evaluate('''() => {
            window.applyFilter('all');
            // 找一个未标记的题目，例如第 15 题
            const state = window.getCurrentPracticeState();
            delete state.statuses[15];
            window.switchTo(15);
        }''')
        await page.wait_for_timeout(200)
        init_q = await page.evaluate("() => window.getCurrentPracticeState().current")
        assert init_q == 15, f"Expected current=15, got {init_q}"

        # 首次给第 15 题打标 vague，应自动前进到第 16 题 (navNext)
        await page.click("#btnVague")
        await page.wait_for_timeout(200)
        after_q = await page.evaluate("() => window.getCurrentPracticeState().current")
        assert after_q == 16, f"Expected auto-advance to 16 after first mark on 15, got {after_q}"
        print(f"  - Path E PASS: Automatically advanced from 15 to {after_q} upon first mark")

        # ----------------------------------------------------
        # Path F: 数学打标 → 切专业课 → Ctrl/Cmd+Z，应回数学原题并恢复状态与 SM-2
        # ----------------------------------------------------
        print("\n--- Testing Path F: Cross-subject Undo Transaction ---")
        await page.evaluate('''() => {
            window.switchSubject('shu1');
            window.applyFilter('all');
            window.switchTo(5);
        }''')
        await page.wait_for_timeout(200)

        # 记录题 5 初始状态与打标前 SM-2
        sm2_5_before = await page.evaluate('''() => {
            const st = window.getCurrentPracticeState();
            return st.sm2[5] ? JSON.stringify(st.sm2[5]) : null;
        }''')
        # 打标 wrong
        await page.click("#btnWrong")
        await page.wait_for_timeout(200)
        st_5 = await page.evaluate("() => window.getCurrentPracticeState().statuses[5]")
        assert st_5 == "wrong", f"Expected status 5 to be wrong, got {st_5}"

        # 切到专业课
        await page.evaluate("() => window.switchSubject('zhuanye')")
        await page.wait_for_timeout(300)
        assert await page.evaluate("() => window.getCurrentSubjectId()") == "zhuanye"

        # 在专业课下按 Ctrl+Z 触发撤销
        await page.keyboard.press("Control+KeyZ")
        await page.wait_for_timeout(400)

        # 验证已跨科目自动回退到数学，且恢复题 5 的旧状态与旧 SM-2
        subj_f = await page.evaluate("() => window.getCurrentSubjectId()")
        assert subj_f == "shu1", f"Expected to return to shu1 on undo, got {subj_f}"
        curr_f = await page.evaluate("() => window.getCurrentPracticeState().current")
        assert curr_f == 5, f"Expected current=5 on undo, got {curr_f}"
        status_5_after = await page.evaluate("() => window.getCurrentPracticeState().statuses[5] || ''")
        sm2_5_after = await page.evaluate('''() => {
            const st = window.getCurrentPracticeState();
            return st.sm2[5] ? JSON.stringify(st.sm2[5]) : null;
        }''')
        assert status_5_after != "wrong", f"Expected status to revert from wrong, got '{status_5_after}'"
        assert sm2_5_before == sm2_5_after, f"Expected SM-2 to revert to {sm2_5_before}, got {sm2_5_after}"
        print("  - Path F PASS: Cross-subject undo restored subject, chapter, question, status, and SM-2")

        # ----------------------------------------------------
        # Path G: 同一状态再次点击取消，确认该题从 SM-2 队列移除
        # ----------------------------------------------------
        print("\n--- Testing Path G: Toggle off status removes SM-2 record ---")
        await page.evaluate("() => window.switchTo(7)")
        await page.wait_for_timeout(100)
        # 点击 proficient 打标
        await page.click("#btnProficient")
        await page.wait_for_timeout(200)
        has_sm2 = await page.evaluate("() => Boolean(window.getCurrentPracticeState().sm2[7])")
        assert has_sm2, "SM-2 record must exist after marking proficient"

        # 再次切回 7 并点击 proficient 取消标记 (toggle off)
        await page.evaluate("() => window.switchTo(7)")
        await page.click("#btnProficient")
        await page.wait_for_timeout(200)
        status_7 = await page.evaluate("() => window.getCurrentPracticeState().statuses[7]")
        assert status_7 is None, f"Expected status 7 to be deleted, got {status_7}"
        has_sm2_after = await page.evaluate("() => Boolean(window.getCurrentPracticeState().sm2[7])")
        assert not has_sm2_after, "SM-2 record must be deleted upon unmarking"
        print("  - Path G PASS: Toggle-off removes SM-2 record cleanly")

        # ----------------------------------------------------
        # Path H: 刷新仍进入全局进度，但题号、科目与学习数据保留
        # ----------------------------------------------------
        print("\n--- Testing Path H: Reload opens Dashboard & preserves progress ---")
        # 在数学中给第 8 题打标 vague
        await page.evaluate("() => window.switchTo(8)")
        await page.click("#btnVague")
        await page.wait_for_timeout(200)

        # 刷新页面
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(500)

        # 验证首屏直达全局进度
        dash_visible = await page.locator("#dashboardPanel").is_visible()
        assert dash_visible, "Reload must show global progress dashboard"

        # 按 V 返回刷题
        await page.keyboard.press("KeyV")
        await page.wait_for_timeout(400)
        view_h = await page.evaluate("() => window.getWorkbenchView()")
        assert view_h == "practice", f"Expected practice view after pressing V, got {view_h}"
        subj_h = await page.evaluate("() => window.getCurrentSubjectId()")
        assert subj_h == "shu1", f"Expected shu1, got {subj_h}"
        st_h = await page.evaluate("() => window.getCurrentPracticeState().statuses[8]")
        assert st_h == "vague", f"Expected status for 8 to be vague, got {st_h}"
        print("  - Path H PASS: Reload opened dashboard; pressing V returned to math with status preserved")

        print("\n--- Console Errors Check ---")
        if console_errors:
            print(f"Warnings/Errors collected ({len(console_errors)}):")
            for e in console_errors:
                print("  ", e)
        else:
            print("  0 console errors detected throughout all runs!")

        assert len([e for e in console_errors if "pageerror" in e]) == 0, "No pageerror allowed"

        print("\n============================================================")
        print("ALL BROWSER REGRESSION PATHS (A ~ H) PASSED 100%!")
        print("============================================================")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(main())
