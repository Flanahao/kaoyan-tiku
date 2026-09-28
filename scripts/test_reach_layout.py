import json
import math

with open('data/politics/books.json', encoding='utf-8') as f:
    books = json.load(f)
with open('data/politics/periods.json', encoding='utf-8') as f:
    periods = json.load(f)
with open('data/politics/relations.json', encoding='utf-8') as f:
    relations = json.load(f)

nodes = []
for b in books:
    path = f"data/politics/nodes/{b['id']}.json"
    with open(path, encoding='utf-8') as f:
        nodes.extend(json.load(f))

# Define node sizes
sizes = {
    'book': [164, 42],
    'chapter': [228, 44],
    'section': [206, 38],
    'point': [226, 34]
}

def simulate_layout(expanded_ids):
    # Determine visible nodes
    node_map = {n['id']: n for n in nodes}
    children_map = {}
    for n in nodes:
        pid = n.get('parentId')
        if pid:
            children_map.setdefault(pid, []).append(n['id'])
    for ids in children_map.values():
        ids.sort(key=lambda nid: node_map[nid].get('order', 0))

    def is_visible(nid):
        curr = node_map.get(nid)
        if not curr or not curr.get('parentId'):
            return True
        guard = set()
        while curr and curr.get('parentId'):
            pid = curr['parentId']
            if pid in guard:
                return False
            guard.add(pid)
            if pid not in expanded_ids:
                return False
            curr = node_map.get(pid)
        return True

    visible_nodes = [n for n in nodes if is_visible(n['id'])]
    visible_ids = set(n['id'] for n in visible_nodes)

    vis_child_map = {}
    for n in visible_nodes:
        pid = n.get('parentId')
        if pid and pid in visible_ids:
            vis_child_map.setdefault(pid, []).append(n)
    for clist in vis_child_map.values():
        clist.sort(key=lambda n: n.get('order', 0))

    def leaf_units(nid):
        children = vis_child_map.get(nid, [])
        if not children:
            return 1
        return sum(leaf_units(c['id']) for c in children)

    # Layout params
    centerX = 0
    timelineTop = 160
    timelineRootGap = 96
    timelineChapterGap = 128
    periodGap = 86
    sgBranchOffset = 310
    bookBaseOffset = 760  # increased from 620 to avoid SG point overlap
    depthIndent = 238
    branchLeafGap = 54
    branchPadding = 32
    branchGap = 34

    positions = {}

    def layout_visible_descendants(parent, side, parentX, top, bottom):
        children = vis_child_map.get(parent['id'], [])
        if not children:
            return
        weights = [leaf_units(c['id']) for c in children]
        total = sum(weights) or 1
        cursor = top
        for i, child in enumerate(children):
            span = (bottom - top) * (weights[i] / total)
            childTop = cursor
            childBottom = cursor + span
            childY = (childTop + childBottom) / 2
            size = sizes.get(child.get('kind', 'point'), sizes['point'])
            depthDelta = max(1, child.get('depth', 1) - parent.get('depth', 0))
            childX = parentX + side * depthIndent * depthDelta
            positions[child['id']] = {
                'x': childX, 'y': childY, 'width': size[0], 'height': size[1], 'outward': side
            }
            layout_visible_descendants(child, side, childX, childTop, childBottom)
            cursor = childBottom

    # 1. SG
    sg_root = next((n for n in visible_nodes if n.get('bookId') == 'sg' and n.get('kind') == 'book'), None)
    sg_chapters = [n for n in visible_nodes if n.get('bookId') == 'sg' and n.get('kind') == 'chapter']
    sg_chapters.sort(key=lambda n: (n.get('timelineRank', 0), n.get('order', 0)))

    if sg_root:
        positions[sg_root['id']] = {
            'x': centerX, 'y': timelineTop - timelineRootGap, 'width': sizes['book'][0], 'height': sizes['book'][1], 'outward': 1
        }

    cursorY = timelineTop
    lastPeriod = None
    period_map = {p['id']: p for p in periods}

    for chapter in sg_chapters:
        leaves = leaf_units(chapter['id'])
        blockHeight = max(timelineChapterGap, leaves * branchLeafGap + branchPadding * 2)
        if lastPeriod and chapter.get('periodId') and chapter['periodId'] != lastPeriod:
            cursorY += periodGap
        chapterY = cursorY + blockHeight / 2
        side = 1 if (chapter.get('order', 0) % 2 == 0) else -1
        positions[chapter['id']] = {
            'x': centerX, 'y': chapterY, 'width': sizes['chapter'][0], 'height': sizes['chapter'][1], 'outward': side
        }
        lastPeriod = chapter.get('periodId') or lastPeriod

        children = vis_child_map.get(chapter['id'], [])
        if children:
            branchX = centerX + side * sgBranchOffset
            totalWeights = sum(leaf_units(c['id']) for c in children) or 1
            branchCursor = chapterY - (blockHeight - branchPadding * 2) / 2
            usable = blockHeight - branchPadding * 2
            for child in children:
                weight = leaf_units(child['id'])
                span = usable * weight / totalWeights
                cTop = branchCursor
                cBottom = branchCursor + span
                cY = (cTop + cBottom) / 2
                cSize = sizes.get(child['kind'], sizes['section'])
                positions[child['id']] = {
                    'x': branchX, 'y': cY, 'width': cSize[0], 'height': cSize[1], 'outward': side
                }
                layout_visible_descendants(child, side, branchX, cTop, cBottom)
                branchCursor = cBottom
        cursorY += blockHeight

    timeline_y1 = positions[sg_root['id']]['y'] + sizes['book'][1] / 2 if sg_root else timelineTop
    timeline_y2 = positions[sg_chapters[-1]['id']]['y'] if sg_chapters else timelineTop + 300

    # Anchors
    sgChapterYById = {ch['id']: positions[ch['id']]['y'] for ch in sg_chapters if ch['id'] in positions}
    def anchorY(aid):
        node = node_map.get(aid)
        guard = set()
        while node and node['id'] not in guard:
            guard.add(node['id'])
            if node.get('bookId') == 'sg' and node.get('kind') == 'chapter':
                return sgChapterYById.get(node['id'])
            pid = node.get('parentId')
            node = node_map.get(pid) if pid else None
        return None

    anchorCache = {}
    def descendantAnchorYs(nid):
        if nid in anchorCache:
            return anchorCache[nid]
        node = node_map.get(nid)
        if not node:
            return []
        ys = []
        for aid in node.get('layoutAnchorIds', []):
            y = anchorY(aid)
            if y is not None:
                ys.append(y)
        for cid in children_map.get(nid, []):
            ys.extend(descendantAnchorYs(cid))
        anchorCache[nid] = ys
        return ys

    def median(vals):
        if not vals:
            return None
        arr = sorted(vals)
        m = len(arr) // 2
        return arr[m] if len(arr) % 2 else (arr[m-1] + arr[m]) / 2

    # 3. Non-SG Books
    nonSgBooks = [b for b in books if b['id'] != 'sg']
    # Group books by side and sort by laneIndex
    by_side = {'left': [], 'right': []}
    for b in nonSgBooks:
        side_key = 'left' if b.get('side') == 'left' else 'right'
        lane_idx = max(0, abs(b.get('lane', 1)) - 1)
        by_side[side_key].append((lane_idx, b))
    for side_key in by_side:
        by_side[side_key].sort(key=lambda item: item[0])

    for side_key, book_items in by_side.items():
        side = -1 if side_key == 'left' else 1
        current_lane_edge = bookBaseOffset

        for lane_idx, book in book_items:
            bookRoot = next((n for n in visible_nodes if n.get('bookId') == book['id'] and n.get('kind') == 'book'), None)
            if not bookRoot:
                continue

            chapters = [n for n in vis_child_map.get(bookRoot['id'], []) if n.get('kind') == 'chapter']
            # SORT CHAPTERS BY TEXTBOOK ORDER to prevent inversion
            chapters.sort(key=lambda n: n.get('order', 0))

            chapterUnits = []
            for i, ch in enumerate(chapters):
                ys = descendantAnchorYs(ch['id'])
                tY = median(ys)
                if tY is None:
                    tY = timelineTop + 160 + i * 150
                leaves = leaf_units(ch['id'])
                height = max(72, leaves * branchLeafGap + branchPadding * 2)
                chapterUnits.append({
                    'chapter': ch, 'targetY': tY, 'height': height, 'y': tY
                })

            # Monotonic anchor adjustment before collision push-down
            for i in range(1, len(chapterUnits)):
                min_tY = chapterUnits[i-1]['y'] + chapterUnits[i-1]['height'] / 2 + branchGap + chapterUnits[i]['height'] / 2
                if chapterUnits[i]['y'] < min_tY:
                    chapterUnits[i]['y'] = min_tY

            # 1D collision push-down
            for i in range(1, len(chapterUnits)):
                prev = chapterUnits[i-1]
                curr = chapterUnits[i]
                minY = prev['y'] + prev['height'] / 2 + branchGap + curr['height'] / 2
                if curr['y'] < minY:
                    curr['y'] = minY

            # Prevent stack drift
            if chapterUnits:
                desired = median([u['targetY'] for u in chapterUnits])
                actual = median([u['y'] for u in chapterUnits])
                shift = (desired if desired is not None else actual) - (actual if actual is not None else desired)
                for u in chapterUnits:
                    u['y'] += shift

            # Calculate rootX for this book based on current_lane_edge
            rootSize = sizes['book']
            rootX = side * (current_lane_edge + rootSize[0] / 2)
            rootY = median([u['y'] for u in chapterUnits])
            if rootY is None:
                rootY = (timeline_y1 + timeline_y2) / 2

            positions[bookRoot['id']] = {
                'x': rootX, 'y': rootY, 'width': rootSize[0], 'height': rootSize[1], 'outward': side
            }

            # Layout chapters and descendants
            max_depth_seen = 0
            for u in chapterUnits:
                ch = u['chapter']
                chX = rootX + side * depthIndent
                chSize = sizes['chapter']
                positions[ch['id']] = {
                    'x': chX, 'y': u['y'], 'width': chSize[0], 'height': chSize[1], 'outward': side
                }
                top = u['y'] - u['height'] / 2 + branchPadding
                bottom = u['y'] + u['height'] / 2 - branchPadding
                layout_visible_descendants(ch, side, chX, top, bottom)

            # Determine maximum reach of this book's visible nodes
            book_nodes = [n for n in visible_nodes if n.get('bookId') == book['id'] and n['id'] in positions]
            if book_nodes:
                book_max_reach = max(abs(positions[n['id']]['x']) + positions[n['id']]['width'] / 2 for n in book_nodes)
                current_lane_edge = book_max_reach + 48  # 48px margin before next lane
            else:
                current_lane_edge += sizes['book'][0] + 48

    # 4. Fallback
    fallback = 0
    for node in visible_nodes:
        if node['id'] not in positions:
            size = sizes.get(node.get('kind', 'point'), sizes['point'])
            positions[node['id']] = {
                'x': 0, 'y': timeline_y2 + 180 + fallback * 60, 'width': size[0], 'height': size[1], 'outward': 1
            }
            fallback += 1

    return positions, visible_nodes

# Test 1: Initial View
init_exp = set(n['id'] for n in nodes if n.get('kind') == 'book')
pos_init, vis_init = simulate_layout(init_exp)

def check_2d_collisions(pos_dict, vnodes):
    boxes = []
    for n in vnodes:
        p = pos_dict.get(n['id'])
        if not p:
            continue
        boxes.append({
            'id': n['id'],
            'l': p['x'] - p['width'] / 2,
            'r': p['x'] + p['width'] / 2,
            't': p['y'] - p['height'] / 2,
            'b': p['y'] + p['height'] / 2
        })
    cols = []
    for i in range(len(boxes)):
        for j in range(i + 1, len(boxes)):
            a = boxes[i]
            b = boxes[j]
            xo = max(0, min(a['r'], b['r']) - max(a['l'], b['l']))
            yo = max(0, min(a['b'], b['b']) - max(a['t'], b['t']))
            if xo > 1 and yo > 1:
                cols.append(f"{a['id']} overlaps {b['id']} (xo={xo:.1f}, yo={yo:.1f})")
    return cols

cols_init = check_2d_collisions(pos_init, vis_init)
print(f"1. Initial view (58 nodes) collisions: {len(cols_init)}")
if cols_init:
    print("   Sample:", cols_init[:5])

# Test 2: Expand SG Chapter 1 + Section 1
exp_sg1 = set(init_exp)
exp_sg1.add('pol.sg.c01')
exp_sg1.add('pol.sg.c01.s01')
pos_sg1, vis_sg1 = simulate_layout(exp_sg1)
cols_sg1 = check_2d_collisions(pos_sg1, vis_sg1)
print(f"2. SG c01 + s01 expanded ({len(vis_sg1)} nodes) collisions: {len(cols_sg1)}")
if cols_sg1:
    print("   Sample:", cols_sg1[:5])

# Test 3: Expand ALL 52 chapters
exp_all_ch = set(init_exp)
for n in nodes:
    if n.get('kind') == 'chapter':
        exp_all_ch.add(n['id'])
pos_all_ch, vis_all_ch = simulate_layout(exp_all_ch)
cols_all_ch = check_2d_collisions(pos_all_ch, vis_all_ch)
print(f"3. All 52 chapters expanded ({len(vis_all_ch)} nodes) collisions: {len(cols_all_ch)}")
if cols_all_ch:
    print("   Sample:", cols_all_ch[:5])

# Test 4: Expand FULL TREE (all 692 nodes)
exp_full = set(n['id'] for n in nodes)
pos_full, vis_full = simulate_layout(exp_full)
cols_full = check_2d_collisions(pos_full, vis_full)
print(f"4. Full tree (692 nodes) collisions: {len(cols_full)}")
if cols_full:
    print("   Sample:", cols_full[:5])

# Check chapter order for all books
for b in books:
    b_chs = [n for n in vis_init if n.get('bookId') == b['id'] and n.get('kind') == 'chapter']
    b_chs.sort(key=lambda n: pos_init[n['id']]['y'])
    orders = [n.get('order', 0) for n in b_chs]
    is_sorted = orders == sorted(orders)
    print(f"Book {b['id']} chapter order: {orders} (monotonic: {is_sorted})")
