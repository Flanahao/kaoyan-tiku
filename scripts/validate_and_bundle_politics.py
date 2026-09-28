import os
import json

base_dir = r"d:\考研题库网站\data\politics"

def load_json(name):
    path = os.path.join(base_dir, name)
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

manifest = load_json("manifest.json")
books = load_json(manifest["books"])
periods = load_json(manifest["periods"])
relations = load_json(manifest["relations"])

nodes = []
for node_file in manifest["nodes"]:
    nodes.extend(load_json(node_file))

print(f"Loaded {len(books)} books, {len(periods)} periods, {len(relations)} relations, {len(nodes)} nodes.")

# Validation
errors = []

# 1. Books validation
book_ids = set()
for b in books:
    bid = b.get("id")
    if not bid:
        errors.append("Book missing id")
    elif bid in book_ids:
        errors.append(f"Duplicate bookId: {bid}")
    book_ids.add(bid)

# 2. Periods validation
period_ids = set()
for p in periods:
    pid = p.get("id")
    if not pid:
        errors.append("Period missing id")
    elif pid in period_ids:
        errors.append(f"Duplicate periodId: {pid}")
    period_ids.add(pid)
    if not isinstance(p.get("rankStart"), (int, float)) or not isinstance(p.get("rankEnd"), (int, float)):
        errors.append(f"Period {pid} missing numeric rankStart/rankEnd")

# 3. Duplicate node ID & Schema validation
node_ids = set()
node_map = {}
valid_kinds = {"book": 0, "chapter": 1, "section": 2, "point": 3}

for node in nodes:
    nid = node.get("id")
    if not nid:
        errors.append("Node missing id")
        continue
    elif nid in node_ids:
        errors.append(f"Duplicate node id: {nid}")
    node_ids.add(nid)
    node_map[nid] = node

    # Canonical purity
    if "style" in node or "x" in node or "y" in node:
        errors.append(f"Node {nid} violates canonical decoupling: contains style/x/y")

    # Kind and depth
    kind = node.get("kind")
    depth = node.get("depth")
    if kind not in valid_kinds:
        errors.append(f"Node {nid} invalid kind '{kind}'")
    elif depth != valid_kinds[kind]:
        errors.append(f"Node {nid} ({kind}) depth is {depth}, expected {valid_kinds[kind]}")

    if kind == "book":
        if node.get("parentId") is not None:
            errors.append(f"Book node {nid} must have null parentId")
    else:
        if not node.get("parentId"):
            errors.append(f"Non-book node {nid} ({kind}) missing parentId")

    # Book ID validity
    if node.get("bookId") not in book_ids:
        errors.append(f"Invalid bookId '{node.get('bookId')}' in node {nid}")

    # Order validation
    if not isinstance(node.get("order"), (int, float)):
        errors.append(f"Node {nid} missing numeric order")

    # TimelineRank for sg points
    if node.get("bookId") == "sg" and kind == "point":
        tr = node.get("timelineRank")
        if tr is None or not isinstance(tr, (int, float)):
            errors.append(f"Node {nid} in sg lacks valid timelineRank: {tr}")

    # periodId validity
    if node.get("periodId") and node.get("periodId") not in period_ids:
        errors.append(f"Node {nid} references invalid periodId '{node.get('periodId')}'")

# 4. Orphan parent & parent hierarchy consistency
parent_map = {}
for node in nodes:
    nid = node.get("id")
    pid = node.get("parentId")
    if pid is not None:
        if pid not in node_ids:
            errors.append(f"Orphan parentId '{pid}' in node {nid}")
        else:
            parent = node_map[pid]
            if parent.get("bookId") != node.get("bookId"):
                errors.append(f"Node {nid} cross-book hierarchy ({node.get('bookId')} -> {parent.get('bookId')})")
            if parent.get("depth") != node.get("depth", 0) - 1:
                errors.append(f"Node {nid} parent depth mismatch ({node.get('depth')} vs {parent.get('depth')})")
    parent_map[nid] = pid

# 5. Parent cycle detection
for nid in node_ids:
    visited = set()
    curr = nid
    while curr:
        if curr in visited:
            errors.append(f"Parent cycle detected involving {nid}")
            break
        visited.add(curr)
        curr = parent_map.get(curr)

# 6. Layout anchor validation
for node in nodes:
    anchors = node.get("layoutAnchorIds")
    if isinstance(anchors, list):
        for aid in anchors:
            if aid not in node_ids:
                errors.append(f"Node {node.get('id')} anchor '{aid}' not found in nodes")
            elif node_map[aid].get("bookId") != "sg":
                errors.append(f"Node {node.get('id')} anchor '{aid}' is not in sg")

# 7. Orphan relation source/target and duplicate relation ID
rel_ids = set()
for rel in relations:
    rid = rel.get("id")
    if not rid:
        errors.append("Relation missing id")
    elif rid in rel_ids:
        errors.append(f"Duplicate relation id: {rid}")
    rel_ids.add(rid)

    if "style" in rel:
        errors.append(f"Relation {rid} violates canonical decoupling: contains style field")

    src = rel.get("source")
    tgt = rel.get("target")
    if src not in node_ids:
        errors.append(f"Relation {rid} orphan source: {src}")
    if tgt not in node_ids:
        errors.append(f"Relation {rid} orphan target: {tgt}")

if errors:
    print(f"FAILED WITH {len(errors)} ERRORS:")
    for err in errors:
        print("  -", err)
    exit(1)
else:
    print("ALL DATA INTEGRITY CHECKS PASSED!")

# Generate bundle.js for Driver B (Static script driver)
bundle_content = f"""// Auto-generated static data bundle for Politics Mind Map
(function () {{
  window.__POLITICS_STATIC_DATA__ = {{
    manifest: {json.dumps(manifest, ensure_ascii=False, indent=2)},
    books: {json.dumps(books, ensure_ascii=False, indent=2)},
    periods: {json.dumps(periods, ensure_ascii=False, indent=2)},
    relations: {json.dumps(relations, ensure_ascii=False, indent=2)},
    nodes: {json.dumps(nodes, ensure_ascii=False, indent=2)}
  }};
}})();
"""

bundle_path = os.path.join(base_dir, "bundle.js")
with open(bundle_path, "w", encoding="utf-8") as f:
    f.write(bundle_content)

print(f"Generated bundle.js at {bundle_path} ({os.path.getsize(bundle_path)} bytes)")
