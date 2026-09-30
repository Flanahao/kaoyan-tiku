import re
from pathlib import Path
from bs4 import BeautifulSoup

def test_static():
    root = Path(__file__).resolve().parents[1]
    index_html = root / 'index.html'
    study_html = root / 'study.html'
    css_v2 = root / 'css' / 'home-dashboard-v2.css'
    home_v2_js = root / 'js' / 'home-dashboard-v2.js'
    route_js = root / 'js' / 'study-route-bootstrap.js'

    assert index_html.exists(), "index.html must exist"
    assert study_html.exists(), "study.html must exist"
    assert css_v2.exists(), "css/home-dashboard-v2.css must exist"
    assert home_v2_js.exists(), "js/home-dashboard-v2.js must exist"
    assert route_js.exists(), "js/study-route-bootstrap.js must exist"

    # 1. index.html checks
    index_text = index_html.read_text(encoding='utf-8')
    assert 'css/home-dashboard-v2.css' in index_text, "index.html must link home-dashboard-v2.css"
    assert 'js/home-dashboard-v2.js' in index_text, "index.html must load home-dashboard-v2.js"
    assert 'home-progress-wrap' not in index_text, "index.html must not contain old standalone home-progress-wrap"
    assert 'homeOverallDonut' not in index_text, "index.html must not duplicate old homeOverallDonut"

    soup = BeautifulSoup(index_text, 'html.parser')
    ids = [node.get('id') for node in soup.find_all(id=True)]
    assert len(ids) == len(set(ids)), f"duplicate IDs found in index.html: {[x for x in ids if ids.count(x) > 1]}"

    # Overview section cards
    overview_cards = soup.select('.kh-overview-grid .kh-card')
    assert len(overview_cards) == 2, f"expected 2 overview cards, got {len(overview_cards)}"

    # Subject progress cards
    subject_cards = soup.select('.kh-subject-progress-card')
    assert len(subject_cards) == 3, f"expected 3 subject progress cards, got {len(subject_cards)}"

    # Wheel buttons
    wheel_buttons = soup.select('[data-wheel]')
    assert len(wheel_buttons) == 3, f"expected 3 wheel buttons, got {len(wheel_buttons)}"
    assert {x.get('data-wheel') for x in wheel_buttons} == {'math', 'major', 'wrong'}

    required_ids = {
        'khCountdownDays', 'khExamDate', 'khAllDonut', 'khAllPct', 'khAllDone', 'khAllMastered', 'khAllVague', 'khAllWrong',
        'khEnglishDonut', 'khEnglishPct', 'khEnglishDone', 'khMathDonut', 'khMathPct', 'khMathDone', 'khMajorDonut', 'khMajorPct', 'khMajorDone'
    }
    missing_ids = required_ids - set(ids)
    assert not missing_ids, f"missing dashboard IDs in index.html: {missing_ids}"

    # Bottom four subject modules
    bottom_modules = [a.get('data-module') for a in soup.select('.home-module-card')]
    assert bottom_modules == ['math', 'major', 'english', 'politics'], f"unexpected bottom modules: {bottom_modules}"

    print("PASS: index.html structure, unique IDs, and section hierarchy")

    # 2. study.html checks
    study_text = study_html.read_text(encoding='utf-8')
    assert 'study-route-bootstrap.js' in study_text, "study.html must load study-route-bootstrap.js"
    for wheel_hook in ['dailyMathWheelButton', 'dailyMajorWheelButton', 'dailyWrongWheelButton', 'dailyMathWheelModal', 'dailyWrongWheelModal']:
        assert wheel_hook in study_text, f"study.html missing wheel hook: {wheel_hook}"

    print("PASS: study.html preserved wheel hooks and loads study-route-bootstrap.js")

    # 3. CSS checks
    css_text = css_v2.read_text(encoding='utf-8')
    for color in ['#2f80ed', '#1557a6', '#124a91', '#7c5cff', '#6941d7']:
        assert color in css_text, f"missing palette color: {color}"
    assert '@media (max-width: 1100px)' in css_text
    assert '@media (max-width: 720px)' in css_text
    assert '@media (max-width: 460px)' in css_text
    assert '.kh-wheel-card' in css_text
    assert '.kh-donut' in css_text

    print("PASS: css/home-dashboard-v2.css palette, components, and responsive breakpoints")

    # 4. JS checks
    home_js_text = home_v2_js.read_text(encoding='utf-8')
    assert 'StudyAnalytics.getSubjectTotals' in home_js_text, "home-dashboard-v2.js must reuse StudyAnalytics.getSubjectTotals"
    assert 'study.html?wheel=' in home_js_text, "home-dashboard-v2.js must launch study.html?wheel="
    assert "politics" not in re.findall(r"renderTotals\('([^']+)'", home_js_text), "politics must not be faked as numeric total"

    route_js_text = route_js.read_text(encoding='utf-8')
    for hook in ['dailyMathWheelButton', 'dailyMajorWheelButton', 'dailyWrongWheelButton', 'dailyMathWheelModal', 'dailyWrongWheelModal']:
        assert hook in route_js_text, f"study-route-bootstrap.js missing hook: {hook}"
    assert 'clearWheelQuery' in route_js_text

    print("PASS: js/home-dashboard-v2.js and js/study-route-bootstrap.js contracts")
    print("ALL STATIC CHECKS PASSED (100%)!")

if __name__ == '__main__':
    test_static()
