"""
Comprehensive End-to-End Automated Verification Test for Politics Mind Map
Testing all 9 MindMap toolkit components, cross-subject resonance lines,
detail inspector, outliner toggle, and keyboard navigation.
"""
import os
import sys
import time
import threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

PORT = 8099
ROOT_DIR = r"d:\考研题库网站"

class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT_DIR, **kwargs)
    def log_message(self, format, *args):
        pass # suppress server logs

def start_server():
    server = ThreadingHTTPServer(('127.0.0.1', PORT), QuietHandler)
    server.serve_forever()

def run_tests():
    from playwright.sync_api import sync_playwright

    # Start HTTP server in daemon thread
    t = threading.Thread(target=start_server, daemon=True)
    t.start()
    time.sleep(0.5)

    console_errors = []
    
    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            executable_path=r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        )
        context = browser.new_context(viewport={'width': 1600, 'height': 900})
        page = context.new_page()

        def on_console(msg):
            if msg.type == 'error':
                console_errors.append(msg.text)
                print(f"[BROWSER ERROR] {msg.text}")
            elif 'Politics' in msg.text or 'MindMap' in msg.text:
                print(f"[BROWSER LOG] {msg.text}")

        page.on('console', on_console)
        page.on('pageerror', lambda err: console_errors.append(str(err)))

        print("--> Navigating to http://127.0.0.1:8099/politics.html")
        page.goto(f"http://127.0.0.1:{PORT}/politics.html", wait_until='networkidle')

        # 1. Check basic loading
        page.wait_for_selector("#mindMapContainer", timeout=8000)
        time.sleep(1.0)

        # 2. Check Controller & DataAdapter
        is_loaded = page.evaluate("() => window.PoliticsDataAdapter && window.PoliticsDataAdapter.isLoaded()")
        print(f"[TEST 1] PoliticsDataAdapter isLoaded: {is_loaded}")
        assert is_loaded, "PoliticsDataAdapter should be loaded"

        has_controller = page.evaluate("() => Boolean(window.PoliticsMindMapController && window.PoliticsMindMapController.getInstance())")
        print(f"[TEST 2] PoliticsMindMapController instance ready: {has_controller}")
        assert has_controller, "PoliticsMindMapController instance should be ready"

        # 3. Check rendered SVG cards on initial macro view
        initial_card_count = page.evaluate("() => document.querySelectorAll('#mindMapContainer .mm-node-card').length")
        print(f"[TEST 3] Rendered mm-node-card count on canvas: {initial_card_count}")
        assert initial_card_count > 5, f"Should render cards on canvas, found {initial_card_count}"

        os.makedirs(os.path.join(ROOT_DIR, "screenshots"), exist_ok=True)
        page.screenshot(path=os.path.join(ROOT_DIR, "screenshots", "politics_macro_view.png"))
        print("[SCREENSHOT] Saved politics_macro_view.png")

        # 4. Check Root Viz Pill click -> opens Detail Inspector
        print("--> Clicking root node '体系概览' viz pill")
        root_btn = page.query_selector('.mm-node-card.level-0 .mm-node-viz-pill')
        assert root_btn is not None, "Root viz pill button should exist"
        root_btn.click()
        time.sleep(0.5)

        inspector_visible = page.evaluate("""() => {
            const el = document.getElementById('politicsInspector');
            return Boolean(el && el.classList.contains('show') && el.style.display !== 'none');
        }""")
        print(f"[TEST 4] Detail Inspector opened via root pill click: {inspector_visible}")
        assert inspector_visible, "Inspector should open after clicking root viz pill"

        root_insp_title = page.evaluate("() => document.getElementById('inspTitle').textContent")
        print(f"[TEST 5] Inspector title: {root_insp_title}")
        assert "全景" in root_insp_title, f"Expected '全景' in title, got {root_insp_title}"

        # Close Inspector with Escape key
        page.keyboard.press("Escape")
        time.sleep(0.3)
        assert page.evaluate("() => document.getElementById('politicsInspector').style.display === 'none'"), "Inspector should close on Esc"

        # 5. Check Scope Switcher - Switch to 'pol_my' (马原)
        print("--> Switching scope to pol_my (马原)")
        page.click("button[data-scope='pol_my']")
        time.sleep(0.8)
        cur_scope = page.evaluate("() => window.PoliticsMindMapController.getCurrentScopeId()")
        print(f"[TEST 6] Current scope after click: {cur_scope}")
        assert cur_scope == 'pol_my', f"Scope should be pol_my, got {cur_scope}"

        my_card_count = page.evaluate("() => document.querySelectorAll('#mindMapContainer .mm-node-card').length")
        print(f"[TEST 7] 马原 cards count: {my_card_count}")
        assert my_card_count > 5, "马原 should render chapters"
        page.screenshot(path=os.path.join(ROOT_DIR, "screenshots", "politics_mayuan_view.png"))
        print("[SCREENSHOT] Saved politics_mayuan_view.png")

        # 6. Test S key layer toggle (pol_my -> pol_macro -> pol_my)
        print("--> Testing S key toggling between macro and last subject")
        page.keyboard.press("s")
        time.sleep(0.6)
        scope_after_s1 = page.evaluate("() => window.PoliticsMindMapController.getCurrentScopeId()")
        print(f"[TEST 8] Scope after 1st S press: {scope_after_s1}")
        assert scope_after_s1 == 'pol_macro', f"Expected pol_macro, got {scope_after_s1}"

        page.keyboard.press("s")
        time.sleep(0.6)
        scope_after_s2 = page.evaluate("() => window.PoliticsMindMapController.getCurrentScopeId()")
        print(f"[TEST 9] Scope after 2nd S press (should return to pol_my): {scope_after_s2}")
        assert scope_after_s2 == 'pol_my', f"Expected pol_my, got {scope_after_s2}"

        # Switch back to pol_macro for cross-subject testing
        page.click("button[data-scope='pol_macro']")
        time.sleep(0.8)

        # 7. Test Cross-Subject Focus Resonance (pol.my.c03.s01.p017 -> pol.sg.c01.s01.p001)
        print("--> Testing Cross-Subject Focus Resonance on pol.my.c03.s01.p017")
        page.evaluate("() => window.PoliticsMindMapController.applyFocusResonanceByUid('pol.my.c03.s01.p017')")
        time.sleep(0.8)

        active_count = page.evaluate("() => document.querySelectorAll('#mindMapContainer .resonance-active').length")
        linked_count = page.evaluate("() => document.querySelectorAll('#mindMapContainer .resonance-linked').length")
        lines_count = page.evaluate("() => document.querySelectorAll('#mindMapContainer path.smm-associative-line-path').length")
        print(f"[TEST 10] Focus Resonance: active={active_count}, linked={linked_count}, lines={lines_count}")
        assert active_count >= 1, "Should have resonance-active card"
        assert linked_count >= 1, "Should have resonance-linked card (pol.sg.c01.s01.p001)"
        assert lines_count >= 1, "Should have rendered associative line connecting cross-subject nodes"

        page.screenshot(path=os.path.join(ROOT_DIR, "screenshots", "politics_resonance_view.png"))
        print("[SCREENSHOT] Saved politics_resonance_view.png")

        # 8. Test Toggle Associative Lines with L key
        is_lines_visible_before = page.evaluate("() => window.PoliticsMindMapController.isAssociativeLineVisible()")
        page.keyboard.press("l")
        time.sleep(0.2)
        is_lines_visible_after = page.evaluate("() => window.PoliticsMindMapController.isAssociativeLineVisible()")
        print(f"[TEST 11] Toggle lines with 'l' key: {is_lines_visible_before} -> {is_lines_visible_after}")
        assert is_lines_visible_before != is_lines_visible_after, "L key should toggle associative lines"
        page.keyboard.press("l") # toggle back on
        time.sleep(0.2)

        # 9. Test Cluster Mode
        print("--> Testing Cluster Mode on pol.my.c03.s01.p017")
        cluster_res = page.evaluate("() => window.PoliticsMindMapController.enterNodeCluster('pol.my.c03.s01.p017')")
        time.sleep(0.6)
        is_cluster_active = page.evaluate("() => window.PoliticsMindMapController.isClusterActive()")
        print(f"[TEST 12] Cluster mode active: {is_cluster_active}")
        assert is_cluster_active, "Cluster mode should be active"
        page.screenshot(path=os.path.join(ROOT_DIR, "screenshots", "politics_cluster_view.png"))
        print("[SCREENSHOT] Saved politics_cluster_view.png")

        # Exit Cluster mode with Esc
        page.keyboard.press("Escape")
        time.sleep(0.5)
        is_cluster_active_after = page.evaluate("() => window.PoliticsMindMapController.isClusterActive()")
        print(f"[TEST 13] Cluster mode exited via Esc: {not is_cluster_active_after}")
        assert not is_cluster_active_after, "Cluster mode should exit on Esc"

        # 10. Test Dual View (Outliner) via Dock Button and M Key
        print("--> Testing Dual View toggle via #btnToggleView")
        btn_toggle_view = page.query_selector("#btnToggleView")
        assert btn_toggle_view is not None, "#btnToggleView should exist in top dock"
        btn_toggle_view.click()
        time.sleep(0.5)

        outliner_active = page.evaluate("""() => {
            const el = document.getElementById('outlinerContainer');
            return Boolean(el && el.classList.contains('active') && el.style.display !== 'none');
        }""")
        btn_text = page.evaluate("() => document.getElementById('btnToggleView').textContent.trim()")
        print(f"[TEST 14] Outliner active via button: {outliner_active}, button text: {btn_text}")
        assert outliner_active, "Outliner should be active"
        assert "导图" in btn_text, f"Expected button text to show '导图', got {btn_text}"
        page.screenshot(path=os.path.join(ROOT_DIR, "screenshots", "politics_outliner_view.png"))
        print("[SCREENSHOT] Saved politics_outliner_view.png")

        # Press M to switch back to mindmap
        print("--> Testing M key toggle back to MindMap")
        page.keyboard.press("m")
        time.sleep(0.5)
        outliner_active_m = page.evaluate("""() => {
            const el = document.getElementById('outlinerContainer');
            return Boolean(el && el.classList.contains('active') && el.style.display !== 'none');
        }""")
        btn_text_m = page.evaluate("() => document.getElementById('btnToggleView').textContent.trim()")
        print(f"[TEST 15] Outliner active after M key: {outliner_active_m}, button text: {btn_text_m}")
        assert not outliner_active_m, "Outliner should be hidden after M key"
        assert "大纲" in btn_text_m, f"Expected button text to show '大纲', got {btn_text_m}"

        # 11. Test Progressive Keyboard Level Expansion (1, 2, 3)
        print("--> Testing Progressive Level Expansion (1, 2, 3)")
        page.keyboard.press("1")
        time.sleep(0.4)
        c1 = page.evaluate("() => document.querySelectorAll('#mindMapContainer .mm-node-card').length")

        page.keyboard.press("2")
        time.sleep(0.4)
        c2 = page.evaluate("() => document.querySelectorAll('#mindMapContainer .mm-node-card').length")

        page.keyboard.press("3")
        time.sleep(0.4)
        c3 = page.evaluate("() => document.querySelectorAll('#mindMapContainer .mm-node-card').length")

        print(f"[TEST 16] Progressive card counts: Level 1 = {c1}, Level 2 = {c2}, Level 3 = {c3}")
        assert c1 < c2, f"Level 2 ({c2}) should expand more cards than Level 1 ({c1})"
        assert c2 < c3, f"Level 3 ({c3}) should expand more cards than Level 2 ({c2})"

        # 12. Test Section Card Text Layout (No pill collision)
        print("--> Checking Section Card Layout for collisions")
        collision_found = page.evaluate("""() => {
            const sectionCards = document.querySelectorAll('#mindMapContainer .mm-node-card.role-section');
            for (let card of sectionCards) {
                const textEl = card.querySelector('.mm-node-content');
                const pillEl = card.querySelector('.mm-node-action-pill');
                if (textEl && pillEl) {
                    const tr = textEl.getBoundingClientRect();
                    const pr = pillEl.getBoundingClientRect();
                    // Horizontal overlap check
                    if (tr.right > pr.left + 2 && tr.left < pr.right) {
                        return { collided: true, text: textEl.textContent.trim(), tr, pr };
                    }
                }
            }
            return { collided: false, count: sectionCards.length };
        }""")
        print(f"[TEST 17] Section card layout collision check: {collision_found}")
        assert not collision_found.get('collided', False), f"Text collision detected: {collision_found}"

        # 13. Test Shortcut Drawer (H key)
        print("--> Testing Shortcut Drawer (H key)")
        page.keyboard.press("h")
        time.sleep(0.4)
        drawer_open = page.evaluate("""() => {
            const d = window.PoliticsMindMapController.getShortcutDrawer();
            return Boolean(d && d.isOpen);
        }""")
        print(f"[TEST 18] Shortcut drawer open: {drawer_open}")
        assert drawer_open, "Shortcut drawer should open on H"
        page.screenshot(path=os.path.join(ROOT_DIR, "screenshots", "politics_drawer_view.png"))
        print("[SCREENSHOT] Saved politics_drawer_view.png")

        # Close drawer with Esc
        page.keyboard.press("Escape")
        time.sleep(0.3)

        # 14. Check Fatal Console Errors
        print(f"[TEST 19] Fatal Console Errors count: {len(console_errors)}")
        if console_errors:
            print("Console Errors:", console_errors)
        assert len(console_errors) == 0, f"Found console errors: {console_errors}"

        browser.close()
        print("\n==========================================")
        print("  ALL 19 DEEP E2E VERIFICATION TESTS PASSED!  ")
        print("==========================================")

if __name__ == '__main__':
    run_tests()
