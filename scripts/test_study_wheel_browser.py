import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright

async def run_browser_tests():
    print("============================================================")
    print("Running scripts/test_study_wheel_browser.py (Header Color Parity)")
    print("============================================================")

    url = "file:///" + os.path.abspath("index.html").replace("\\", "/")

    async with async_playwright() as p:
        browser = await p.chromium.launch()
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        page = await context.new_page()

        # 处理确认弹窗
        page.on("dialog", lambda d: asyncio.create_task(d.accept()))

        # 辅助函数：重置转盘状态
        async def reset_storage():
            await page.evaluate("""() => {
                const prefix = 'user_guest_';
                localStorage.removeItem(prefix + 'daily_study_wheel_rounds_v2');
                localStorage.removeItem(prefix + 'daily_study_wheel_daily_v1');
                localStorage.removeItem(prefix + 'daily_study_wheel_history_v1');
                localStorage.removeItem(prefix + 'daily_study_wheel_undo_v1');
                if (window.DailyStudyWheel && typeof window.DailyStudyWheel.render === 'function') {
                    window.DailyStudyWheel.render();
                }
            }""")
            await page.wait_for_timeout(100)

        # 辅助函数：读取 Header 状态
        async def get_chip_info(chip_id):
            return await page.evaluate("""(id) => {
                const el = document.getElementById(id);
                if (!el) return null;
                const cs = window.getComputedStyle(el);
                return {
                    className: el.className,
                    hasProgressed: el.classList.contains('is-progressed'),
                    hasActive: el.classList.contains('is-active'),
                    hasIdle: el.classList.contains('is-idle'),
                    bg: cs.backgroundColor,
                    border: cs.borderColor,
                    color: cs.color
                };
            }""", chip_id)

        await page.goto(url, wait_until="networkidle")
        await page.wait_for_function("() => window.DailyStudyWheel && typeof window.DailyStudyWheel.openModal === 'function'")

        # -------------------------------------------------------------------------
        # Case 0: 初始状态 (两科均未完成)
        # -------------------------------------------------------------------------
        print("\n--- Case 0: 初始空状态 (0 完成) ---")
        await reset_storage()
        c0_math = await get_chip_info("dailyMathWheelButton")
        c0_major = await get_chip_info("dailyMajorWheelButton")

        assert not c0_math["hasProgressed"], "初始数学不应具备 is-progressed"
        assert not c0_major["hasProgressed"], "初始专业课不应具备 is-progressed"
        assert c0_math["bg"] == c0_major["bg"], f"初始两科背景色必须完全一致: math={c0_math['bg']}, major={c0_major['bg']}"
        assert c0_math["border"] == c0_major["border"], f"初始两科边框色必须完全一致: math={c0_math['border']}, major={c0_major['border']}"
        print("   - 初始底色对齐: math=" + str(c0_math['bg']) + ", major=" + str(c0_major['bg']) + " PASS")

        # -------------------------------------------------------------------------
        # Case A: 数学完成第一轮 -> math is-progressed (绿色完成态), major 保持默认
        # -------------------------------------------------------------------------
        print("\n--- Case A: 数学完成第一轮 ---")
        await reset_storage()
        await page.evaluate("() => window.DailyStudyWheel.openModal('shu1')")
        await page.wait_for_timeout(200)

        # 抽取第 1 轮
        await page.click("#btnDailyMathWheelSpin")
        await page.wait_for_function("() => !window.DailyStudyWheel.isSpinning()")

        # 完成第 1 轮
        await page.click("#btnStudyWheelComplete")
        await page.wait_for_timeout(300)

        # 关闭弹窗
        await page.evaluate("() => window.DailyStudyWheel.closeModal()")
        await page.wait_for_timeout(100)

        cA_math = await get_chip_info("dailyMathWheelButton")
        cA_major = await get_chip_info("dailyMajorWheelButton")
        math_rounds = await page.evaluate("() => window.DailyStudyWheel.getWheelCompletedRoundsToday('math').length")

        print("   - 数学完成一轮后: className='" + str(cA_math['className']) + "', completedRounds=" + str(math_rounds))
        print("     backgroundColor=" + str(cA_math['bg']) + ", borderColor=" + str(cA_math['border']))
        print("   - 专业课状态: className='" + str(cA_major['className']) + "', hasProgressed=" + str(cA_major['hasProgressed']))

        assert cA_math["hasProgressed"], "数学完成一轮后必须具备 is-progressed"
        assert not cA_major["hasProgressed"], "专业课未推进不应具备 is-progressed"
        assert cA_math["bg"] != c0_math["bg"], "数学背景色必须已变为推进态颜色"
        print("[PASS] Case A PASS: 数学完成第一轮触发绿色完成态，专业课未受影响")

        # -------------------------------------------------------------------------
        # Case B: 专业课完成第一轮 -> major is-progressed, math 保持默认
        # -------------------------------------------------------------------------
        print("\n--- Case B: 专业课完成第一轮 (镜像验证) ---")
        await reset_storage()
        await page.evaluate("() => window.DailyStudyWheel.openModal('zhuanye')")
        await page.wait_for_timeout(200)

        # 抽取第 1 轮
        await page.click("#btnDailyMathWheelSpin")
        await page.wait_for_function("() => !window.DailyStudyWheel.isSpinning()")

        # 完成第 1 轮
        await page.click("#btnStudyWheelComplete")
        await page.wait_for_timeout(300)

        await page.evaluate("() => window.DailyStudyWheel.closeModal()")
        await page.wait_for_timeout(100)

        cB_math = await get_chip_info("dailyMathWheelButton")
        cB_major = await get_chip_info("dailyMajorWheelButton")
        major_rounds = await page.evaluate("() => window.DailyStudyWheel.getWheelCompletedRoundsToday('major').length")

        print("   - 专业课完成一轮后: className='" + str(cB_major['className']) + "', completedRounds=" + str(major_rounds))
        print("     backgroundColor=" + str(cB_major['bg']) + ", borderColor=" + str(cB_major['border']))

        assert not cB_math["hasProgressed"], "数学未推进不应具备 is-progressed"
        assert cB_major["hasProgressed"], "专业课完成一轮后必须具备 is-progressed"
        assert cB_major["bg"] == cA_math["bg"], "专业课完成色与数学完成色必须完全一致!"
        assert cB_major["border"] == cA_math["border"], "专业课完成边框与数学必须完全一致!"
        print("[PASS] Case B PASS: 专业课完成态与数学完成态颜色严格 100% 对齐")

        # -------------------------------------------------------------------------
        # Case C: 两科都完成过一轮 -> 均有 is-progressed，且样式完全无差
        # -------------------------------------------------------------------------
        print("\n--- Case C: 双科均完成一轮推进 ---")
        await page.evaluate("() => window.DailyStudyWheel.openModal('shu1')")
        await page.wait_for_timeout(200)
        await page.click("#btnDailyMathWheelSpin")
        await page.wait_for_function("() => !window.DailyStudyWheel.isSpinning()")
        await page.click("#btnStudyWheelComplete")
        await page.wait_for_timeout(300)
        await page.evaluate("() => window.DailyStudyWheel.closeModal()")
        await page.wait_for_timeout(100)

        cC_math = await get_chip_info("dailyMathWheelButton")
        cC_major = await get_chip_info("dailyMajorWheelButton")

        assert cC_math["hasProgressed"], "双科完成时数学必须有 is-progressed"
        assert cC_major["hasProgressed"], "双科完成时专业课必须有 is-progressed"
        assert cC_math["bg"] == cC_major["bg"], "双科完成态背景色必须相同"
        assert cC_math["border"] == cC_major["border"], "双科完成态边框色必须相同"
        print("[PASS] Case C PASS: 双科均呈现相同推进态完成色")

        # -------------------------------------------------------------------------
        # Case D: 数学 Undo 掉当天唯一完成轮次 -> 绿色褪去，专业课保持绿色
        # -------------------------------------------------------------------------
        print("\n--- Case D: 数学 Undo 掉当天唯一完成轮次 ---")
        await page.evaluate("() => window.DailyStudyWheel.openModal('shu1')")
        await page.wait_for_timeout(200)

        # 撤销数学第 1 轮
        await page.click("#btnStudyWheelUndoRound")
        await page.wait_for_timeout(300)

        await page.evaluate("() => window.DailyStudyWheel.closeModal()")
        await page.wait_for_timeout(100)

        cD_math = await get_chip_info("dailyMathWheelButton")
        cD_major = await get_chip_info("dailyMajorWheelButton")
        math_rounds_d = await page.evaluate("() => window.DailyStudyWheel.getWheelCompletedRoundsToday('math').length")

        print("   - 数学撤销后: completedRounds=" + str(math_rounds_d) + ", className='" + str(cD_math['className']) + "', bg=" + str(cD_math['bg']))
        print("   - 专业课仍保留: hasProgressed=" + str(cD_major['hasProgressed']))

        assert not cD_math["hasProgressed"], "撤销唯一完成轮次后数学不可具备 is-progressed"
        assert cD_major["hasProgressed"], "数学撤销不得影响专业课的完成态"
        assert cD_math["bg"] == c0_math["bg"], "数学背景色必须精确恢复到初始底色"
        print("[PASS] Case D PASS: 撤销当天唯一完成轮次后绿色消失，跨科隔离完备")

        # -------------------------------------------------------------------------
        # Case E: 数学完成 3 轮，只 Undo 最后一轮 -> 剩余 2 轮完成，保持绿色
        # -------------------------------------------------------------------------
        print("\n--- Case E: 完成 3 轮只撤销第 3 轮，仍保持绿色 ---")
        await reset_storage()
        await page.evaluate("() => window.DailyStudyWheel.openModal('shu1')")
        await page.wait_for_timeout(200)

        # 完成第 1 轮
        await page.click("#btnDailyMathWheelSpin")
        await page.wait_for_function("() => !window.DailyStudyWheel.isSpinning()")
        await page.click("#btnStudyWheelComplete")
        await page.wait_for_timeout(200)

        # 完成第 2 轮 (加量)
        await page.click("#btnStudyWheelAddRound")
        await page.wait_for_function("() => !window.DailyStudyWheel.isSpinning()")
        await page.click("#btnStudyWheelComplete")
        await page.wait_for_timeout(200)

        # 开启第 3 轮 (加量)
        await page.click("#btnStudyWheelAddRound")
        await page.wait_for_function("() => !window.DailyStudyWheel.isSpinning()")

        # 此时只撤销第 3 轮（回到第 2 轮完成态）
        await page.click("#btnStudyWheelUndoRound")
        await page.wait_for_timeout(300)

        await page.evaluate("() => window.DailyStudyWheel.closeModal()")
        await page.wait_for_timeout(100)

        cE_math = await get_chip_info("dailyMathWheelButton")
        math_rounds_e = await page.evaluate("() => window.DailyStudyWheel.getWheelCompletedRoundsToday('math').length")
        print("   - 连续多轮撤销后剩余完成数: " + str(math_rounds_e) + ", hasProgressed=" + str(cE_math['hasProgressed']))

        assert math_rounds_e >= 1, "应至少剩余已完成轮次"
        assert cE_math["hasProgressed"], "有多轮完成残留时必须继续保持 is-progressed 绿色"
        print("[PASS] Case E PASS: 连续多轮只撤销末轮，绿色推进态正确保持")

        # -------------------------------------------------------------------------
        # Case F: 刷新页面持久性测试
        # -------------------------------------------------------------------------
        print("\n--- Case F: 页面刷新持久性验证 ---")
        await page.reload(wait_until="networkidle")
        cF_math = await get_chip_info("dailyMathWheelButton")

        print("   - 页面刷新后数学: hasProgressed=" + str(cF_math['hasProgressed']) + ", bg=" + str(cF_math['bg']))
        assert cF_math["hasProgressed"], "刷新后数学必须继续保持 is-progressed"
        assert cF_math["bg"] == cE_math["bg"], "刷新后背景色必须保持一致"
        print("[PASS] Case F PASS: 刷新页面状态色持久保持")

        await context.close()
        await browser.close()

    print("\n" + "=" * 60)
    print("ALL BROWSER HEADER COLOR PARITY TESTS PASSED!")
    print("=" * 60)

if __name__ == "__main__":
    asyncio.run(run_browser_tests())
