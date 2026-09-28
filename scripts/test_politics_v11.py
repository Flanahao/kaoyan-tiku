import os
import sys
import time
from playwright.sync_api import sync_playwright

def run_tests():
    base_dir = r"d:\考研题库网站"
    politics_url = f"file:///{base_dir.replace(os.sep, '/')}/politics.html"
    screenshot_dir = os.path.join(base_dir, "screenshots")
    os.makedirs(screenshot_dir, exist_ok=True)

    print("==================================================")
    print("V1.1 REBUILD VERIFICATION SUITE")
    print(f"Target: {politics_url}")
    print("==================================================")

    with sync_playwright() as p:
        browser = p.chromium.launch()
        # Viewport: 1664 x 920 as requested in guide section 7 F
        page = browser.new_page(viewport={"width": 1664, "height": 920})

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        # ----------------------------------------------------
        # A. 初始加载
        # ----------------------------------------------------
        print("\n--- A. 初始加载 (Initial Load & Visibility) ---")
        page.goto(politics_url)
        page.wait_for_function("() => window.__POLITICS_READY__ === true", timeout=20000)
        time.sleep(1)

        print(f"Console errors: {console_errors}")
        assert len(console_errors) == 0, f"Found console errors: {console_errors}"

        summary = page.evaluate("""() => {
            const store = window.PoliticsStore;
            const foNodes = Array.from(document.querySelectorAll('.politics-node-fo'));
            const kindCounts = {};
            foNodes.forEach(fo => {
                const card = fo.querySelector('.politics-node-card');
                const classes = Array.from(card.classList);
                const kindClass = classes.find(c => c.startsWith('kind-'));
                const kind = kindClass ? kindClass.replace('kind-', '') : 'unknown';
                kindCounts[kind] = (kindCounts[kind] || 0) + 1;
            });

            return {
                canonicalTotal: store.domain.nodes.length,
                renderedCount: foNodes.length,
                kindCounts: kindCounts,
                statusText: document.getElementById('politicsVisibleCount')?.textContent || ''
            };
        }""")
        print(f"Canonical total nodes: {summary['canonicalTotal']}")
        print(f"Visible nodes on initial render: {summary['renderedCount']}")
        print(f"Node count by kind: {summary['kindCounts']}")
        print(f"Status text: {summary['statusText']}")

        # Verify only Book and Chapter are visible by default
        assert summary['canonicalTotal'] > 500, f"Expected canonical total > 500, got {summary['canonicalTotal']}"
        assert summary['renderedCount'] < 100, f"Expected initial visible nodes < 100, got {summary['renderedCount']}"
        assert summary['kindCounts'].get('point', 0) == 0, "Points should be hidden by default"
        assert summary['kindCounts'].get('section', 0) == 0, "Sections should be hidden by default"
        assert summary['kindCounts'].get('book', 0) == 6, f"Expected 6 books, got {summary['kindCounts'].get('book')}"
        assert summary['kindCounts'].get('chapter', 0) > 0, "Chapters should be visible"

        # Screenshot 1: Initial overview
        screenshot1_path = os.path.join(screenshot_dir, "politics_v11_initial_overview.png")
        page.screenshot(path=screenshot1_path)
        print(f"Saved initial overview screenshot to: {screenshot1_path}")

        # ----------------------------------------------------
        # B. 史纲 (Spine & Branching)
        # ----------------------------------------------------
        print("\n--- B. 史纲 (Central Spine & Chapter Alignment) ---")
        spine_test = page.evaluate("""() => {
            const spine = document.querySelector('.politics-timeline-spine');
            const markers = document.querySelectorAll('.politics-period-marker');
            const store = window.PoliticsStore;
            
            const foNodes = Array.from(document.querySelectorAll('.politics-node-fo'));
            const sgChapters = [];
            foNodes.forEach(fo => {
                const id = fo.dataset.nodeId;
                const node = store.getNode(id);
                if (node && node.bookId === 'sg' && node.kind === 'chapter') {
                    sgChapters.push({
                        id: node.id,
                        title: node.title,
                        x: parseFloat(fo.getAttribute('x')),
                        width: parseFloat(fo.getAttribute('width')),
                        y: parseFloat(fo.getAttribute('y'))
                    });
                }
            });

            const allCentered = sgChapters.every(ch => {
                const centerX = ch.x + ch.width / 2;
                return Math.abs(centerX) < 1; // within 1px of x=0
            });

            return {
                spineExists: !!spine,
                markersCount: markers.length,
                sgChaptersCount: sgChapters.length,
                allCentered: allCentered,
                sgChapters: sgChapters.slice(0, 3)
            };
        }""")
        print(f"Timeline spine exists: {spine_test['spineExists']}")
        print(f"Period markers count: {spine_test['markersCount']}")
        print(f"SG chapters count: {spine_test['sgChaptersCount']}, all centered on spine: {spine_test['allCentered']}")
        assert spine_test['spineExists'], "Spine should exist"
        assert spine_test['markersCount'] > 0, "Period markers should exist"
        assert spine_test['sgChaptersCount'] > 0, "SG chapters should be rendered"
        assert spine_test['allCentered'], "All SG chapters must be centered on x=0 timeline"

        # Expand a SG Chapter
        print("\n--- B2. 展开一个史纲 Chapter ---")
        page.locator('.politics-node-fo[data-node-id="pol.sg.c01"] .politics-node-toggle').click()
        time.sleep(1)

        after_ch_expand = page.evaluate("""() => {
            const foNodes = Array.from(document.querySelectorAll('.politics-node-fo'));
            const sections = foNodes.filter(fo => fo.classList.contains('kind-section'));
            return {
                totalVisible: foNodes.length,
                sectionsVisible: sections.length,
                sectionSample: sections.map(s => ({
                    id: s.dataset.nodeId,
                    x: parseFloat(s.getAttribute('x')),
                    y: parseFloat(s.getAttribute('y'))
                }))
            };
        }""")
        print(f"After SG chapter expand: {after_ch_expand['totalVisible']} visible nodes, {after_ch_expand['sectionsVisible']} sections")
        assert after_ch_expand['sectionsVisible'] > 0, "Sections should now be visible"
        for s in after_ch_expand['sectionSample']:
            assert abs(s['x']) > 100, f"Section {s['id']} should grow outward from center, got x={s['x']}"

        # Expand a Section
        print("\n--- B3. 展开一个 Section (Points grow further outward) ---")
        first_sec = page.locator('.politics-node-fo.kind-section .politics-node-toggle').first
        first_sec.click()
        time.sleep(1)

        after_sec_expand = page.evaluate("""() => {
            const foNodes = Array.from(document.querySelectorAll('.politics-node-fo'));
            const points = foNodes.filter(fo => fo.classList.contains('kind-point'));
            const sec = foNodes.find(fo => fo.classList.contains('kind-section'));
            const secX = sec ? Math.abs(parseFloat(sec.getAttribute('x'))) : 0;
            const pointsFurther = points.every(p => Math.abs(parseFloat(p.getAttribute('x'))) > secX);
            return {
                totalVisible: foNodes.length,
                pointsVisible: points.length,
                pointsFurther: pointsFurther,
                pointSample: points.map(p => ({
                    id: p.dataset.nodeId,
                    x: parseFloat(p.getAttribute('x')),
                    y: parseFloat(p.getAttribute('y'))
                })).slice(0, 3)
            };
        }""")
        print(f"After section expand: {after_sec_expand['totalVisible']} visible nodes, {after_sec_expand['pointsVisible']} points, points further outward: {after_sec_expand['pointsFurther']}")
        assert after_sec_expand['pointsVisible'] > 0, "Points should now be visible"
        assert after_sec_expand['pointsFurther'], "Points should be placed further away from spine than their parent section"

        # Fit view and take Screenshot 2
        page.locator("#btnPoliticsFit").click()
        time.sleep(1)
        # Move mouse out of canvas elements
        page.mouse.move(0, 0)
        screenshot2_path = os.path.join(screenshot_dir, "politics_v11_expanded_sg.png")
        page.screenshot(path=screenshot2_path)
        print(f"Saved expanded screenshot to: {screenshot2_path}")

        # ----------------------------------------------------
        # C. 非史纲 (Satellite Trees & Non-overlapping)
        # ----------------------------------------------------
        print("\n--- C. 非史纲科目 (Satellite Trees) ---")
        lateral_test = page.evaluate("""() => {
            const store = window.PoliticsStore;
            const foNodes = Array.from(document.querySelectorAll('.politics-node-fo'));
            const books = {};
            foNodes.forEach(fo => {
                const id = fo.dataset.nodeId;
                const node = store.getNode(id);
                if (node && node.kind === 'book') {
                    const x = parseFloat(fo.getAttribute('x')) + parseFloat(fo.getAttribute('width')) / 2;
                    books[node.bookId] = x;
                }
            });
            return books;
        }""")
        print(f"Book root center X positions: {lateral_test}")
        assert abs(lateral_test.get('sg', 999)) < 5, "SG book root should be near x=0"
        assert lateral_test.get('my', 0) < -100, "MY book should be on the left"
        assert lateral_test.get('xg', 0) > 100, "XG book should be on the right"

        # Check chapter overlap within each subject
        overlap_check = page.evaluate("""() => {
            const store = window.PoliticsStore;
            const foNodes = Array.from(document.querySelectorAll('.politics-node-fo.kind-chapter'));
            const byBook = {};
            foNodes.forEach(fo => {
                const id = fo.dataset.nodeId;
                const node = store.getNode(id);
                if (!byBook[node.bookId]) byBook[node.bookId] = [];
                byBook[node.bookId].push({
                    id: node.id,
                    top: parseFloat(fo.getAttribute('y')),
                    bottom: parseFloat(fo.getAttribute('y')) + parseFloat(fo.getAttribute('height'))
                });
            });

            const overlaps = [];
            Object.entries(byBook).forEach(([bookId, list]) => {
                list.sort((a, b) => a.top - b.top);
                for (let i = 1; i < list.length; i++) {
                    if (list[i].top < list[i-1].bottom) {
                        overlaps.push(`${bookId}: ${list[i-1].id} overlaps with ${list[i].id}`);
                    }
                }
            });
            return overlaps;
        }""")
        print(f"Chapter overlaps count: {len(overlap_check)}")
        assert len(overlap_check) == 0, f"Found chapter overlaps: {overlap_check}"

        # ----------------------------------------------------
        # D. Relation (Aggregation, Opacity, Hover, Toggle)
        # ----------------------------------------------------
        print("\n--- D. 跨书关系与语义聚合 (Relations & Hover) ---")
        # Ensure mouse is away from any node
        page.mouse.move(0, 0)
        time.sleep(0.3)
        rel_test = page.evaluate("""() => {
            const edges = Array.from(document.querySelectorAll('.politics-relation-edge'));
            const unhovered = edges.filter(e => !e.classList.contains('is-hovered') && !e.classList.contains('is-active'));
            const styles = unhovered.map(e => window.getComputedStyle(e).opacity);
            return {
                edgeCount: edges.length,
                unhoveredCount: unhovered.length,
                defaultOpacity: parseFloat(styles[0] || '0')
            };
        }""")
        print(f"Aggregated relation edges: {rel_test['edgeCount']}, unhovered: {rel_test['unhoveredCount']}, sample opacity: {rel_test['defaultOpacity']}")
        assert rel_test['edgeCount'] > 0, "Aggregated relations should exist"
        assert rel_test['defaultOpacity'] <= 0.25, f"Relation lines should be low opacity background, got {rel_test['defaultOpacity']}"

        # Hover over a node and verify hovered relation gets highlighted
        hover_test = page.evaluate("""() => {
            const edge = document.querySelector('.politics-relation-edge');
            if (!edge) return { success: false };
            const sourceId = edge.dataset.source;
            const targetId = edge.dataset.target;

            window.PoliticsGraph.setHoveredNode(sourceId);
            const hoveredEdges = document.querySelectorAll('.politics-relation-edge.is-hovered');
            const hoveredOpacity = parseFloat(window.getComputedStyle(hoveredEdges[0]).opacity);
            
            window.PoliticsGraph.setHoveredNode(null);
            const countAfterClear = document.querySelectorAll('.politics-relation-edge.is-hovered').length;

            return {
                sourceId,
                targetId,
                countHovered: hoveredEdges.length,
                hoveredOpacity,
                countAfterClear
            };
        }""")
        print(f"Hover test: {hover_test}")
        assert hover_test['countHovered'] > 0, "Hovering source node must highlight connected relation edge"
        assert hover_test['hoveredOpacity'] > 0.6, f"Hovered edge should have high opacity, got {hover_test['hoveredOpacity']}"
        assert hover_test['countAfterClear'] == 0, "Clearing hover must remove highlight"

        # Toggle relations off/on via button
        page.locator("#btnPoliticsRelations").click()
        time.sleep(0.5)
        edges_off_count = page.evaluate("() => document.querySelectorAll('.politics-relation-edge').length")
        btn_text_off = page.locator("#btnPoliticsRelations").inner_text()
        print(f"Relations toggled off: {edges_off_count} edges, button text: '{btn_text_off}'")
        assert edges_off_count == 0, "Relations should be 0 when toggled off"
        assert "关" in btn_text_off, "Button text should be 关联线：关"

        page.locator("#btnPoliticsRelations").click()
        time.sleep(0.5)
        edges_on_count = page.evaluate("() => document.querySelectorAll('.politics-relation-edge').length")
        btn_text_on = page.locator("#btnPoliticsRelations").inner_text()
        print(f"Relations toggled back on: {edges_on_count} edges, button text: '{btn_text_on}'")
        assert edges_on_count > 0, "Relations should reappear when toggled on"
        assert "开" in btn_text_on, "Button text should be 关联线：开"

        # ----------------------------------------------------
        # E. Interaction (Click, Double Click, Inspector, Zoom, Fit, Pan)
        # ----------------------------------------------------
        print("\n--- E. 交互功能 (Interaction Suite) ---")
        # 1. Click node opens Inspector
        ch_card = page.locator('.politics-node-card.kind-chapter').first
        ch_card.click()
        time.sleep(0.5)

        inspector_info = page.evaluate("""() => {
            const ins = document.getElementById('politicsInspector');
            return {
                isOpen: ins.classList.contains('is-open'),
                title: ins.querySelector('h2')?.textContent.trim(),
                summary: ins.querySelector('p')?.textContent.trim(),
                book: ins.querySelector('.politics-inspector-book')?.textContent.trim(),
                selectedId: window.PoliticsStore.view.selectedNodeId
            };
        }""")
        print(f"Inspector info on click: {inspector_info}")
        assert inspector_info['isOpen'], "Inspector should be open"
        assert len(inspector_info['title']) > 0, "Inspector title should not be empty"

        # 2. Escape closes inspector
        page.keyboard.press("Escape")
        time.sleep(0.5)
        is_open_after_esc = page.evaluate("() => document.getElementById('politicsInspector').classList.contains('is-open')")
        print(f"Inspector is open after Escape: {is_open_after_esc}")
        assert not is_open_after_esc, "Inspector should close on Escape"

        # 3. Canvas click deselects
        ch_card.click()
        time.sleep(0.5)
        assert page.evaluate("() => window.PoliticsStore.view.selectedNodeId !== null")
        # Click on empty background area of SVG (e.g. x=250, y=200, well away from buttons and cards)
        page.mouse.click(250, 200)
        time.sleep(0.5)
        deselected = page.evaluate("() => window.PoliticsStore.view.selectedNodeId === null")
        print(f"Canvas click cleared selection: {deselected}")
        assert deselected, "Clicking canvas background must clear selection"

        # 4. Double click node toggles expand/collapse
        test_node_id = "pol.sg.c02"
        target_card = page.locator(f'.politics-node-fo[data-node-id="{test_node_id}"] .politics-node-card')
        before_dbl = page.evaluate(f"() => window.PoliticsStore.isExpanded('{test_node_id}')")
        target_card.dblclick()
        time.sleep(0.5)
        after_dbl = page.evaluate(f"() => window.PoliticsStore.isExpanded('{test_node_id}')")
        print(f"Double click {test_node_id}: before={before_dbl}, after={after_dbl}")
        assert after_dbl != before_dbl, "Double click should toggle expansion state"

        # 5. Zoom In / Zoom Out / Reset View / Fit View
        z0 = page.evaluate("() => window.PoliticsGraph.getZoom()")
        page.locator("#btnPoliticsZoomIn").click()
        time.sleep(0.3)
        z_in = page.evaluate("() => window.PoliticsGraph.getZoom()")
        page.locator("#btnPoliticsZoomOut").click()
        page.locator("#btnPoliticsZoomOut").click()
        time.sleep(0.3)
        z_out = page.evaluate("() => window.PoliticsGraph.getZoom()")
        page.locator("#btnPoliticsReset").click()
        time.sleep(0.3)
        z_reset = page.evaluate("() => window.PoliticsGraph.getZoom()")
        page.locator("#btnPoliticsFit").click()
        time.sleep(0.3)
        z_fit = page.evaluate("() => window.PoliticsGraph.getZoom()")

        print(f"Zoom tests: initial={z0:.3f}, in={z_in:.3f}, out={z_out:.3f}, reset={z_reset:.3f}, fit={z_fit:.3f}")
        assert z_in > z0, "Zoom in must increase zoom"
        assert z_out < z_in, "Zoom out must decrease zoom"
        assert abs(z_reset - 0.72) < 0.05, "Reset must restore 0.72 default"

        # 6. Drag canvas (Pan)
        transform_before = page.evaluate("""() => {
            const sc = document.querySelector('.politics-scene');
            return sc.getAttribute('transform');
        }""")
        page.mouse.move(500, 500)
        page.mouse.down()
        page.mouse.move(600, 550, steps=5)
        page.mouse.up()
        time.sleep(0.3)
        transform_after = page.evaluate("""() => {
            const sc = document.querySelector('.politics-scene');
            return sc.getAttribute('transform');
        }""")
        print(f"Pan drag transform before: '{transform_before}', after: '{transform_after}'")
        assert transform_before != transform_after, "Dragging canvas must update scene transform"

        # 7. Wheel Zoom
        page.mouse.move(500, 500)
        page.mouse.wheel(0, 100)
        time.sleep(0.3)
        z_wheel = page.evaluate("() => window.PoliticsGraph.getZoom()")
        print(f"Wheel zoom result: {z_wheel:.3f}")
        assert z_wheel != z_fit, "Wheel event must adjust zoom"

        print("\n==================================================")
        print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY WITH 0 ERRORS!")
        print("==================================================")
        browser.close()

if __name__ == "__main__":
    run_tests()
