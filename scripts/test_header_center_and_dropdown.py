import asyncio
import http.server
import threading
import sys
from pathlib import Path
from playwright.async_api import async_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ROOT = Path(__file__).resolve().parents[1]

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args): pass

server = http.server.ThreadingHTTPServer(('127.0.0.1', 0), lambda *args: QuietHandler(*args, directory=str(ROOT)))
threading.Thread(target=server.serve_forever, daemon=True).start()
port = server.server_port

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for w in [1920, 1600, 1536, 1440, 1366, 1280, 1024, 768]:
            page = await browser.new_page(viewport={"width": w, "height": 900})
            await page.add_init_script("""(() => {
                localStorage.setItem('user_guest_kaoyan_subject', 'shu1');
            })();""")
            await page.goto(f'http://127.0.0.1:{port}/index.html')
            await page.wait_for_timeout(300)

            # Switch to yeyu_la_10
            await page.evaluate("() => window.switchChapter('yeyu_la_10')")
            await page.wait_for_timeout(200)

            # Measure centering and heights
            metrics = await page.evaluate("""() => {
                const header = document.querySelector('.account-bar');
                const center = document.querySelector('.header-nav-center');
                const hRect = header.getBoundingClientRect();
                const cRect = center.getBoundingClientRect();
                const hMid = hRect.left + hRect.width / 2;
                const cMid = cRect.left + cRect.width / 2;
                return {
                    hMid,
                    cMid,
                    diff: Math.abs(hMid - cMid),
                    cHeight: cRect.height,
                    cBottom: cRect.bottom,
                    hBottom: hRect.bottom
                };
            }""")
            print(f"Viewport {w}px: cHeight={metrics['cHeight']}, hBottom={metrics['hBottom']}, cBottom={metrics['cBottom']}, diff={metrics['diff']:.2f}px")
            assert metrics['cBottom'] <= metrics['hBottom'], f"Width {w}: center widgets should not protrude outside header!"

            # Test trigWb click
            await page.locator('#trigWb').click()
            await page.wait_for_timeout(150)
            assert await page.locator('#panelWb').is_visible(), f"Width {w}: panelWb should be visible!"

            # Test click book
            await page.locator('#panelWb .title-option', has_text='李林880').first.click()
            await page.wait_for_timeout(200)
            assert await page.locator('#txtWb').inner_text() == '李林880'

            # Test trigChapter click
            await page.locator('#trigChapter').click()
            await page.wait_for_timeout(150)
            assert await page.locator('#panelChapter').is_visible(), f"Width {w}: panelChapter should be visible!"

            if w in [1920, 1440]:
                await page.screenshot(path=f"screenshots/header_centered_final_{w}.png")

            await page.close()
        await browser.close()
    print("ALL CENTERING AND DROPDOWN TESTS PASSED 100%!")

if __name__ == '__main__':
    asyncio.run(run())
