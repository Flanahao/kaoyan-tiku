import os
import time
from playwright.sync_api import sync_playwright

base_dir = r"d:\考研题库网站"
politics_url = f"file:///{base_dir.replace(os.sep, '/')}/politics.html"
index_url = f"file:///{base_dir.replace(os.sep, '/')}/index.html"

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    
    # Test nav from politics to index
    print("1. Testing politics.html -> index.html navigation...")
    page.goto(politics_url)
    page.wait_for_function("() => window.__POLITICS_READY__ === true")
    page.click(".politics-back")
    page.wait_for_selector("#appShell", timeout=8000)
    print("Current URL:", page.url)
    assert "index.html" in page.url or page.url.endswith("/"), "Failed to return to index.html"
    
    # Test nav from index to politics
    print("2. Testing index.html -> politics.html navigation...")
    if page.locator("#subjectOverlay").is_visible():
        opt = page.locator(".subject-option[data-subject='shu1']").first
        if opt.is_visible():
            opt.click()
        else:
            page.keyboard.press("Escape")
        time.sleep(0.3)

    page.click("#btnNavPolitics", force=True)
    page.wait_for_function("() => window.__POLITICS_READY__ === true", timeout=8000)
    assert "politics.html" in page.url, "Failed to navigate to politics.html"
    print("Politics loaded cleanly from index.html!")

    # Test validator negative defenses
    print("3. Testing Validator negative defenses...")
    val_res = page.evaluate("""() => {
        const val = window.PoliticsValidator;
        const validData = window.PoliticsStore.domain;

        // Duplicate node
        const d1 = JSON.parse(JSON.stringify(validData));
        d1.nodes.push({ id: d1.nodes[0].id, bookId: 'sg', kind: 'point', depth: 3, parentId: 'pol.sg.c01.s01' });
        const r1 = val.validate(d1);

        // Orphan
        const d2 = JSON.parse(JSON.stringify(validData));
        d2.nodes[0].parentId = 'non_existent_parent';
        const r2 = val.validate(d2);

        // Cycle
        const d3 = JSON.parse(JSON.stringify(validData));
        const c01 = d3.nodes.find(n => n.id === 'pol.sg.c01');
        const s01 = d3.nodes.find(n => n.id === 'pol.sg.c01.s01');
        c01.parentId = s01.id;
        const r3 = val.validate(d3);

        return {
            duplicateCaught: !r1.valid && r1.errors.some(e => e.includes('Duplicate node id')),
            orphanCaught: !r2.valid && r2.errors.some(e => e.includes('orphan parentId')),
            cycleCaught: !r3.valid && r3.errors.some(e => e.includes('cycle'))
        };
    }""")
    print("Validator results:", val_res)
    assert all(val_res.values()), f"Validator defense failed: {val_res}"

    browser.close()
    print("All integration & regression tests passed!")
