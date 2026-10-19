#!/usr/bin/env python3
"""独立浏览器交互测试；需要 pip install playwright 和本机 Chromium。"""
import asyncio
import os
import shutil
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
JS = (ROOT / "js/politics-text-highlighter.js").read_text(encoding="utf-8")
CSS = (ROOT / "css/politics-text-highlighter.css").read_text(encoding="utf-8")
ANALYSIS_HTML = (
    "<div class='sol-answer-banner'>正确答案 <b>B</b></div>"
    "<div class='sol-analysis-body'>"
    "<h4 class='sol-analysis-title'>📖【解析精讲】</h4>"
    "<div class='sol-analysis-content'>"
    "<p>商品的劳动具有二重性，即<strong>具体劳动和抽象劳动</strong>。</p>"
    "<p>在商品生产中，抽象劳动创造价值。</p>"
    "</div></div>"
)
checks = []

def check(name, condition):
    checks.append((name, bool(condition)))
    if not condition:
        print("FAIL:", name)

async def select_range(page, start_selector, start_offset, end_selector, end_offset, mouse_target):
    return await page.evaluate("""({ss,so,es,eo,mouse}) => {
        const a = document.querySelector(ss).firstChild;
        const b = document.querySelector(es).firstChild;
        const r = document.createRange();
        r.setStart(a,so);
        r.setEnd(b,eo);
        const select=window.getSelection();
        select.removeAllRanges();
        select.addRange(r);
        document.querySelector(mouse).dispatchEvent(
          new MouseEvent('mouseup', {bubbles:true})
        );
        const body = document.querySelector('.sol-analysis-content');
        const pos=PoliticsTextHighlighter.getOffsets(body,r);
        const back=pos && PoliticsTextHighlighter.rangeFromOffsets(body,pos.start,pos.end);
        return {original:r.toString(), restored:back && back.toString()};
    }""", {
        "ss":start_selector, "so":start_offset,
        "es":end_selector, "eo":end_offset, "mouse":mouse_target
    })

async def run():
    async with async_playwright() as pw:
        win_chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        chrome_path = (os.environ.get("CHROMIUM_PATH") or shutil.which("chromium")
                       or shutil.which("chromium-browser") or shutil.which("google-chrome")
                       or (win_chrome if os.path.exists(win_chrome) else None))
        launch_args = dict(headless=True, args=[
            "--no-sandbox", "--disable-gpu", "--no-zygote",
            "--disable-dev-shm-usage", "--disable-breakpad"
        ])
        if chrome_path:
            launch_args["executable_path"] = chrome_path
        browser = await pw.chromium.launch(**launch_args)
        page = await browser.new_page(viewport={"width":900,"height":750})
        errors = []
        page.on("pageerror", lambda error: errors.append(str(error)))
        await page.set_content(
            "<div id='solutionTextCard'>" + ANALYSIS_HTML + "</div>"
            "<div id='questionTextCard'>题干，无法荧光标注。</div>"
            "<div id='mastery'>模糊</div>"
        )
        await page.add_style_tag(content=CSS)
        await page.evaluate("""() => {
          const m = new Map();
          Object.defineProperty(window,'localStorage',{configurable:true,value:{
            getItem:key=>m.get(key)??null,
            setItem:(key,val)=>m.set(key,String(val)),
            removeItem:key=>m.delete(key)
          }});
          window.confirm=()=>true;
        }""")
        await page.add_script_tag(content=JS)
        check("API exists and CSS highlights supported",
              await page.evaluate("PoliticsTextHighlighter.supported()"))
        check("mount successfully",
              await page.evaluate("""PoliticsTextHighlighter.mount(
                document.querySelector('#solutionTextCard'),'ch1-q1')"""))
        checks_colors = await page.evaluate("""() => ['blue','yellow','red'].map(color => {
          const rule=getComputedStyle(document.querySelector('.sol-analysis-content'),
                   '::highlight(politics-hl-'+color+')');
          return rule.backgroundColor;
        })""")
        check("three vivid color rules are available", all("rgba(" in x or "rgb(" in x for x in checks_colors))
        check("invalid persisted records are ignored",
              await page.evaluate("""() => {
                const cleaned = PoliticsTextHighlighter.normalizedMarks([
                  {start:0,end:1,quote:'商',color:'blue'},
                  {start:-1,end:2,quote:'x',color:'red'},
                  {start:2,end:2,quote:'',color:'green'}
                ]);
                return cleaned.length===1 && cleaned[0].color==='blue';
              }"""))

        select_info = await select_range(
            page,'.sol-analysis-content p',2,'.sol-analysis-content strong',6,
            '.sol-analysis-content p')
        check("cross-element offset roundtrip",
              select_info["original"]==select_info["restored"])
        check("selection shows color popup",
              await page.locator(".politics-hl-popup").is_visible())
        await page.locator(".politics-hl-popup .is-blue").click()
        first = await page.evaluate("""() => ({
          stored:JSON.parse(localStorage.getItem('ch1-q1')),
          blue:CSS.highlights.get('politics-hl-blue')?.size||0,
          count:document.querySelector('.politics-hl-count').textContent,
          answer:document.querySelector('.sol-answer-banner').textContent,
          mastery:document.querySelector('#mastery').textContent,
          markTags:document.querySelectorAll('.sol-analysis-content mark').length
        })""")
        check("blue stored", len(first["stored"])==1 and first["stored"][0]["color"]=="blue")
        check("blue visible in native registry", first["blue"]==1)
        check("mark count updated", "1" in first["count"])
        check("correct answer remains unchanged", "B" in first["answer"])
        check("mastery remains fuzzy", first["mastery"]=="模糊")
        check("Markdown DOM untouched (no injected mark elements)",first["markTags"]==0)

        # 第二段加黄色
        await select_range(page,'.sol-analysis-content p:nth-child(2)',0,
                           '.sol-analysis-content p:nth-child(2)',7,
                           '.sol-analysis-content p:nth-child(2)')
        await page.locator(".politics-hl-popup .is-yellow").click()
        check("blue/yellow coexist",
              await page.evaluate("""() => (
                (CSS.highlights.get('politics-hl-blue')?.size||0)===1 &&
                (CSS.highlights.get('politics-hl-yellow')?.size||0)===1
              )"""))

        # 同一范围重新涂红色：要覆盖之前的黄色，不重复添加
        await select_range(page,'.sol-analysis-content p:nth-child(2)',0,
                           '.sol-analysis-content p:nth-child(2)',7,
                           '.sol-analysis-content p:nth-child(2)')
        await page.locator(".politics-hl-popup .is-red").click()
        repaint = await page.evaluate("""() => ({
           arr:JSON.parse(localStorage.getItem('ch1-q1')),
           red:CSS.highlights.get('politics-hl-red')?.size||0,
           yellow:CSS.highlights.get('politics-hl-yellow')?.size||0
        })""")
        check("same text repainted red without duplicate",
              len(repaint["arr"])==2 and repaint["red"]==1 and repaint["yellow"]==0)

        # 不允许高亮答案、题目、解析标题
        outside = await page.evaluate("""() => {
          const text=document.querySelector('.sol-answer-banner').firstChild;
          const r=document.createRange();r.setStart(text,0);r.setEnd(text,4);
          const s=getSelection();s.removeAllRanges();s.addRange(r);
          document.querySelector('.sol-answer-banner').dispatchEvent(new MouseEvent('mouseup',{bubbles:true}));
          return document.querySelector('.politics-hl-popup').hidden;
        }""")
        check("answer banner cannot be highlighted", outside)

        # 撤销和清空
        await page.locator(".politics-hl-undo").click()
        check("undo removes latest red",
              await page.evaluate("""() => CSS.highlights.get('politics-hl-red')===undefined &&
                   JSON.parse(localStorage.getItem('ch1-q1')).length===1"""))
        # 加黄色，保证刷新和切题回来时可恢复（原始 DOM 不破坏）
        await select_range(page,'.sol-analysis-content p:nth-child(2)',0,
                           '.sol-analysis-content p:nth-child(2)',7,
                           '.sol-analysis-content p:nth-child(2)')
        await page.locator(".politics-hl-popup .is-yellow").click()

        # 模拟下一题：替换解析 DOM，挂载不同 key
        jump = await page.evaluate("""() => {
          const box=document.getElementById('solutionTextCard');
          window.__original=box.innerHTML
              .replace(/<div class="politics-hl-controls">[\s\S]*?<\/div>/,'');
          // 避免从旧 HTML 拷贝控制条，用测试输入的简化原始正文。
          box.innerHTML='<div class="sol-analysis-body"><h4 class="sol-analysis-title">解析精讲</h4>'+
             '<div class="sol-analysis-content">另一道题的解析文字，绝不串题。</div></div>';
          PoliticsTextHighlighter.mount(box,'ch1-q2');
          return {
            blue:CSS.highlights.get('politics-hl-blue')===undefined,
            yellow:CSS.highlights.get('politics-hl-yellow')===undefined,
            count:document.querySelector('.politics-hl-count').textContent
          };
        }""")
        check("next question does not inherit marks",
              jump["blue"] and jump["yellow"] and "0" in jump["count"])

        # 切回原题，回复原始文本及相同 key
        await page.evaluate("""(html) => {
          const card=document.getElementById('solutionTextCard');
          card.innerHTML=html;
          PoliticsTextHighlighter.mount(card,'ch1-q1');
        }""", ANALYSIS_HTML)
        restored = await page.evaluate("""() => ({
          blue: CSS.highlights.get('politics-hl-blue')?.size||0,
          yellow: CSS.highlights.get('politics-hl-yellow')?.size||0,
          count:document.querySelector('.politics-hl-count').textContent,
          buttons:document.querySelectorAll('.politics-hl-undo').length
        })""")
        check("return to question restores blue and yellow",
              restored["blue"]==1 and restored["yellow"]==1)
        check("remount does not duplicate controls",restored["buttons"]==1)

        # 解析内容变更，同一个 key 不应按过期偏移上色
        await page.evaluate("""() => {
          const root=document.querySelector('.sol-analysis-content');
          root.textContent='全新的、与原解析内容无关的文本，旧偏移不能误涂。';
          PoliticsTextHighlighter.mount(document.querySelector('#solutionTextCard'),'ch1-q1');
        }""")
        check("content mismatch safely skips outdated marks",
              await page.evaluate("""() => (
                CSS.highlights.get('politics-hl-blue')===undefined &&
                CSS.highlights.get('politics-hl-yellow')===undefined
              )"""))

        # 重挂同一现有 DOM 也不能产生多个控制条。
        await page.evaluate("""() =>
          PoliticsTextHighlighter.mount(
            document.getElementById('solutionTextCard'),'ch1-q1'
          )""")
        check("same-DOM repeated mount stays idempotent",
              await page.evaluate("""() =>
                document.querySelectorAll('.politics-hl-controls').length===1"""))
        await page.locator(".politics-hl-clear").click()
        check("clear current question and persist empty array",
              await page.evaluate("""() =>
                JSON.parse(localStorage.getItem('ch1-q1')).length===0"""))
        await page.evaluate("PoliticsTextHighlighter.reset()")
        check("reset unregisters all color overlays",
              await page.evaluate("""() => (
                CSS.highlights.get('politics-hl-blue')===undefined &&
                CSS.highlights.get('politics-hl-yellow')===undefined &&
                CSS.highlights.get('politics-hl-red')===undefined
              )"""))
        # 真正的鼠标左键按下—拖动—松开，而不是仅模拟 selection。
        await page.evaluate("""() => {
          const card=document.querySelector('#solutionTextCard');
          card.innerHTML='<div class="sol-analysis-body"><div class="sol-analysis-content">'+
          '<p style="font-size:22px;line-height:2">商品的劳动具有二重性，即具体劳动和抽象劳动。</p>'+
          '</div></div>';
          PoliticsTextHighlighter.mount(card,'real-mouse-drag');
        }""")
        coords = await page.evaluate("""() => {
          const text = document.querySelector('.sol-analysis-content p').firstChild;
          function caret(offset) {
            const r=document.createRange();r.setStart(text,offset);r.collapse(true);
            const x=r.getBoundingClientRect();
            return {x:x.x,y:x.y+x.height/2};
          }
          return {start:caret(2),end:caret(11)};
        }""")
        await page.mouse.move(coords["start"]["x"],coords["start"]["y"])
        await page.mouse.down()
        await page.mouse.move(coords["end"]["x"],coords["end"]["y"],steps=12)
        await page.mouse.up()
        dragged = await page.evaluate("""() => ({
          text:window.getSelection()?.toString(),
          menu:!document.querySelector('.politics-hl-popup').hidden
        })""")
        check("real left-button drag selects text", len(dragged["text"]) >= 5)
        check("real drag opens popup", dragged["menu"])
        await page.locator(".politics-hl-popup .is-red").click()
        check("real drag applies red highlight",
              await page.evaluate("""() => (
                JSON.parse(localStorage.getItem('real-mouse-drag'))[0]?.color === 'red' &&
                (CSS.highlights.get('politics-hl-red')?.size||0) === 1
              )"""))
        check("no browser runtime errors",len(errors)==0)
        print(f"Browser checks: {sum(ok for _,ok in checks)}/{len(checks)} passed")
        if errors: print("Browser errors:",errors)
        await browser.close()
        assert all(ok for _,ok in checks), "Some browser checks failed."

if __name__ == "__main__":
    asyncio.run(run())
