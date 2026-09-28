import time
from playwright.sync_api import sync_playwright

def stress_test():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1664, "height": 920})
        page.goto("file:///d:/考研题库网站/politics.html")
        page.wait_for_function("() => window.__POLITICS_READY__ === true")
        
        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        # Expand ALL 52 chapters
        t0 = time.time()
        res = page.evaluate("""async () => {
            const store = window.PoliticsStore;
            const chapters = store.domain.nodes.filter(n => n.kind === 'chapter');
            chapters.forEach(ch => {
                store.view.expandedNodeIds.add(ch.id);
            });
            const tStart = performance.now();
            await window.PoliticsApp.rebuild('expand-all-chapters');
            const tEnd = performance.now();

            const foNodes = Array.from(document.querySelectorAll('.politics-node-fo'));
            // Check for NaN positions
            const nanNodes = foNodes.filter(fo => {
                const x = parseFloat(fo.getAttribute('x'));
                const y = parseFloat(fo.getAttribute('y'));
                return isNaN(x) || isNaN(y);
            });

            return {
                chaptersCount: chapters.length,
                visibleNodesCount: foNodes.length,
                rebuildTimeMs: tEnd - tStart,
                nanNodesCount: nanNodes.length
            };
        }""")
        print(f"Expand all chapters result: {res}")
        assert res['nanNodesCount'] == 0, "No nodes should have NaN position"
        assert len(console_errors) == 0, f"Found console errors: {console_errors}"

        # Now check chapter and section overlaps across all books
        overlap_results = page.evaluate("""() => {
            const store = window.PoliticsStore;
            const foNodes = Array.from(document.querySelectorAll('.politics-node-fo'));
            const byBookKind = {};
            foNodes.forEach(fo => {
                const node = store.getNode(fo.dataset.nodeId);
                const key = `${node.bookId}-${node.kind}`;
                if (!byBookKind[key]) byBookKind[key] = [];
                byBookKind[key].push({
                    id: node.id,
                    parentId: node.parentId,
                    x: parseFloat(fo.getAttribute('x')),
                    y: parseFloat(fo.getAttribute('y')),
                    width: parseFloat(fo.getAttribute('width')),
                    height: parseFloat(fo.getAttribute('height'))
                });
            });

            // Check overlap among siblings under same parent
            const overlaps = [];
            Object.entries(byBookKind).forEach(([key, list]) => {
                // Group by parentId
                const byParent = {};
                list.forEach(item => {
                    if (!byParent[item.parentId]) byParent[item.parentId] = [];
                    byParent[item.parentId].push(item);
                });
                Object.entries(byParent).forEach(([parentId, siblings]) => {
                    siblings.sort((a, b) => a.y - b.y);
                    for (let i = 1; i < siblings.length; i++) {
                        const prevBottom = siblings[i-1].y + siblings[i-1].height;
                        const currTop = siblings[i].y;
                        if (currTop < prevBottom - 1) { // 1px tolerance
                            overlaps.push(`Sibling overlap under ${parentId}: ${siblings[i-1].id} (bottom=${prevBottom}) overlaps ${siblings[i].id} (top=${currTop})`);
                        }
                    }
                });
            });

            return {
                totalGroups: Object.keys(byBookKind).length,
                overlapsCount: overlaps.length,
                overlaps: overlaps.slice(0, 10)
            };
        }""")
        print(f"Overlap check under mass expansion: {overlap_results}")

        # Also expand ALL sections!
        res_sec = page.evaluate("""async () => {
            const store = window.PoliticsStore;
            const sections = store.domain.nodes.filter(n => n.kind === 'section');
            sections.forEach(s => {
                store.view.expandedNodeIds.add(s.id);
            });
            const tStart = performance.now();
            await window.PoliticsApp.rebuild('expand-all-sections');
            const tEnd = performance.now();
            const foNodes = Array.from(document.querySelectorAll('.politics-node-fo'));
            return {
                totalVisible: foNodes.length,
                rebuildTimeMs: tEnd - tStart
            };
        }""")
        print(f"Expand all sections result (Full Tree): {res_sec}")

        # Check overlaps on full tree
        full_overlaps = page.evaluate("""() => {
            const store = window.PoliticsStore;
            const foNodes = Array.from(document.querySelectorAll('.politics-node-fo'));
            // Group by parentId
            const byParent = {};
            foNodes.forEach(fo => {
                const node = store.getNode(fo.dataset.nodeId);
                if (!node.parentId) return;
                if (!byParent[node.parentId]) byParent[node.parentId] = [];
                byParent[node.parentId].push({
                    id: node.id,
                    y: parseFloat(fo.getAttribute('y')),
                    height: parseFloat(fo.getAttribute('height'))
                });
            });
            const overlaps = [];
            Object.entries(byParent).forEach(([parentId, siblings]) => {
                siblings.sort((a, b) => a.y - b.y);
                for (let i = 1; i < siblings.length; i++) {
                    const prevBottom = siblings[i-1].y + siblings[i-1].height;
                    const currTop = siblings[i].y;
                    if (currTop < prevBottom - 0.5) {
                        overlaps.push(`${siblings[i-1].id} and ${siblings[i].id} under ${parentId}`);
                    }
                }
            });
            return {
                overlapsCount: overlaps.length,
                sample: overlaps.slice(0, 10)
            };
        }""")
        # Check 2D bounding box intersection between all pairs of visible nodes in initial view
        collisions_initial = page.evaluate("""() => {
            const foNodes = Array.from(document.querySelectorAll('.politics-node-fo'));
            const boxes = foNodes.map(fo => ({
                id: fo.dataset.nodeId,
                left: parseFloat(fo.getAttribute('x')),
                top: parseFloat(fo.getAttribute('y')),
                right: parseFloat(fo.getAttribute('x')) + parseFloat(fo.getAttribute('width')),
                bottom: parseFloat(fo.getAttribute('y')) + parseFloat(fo.getAttribute('height'))
            }));
            const cols = [];
            for (let i = 0; i < boxes.length; i++) {
                for (let j = i + 1; j < boxes.length; j++) {
                    const a = boxes[i];
                    const b = boxes[j];
                    const xOverlap = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
                    const yOverlap = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
                    if (xOverlap > 1 && yOverlap > 1) {
                        cols.push(a.id + ' overlaps ' + b.id + ' (xOverlap=' + xOverlap + ', yOverlap=' + yOverlap + ')');
                    }
                }
            }
            return cols;
        }""")
        print(f"Full 2D collisions count across all 692 nodes: {len(collisions_initial)}")
        if len(collisions_initial) > 0:
            print(f"Sample 2D collisions: {collisions_initial[:10]}")

        browser.close()

if __name__ == "__main__":
    stress_test()
