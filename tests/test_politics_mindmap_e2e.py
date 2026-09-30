"""Run with: python3 tests/test_politics_mindmap_e2e.py (requires Playwright Chromium)."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from threading import Thread

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]


def main():
    handler = partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    Thread(target=server.serve_forever, daemon=True).start()
    errors = []
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            context = browser.new_context(viewport={"width": 1600, "height": 900})
            page = context.new_page()
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.goto(f"http://127.0.0.1:{server.server_port}/politics.html")
            page.wait_for_function("() => !!window.PoliticsMindMapController?.getInstance()")
            page.wait_for_function("() => document.querySelectorAll('#mindMapContainer .mm-node-card').length > 5")

            before = page.evaluate("() => window.PoliticsMindMapController.isAssociativeLineVisible()")
            page.keyboard.press("l")
            assert page.evaluate("() => window.PoliticsMindMapController.isAssociativeLineVisible()") != before

            page.evaluate("""() => {
              const c = window.PoliticsMindMapController;
              const root = c.getInstance().renderer.renderTree;
              const visit = n => {
                if (n.data?.uid === 'pol.my.c03.s01.p017') { n.data.text = '自动化测试修改'; return true; }
                return (n.children || []).some(visit);
              };
              if (!visit(root)) throw Error('shared point missing');
              c.persistCurrentMindMapState(true);
            }""")
            page.locator('[data-scope="pol_my"]').click()
            value = page.evaluate("""() => {
              const visit = n => n.data?.uid === 'pol.my.c03.s01.p017'
                ? n.data.text : (n.children || []).map(visit).find(Boolean);
              return visit(window.PoliticsMindMapController.getInstance().renderer.renderTree);
            }""")
            assert value == "自动化测试修改", value

            page.reload()
            page.wait_for_function("() => !!window.PoliticsMindMapController?.getInstance()")
            page.locator('[data-scope="pol_my"]').click()
            assert page.evaluate("""() => {
              const visit = n => n.data?.uid === 'pol.my.c03.s01.p017'
                ? n.data.text : (n.children || []).map(visit).find(Boolean);
              return visit(window.PoliticsMindMapController.getInstance().renderer.renderTree);
            }""") == "自动化测试修改"
            assert not errors, errors
            context.close()
            browser.close()
    finally:
        server.shutdown()


if __name__ == "__main__":
    main()
