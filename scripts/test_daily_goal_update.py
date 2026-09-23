import asyncio
import http.server
import json
import threading
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), lambda *args: QuietHandler(*args, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
port = server.server_port

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1440, "height": 900})
        await context.add_init_script("""(() => {
            localStorage.setItem('user_guest_kaoyan_subject', 'shu1');
        })();""")
        page = await context.new_page()
        page.on('console', lambda msg: print('BROWSER CONSOLE:', msg.type, msg.text))
        page.on('pageerror', lambda err: print('BROWSER ERROR:', err))
        await page.goto(f'http://127.0.0.1:{port}/index.html')
        await page.wait_for_timeout(600)

        # 检查初始今日目标
        math_text = await page.locator('#dailyGoalMathText').inner_text()
        print('Initial dailyGoalMathText:', math_text)
        assert math_text == '0/20'

        # 点击熟练按钮 (btnProficient)
        btn_prof = page.locator('#btnProficient')
        print('Clicking btnProficient...')
        await btn_prof.click()
        await page.wait_for_timeout(300)

        math_text_after1 = await page.locator('#dailyGoalMathText').inner_text()
        print('After 1st mark dailyGoalMathText:', math_text_after1)
        assert math_text_after1 == '1/20', f'打标第 1 题后应为 1/20，实际: {math_text_after1}'

        # 再打标第二题 (键盘按 C -> 不会)
        print('Pressing C on next question...')
        await page.keyboard.press('c')
        await page.wait_for_timeout(300)

        math_text_after2 = await page.locator('#dailyGoalMathText').inner_text()
        print('After 2nd mark dailyGoalMathText:', math_text_after2)
        assert math_text_after2 == '2/20', f'打标第 2 题后应为 2/20，实际: {math_text_after2}'

        # 再打标第三题 (键盘按 X -> 模糊)
        print('Pressing X on 3rd question...')
        await page.keyboard.press('x')
        await page.wait_for_timeout(300)

        math_text_after3 = await page.locator('#dailyGoalMathText').inner_text()
        print('After 3rd mark dailyGoalMathText:', math_text_after3)
        assert math_text_after3 == '3/20', f'打标第 3 题后应为 3/20，实际: {math_text_after3}'

        # 切换到专业课并打标测试
        print('Switching to Major (专业课)...')
        await page.evaluate("() => window.DailyStudyWheelBridge.openChapter('zhuanye', 'bg_jy_01')")
        await page.wait_for_timeout(500)

        major_initial = await page.locator('#dailyGoalMajorText').inner_text()
        print('Initial dailyGoalMajorText:', major_initial)
        assert major_initial == '0/20'

        print('Marking major question with Z (proficient)...')
        await page.keyboard.press('z')
        await page.wait_for_timeout(300)

        major_after1 = await page.locator('#dailyGoalMajorText').inner_text()
        print('After 1st major mark dailyGoalMajorText:', major_after1)
        assert major_after1 == '1/20', f'专业课打标第 1 题后应为 1/20，实际: {major_after1}'

        print('Marking 2nd major question with C (wrong)...')
        await page.keyboard.press('c')
        await page.wait_for_timeout(300)

        major_after2 = await page.locator('#dailyGoalMajorText').inner_text()
        print('After 2nd major mark dailyGoalMajorText:', major_after2)
        assert major_after2 == '2/20', f'专业课打标第 2 题后应为 2/20，实际: {major_after2}'
        eval_res = await page.evaluate("""() => {
            const evKey = 'user_guest_study_events_v1';
            const raw = localStorage.getItem(evKey);
            return {
                eventsKeyVal: raw ? JSON.parse(raw) : null,
                localStorageKeys: Object.keys(localStorage)
            };
        }""")
        print('localStorage eval:', json.dumps(eval_res, ensure_ascii=False, indent=2))

        await browser.close()

asyncio.run(run())
server.shutdown()
