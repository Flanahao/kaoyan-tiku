import os
import sys
import time
from playwright.sync_api import sync_playwright

def run_tests():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    politics_url = f"file:///{base_dir.replace(os.sep, '/')}/politics.html"
    index_url = f"file:///{base_dir.replace(os.sep, '/')}/index.html"
    screenshot_dir = os.path.join(base_dir, "screenshots")
    os.makedirs(screenshot_dir, exist_ok=True)

    print("==================================================")
    print("STARTING POLITICS MILESTONE 0 + 1 VERIFICATION")
    print(f"Base Directory: {base_dir}")
    print(f"Politics URL: {politics_url}")
    print("==================================================")

    results = []

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1440, "height": 900})

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        # ----------------------------------------------------
        # Test 1: politics.html Load & G6 Render
        # ----------------------------------------------------
        print("\n[Test 1] Loading politics.html...")
        page.goto(politics_url)
        page.wait_for_function("() => window.__POLITICS_READY__ === true", timeout=10000)
        time.sleep(0.5)

        graph_stats = page.evaluate("""() => {
            const graph = window.PoliticsGraph.getGraph();
            return {
                nodeCount: graph.getNodeData().length,
                edgeCount: graph.getEdgeData().length,
                zoom: window.PoliticsGraph.getZoom(),
                visibleText: document.getElementById('politicsVisibleCount')?.textContent || ''
            };
        }""")
        print("Graph stats:", graph_stats)

        assert graph_stats["nodeCount"] >= 30, f"Expected >= 30 nodes, got {graph_stats['nodeCount']}"
        assert graph_stats["edgeCount"] >= 10, f"Expected >= 10 edges, got {graph_stats['edgeCount']}"
        results.append(("politics.html Load & G6 Render", "PASS", f"{graph_stats['nodeCount']} nodes, {graph_stats['edgeCount']} edges"))

        # ----------------------------------------------------
        # Test 2: Console Error Check
        # ----------------------------------------------------
        print("\n[Test 2] Checking console errors...")
        print(f"Console errors recorded: {len(console_errors)}")
        if console_errors:
            print("Errors:", console_errors)
        assert len(console_errors) == 0, f"Encountered console errors: {console_errors}"
        results.append(("Console Error Check", "PASS", "0 console errors"))

        # ----------------------------------------------------
        # Test 3: Layout Verification (Spine, Multi-Lane & Compactness)
        # ----------------------------------------------------
        print("\n[Test 3] Verifying Multi-Lane Layout Topology & Visual Compactness...")
        layout_check = page.evaluate("""() => {
            const graph = window.PoliticsGraph.getGraph();
            const nodes = graph.getNodeData();
            
            const sgNodes = nodes.filter(n => n.data.bookId === 'sg');
            const myNodes = nodes.filter(n => n.data.bookId === 'my');
            const mztNodes = nodes.filter(n => n.data.bookId === 'mzt');
            const xgNodes = nodes.filter(n => n.data.bookId === 'xg');
            const sxNodes = nodes.filter(n => n.data.bookId === 'sx');
            const xsNodes = nodes.filter(n => n.data.bookId === 'xs');
            
            const sgXPositions = sgNodes.map(n => n.style.x);
            const myXPositions = myNodes.map(n => n.style.x);
            const xgXPositions = xgNodes.map(n => n.style.x);
            
            const sgAllAtZero = sgXPositions.every(x => Math.abs(x) < 5);
            const myAllNegative = myXPositions.every(x => x < -100);
            const xgAllPositive = xgXPositions.every(x => x > 100);
            
            // Check vertical ordering of sg
            const sgYPositions = sgNodes.map(n => n.style.y);
            let sgStrictlyDescending = true;
            for (let i = 1; i < sgYPositions.length; i++) {
                if (sgYPositions[i] <= sgYPositions[i-1]) {
                    sgStrictlyDescending = false;
                    break;
                }
            }
            
            // Check vertical voids: no non-book branch child node should be > 700px away from its parent
            const nodeMap = new Map(nodes.map(n => [n.id, n]));
            let maxNonBookDist = 0;
            let worstNonBook = '';
            for (const n of nodes) {
                if (n.data.bookId !== 'sg' && n.data.parentId && nodeMap.has(n.data.parentId)) {
                    const p = nodeMap.get(n.data.parentId);
                    if (p.data.kind !== 'book') {
                        const dist = Math.abs(n.style.y - p.style.y);
                        if (dist > maxNonBookDist) {
                            maxNonBookDist = dist;
                            worstNonBook = `${p.id} -> ${n.id} (${dist}px)`;
                        }
                    }
                }
            }

            // Check mzt chapter ordering (Chapter 1 and Chapter 2 branches preserve monotonic order)
            const mztC01 = nodeMap.get('pol.mzt.c01');
            const mztC02 = nodeMap.get('pol.mzt.c02');
            const mztC01P = nodes.find(n => n.id.startsWith('pol.mzt.c01') && n.data.kind === 'point');
            const mztC02P = nodes.find(n => n.id.startsWith('pol.mzt.c02') && n.data.kind === 'point');
            const mztNoCross = (mztC01.style.y < mztC02.style.y) && (mztC01P.style.y < mztC02P.style.y);

            return {
                sgCount: sgNodes.length,
                myCount: myNodes.length,
                xgCount: xgNodes.length,
                sgAllAtZero,
                myAllNegative,
                xgAllPositive,
                sgStrictlyDescending,
                sgMinY: Math.min(...sgYPositions),
                sgMaxY: Math.max(...sgYPositions),
                maxNonBookDist,
                worstNonBook,
                mztNoCross
            };
        }""")
        print("Layout verification result:", layout_check)
        assert layout_check["sgAllAtZero"], "All sg nodes must be on lane 0 (x ~ 0)"
        assert layout_check["myAllNegative"], "All my nodes must be on left lanes (x < -100)"
        assert layout_check["xgAllPositive"], "All xg nodes must be on right lanes (x > 100)"
        assert layout_check["sgStrictlyDescending"], "Timeline sg nodes must flow vertically downwards"
        assert layout_check["maxNonBookDist"] < 700, f"Branch vertical distance too large: {layout_check['worstNonBook']}"
        assert layout_check["mztNoCross"], "Chapter hierarchy lines must not cross"
        results.append(("Multi-Lane Layout Topology", "PASS", f"史纲中央(x=0), 无连线交叉, 最大分支跨度 {layout_check['maxNonBookDist']}px"))

        # ----------------------------------------------------
        # Test 4: Viewport Controls & Keyboard Shortcuts
        # ----------------------------------------------------
        print("\n[Test 4] Testing Viewport Controls (Buttons & Keyboard Shortcuts)...")
        initial_zoom = page.evaluate("window.PoliticsGraph.getZoom()")

        # Button Zoom In
        page.click("#btnPoliticsZoomIn")
        time.sleep(0.3)
        zoom_in_val = page.evaluate("window.PoliticsGraph.getZoom()")
        assert zoom_in_val > initial_zoom, f"Zoom in failed: {zoom_in_val} not > {initial_zoom}"

        # Button Zoom Out
        page.click("#btnPoliticsZoomOut")
        time.sleep(0.4)
        page.click("#btnPoliticsZoomOut")
        time.sleep(0.4)
        zoom_out_val = page.evaluate("window.PoliticsGraph.getZoom()")
        assert zoom_out_val < initial_zoom, f"Zoom out failed: {zoom_out_val} not < {initial_zoom}"

        # Button Reset View
        page.click("#btnPoliticsReset")
        time.sleep(0.8)
        reset_zoom_val = page.evaluate("window.PoliticsGraph.getZoom()")
        assert abs(reset_zoom_val - 0.75) < 0.05, f"Reset view zoom expected ~0.75, got {reset_zoom_val}"

        # Button Fit View
        page.click("#btnPoliticsFit")
        time.sleep(0.5)
        fit_zoom_val = page.evaluate("window.PoliticsGraph.getZoom()")
        assert abs(fit_zoom_val - initial_zoom) < 0.05, f"Fit view expected ~{initial_zoom}, got {fit_zoom_val}"

        # Keyboard shortcut '+'
        page.keyboard.press("+")
        time.sleep(0.3)
        k_zoom_in = page.evaluate("window.PoliticsGraph.getZoom()")
        assert k_zoom_in > fit_zoom_val, "Keyboard '+' failed to zoom in"

        # Keyboard shortcut '-'
        page.keyboard.press("-")
        time.sleep(0.3)
        k_zoom_out = page.evaluate("window.PoliticsGraph.getZoom()")
        assert k_zoom_out < k_zoom_in, "Keyboard '-' failed to zoom out"

        # Keyboard shortcut '0'
        page.keyboard.press("0")
        time.sleep(0.8)
        k_reset = page.evaluate("window.PoliticsGraph.getZoom()")
        assert abs(k_reset - 0.75) < 0.05, f"Keyboard '0' expected ~0.75, got {k_reset}"

        # Keyboard shortcut 'f'
        page.keyboard.press("f")
        time.sleep(0.8)
        k_fit = page.evaluate("window.PoliticsGraph.getZoom()")
        assert abs(k_fit - initial_zoom) < 0.05, f"Keyboard 'f' expected ~{initial_zoom}, got {k_fit}"

        results.append(("Viewport Controls & Shortcuts", "PASS", "按钮与快捷键(+/-/0/f)响应正常"))

        # ----------------------------------------------------
        # Test 5: Canvas Drag Interaction (Pan)
        # ----------------------------------------------------
        # ----------------------------------------------------
        # Test 5: Canvas Drag Interaction (Pan)
        # ----------------------------------------------------
        print("\n[Test 5] Testing Canvas Drag Interaction (Pan)...")
        canvas = page.locator("#politicsGraph")
        box = canvas.bounding_box()
        # Drag from canvas corner/background to avoid clicking on foreground node cards
        start_x = box["x"] + 60
        start_y = box["y"] + 60

        pos_before = page.evaluate("window.PoliticsGraph.getGraph().getViewportCenter()")
        page.mouse.move(start_x, start_y)
        page.mouse.down()
        page.mouse.move(start_x + 150, start_y + 100, steps=10)
        page.mouse.up()
        time.sleep(0.3)
        pos_after = page.evaluate("window.PoliticsGraph.getGraph().getViewportCenter()")
        print(f"Viewport center before pan: {pos_before}, after pan: {pos_after}")
        assert pos_before != pos_after, "Pan drag failed to move viewport"
        results.append(("Canvas Drag Interaction", "PASS", "Canvas pans smoothly"))

        # Fit view and take screenshot
        page.click("#btnPoliticsFit")
        time.sleep(0.5)
        politics_screenshot = os.path.join(screenshot_dir, "politics_mindmap_rendered.png")
        page.screenshot(path=politics_screenshot)
        print(f"Saved screenshot to {politics_screenshot}")

        # ----------------------------------------------------
        # Test 6: Period Bar Navigation (Real Camera Movement across all 5 periods)
        # ----------------------------------------------------
        print("\n[Test 6] Testing Period Bar Navigation across Periods 1 to 5...")
        pills = page.locator(".politics-period-pill")
        pill_count = pills.count()
        assert pill_count == 6, f"Expected 6 period pills (1 overview + 5 periods), got {pill_count}"

        overview_center = page.evaluate("window.PoliticsGraph.getGraph().getViewportCenter()")

        period_targets = [
            (1, "pol.sg.c01", "旧民主主义革命时期"),
            (2, "pol.sg.c04", "新民主主义革命时期"),
            (3, "pol.sg.c08", "社会主义革命和建设时期"),
            (4, "pol.sg.c09", "改革开放新时期"),
            (5, "pol.sg.c10", "中国特色社会主义新时代")
        ]

        prev_y = -9999
        for pill_idx, expected_node, period_label in period_targets:
            pills.nth(pill_idx).click()
            time.sleep(0.5)
            center = page.evaluate("window.PoliticsGraph.getGraph().getViewportCenter()")
            target_y = page.evaluate(f"() => window.PoliticsGraph.getGraph().getNodeData().find(n => n.id === '{expected_node}')?.style.y")
            assert target_y is not None, f"Target node {expected_node} for Period {pill_idx} not found in G6!"
            print(f"Center after clicking Period {pill_idx} ({period_label}): {center} (target y: {target_y})")
            assert abs(center[0]) < 15, f"Period {pill_idx} X should be center axis (~0), got {center[0]}"
            assert abs(center[1] - target_y) < 30, f"Period {pill_idx} Y should focus on {expected_node} (~{target_y}), got {center[1]}"
            assert center[1] > prev_y, f"Period {pill_idx} Y ({center[1]}) must strictly descend below previous period Y ({prev_y})"
            prev_y = center[1]

        # Click Overview
        pills.nth(0).click()
        time.sleep(0.5)
        back_center = page.evaluate("window.PoliticsGraph.getGraph().getViewportCenter()")
        assert abs(back_center[1] - overview_center[1]) < 30, "Overview pill failed to return to overview center"
        results.append(("Period Bar Navigation", "PASS", "全部5大历史时期平移视口至对应主干章节且严格向下递进"))

        # ----------------------------------------------------
        # Test 7: Navigation from politics.html -> index.html
        # ----------------------------------------------------
        print("\n[Test 7] Testing navigation back to index.html...")
        page.click(".politics-back")
        page.wait_for_selector("#appShell", timeout=8000)
        assert "index.html" in page.url or page.url.endswith("/"), f"URL did not return to index: {page.url}"
        results.append(("politics.html -> index.html Navigation", "PASS", "Returned to workbench cleanly"))

        # ----------------------------------------------------
        # Test 8: Navigation from index.html -> politics.html
        # ----------------------------------------------------
        print("\n[Test 8] Testing navigation from index.html to politics.html...")
        if page.locator("#subjectOverlay").is_visible():
            opt = page.locator(".subject-option[data-subject='shu1']").first
            if opt.is_visible():
                opt.click()
            else:
                page.keyboard.press("Escape")
            time.sleep(0.3)

        page.click("#btnNavPolitics", force=True)
        page.wait_for_function("() => window.__POLITICS_READY__ === true", timeout=8000)
        assert "politics.html" in page.url, f"URL did not navigate to politics: {page.url}"
        results.append(("index.html -> politics.html Navigation", "PASS", "Navigated to politics mindmap cleanly"))

        # ----------------------------------------------------
        # Test 9: Original Question Bank Regression Test
        # ----------------------------------------------------
        print("\n[Test 9] Regressing Original Question Bank on index.html...")
        page.goto(index_url)
        page.wait_for_selector("#appShell", timeout=8000)

        qbank_status = page.evaluate("""() => {
            return {
                hasSidebar: !!document.getElementById('sidebarLeft'),
                hasQnav: !!document.getElementById('qnav'),
                hasStats: !!document.getElementById('statsPanel'),
                hasShortcuts: !!document.getElementById('shortcutModal'),
                hasSolDefault: !!document.getElementById('btnSolDefault'),
                hasPoliticsBtn: !!document.getElementById('btnNavPolitics')
            };
        }""")
        print("Question bank regression check:", qbank_status)
        for k, v in qbank_status.items():
            assert v is True, f"Question bank regression failed on element: {k}"
        results.append(("Question Bank Regression", "PASS", "All core study, practice, and sidebar UI intact"))

        # ----------------------------------------------------
        # Test 10: Strict Validator Negative Tests
        # ----------------------------------------------------
        print("\n[Test 10] Testing Strict Validator Negative Defenses...")
        page.goto(politics_url)
        page.wait_for_function("() => window.__POLITICS_READY__ === true", timeout=8000)

        validator_res = page.evaluate("""() => {
            const val = window.PoliticsValidator;
            const validData = window.PoliticsStore.domain;
            
            // 1. Duplicate node ID
            const d1 = JSON.parse(JSON.stringify(validData));
            d1.nodes.push({ id: d1.nodes[0].id, bookId: 'sg', kind: 'point', depth: 3, parentId: 'pol.sg.c01.s01' });
            const r1 = val.validate(d1);

            // 2. Orphan parent
            const d2 = JSON.parse(JSON.stringify(validData));
            d2.nodes[0].parentId = 'non_existent_parent';
            const r2 = val.validate(d2);

            // 3. Parent cycle
            const d3 = JSON.parse(JSON.stringify(validData));
            const c01 = d3.nodes.find(n => n.id === 'pol.sg.c01');
            const s01 = d3.nodes.find(n => n.id === 'pol.sg.c01.s01');
            c01.parentId = s01.id;
            const r3 = val.validate(d3);

            // 4. Invalid depth for kind
            const d4 = JSON.parse(JSON.stringify(validData));
            d4.nodes.find(n => n.kind === 'point').depth = 1;
            const r4 = val.validate(d4);

            // 5. Invalid periodId
            const d5 = JSON.parse(JSON.stringify(validData));
            d5.nodes.find(n => n.periodId).periodId = 'bad-period';
            const r5 = val.validate(d5);

            // 6. Bad anchor ID
            const d6 = JSON.parse(JSON.stringify(validData));
            const anchored = d6.nodes.find(n => n.layoutAnchorIds && n.layoutAnchorIds.length > 0);
            anchored.layoutAnchorIds.push('fake_anchor_id');
            const r6 = val.validate(d6);

            // 7. Canonical style violation
            const d7 = JSON.parse(JSON.stringify(validData));
            d7.nodes[0].style = { x: 100, y: 100 };
            const r7 = val.validate(d7);

            return {
                caughtDuplicate: !r1.valid && r1.errors.some(e => e.includes('Duplicate node id')),
                caughtOrphan: !r2.valid && r2.errors.some(e => e.includes('orphan parentId')),
                caughtCycle: !r3.valid && r3.errors.some(e => e.includes('cycle')),
                caughtBadDepth: !r4.valid && r4.errors.some(e => e.includes('depth')),
                caughtBadPeriod: !r5.valid && r5.errors.some(e => e.includes('invalid periodId')),
                caughtBadAnchor: !r6.valid && r6.errors.some(e => e.includes('fake_anchor_id')),
                caughtStyleTampering: !r7.valid && r7.errors.some(e => e.includes('canonical decoupling'))
            };
        }""")
        print("Validator defense check:", validator_res)
        for k, v in validator_res.items():
            assert v is True, f"Validator failed to catch violation: {k}"
        results.append(("Strict Validator Defenses", "PASS", "All 7 negative integrity tests successfully caught"))

        browser.close()

    print("\n==================================================")
    print("ALL TESTS COMPLETED SUCCESSFULLY!")
    for name, status, detail in results:
        print(f"  [{status}] {name}: {detail}")
    print("==================================================")

if __name__ == "__main__":
    run_tests()
