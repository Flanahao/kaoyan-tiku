import http.server
import socketserver
import threading
import time
from pathlib import Path
from playwright.sync_api import sync_playwright

PORT = 8016
REPO_DIR = Path(__file__).resolve().parent.parent
ARTIFACTS_DIR = Path(r"C:\Users\Flanagan\.gemini\antigravity\brain\226047f0-0eea-4308-a980-7cd958a3b0ed")

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(REPO_DIR), **kwargs)

def start_server():
    httpd = socketserver.TCPServer(("127.0.0.1", 0), Handler)
    port = httpd.server_address[1]
    thread = threading.Thread(target=httpd.serve_forever, daemon=True)
    thread.start()
    return httpd, port

def main():
    httpd, port = start_server()
    print(f"HTTP Server started at http://127.0.0.1:{port}")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # =========================================================================
        # PART 1: HTTP Protocol E2E Testing
        # =========================================================================
        print("\n=======================================================")
        print("PART 1: HTTP Protocol Testing (http://127.0.0.1:8016)")
        print("=======================================================")
        context = browser.new_context(viewport={'width': 1664, 'height': 920})
        page = context.new_page()

        console_errors = []
        page.on('console', lambda msg: console_errors.append(f"[console.{msg.type}] {msg.text}") if msg.type == 'error' else None)
        page.on('pageerror', lambda err: console_errors.append(f"[pageerror] {err}"))

        # Pre-seed 2 years: 2018 (2 wrong, 1 vague) and 2021 (1 wrong, 0 vague)
        init_script = """
        localStorage.setItem('user_guest_study_dashboard_settings_v1', JSON.stringify({examDate: '2026-12-19'}));
        localStorage.setItem('user_guest_s1_zt_2018_s1_status', JSON.stringify({
            '0': 'wrong',
            '1': 'wrong',
            '2': 'vague',
            '3': 'proficient'
        }));
        localStorage.setItem('user_guest_s1_zt_2021_s1_status', JSON.stringify({
            '0': 'wrong',
            '1': 'proficient'
        }));
        """
        print("\n--- Test 1.1: Homepage 4th card presence and initial state ---")
        page.goto(f'http://127.0.0.1:{port}/index.html', wait_until='networkidle')
        page.evaluate(init_script)
        card = page.locator('.kh-wheel-card[data-wheel="math-zhenti-wrong"]')
        assert card.is_visible(), "4th wheel card must be visible on homepage"
        card_text = card.text_content()
        assert "数学历年真题错题转盘" in card_text
        print("  4th card verified:", card_text.replace('\n', ' ').strip())

        print("\n--- Test 1.2: Launch wheel in home host iframe ---")
        card.click()
        assert page.url.endswith('/index.html'), "Must stay on homepage while wheel is open"
        page.locator('#homeWheelHost').wait_for(state='visible', timeout=10000)

        frame = page.frame_locator('#homeWheelFrame')
        overlay = frame.locator('.mzw-overlay')
        overlay.wait_for(state='visible', timeout=15000)
        assert overlay.is_visible(), "mzw-overlay must be visible"

        # Verify candidate count text: 2 years
        result_el = frame.locator('.mzw-result')
        result_el.wait_for(state='visible')
        text = result_el.text_content()
        print(f"  Candidate status text: {text}")
        assert "当前 2 个年份有错题，可开始抽取" in text, f"Unexpected text: {text}"

        shot_opened = ARTIFACTS_DIR / "math_zhenti_wrong_wheel_opened.png"
        page.screenshot(path=str(shot_opened), full_page=False)
        print(f"  Saved screenshot: {shot_opened}")

        print("\n--- Test 1.3: Spin the wheel and verify landed result ---")
        spin_btn = frame.locator('.mzw-spin')
        assert spin_btn.is_enabled()
        review_btn = frame.locator('.mzw-review')
        assert review_btn.is_disabled(), "Review button must be disabled before spin"

        spin_btn.click()
        assert spin_btn.is_disabled(), "Spin button must be disabled while spinning"
        assert "转盘转动中…" in result_el.text_content()

        time.sleep(4.8) # Wait for 4.55s spin animation

        spun_result = result_el.text_content()
        print(f"  Spun result text: {spun_result}")
        assert "抽中" in spun_result
        assert review_btn.is_enabled(), "Review button must be enabled after spin completes"
        assert spin_btn.is_enabled(), "Spin button must be re-enabled after spin completes"

        shot_spun = ARTIFACTS_DIR / "math_zhenti_wrong_wheel_spun.png"
        page.screenshot(path=str(shot_spun), full_page=False)
        print(f"  Saved spun screenshot: {shot_spun}")

        print("\n--- Test 1.4: Click review and verify handoff to study.html ---")
        review_btn.click()
        page.wait_for_url("**/study.html?subject=shu1&chapter=s1_zt_*&from=home&wheelMode=mistakes", timeout=10000)
        print(f"  Successfully navigated to: {page.url}")

        page.wait_for_function("() => window.getWorkbenchView && window.getWorkbenchView() === 'practice'", timeout=8000)
        view = page.evaluate("window.getWorkbenchView ? window.getWorkbenchView() : ''")
        assert view == 'practice', f"Must land in practice workbench view, got {view}"

        # Verify active chapter corresponds to the selected year
        current_ch = page.evaluate("() => window.getCurrentPracticeState ? window.getCurrentPracticeState().currentChapterId : ''")
        print(f"  Landed chapter: {current_ch}")
        assert current_ch in ('s1_zt_2018', 's1_zt_2021'), f"Landed chapter {current_ch} must be one of the candidate years"

        shot_landed = ARTIFACTS_DIR / "math_zhenti_mistakes_study_landed.png"
        page.screenshot(path=str(shot_landed), full_page=False)
        print(f"  Saved study landed screenshot: {shot_landed}")

        print("\n--- Test 1.5: Zero-mistake empty state handling ---")
        # Clear all mistakes in localStorage
        page.evaluate("""() => {
            localStorage.removeItem('user_guest_s1_zt_2018_s1_status');
            localStorage.removeItem('user_guest_s1_zt_2021_s1_status');
        }""")
        page.goto(f'http://127.0.0.1:{port}/index.html', wait_until='networkidle')
        page.locator('.kh-wheel-card[data-wheel="math-zhenti-wrong"]').click()

        frame = page.frame_locator('#homeWheelFrame')
        frame.locator('.mzw-overlay').wait_for(state='visible', timeout=15000)
        empty_text = frame.locator('.mzw-result').text_content()
        print(f"  Zero-candidate result text: {empty_text}")
        assert "暂无可复习的真题错题" in empty_text, f"Unexpected empty text: {empty_text}"
        assert frame.locator('.mzw-spin').is_disabled(), "Spin button must be disabled when 0 candidates"
        assert frame.locator('.mzw-review').is_disabled(), "Review button must be disabled when 0 candidates"

        shot_empty = ARTIFACTS_DIR / "math_zhenti_wrong_wheel_empty_state.png"
        page.screenshot(path=str(shot_empty), full_page=False)
        print(f"  Saved empty state screenshot: {shot_empty}")

        # Close via close button
        frame.locator('.mzw-close').click()
        page.locator('#homeWheelHost').wait_for(state='hidden', timeout=5000)
        assert page.locator('#homeWheelHost').is_hidden()
        print("  Close button successfully closed the wheel and host dialog")

        print("\n--- Test 1.6: Single-candidate (1 year) deterministic selection ---")
        page.evaluate("""() => {
            localStorage.setItem('user_guest_s1_zt_2025_s1_status', JSON.stringify({
                '0': 'wrong'
            }));
        }""")
        page.locator('.kh-wheel-card[data-wheel="math-zhenti-wrong"]').click()
        frame.locator('.mzw-overlay').wait_for(state='visible', timeout=15000)
        single_text = frame.locator('.mzw-result').text_content()
        print(f"  Single-candidate text: {single_text}")
        assert "当前 1 个年份有错题，可开始抽取" in single_text

        frame.locator('.mzw-spin').click()
        time.sleep(4.8)
        single_spun = frame.locator('.mzw-result').text_content()
        print(f"  Single-candidate spun text: {single_spun}")
        assert "抽中 2025 年" in single_spun, f"1 candidate must always pick 2025, got: {single_spun}"
        frame.locator('.mzw-close').click()
        page.locator('#homeWheelHost').wait_for(state='hidden', timeout=5000)

        # =========================================================================
        # PART 2: Local file:// Protocol Verification
        # =========================================================================
        print("\n=======================================================")
        print("PART 2: Local file:// Protocol Verification")
        print("=======================================================")
        file_url = f"file:///{str(REPO_DIR).replace('\\', '/')}/index.html"
        print(f"  Opening {file_url}")

        file_page = context.new_page()
        file_errors = []
        file_page.on('console', lambda msg: file_errors.append(f"[console.{msg.type}] {msg.text}") if msg.type == 'error' else None)
        file_page.on('pageerror', lambda err: file_errors.append(f"[pageerror] {err}"))

        file_page.goto(file_url, wait_until='networkidle')
        file_page.wait_for_selector('.kh-wheel-card[data-wheel="math-zhenti-wrong"]')

        # Pre-seed for file protocol
        file_page.evaluate("""() => {
            localStorage.setItem('user_guest_s1_zt_2019_s1_status', JSON.stringify({
                '0': 'wrong',
                '1': 'vague'
            }));
        }""")

        file_page.locator('.kh-wheel-card[data-wheel="math-zhenti-wrong"]').click()
        file_page.locator('#homeWheelHost').wait_for(state='visible', timeout=10000)

        file_frame = file_page.frame_locator('#homeWheelFrame')
        file_frame.locator('.mzw-overlay').wait_for(state='visible', timeout=15000)
        assert file_page.url.startswith('file:'), "Must stay on file:// protocol"

        file_result = file_frame.locator('.mzw-result').text_content()
        print(f"  file:// candidate text: {file_result}")
        assert "当前 1 个年份有错题，可开始抽取" in file_result

        shot_file = ARTIFACTS_DIR / "math_zhenti_wrong_wheel_file_protocol.png"
        file_page.screenshot(path=str(shot_file), full_page=False)
        print(f"  Saved file protocol screenshot: {shot_file}")

        file_spin_btn = file_frame.locator('.mzw-spin')
        file_spin_btn.click()
        time.sleep(4.8)

        file_spun_text = file_frame.locator('.mzw-result').text_content()
        print(f"  file:// spun text: {file_spun_text}")
        assert "抽中 2019 年" in file_spun_text

        # Test close under file protocol
        file_frame.locator('.mzw-close').click()
        file_page.locator('#homeWheelHost').wait_for(state='hidden', timeout=5000)
        assert file_page.locator('#homeWheelHost').is_hidden()
        print("  file:// modal closed cleanly")

        print(f"\n  HTTP console errors: {len(console_errors)}")
        if console_errors:
            for e in console_errors:
                print("    -", e)
        assert len(console_errors) == 0, f"Expected 0 HTTP console errors, got {len(console_errors)}"

        print(f"  file:// console errors: {len(file_errors)}")
        if file_errors:
            for e in file_errors:
                print("    -", e)
        assert len(file_errors) == 0, f"Expected 0 file:// console errors, got {len(file_errors)}"

        browser.close()

    print("\n=======================================================")
    print("ALL MATH ZHENTI WRONG WHEEL BROWSER TESTS PASSED (100%)!")
    print("Zero errors on HTTP and file:// protocols!")
    print("=======================================================")

if __name__ == '__main__':
    main()
