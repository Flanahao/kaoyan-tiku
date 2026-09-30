from pathlib import Path
from html.parser import HTMLParser
import subprocess, sys

ROOT = Path(__file__).resolve().parents[1]
NODE_BIN = r"C:\Users\Flanagan\AppData\Roaming\Python\Python312\site-packages\playwright\driver\node.exe"

results = []

def check(name, cond, detail=''):
    results.append((name, bool(cond), detail))

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.cards = []
        self.classes = []
        self.scripts = []
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        if d.get('id'):
            self.ids.add(d['id'])
        if d.get('class'):
            self.classes.extend(d['class'].split())
        if tag == 'a' and 'home-module-card' in d.get('class', '').split():
            self.cards.append((d.get('data-module'), d.get('href')))
        if tag == 'script' and d.get('src'):
            self.scripts.append(d['src'])

# 1. index.html checks
html = (ROOT / 'index.html').read_text(encoding='utf-8')
p = Parser()
p.feed(html)

dashboard_v2_map = {
    'homeOverallDonut': 'khAllDonut',
    'homeOverallPct': 'khAllPct',
    'homeDoneText': 'khAllDone',
    'homeMasteredText': 'khAllMastered',
    'homeVagueText': 'khAllVague',
    'homeWrongText': 'khAllWrong'
}
for required in ['homeOverallDonut', 'homeOverallPct', 'homeDoneText', 'homeMasteredText', 'homeVagueText', 'homeWrongText']:
    v2_id = dashboard_v2_map.get(required)
    check('homepage id ' + required, (required in p.ids) or (v2_id in p.ids))

check('home has no old sidebar', 'sidebar-left' not in p.classes)

expected = {
    'math': 'study.html?subject=shu1',
    'major': 'study.html?subject=zhuanye',
    'english': 'study.html?subject=english',
    'politics': 'politics.html'
}
check('four subject cards', len(p.cards) == 4, str(p.cards))
for key, href in expected.items():
    check('route ' + key, (key, href) in p.cards, str(p.cards))

analytics_idx = next((i for i, s in enumerate(p.scripts) if 'study-analytics.js' in s), -1)
home_idx = next((i for i, s in enumerate(p.scripts) if 'home.js' in s), -1)
check('analytics before home.js', analytics_idx != -1 and home_idx != -1 and analytics_idx < home_idx)

# 2. css/home.css checks
css = (ROOT / 'css' / 'home.css').read_text(encoding='utf-8')
check('blue palette', '--ky-blue: #2f80ed;' in css)
check('purple palette', '--ky-purple: #7c5cff;' in css)
check('desktop four columns', 'grid-template-columns: repeat(4, minmax(0, 1fr));' in css)
check('responsive two columns', '@media (max-width: 1100px)' in css and 'repeat(2, minmax(0, 1fr))' in css)
check('responsive one column', '@media (max-width: 620px)' in css and 'grid-template-columns: 1fr;' in css)

# 3. css/study-shell.css checks
shell_css = (ROOT / 'css' / 'study-shell.css').read_text(encoding='utf-8')
check('old sidebar hidden not removed', '.sidebar-left' in shell_css and 'display: none !important;' in shell_css)
check('focus bar style exists', '.focus-home-btn' in shell_css and '.focus-subject-chip' in shell_css)

# 4. study.html checks
study_html = (ROOT / 'study.html').read_text(encoding='utf-8')
check('study.html loads study-shell.css', 'study-shell.css' in study_html)
check('study.html loads study-route-bootstrap.js', 'study-route-bootstrap.js' in study_html)
check('study.html loads study-shell.js', 'study-shell.js' in study_html)
check('study.html keeps old sidebar DOM', 'sidebar-left' in study_html and 'btnSwitchSubject' in study_html)
bootstrap_pos = study_html.find('study-route-bootstrap.js')
app_pos = study_html.find('js/app.js')
check('bootstrap executes before app.js', bootstrap_pos != -1 and app_pos != -1 and bootstrap_pos < app_pos)

# 5. politics.html back link check
pol_html = (ROOT / 'politics.html').read_text(encoding='utf-8')
check('politics has back home link', 'href="index.html"' in pol_html)

# 6. Syntax check for JS files using Node
for js in ['home.js', 'study-route-bootstrap.js', 'study-shell.js']:
    js_path = str(ROOT / 'js' / js)
    cp = subprocess.run([NODE_BIN, '--check', js_path], capture_output=True, text=True)
    check('node syntax ' + js, cp.returncode == 0, cp.stderr.strip())

# Print summary
all_ok = True
for name, ok, detail in results:
    status = 'PASS' if ok else 'FAIL'
    msg = f"{status} | {name}" + (f" | {detail}" if detail else "")
    print(msg)
    if not ok:
        all_ok = False

total_pass = sum(1 for _, ok, _ in results if ok)
print(f"\nTOTAL: {total_pass}/{len(results)} PASS")

if not all_ok:
    sys.exit(1)
sys.exit(0)
