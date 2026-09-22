import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright

async def verify():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page()
        url = "file:///" + os.path.abspath("index.html").replace("\\", "/")
        await page.goto(url, wait_until="networkidle")

        # Set realistic mock text to major wheel summary
        await page.evaluate("""() => {
            const mathSum = document.getElementById('dailyMathWheelSummary');
            const majorSum = document.getElementById('dailyMajorWheelSummary');
            if (mathSum) mathSum.textContent = '第1轮 · 第14讲 二重积分';
            if (majorSum) majorSum.textContent = '第1轮 · 第1章 信号与系统绪论';
        }""")

        viewports = [1440, 1200, 1024, 768, 620, 390, 320]
        print("=" * 60)
        print("Header Wheel Widgets Size & Consistency Across Viewports")
        print("=" * 60)

        for w in viewports:
            await page.set_viewport_size({"width": w, "height": 900})
            await page.wait_for_timeout(100)

            res = await page.evaluate("""() => {
                const bMath = document.getElementById('dailyMathWheelButton').getBoundingClientRect();
                const bMajor = document.getElementById('dailyMajorWheelButton').getBoundingClientRect();
                return {
                    math: { w: bMath.width, h: bMath.height },
                    major: { w: bMajor.width, h: bMajor.height }
                };
            }""")

            dw = abs(res["math"]["w"] - res["major"]["w"])
            dh = abs(res["math"]["h"] - res["major"]["h"])

            print(f"[{w}px] Math: {res['math']['w']:.1f}x{res['math']['h']:.1f} | Major: {res['major']['w']:.1f}x{res['major']['h']:.1f} | diff: ({dw:.2f}px, {dh:.2f}px)")
            assert dw <= 1.0, f"Width difference > 1px at {w}px!"
            assert dh <= 1.0, f"Height difference > 1px at {w}px!"

        # Take screenshot of header widgets at 1440px
        await page.set_viewport_size({"width": 1440, "height": 900})
        await page.locator(".account-bar").screenshot(path="screenshots/header_widgets_equal.png")
        print("\n✅ All viewports header widget buttons are strictly equal!")
        await browser.close()

if __name__ == "__main__":
    asyncio.run(verify())
