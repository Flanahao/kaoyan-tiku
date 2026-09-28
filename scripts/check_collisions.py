from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto('file:///d:/考研题库网站/politics.html')
    page.wait_for_function('() => window.__POLITICS_READY__ === true')
    
    collisions = page.evaluate("""() => {
        const graph = window.PoliticsGraph.getGraph();
        const nodes = graph.getNodeData();
        
        let collision2d = 0;
        const collidingPairs = [];
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
                
                const overlapX = Math.abs(x1 - x2) < (w1 + w2) / 2;
                const overlapY = Math.abs(y1 - y2) < (h1 + h2) / 2;
                if (overlapX && overlapY) {
                    collidingPairs.push(n1.id + ' overlaps with ' + n2.id + ' (x1=' + x1 + ', y1=' + y1 + ', x2=' + x2 + ', y2=' + y2 + ')');
                }
            }
        }
        return collidingPairs;
    }""")
    print('True 2D collisions count:', len(collisions))
    for c in collisions[:10]:
        print(' ', c)
    browser.close()
