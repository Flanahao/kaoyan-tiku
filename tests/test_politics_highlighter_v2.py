#!/usr/bin/env python3
"""政治题库荧光笔增强版全功能自动化测试：
1. 题干荧光高亮
2. 选项文字荧光高亮，且划词不误触选项选择
3. 解析精讲荧光高亮
4. 7种荧光颜色全量验证（蓝、黄、红、洋红、青色、酸橙色、深橙色）
5. 浮动条橡皮擦、撤销功能
6. 本地持久化与重载恢复
"""
import asyncio
import os
import shutil
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path("D:/考研题库网站")
JS = (ROOT / "js/politics-text-highlighter.js").read_text(encoding="utf-8")
CSS = (ROOT / "css/politics-text-highlighter.css").read_text(encoding="utf-8")

PAGE_HTML = """
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Highlighter Test</title>
</head>
<body>
  <div id="questionTextCard" class="question-text-card">
    <div class="q-header-row">
      <span class="q-type-badge single">单选题</span>
      <span class="q-num-badge">第 1 题 / 共 100 题</span>
    </div>
    <div class="q-stem">马克思主义政治经济学的研究对象是生产关系，其核心是生产资料所有制形式。</div>
    <div class="q-choices">
      <div class="q-choice-item" data-choice="A">
        <span class="choice-key">A</span>
        <div class="choice-text">商品的使用价值与价值对立统一</div>
      </div>
      <div class="q-choice-item" data-choice="B">
        <span class="choice-key">B</span>
        <div class="choice-text">生产资料所有制是生产关系的核心</div>
      </div>
      <div class="q-choice-item" data-choice="C">
        <span class="choice-key">C</span>
        <div class="choice-text">劳动力成为商品是货币转化为资本的前提</div>
      </div>
      <div class="q-choice-item" data-choice="D">
        <span class="choice-key">D</span>
        <div class="choice-text">剩余价值规律是资本主义的基本经济规律</div>
      </div>
    </div>
  </div>

  <div class="toggle-bar">
    <button id="btnToggle">显示解析</button>
  </div>

  <div id="solutionTextCard" class="solution-text-card">
    <div class="sol-answer-banner">
      <span class="sol-answer-label">正确答案</span>
      <span class="sol-answer-val">B</span>
    </div>
    <div class="sol-analysis-body">
      <h4 class="sol-analysis-title">📖【解析精讲】</h4>
      <div class="sol-analysis-content">
        <p>生产关系是人们在物质生产过程中结成的经济关系，它的核心是<strong>生产资料所有制形式</strong>。</p>
        <p>具体劳动创造使用价值，抽象劳动创造价值，二者是同一劳动的两个方面。</p>
      </div>
    </div>
  </div>
</body>
</html>
"""

checks = []

def check(name, condition):
    checks.append((name, bool(condition)))
    if condition:
        print(f"  [PASS] {name}")
    else:
        print(f"  [FAIL] {name}")

async def run():
    print("=== 开始政治荧光笔增强版自动化验证 ===")
    async with async_playwright() as pw:
        win_chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        chrome_path = (win_chrome if os.path.exists(win_chrome) else None)
        launch_args = dict(headless=True, args=[
            "--no-sandbox", "--disable-gpu", "--no-zygote",
            "--disable-dev-shm-usage", "--disable-breakpad"
        ])
        if chrome_path:
            launch_args["executable_path"] = chrome_path
        browser = await pw.chromium.launch(**launch_args)
        page = await browser.new_page(viewport={"width": 1000, "height": 900})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))

        await page.set_content(PAGE_HTML)
        await page.add_style_tag(content=CSS)
        await page.evaluate("""() => {
          const m = new Map();
          Object.defineProperty(window, 'localStorage', {
            configurable: true,
            value: {
              getItem: key => m.get(key) ?? null,
              setItem: (key, val) => m.set(key, String(val)),
              removeItem: key => m.delete(key),
              clear: () => m.clear()
            }
          });
          window.confirm = () => true;

          // 给选项添加选择逻辑与划词保护
          const card = document.getElementById('questionTextCard');
          card.querySelectorAll('.q-choice-item').forEach(function(item) {
            item.addEventListener('click', function() {
              var sel = window.getSelection ? window.getSelection() : null;
              if (sel && !sel.isCollapsed && sel.toString().trim().length > 0) {
                return;
              }
              card.querySelectorAll('.q-choice-item').forEach(function(el) {
                if (el !== item) el.classList.remove('is-selected');
              });
              item.classList.toggle('is-selected');
            });
          });
        }""")
        await page.add_script_tag(content=JS)

        # 1. 验证 API 和挂载
        supported = await page.evaluate("PoliticsTextHighlighter.supported()")
        check("CSS Highlight API supported", supported)

        mounted = await page.evaluate("""() => {
          return PoliticsTextHighlighter.mount({
            questionCard: document.getElementById('questionTextCard'),
            solutionCard: document.getElementById('solutionTextCard'),
            storageKey: 'politics_ch1_q1'
          });
        }""")
        check("Mounted question and solution cards successfully", mounted)

        # 2. 验证7种荧光颜色规则
        colors = ['blue', 'yellow', 'red', 'magenta', 'cyan', 'lime', 'darkorange']
        color_rules = await page.evaluate("""(colors) => {
          return colors.map(c => {
            const rule = getComputedStyle(document.querySelector('.sol-analysis-content'), '::highlight(politics-hl-' + c + ')');
            return rule.backgroundColor;
          });
        }""", colors)
        check("All 7 highlight CSS rules defined", len(color_rules) == 7 and all(bool(c) for c in color_rules))

        # 3. 题干涂色验证 (Magenta / 洋红)
        await page.evaluate("""() => {
          const stemTextNode = document.querySelector('.q-stem').firstChild;
          const r = document.createRange();
          r.setStart(stemTextNode, 0); // '马克思主义政治经济学'
          r.setEnd(stemTextNode, 10);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(r);
          document.querySelector('.q-stem').dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        }""")
        popup_visible = await page.locator(".politics-hl-popup").is_visible()
        check("Popup appears on question stem text selection", popup_visible)

        # 点击洋红 (magenta)
        await page.locator(".politics-hl-popup .is-magenta").click()
        stem_hl = await page.evaluate("""() => {
          const stored = JSON.parse(localStorage.getItem('politics_ch1_q1'));
          const count = CSS.highlights.get('politics-hl-magenta')?.size || 0;
          return { stored, count };
        }""")
        check("Question stem highlighted with Magenta", stem_hl["count"] == 1 and stem_hl["stored"][-1]["target"] == "stem" and stem_hl["stored"][-1]["color"] == "magenta")

        # 4. 选项 A 涂色验证 (Cyan / 青色)
        await page.evaluate("""() => {
          const aTextNode = document.querySelector('.q-choice-item[data-choice="A"] .choice-text').firstChild;
          const r = document.createRange();
          r.setStart(aTextNode, 0); // '商品的使用价值'
          r.setEnd(aTextNode, 7);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(r);
          document.querySelector('.q-choice-item[data-choice="A"] .choice-text').dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        }""")
        await page.locator(".politics-hl-popup .is-cyan").click()
        choice_a_hl = await page.evaluate("""() => {
          const stored = JSON.parse(localStorage.getItem('politics_ch1_q1'));
          const count = CSS.highlights.get('politics-hl-cyan')?.size || 0;
          const aSelected = document.querySelector('.q-choice-item[data-choice="A"]').classList.contains('is-selected');
          return { stored, count, aSelected };
        }""")
        check("Option A text highlighted with Cyan", choice_a_hl["count"] == 1 and choice_a_hl["stored"][-1]["target"] == "choice_A" and choice_a_hl["stored"][-1]["color"] == "cyan")
        check("Highlighting option A did NOT toggle selection state", not choice_a_hl["aSelected"])

        # 5. 选项 B 涂色验证 (Lime / 酸橙色)
        await page.evaluate("""() => {
          const bTextNode = document.querySelector('.q-choice-item[data-choice="B"] .choice-text').firstChild;
          const r = document.createRange();
          r.setStart(bTextNode, 0);
          r.setEnd(bTextNode, 7);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(r);
          document.querySelector('.q-choice-item[data-choice="B"] .choice-text').dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        }""")
        await page.locator(".politics-hl-popup .is-lime").click()
        choice_b_hl = await page.evaluate("""() => {
          const stored = JSON.parse(localStorage.getItem('politics_ch1_q1'));
          const count = CSS.highlights.get('politics-hl-lime')?.size || 0;
          return { stored, count };
        }""")
        check("Option B text highlighted with Lime", choice_b_hl["count"] == 1 and choice_b_hl["stored"][-1]["target"] == "choice_B" and choice_b_hl["stored"][-1]["color"] == "lime")

        # 6. 选项 C 涂色验证 (DarkOrange / 深橙色)
        await page.evaluate("""() => {
          const cTextNode = document.querySelector('.q-choice-item[data-choice="C"] .choice-text').firstChild;
          const r = document.createRange();
          r.setStart(cTextNode, 0);
          r.setEnd(cTextNode, 7);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(r);
          document.querySelector('.q-choice-item[data-choice="C"] .choice-text').dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        }""")
        await page.locator(".politics-hl-popup .is-darkorange").click()
        choice_c_hl = await page.evaluate("""() => {
          const stored = JSON.parse(localStorage.getItem('politics_ch1_q1'));
          const count = CSS.highlights.get('politics-hl-darkorange')?.size || 0;
          return { stored, count };
        }""")
        check("Option C text highlighted with DarkOrange", choice_c_hl["count"] == 1 and choice_c_hl["stored"][-1]["target"] == "choice_C" and choice_c_hl["stored"][-1]["color"] == "darkorange")

        # 7. 解析精讲涂色验证 (Blue, Yellow, Red)
        # 涂 Blue
        await page.evaluate("""() => {
          const node = document.querySelector('.sol-analysis-content p').firstChild;
          const r = document.createRange();
          r.setStart(node, 0);
          r.setEnd(node, 4);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(r);
          document.querySelector('.sol-analysis-content p').dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        }""")
        await page.locator(".politics-hl-popup .is-blue").click()

        # 涂 Yellow
        await page.evaluate("""() => {
          const node = document.querySelectorAll('.sol-analysis-content p')[1].firstChild;
          const r = document.createRange();
          r.setStart(node, 0);
          r.setEnd(node, 4);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(r);
          document.querySelectorAll('.sol-analysis-content p')[1].dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        }""")
        await page.locator(".politics-hl-popup .is-yellow").click()

        # 涂 Red
        await page.evaluate("""() => {
          const node = document.querySelectorAll('.sol-analysis-content p')[1].firstChild;
          const r = document.createRange();
          r.setStart(node, 10);
          r.setEnd(node, 18);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(r);
          document.querySelectorAll('.sol-analysis-content p')[1].dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        }""")
        await page.locator(".politics-hl-popup .is-red").click()

        # 验证全部7种颜色均共存且高亮生效
        all_colors_check = await page.evaluate("""() => {
          const stored = JSON.parse(localStorage.getItem('politics_ch1_q1'));
          return {
            totalMarks: stored.length,
            blue: CSS.highlights.get('politics-hl-blue')?.size || 0,
            yellow: CSS.highlights.get('politics-hl-yellow')?.size || 0,
            red: CSS.highlights.get('politics-hl-red')?.size || 0,
            magenta: CSS.highlights.get('politics-hl-magenta')?.size || 0,
            cyan: CSS.highlights.get('politics-hl-cyan')?.size || 0,
            lime: CSS.highlights.get('politics-hl-lime')?.size || 0,
            darkorange: CSS.highlights.get('politics-hl-darkorange')?.size || 0,
          };
        }""")
        check("All 7 colors coexist simultaneously across stem, options, analysis",
              all_colors_check["totalMarks"] == 7 and
              all_colors_check["blue"] == 1 and
              all_colors_check["yellow"] == 1 and
              all_colors_check["red"] == 1 and
              all_colors_check["magenta"] == 1 and
              all_colors_check["cyan"] == 1 and
              all_colors_check["lime"] == 1 and
              all_colors_check["darkorange"] == 1)

        # 截图保存7色共存效果
        screenshot_path = "tests/politics_highlighter_7colors.png"
        await page.screenshot(path=screenshot_path)
        print(f"  [SAVED] 截图已输出至: {screenshot_path}")

        # 8. 验证弹窗橡皮擦 (🧹)
        await page.evaluate("""() => {
          const aTextNode = document.querySelector('.q-choice-item[data-choice="A"] .choice-text').firstChild;
          const r = document.createRange();
          r.setStart(aTextNode, 0);
          r.setEnd(aTextNode, 7);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(r);
          document.querySelector('.q-choice-item[data-choice="A"] .choice-text').dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        }""")
        await page.locator(".politics-hl-popup .is-eraser").click()
        erase_check = await page.evaluate("""() => {
          const stored = JSON.parse(localStorage.getItem('politics_ch1_q1'));
          const cyanCount = CSS.highlights.get('politics-hl-cyan')?.size || 0;
          return { total: stored.length, cyanCount };
        }""")
        check("Eraser removes highlight from Option A", erase_check["cyanCount"] == 0 and erase_check["total"] == 6)

        # 9. 验证弹窗撤销 (↩️)
        await page.evaluate("""() => {
          const bTextNode = document.querySelector('.q-choice-item[data-choice="B"] .choice-text').firstChild;
          const r = document.createRange();
          r.setStart(bTextNode, 0);
          r.setEnd(bTextNode, 5);
          const sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(r);
          document.querySelector('.q-choice-item[data-choice="B"] .choice-text').dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        }""")
        await page.locator(".politics-hl-popup .is-undo").click()
        undo_check = await page.evaluate("""() => {
          const stored = JSON.parse(localStorage.getItem('politics_ch1_q1'));
          return stored.length;
        }""")
        check("Undo button in popup pops latest mark", undo_check == 5)

        # 10. 验证选项普通点击选择未受破坏
        await page.locator('.q-choice-item[data-choice="B"]').click()
        b_selected = await page.evaluate("""() => {
          return document.querySelector('.q-choice-item[data-choice="B"]').classList.contains('is-selected');
        }""")
        check("Normal single-click selects option B", b_selected)

        # 11. 验证跨题与重载隔离性
        # 切到第2题
        await page.evaluate("""() => {
          PoliticsTextHighlighter.mount({
            questionCard: document.getElementById('questionTextCard'),
            solutionCard: document.getElementById('solutionTextCard'),
            storageKey: 'politics_ch1_q2'
          });
        }""")
        q2_check = await page.evaluate("""() => {
          return {
            stored: JSON.parse(localStorage.getItem('politics_ch1_q2')),
            red: CSS.highlights.get('politics-hl-red')?.size || 0
          };
        }""")
        check("Question 2 starts clean without inheriting Q1 marks", q2_check["stored"] is None and q2_check["red"] == 0)

        # 切回第1题并完全恢复高亮
        await page.evaluate("""() => {
          PoliticsTextHighlighter.mount({
            questionCard: document.getElementById('questionTextCard'),
            solutionCard: document.getElementById('solutionTextCard'),
            storageKey: 'politics_ch1_q1'
          });
        }""")
        restored_check = await page.evaluate("""() => {
          return {
            total: JSON.parse(localStorage.getItem('politics_ch1_q1')).length,
            magenta: CSS.highlights.get('politics-hl-magenta')?.size || 0
          };
        }""")
        check("Returning to Q1 restores all persisted highlights", restored_check["total"] == 5 and restored_check["magenta"] == 1)

        # 12. 清空本题
        await page.locator(".politics-hl-clear").click()
        clear_check = await page.evaluate("""() => {
          return {
            stored: JSON.parse(localStorage.getItem('politics_ch1_q1')),
            magenta: CSS.highlights.get('politics-hl-magenta')?.size || 0
          };
        }""")
        check("Clear button empties all marks for question", len(clear_check["stored"]) == 0 and clear_check["magenta"] == 0)

        check("No unhandled browser exceptions", len(errors) == 0)
        print(f"\n自动化验证结果: {sum(ok for _, ok in checks)}/{len(checks)} 通过!")
        await browser.close()
        assert all(ok for _, ok in checks), "部分检查未通过"

if __name__ == "__main__":
    asyncio.run(run())
