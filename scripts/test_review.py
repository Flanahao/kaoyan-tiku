import os
from playwright.sync_api import sync_playwright

def test():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page(viewport={"width": 1664, "height": 920})
        page.goto("file:///d:/考研题库网站/politics.html")
        page.wait_for_function("() => window.__POLITICS_READY__ === true")
        
        # Test 1: Relations connected to c01 before and after expand
        rels_before = page.evaluate("""() => {
            const edges = Array.from(document.querySelectorAll('.politics-relation-edge'));
            return edges.map(e => ({
                source: e.dataset.source,
                target: e.dataset.target,
                count: e.dataset.count
            })).filter(e => e.source.includes('c01') || e.target.includes('c01'));
        }""")
        print("Before expand c01:", rels_before)
        
        # Click toggle on c01
        page.locator(".politics-node-fo[data-node-id='pol.sg.c01'] .politics-node-toggle").click()
        page.wait_for_timeout(500)
        
        rels_after = page.evaluate("""() => {
            const edges = Array.from(document.querySelectorAll('.politics-relation-edge'));
            return edges.map(e => ({
                source: e.dataset.source,
                target: e.dataset.target,
                count: e.dataset.count
            })).filter(e => e.source.includes('c01') || e.target.includes('c01'));
        }""")
        print("After expand c01:", rels_after)

        # Hover on pol.sg.c01.s01
        hover_s01 = page.evaluate("""() => {
            window.PoliticsGraph.setHoveredNode('pol.sg.c01.s01');
            const h = document.querySelectorAll('.politics-relation-edge.is-hovered');
            return h.length;
        }""")
        print("Hover on pol.sg.c01.s01 highlighted count:", hover_s01)

        # Hover on pol.sg.c01 (parent chapter)
        hover_c01 = page.evaluate("""() => {
            window.PoliticsGraph.setHoveredNode('pol.sg.c01');
            const h = document.querySelectorAll('.politics-relation-edge.is-hovered');
            return h.length;
        }""")
        print("Hover on parent pol.sg.c01 highlighted count:", hover_c01)

        ranges = page.evaluate("""() => {
            const store = window.PoliticsStore;
            const foNodes = Array.from(document.querySelectorAll('.politics-node-fo.kind-chapter'));
            const byBook = {};
            foNodes.forEach(fo => {
                const node = store.getNode(fo.dataset.nodeId);
                if (!byBook[node.bookId]) byBook[node.bookId] = [];
                byBook[node.bookId].push(parseFloat(fo.getAttribute('y')));
            });
            const r = {};
            Object.entries(byBook).forEach(([b, ys]) => {
                r[b] = { min: Math.min(...ys), max: Math.max(...ys), count: ys.length };
            });
            return r;
        }""")
        for b, r in ranges.items():
            print(f"{b:4s}: Y from {r['min']:6.1f} to {r['max']:6.1f} ({r['count']} chapters)")

        # Expand xg chapters and check overlaps with sx
        cols_xg_sx = page.evaluate("""async () => {
            const store = window.PoliticsStore;
            const xgChs = store.domain.nodes.filter(n => n.bookId === 'xg' && n.kind === 'chapter');
            xgChs.forEach(c => store.view.expandedNodeIds.add(c.id));
            await window.PoliticsApp.rebuild('expand-xg');

            const foNodes = Array.from(document.querySelectorAll('.politics-node-fo'));
            const xgNodes = foNodes.filter(fo => fo.dataset.nodeId.startsWith('pol.xg'));
            const sxNodes = foNodes.filter(fo => fo.dataset.nodeId.startsWith('pol.sx'));
            const overlaps = [];
            xgNodes.forEach(a => {
                const ab = {
                    id: a.dataset.nodeId,
                    l: parseFloat(a.getAttribute('x')),
                    t: parseFloat(a.getAttribute('y')),
                    r: parseFloat(a.getAttribute('x')) + parseFloat(a.getAttribute('width')),
                    b: parseFloat(a.getAttribute('y')) + parseFloat(a.getAttribute('height'))
                };
                sxNodes.forEach(b => {
                    const bb = {
                        id: b.dataset.nodeId,
                        l: parseFloat(b.getAttribute('x')),
                        t: parseFloat(b.getAttribute('y')),
                        r: parseFloat(b.getAttribute('x')) + parseFloat(b.getAttribute('width')),
                        b: parseFloat(b.getAttribute('y')) + parseFloat(b.getAttribute('height'))
                    };
                    const xo = Math.max(0, Math.min(ab.r, bb.r) - Math.max(ab.l, bb.l));
                    const yo = Math.max(0, Math.min(ab.b, bb.b) - Math.max(ab.t, bb.t));
                    if (xo > 1 && yo > 1) {
                        overlaps.push(ab.id + ' overlaps ' + bb.id + ' (xo=' + xo.toFixed(1) + ', yo=' + yo.toFixed(1) + ')');
                    }
                });
            });
            return overlaps;
        }""")
        print(f"Overlaps between XG and SX when XG chapters expanded: {len(cols_xg_sx)}")
        if cols_xg_sx:
            print("Sample XG-SX overlaps:", cols_xg_sx[:5])
        
        browser.close()

if __name__ == "__main__":
    test()
