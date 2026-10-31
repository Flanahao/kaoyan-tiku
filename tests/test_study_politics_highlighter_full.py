import asyncio
import os
import shutil
import subprocess
import time
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path("D:/考研题库网站")
ARTIFACTS_DIR = Path(r"C:\Users\Flanagan\.gemini\antigravity\brain\64b48c83-2e69-4c1b-bcfa-7ca7005dd2ea")
PORT = 8097

async def run():
    print(f"Starting http.server on port {PORT}...")
    server = subprocess.Popen(
        ["python", "-m", "http.server", str(PORT)],
        cwd=str(ROOT),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    time.sleep(1.2)

    try:
        async with async_playwright() as pw:
            win_chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
            chrome_path = (win_chrome if os.path.exists(win_chrome) else None)
            launch_args = dict(headless=True, args=[
                "--no-sandbox", "--disable-gpu", "--no-zygote",
                "--disable-dev-shm-usage", "--disable-breakpad"
            ])
            if chrome_path:
                launch_args["executable_path"] = chrome_path
            browser = await pw.chromium.launch(**launch_args)
            context = await browser.new_context(viewport={"width": 1200, "height": 950})
            page = await context.new_page()

            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))

            url = f"http://127.0.0.1:{PORT}/study.html?subject=politics"
            print(f"Opening {url} ...")
            await page.goto(url, wait_until="networkidle")

            # 等待题卡渲染
            await page.wait_for_selector("#questionTextCard .q-stem", timeout=8000)
            print("Question text card loaded!")

            # 点击显示解析按钮（避免 spacebar 滚动）
            toggle_btn = page.locator("#btnToggle")
            if await toggle_btn.is_visible():
                await toggle_btn.click()
            await page.wait_for_selector("#solutionTextCard .sol-analysis-content", timeout=5000)
            print("Solution text card loaded!")

            # 辅助函数：选取元素内的首个文本节点并选中
            await page.evaluate("""() => {
              window.__selectText = function(containerSelector, start, end) {
                const el = document.querySelector(containerSelector);
                if (!el) return false;
                el.scrollIntoView({ block: 'center', inline: 'nearest' });
                const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
                const textNode = walker.nextNode();
                if (!textNode) return false;
                const r = document.createRange();
                r.setStart(textNode, Math.min(start, textNode.nodeValue.length - 1));
                r.setEnd(textNode, Math.min(end, textNode.nodeValue.length));
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(r);
                el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                return true;
              };
            }""")

            # 1. 在题干上划选文字并标注洋红 (Magenta)
            await page.evaluate("__selectText('.q-stem', 0, 8)")
            await page.wait_for_selector(".politics-hl-popup:not([hidden])", timeout=3000)
            await page.locator(".politics-hl-popup .is-magenta").click()
            print("Stem highlighted with Magenta!")

            # 2. 在选项A上划选文字并标注青色 (Cyan)
            await page.evaluate("__selectText('.q-choice-item[data-choice=\"A\"] .choice-text', 0, 8)")
            await page.wait_for_selector(".politics-hl-popup:not([hidden])", timeout=3000)
            await page.locator(".politics-hl-popup .is-cyan").click()
            print("Option A highlighted with Cyan!")

            # 3. 在选项B上划选文字并标注酸橙色 (Lime)
            await page.evaluate("__selectText('.q-choice-item[data-choice=\"B\"] .choice-text', 0, 8)")
            await page.wait_for_selector(".politics-hl-popup:not([hidden])", timeout=3000)
            await page.locator(".politics-hl-popup .is-lime").click()
            print("Option B highlighted with Lime!")

            # 4. 在选项C上划选文字并标注深橙色 (DarkOrange)
            await page.evaluate("__selectText('.q-choice-item[data-choice=\"C\"] .choice-text', 0, 8)")
            await page.wait_for_selector(".politics-hl-popup:not([hidden])", timeout=3000)
            await page.locator(".politics-hl-popup .is-darkorange").click()
            print("Option C highlighted with DarkOrange!")

            # 5. 在解析精讲上标注黄色
            await page.evaluate("__selectText('.sol-analysis-content', 0, 10)")
            await page.wait_for_selector(".politics-hl-popup:not([hidden])", timeout=3000)
            await page.locator(".politics-hl-popup .is-yellow").click()
            print("Analysis highlighted with Yellow!")

            # 重新划选题干文字展开浮动条并截图展示所有7色
            await page.evaluate("__selectText('.q-stem', 0, 6)")
            await page.wait_for_timeout(400)

            shot1 = ARTIFACTS_DIR / "politics_highlighter_full_light.png"
            await page.screenshot(path=str(shot1))
            print(f"Light mode screenshot saved: {shot1}")

            # 切换暗色模式并截图
            await page.evaluate("document.body.classList.add('dark-mode')")
            await page.wait_for_timeout(300)
            shot2 = ARTIFACTS_DIR / "politics_highlighter_full_dark.png"
            await page.screenshot(path=str(shot2))
            print(f"Dark mode screenshot saved: {shot2}")

            # 验证控制台无报错
            print(f"Errors count: {len(errors)}")
            assert len(errors) == 0, f"Errors encountered: {errors}"

            await browser.close()
            print("Live E2E full test PASSED!")
    finally:
        server.terminate()
        server.wait()

if __name__ == "__main__":
    asyncio.run(run())
