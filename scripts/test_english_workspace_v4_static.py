from pathlib import Path
import json, re, sys

ROOT = Path(__file__).resolve().parents[1]

checks = []

def ok(name, cond):
    checks.append((name, bool(cond)))

html = (ROOT / "english-workspace.html").read_text(encoding="utf-8")
css = (ROOT / "css" / "english-workspace.css").read_text(encoding="utf-8")
ann = (ROOT / "js" / "english-annotations.js").read_text(encoding="utf-8")
app = (ROOT / "js" / "english-workspace.js").read_text(encoding="utf-8")
bridge = (ROOT / "js" / "english-workspace-bridge.js").read_text(encoding="utf-8")

ok("workspace html loads annotation engine", 'js/english-annotations.js' in html)
ok("workspace html loads workspace engine", 'js/english-workspace.js' in html)
ok("53/47 split present", '53fr' in css and '47fr' in css)
ok("word padding zero", re.search(r'\.ew-word\{[^}]*padding:0[^}]*margin:0', css) is not None)
ok("word yellow", '#ffff00' in css.lower())
ok("word green", '#00ff00' in css.lower())
ok("word cyan", '#00ffff' in css.lower())
ok("CSS Custom Highlight API", 'CSS.highlights' in ann and 'Highlight' in ann)
ok("range persistence offsets", 'start:' in ann and 'end:' in ann and 'quote:' in ann)
ok("annotation key", 'user_guest_kaoyan_english_text_annot_v4' in ann)
ok("answers key reused", 'user_guest_kaoyan_english_user_answers_v1' in app)
ok("status key reused", 'user_guest_kaoyan_english_zhenti_status_v1' in app)
ok("notes key reused", 'user_guest_kaoyan_english_notes_v1' in app)
ok("drafts key reused", 'user_guest_kaoyan_english_drafts_v1' in app)
ok("vocab key reused", 'user_guest_kaoyan_english_zhenti_vocab_v1' in app)
ok("bridge uses ENGLISH_ZHENTI_PAPERS", 'ENGLISH_ZHENTI_PAPERS' in bridge)
ok("bridge uses sessionStorage", 'sessionStorage' in bridge)

failed = [n for n, passed in checks if not passed]
for name, passed in checks:
    print(("PASS" if passed else "FAIL") + " - " + name)

if failed:
    print("\nFAILED:", failed)
    sys.exit(1)
print("\nAll static package checks passed:", len(checks))
