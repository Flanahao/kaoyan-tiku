import os
import sys
import time
from playwright.sync_api import sync_playwright

def verify():
    base_dir = r"d:\考研题库网站"
    politics_url = f"file:///{base_dir.replace(os.sep, '/')}/politics.html"
    screenshot_dir = os.path.join(base_dir, "screenshots")
    os.makedirs(screenshot_dir, exist_ok=True)

    print("==================================================")
    print("VERIFYING POLITICS MIND MAP WITH REAL TEXTBOOK DATA")
    print(f"Politics URL: {politics_url}")
    print("==================================================")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1600, "height": 1000})

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        print("\n1. Navigating to politics.html...")
        page.goto(politics_url)
        page.wait_for_function("() => window.__POLITICS_READY__ === true", timeout=15000)
        time.sleep(1)

        print("\n2. Checking console errors...")
        print(f"Console errors count: {len(console_errors)}")
        if console_errors:
            print("Errors encountered:", console_errors)
        assert len(console_errors) == 0, f"Encountered console errors: {console_errors}"

        print("\n3. Inspecting Graph stats...")
        stats = page.evaluate("""() => {
            const graph = window.PoliticsGraph.getGraph();
            const nodes = graph.getNodeData();
            const edges = graph.getEdgeData();
            return {
                nodeCount: nodes.length,
                edgeCount: edges.length,
                visibleCountText: document.getElementById('politicsVisibleCount')?.textContent || '',
                zoom: window.PoliticsGraph.getZoom(),
                viewportCenter: graph.getViewportCenter()
            };
        }""")
        print("Graph stats:", stats)
        assert stats["nodeCount"] >= 600, f"Expected >= 600 nodes, got {stats['nodeCount']}"
        assert stats["edgeCount"] >= 600, f"Expected >= 600 edges, got {stats['edgeCount']}"

        print("\n4. Checking multi-lane positions...")
        layout_metrics = page.evaluate("""() => {
            const graph = window.PoliticsGraph.getGraph();
            const nodes = graph.getNodeData();
            
            const sgNodes = nodes.filter(n => n.data.bookId === 'sg');
            const myNodes = nodes.filter(n => n.data.bookId === 'my');
            const mztNodes = nodes.filter(n => n.data.bookId === 'mzt');
            const xgNodes = nodes.filter(n => n.data.bookId === 'xg');
            const sxNodes = nodes.filter(n => n.data.bookId === 'sx');
            const xsNodes = nodes.filter(n => n.data.bookId === 'xs');
            
            // Check x-axis separation
            const sgAllCenter = sgNodes.every(n => Math.abs(n.style.x) < 5);
            const myAllLeft = myNodes.every(n => n.style.x < -100);
            const mztAllLeft = mztNodes.every(n => n.style.x < -100);
            const xgAllRight = xgNodes.every(n => n.style.x > 100);
            const sxAllRight = sxNodes.every(n => n.style.x > 100);
            
            // Check SG strictly descending
            const sgYs = sgNodes.map(n => n.style.y);
            let sgStrictlyDescending = true;
            for (let i = 1; i < sgYs.length; i++) {
                if (sgYs[i] <= sgYs[i-1]) {
                    sgStrictlyDescending = false;
                    break;
                }
            }

            // Check true 2D bounding box collision between all rendered nodes
            let collisionCount = 0;
            const collisions = [];
            for (let i = 0; i < nodes.length; i++) {
                const n1 = nodes[i];
                const w1 = n1.style.size ? n1.style.size[0] : 170;
                const h1 = n1.style.size ? n1.style.size[1] : 34;
                const x1 = n1.style.x;
                const y1 = n1.style.y;
                for (let j = i + 1; j < nodes.length; j++) {
                    const n2 = nodes[j];
                    const w2 = n2.style.size ? n2.style.size[0] : 170;
                    const h2 = n2.style.size ? n2.style.size[1] : 34;
                    const x2 = n2.style.x;
                    const y2 = n2.style.y;
                    if (Math.abs(x1 - x2) < (w1 + w2) / 2 && Math.abs(y1 - y2) < (h1 + h2) / 2) {
                        collisionCount++;
                        collisions.push(`${n1.id} & ${n2.id}`);
                    }
                }
            }

            return {
                counts: {
                    sg: sgNodes.length,
                    my: myNodes.length,
                    mzt: mztNodes.length,
                    xg: xgNodes.length,
                    sx: sxNodes.length,
                    xs: xsNodes.length
                },
                sgAllCenter,
                myAllLeft,
                mztAllLeft,
                xgAllRight,
                sxAllRight,
                sgStrictlyDescending,
                collisionCount,
                collisions,
                sgYRange: [Math.min(...sgYs), Math.max(...sgYs)]
            };
        }""")
        print("Layout metrics:", layout_metrics)
        assert layout_metrics["sgAllCenter"], "All sg nodes must be on lane 0 (x ~ 0)"
        assert layout_metrics["myAllLeft"], "All my nodes must be on left lanes (x < -100)"
        assert layout_metrics["mztAllLeft"], "All mzt nodes must be on left lanes (x < -100)"
        assert layout_metrics["xgAllRight"], "All xg nodes must be on right lanes (x > 100)"
        assert layout_metrics["sxAllRight"], "All sx nodes must be on right lanes (x > 100)"
        assert layout_metrics["sgStrictlyDescending"], "Timeline sg nodes must flow vertically downwards"
        assert layout_metrics["collisionCount"] == 0, f"Found {layout_metrics['collisionCount']} collisions: {layout_metrics['collisions']}"

        print("\n5. Testing Period Bar navigation...")
        pills = page.locator(".politics-period-pill")
        pill_count = pills.count()
        print(f"Found {pill_count} period pills (1 overview + 5 periods)")
        assert pill_count == 6, f"Expected 6 period pills, got {pill_count}"

        # Click each period and check focus (strictly monotonically descending along timeline)
        prev_y = -9999
        for idx in range(1, 6):
            pills.nth(idx).click()
            time.sleep(0.5)
            vc = page.evaluate("window.PoliticsGraph.getGraph().getViewportCenter()")
            print(f"Period {idx} center:", vc)
            assert abs(vc[0]) < 15, f"Period {idx} center X should be ~0, got {vc[0]}"
            assert vc[1] > prev_y, f"Period {idx} center Y ({vc[1]}) must strictly descend below Period {idx - 1} ({prev_y})"
            prev_y = vc[1]

        # Click back to overview
        pills.nth(0).click()
        time.sleep(0.5)

        print("\n6. Taking screenshot of mind map with real data...")
        screenshot_path = os.path.join(screenshot_dir, "politics_real_data_mindmap.png")
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")

        browser.close()

    print("\n==================================================")
    print("ALL REAL DATA CHECKS PASSED PERFECTLY!")
    print("==================================================")

if __name__ == "__main__":
    verify()
