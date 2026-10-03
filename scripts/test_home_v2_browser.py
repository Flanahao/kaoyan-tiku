import os
import sys
import time
import json
import threading
from http.server import SimpleHTTPRequestHandler, HTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 8922
ROOT_DIR = Path(__file__).resolve().parents[1]
ARTIFACTS_DIR = Path(r"C:\Users\Flanagan\.gemini\antigravity\brain\226047f0-0eea-4308-a980-7cd958a3b0ed")
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def run_server():
    os.chdir(ROOT_DIR)
    server = HTTPServer(('127.0.0.1', PORT), QuietHandler)
    server.serve_forever()

def main():
    server_thread = threading.Thread(target=run_server, daemon=True)
    server_thread.start()
    time.sleep(1)

    console_errors = []
    def on_console(msg):
        if msg.type == 'error':
            # Ignore harmless resource 404s like missing favicon or image asset if any
            console_errors.append(msg.text)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1664, 'height': 920}
        )
        page = context.new_page()
        page.on('console', on_console)
        page.on('pageerror', lambda err: console_errors.append(f"[pageerror] {err}"))

        # Pre-seed localStorage with exam date and some questions so counts & wrong wheel are active
        init_script = """
        localStorage.setItem('user_guest_study_dashboard_settings_v1', JSON.stringify({examDate: '2026-12-19'}));
        localStorage.setItem('user_guest_shu1_status', JSON.stringify({
            'ex_1-1': 'wrong',
            'ex_1-2': 'proficient',
            'ex_1-3': 'vague'
        }));
        localStorage.setItem('user_guest_s1_zt_2020_s1_status', JSON.stringify({
            '0': 'wrong',
            '1': 'vague'
        }));
        localStorage.setItem('user_guest_s1_zt_2022_s1_status', JSON.stringify({
            '0': 'wrong'
        }));
        """
        page.add_init_script(init_script)

        print("=== Test 1: Desktop Viewport 1664x920 & Hero Fold Visibility ===")
        page.goto(f'http://127.0.0.1:{PORT}/index.html', wait_until='networkidle')
        page.wait_for_selector('.kh-dashboard')

        # Check brand and hero
        brand_text = page.locator('.home-brand-title').text_content()
        assert 'Kyson的考研' in brand_text, f"Unexpected brand: {brand_text}"

        # Check overview row 1 bounding box: must be within the first screen (920px)
        overview_box = page.locator('.kh-overview-grid').bounding_box()
        assert overview_box is not None, "overview_grid must exist"
        print(f"  .kh-overview-grid top: {overview_box['y']}px, bottom: {overview_box['y'] + overview_box['height']}px")
        assert overview_box['y'] < 920, f"Overview grid must start within 920px, got {overview_box['y']}"
        assert (overview_box['y'] + 100) < 920, "First row of overview must be clearly visible on 1664x920"

        # Check countdown card
        countdown_days = page.locator('#khCountdownDays').text_content().strip()
        exam_date_text = page.locator('#khExamDate').text_content().strip()
        print(f"  Countdown days: {countdown_days}, date text: {exam_date_text}")
        assert countdown_days.isdigit() and int(countdown_days) > 0, f"Invalid countdown: {countdown_days}"
        assert '2026-12-19' in exam_date_text, f"Expected 2026-12-19 in {exam_date_text}"

        # Check 1 total card + 3 subject progress cards + 4 wheel buttons + 4 bottom modules
        assert page.locator('.kh-total-card').count() == 1
        assert page.locator('.kh-subject-progress-card').count() == 3
        assert page.locator('[data-wheel]').count() == 4
        assert page.locator('.home-module-card').count() == 4

        # Save 1664x920 screenshot
        shot_1664 = ARTIFACTS_DIR / "kyson_home_v2_1664x920.png"
        page.screenshot(path=str(shot_1664), full_page=False)
        print(f"  Saved 1664x920 screenshot to: {shot_1664}")

        print("\n=== Test 2: Desktop Viewport 1856x830 ===")
        page.set_viewport_size({'width': 1856, 'height': 830})
        time.sleep(0.5)
        shot_1856 = ARTIFACTS_DIR / "kyson_home_v2_1856x830.png"
        page.screenshot(path=str(shot_1856), full_page=False)
        print(f"  Saved 1856x830 screenshot to: {shot_1856}")

        print("\n=== Test 3: Responsive Behavior (1280x800 & 768x1024) ===")
        page.set_viewport_size({'width': 1280, 'height': 800})
        time.sleep(0.3)
        no_h_scroll = page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
        assert no_h_scroll, "1280px should have no horizontal overflow"

        page.set_viewport_size({'width': 768, 'height': 1024})
        time.sleep(0.3)
        no_h_scroll_768 = page.evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth")
        assert no_h_scroll_768, "768px should have no horizontal overflow"
        print("  Responsive layouts at 1280px and 768px passed without horizontal overflow.")

        # Return to standard 1664 viewport for functional tests
        page.set_viewport_size({'width': 1664, 'height': 920})

        print("\n=== Test 4: Single Overall Progress (No duplicate cards) ===")
        all_donuts = page.locator('#khAllDonut').count()
        old_donuts = page.locator('#homeOverallDonut').count()
        assert all_donuts == 1, f"Expected exactly 1 #khAllDonut, got {all_donuts}"
        assert old_donuts == 0, f"Old #homeOverallDonut must not exist in V2, got {old_donuts}"
        print("  Verified: exactly 1 total progress area, old progress card cleanly replaced.")

        print("\n=== Test 5: Numbers Match StudyAnalytics ===")
        analytics_data = page.evaluate("window.StudyAnalytics.getSubjectTotals()")
        rendered_done = page.locator('#khAllDone').text_content().strip()
        rendered_pct = page.locator('#khAllPct').text_content().strip()
        expected_all = analytics_data['all']
        expected_done_str = f"{expected_all['done']:,} / {expected_all['total']:,}"
        print(f"  StudyAnalytics total: {expected_all['total']}, done: {expected_all['done']}")
        print(f"  Rendered done: {rendered_done}, rendered pct: {rendered_pct}")
        assert rendered_done == expected_done_str, f"Mismatch: {rendered_done} vs {expected_done_str}"

        # Politics note check
        politics_note = page.locator('.kh-politics-note').text_content()
        assert '知识图谱' in politics_note and '暂不虚构' in politics_note

        print("\n=== Test 6: Math Wheel Launch & Real Wheel Functionality ===")
        page.goto(f'http://127.0.0.1:{PORT}/index.html', wait_until='networkidle')
        page.locator('[data-wheel="math"]').click()

        frame = page.frame_locator('#homeWheelFrame')
        frame.locator('#dailyMathWheelModal').wait_for(state='visible', timeout=15000)
        assert page.url.endswith('/index.html'), "spinning must stay on the homepage"

        # Capture Math Wheel opened screenshot
        shot_math = ARTIFACTS_DIR / "kyson_wheel_math_opened.png"
        page.screenshot(path=str(shot_math), full_page=False)
        print(f"  Saved Math Wheel screenshot to: {shot_math}")

        # Click spin button and verify real wheel spin
        spin_btn = frame.locator('#btnDailyMathWheelSpin')
        if spin_btn.is_visible():
            spin_btn.click()
            time.sleep(4.5) # Wait for animation to finish
            # Check selected chapter is displayed
            selected_text = frame.locator('#dailyMathWheelResultName').text_content()
            print(f"  Math Wheel spun! Selected chapter: {selected_text.strip()}")
            assert frame.locator('#btnDailyMathWheelStart').is_visible(), "Start learning button must appear"

            # Click '开始学习' and verify it transitions to chapter study and closes modal
            frame.locator('#btnDailyMathWheelStart').click()
            page.wait_for_url("**/study.html?subject=shu1&chapter=*", timeout=10000)
            page.wait_for_function("() => window.getWorkbenchView && window.getWorkbenchView() === 'practice'", timeout=5000)
            view = page.evaluate("window.getWorkbenchView ? window.getWorkbenchView() : ''")
            assert view == 'practice', f"Starting learning should be in practice view, got {view}"


        print("\n=== Test 7: Major Wheel Launch & Tab Semantics ===")
        page.goto(f'http://127.0.0.1:{PORT}/index.html', wait_until='networkidle')
        page.locator('[data-wheel="major"]').click()
        frame = page.frame_locator('#homeWheelFrame')
        frame.locator('#dailyMathWheelModal').wait_for(state='visible', timeout=15000)
        assert page.url.endswith('/index.html')

        # Verify major subject semantics in wheel tab
        major_active = frame.locator('#dailyMathWheelModal .study-wheel-tab[data-subject-id="zhuanye"]').evaluate("""(tab) =>
            tab.classList.contains('active')
        """)
        print(f"  Major wheel tab active: {major_active}")
        assert major_active, "Major tab must be active when opening major wheel"

        # Spin major wheel
        frame.locator('#btnDailyMathWheelSpin').click()
        time.sleep(4.5)
        major_selected = frame.locator('#dailyMathWheelResultName').text_content()
        print(f"  Major Wheel spun! Selected chapter: {major_selected.strip()}")
        frame.locator('#btnCloseDailyMathWheel').click()
        page.locator('#homeWheelHost').wait_for(state='hidden', timeout=5000)

        print("\n=== Test 8: Wrong Wheel Launch & Screenshot ===")
        page.goto(f'http://127.0.0.1:{PORT}/index.html', wait_until='networkidle')
        page.locator('[data-wheel="wrong"]').click()
        frame = page.frame_locator('#homeWheelFrame')
        frame.locator('#dailyWrongWheelModal').wait_for(state='visible', timeout=15000)
        assert page.url.endswith('/index.html')

        # Capture Wrong Wheel screenshot
        shot_wrong = ARTIFACTS_DIR / "kyson_wheel_wrong_opened.png"
        page.screenshot(path=str(shot_wrong), full_page=False)
        print(f"  Saved Wrong Wheel screenshot to: {shot_wrong}")

        # Test scope button and spin wrong wheel
        frame.locator('#btnWrongScopeAll').click()
        time.sleep(0.5)
        frame.locator('#btnDailyWrongWheelSpin').click()
        time.sleep(4.5)
        wrong_selected = frame.locator('#dailyWrongWheelResultName').text_content()
        print(f"  Wrong Wheel spun! Selected chapter: {wrong_selected.strip()}")
        frame.locator('#btnCloseDailyWrongWheel').click()
        page.locator('#homeWheelHost').wait_for(state='hidden', timeout=5000)

        print("\n=== Test 8b: Math Zhenti Wrong Wheel Launch & Spin & Review ===")
        page.goto(f'http://127.0.0.1:{PORT}/index.html', wait_until='networkidle')
        page.locator('[data-wheel="math-zhenti-wrong"]').click()
        frame = page.frame_locator('#homeWheelFrame')
        frame.locator('.mzw-overlay').wait_for(state='visible', timeout=15000)
        assert page.url.endswith('/index.html')

        shot_zhenti_wrong = ARTIFACTS_DIR / "kyson_wheel_zhenti_wrong_opened.png"
        page.screenshot(path=str(shot_zhenti_wrong), full_page=False)
        print(f"  Saved Math Zhenti Wrong Wheel screenshot to: {shot_zhenti_wrong}")

        # Check candidate count text
        frame.locator('.mzw-result').wait_for(state='visible')
        result_text = frame.locator('.mzw-result').text_content()
        print(f"  Math Zhenti Wrong result text: {result_text}")
        assert '个年份有错题' in result_text, f"Expected candidate count, got {result_text}"

        # Spin button should be enabled
        spin_btn = frame.locator('.mzw-spin')
        assert spin_btn.is_enabled()
        spin_btn.click()

        # Wait for spin animation (4.55s)
        time.sleep(4.8)
        spun_text = frame.locator('.mzw-result').text_content()
        print(f"  Spun result: {spun_text}")
        assert '抽中' in spun_text, f"Expected 抽中 in {spun_text}"
        assert '不会' in spun_text and '模糊' in spun_text

        # Review button should be enabled
        review_btn = frame.locator('.mzw-review')
        assert review_btn.is_enabled()
        review_btn.click()

        # Should navigate to study.html in mistakes mode
        page.wait_for_url("**/study.html?subject=shu1&chapter=s1_zt_*&from=home&wheelMode=mistakes", timeout=10000)
        page.wait_for_function("() => window.getWorkbenchView && window.getWorkbenchView() === 'practice'", timeout=5000)
        view = page.evaluate("window.getWorkbenchView ? window.getWorkbenchView() : ''")
        assert view == 'practice', f"Review should land in practice view, got {view}"

        shot_review = ARTIFACTS_DIR / "kyson_zhenti_mistakes_review_landed.png"
        page.screenshot(path=str(shot_review), full_page=False)
        print(f"  Saved mistakes review landing screenshot to: {shot_review}")

        print("\n=== Test 9: Verify 4 Subject Entries Still Work ===")
        page.goto(f'http://127.0.0.1:{PORT}/index.html', wait_until='networkidle')

        # Math entry
        page.locator('.home-module-card.math').click()
        page.wait_for_url("**/study.html?subject=shu1", timeout=5000)
        page.wait_for_function("() => window.getWorkbenchView && window.getWorkbenchView() === 'practice'", timeout=5000)
        view = page.evaluate("window.getWorkbenchView ? window.getWorkbenchView() : ''")
        assert view == 'practice', f"Math entry should land in practice view, got {view}"
        assert page.locator('.header-nav-right #dailyGoalButton').is_visible()

        # Major entry
        page.goto(f'http://127.0.0.1:{PORT}/index.html', wait_until='networkidle')
        page.locator('.home-module-card.major').click()
        page.wait_for_url("**/study.html?subject=zhuanye", timeout=5000)
        page.wait_for_function("() => window.getWorkbenchView && window.getWorkbenchView() === 'practice'", timeout=5000)

        # English entry
        page.goto(f'http://127.0.0.1:{PORT}/index.html', wait_until='networkidle')
        page.locator('.home-module-card.english').click()
        page.wait_for_url("**/study.html?subject=english", timeout=5000)

        # Politics entry
        page.goto(f'http://127.0.0.1:{PORT}/index.html', wait_until='networkidle')
        page.locator('.home-module-card.politics').click()
        page.wait_for_url("**/politics.html", timeout=5000)
        page.locator('.politics-home-link').click()
        page.wait_for_url("**/index.html", timeout=5000)

        print("\n=== Test 10: Console Errors Inspection ===")
        print(f"  Recorded console errors count: {len(console_errors)}")
        if console_errors:
            for err in console_errors:
                print("    - Error:", err)
        assert len(console_errors) == 0, f"Expected 0 console errors, got {len(console_errors)}"

        browser.close()

    print("\n==================================================")
    print("ALL 10 BROWSER E2E ACCEPTANCE TESTS PASSED (100%)!")
    print("Zero console errors confirmed.")
    print("==================================================")

if __name__ == '__main__':
    main()
