#!/usr/bin/env python3
"""Standalone Chromium UI regression tests. Requires Python Playwright."""
import asyncio
import os
import shutil
from pathlib import Path
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parent.parent
JS = (ROOT / 'js/politics-choice-notes.js').read_text(encoding='utf-8')
CSS = (ROOT / 'css/politics-choice-notes.css').read_text(encoding='utf-8')

# The same CSS classes and selection listeners as js/app.js renderPoliticsQuestionCard,
# plus a representative "submit grade" implementation.
HTML = """<!doctype html><html lang="zh-CN">
<div id="mastery">模糊</div>
<div id="questionTextCard" class="question-text-card">
 <div class="q-stem">商品是劳动产品，具体劳动与抽象劳动的区别体现在？</div>
 <div class="q-choices">
  <div class="q-choice-item" data-choice="A"><span class="choice-key">A</span><div class="choice-text">两种劳动各自独立</div></div>
  <div class="q-choice-item" data-choice="B"><span class="choice-key">B</span><div class="choice-text">具体劳动反映人与自然的关系</div></div>
  <div class="q-choice-item" data-choice="C"><span class="choice-key">C</span><div class="choice-text">具体劳动与抽象劳动并列</div></div>
  <div class="q-choice-item" data-choice="D"><span class="choice-key">D</span><div class="choice-text">具体劳动创造使用价值</div></div>
 </div>
 <div class="politics-grade-actions"><button type="button" class="politics-grade-submit">提交批改</button>
 <span class="politics-grade-result" data-status=""></span></div>
</div>
</html>"""

BASE_STYLE = """
body {font-family:Arial,"Microsoft Yahei",sans-serif;background:#f3f6fa;padding:24px}
#questionTextCard {max-width:920px;margin:auto;background:white;padding:18px;border-radius:14px}
.q-choices {display:flex;flex-direction:column;gap:12px}
.q-choice-item {display:flex;align-items:flex-start;gap:14px;padding:12px 18px;
 background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;cursor:pointer}
.q-choice-item.is-selected {background:#f0fdf4;border-color:#86efac}
.choice-key {flex-shrink:0;display:flex;align-items:center;justify-content:center;
 width:28px;height:28px;border-radius:50%;background:#e2e8f0}
.choice-text {flex:1;font-size:15.5px;line-height:1.7;color:#334155}
.politics-grade-actions{display:flex;gap:12px;margin-top:14px}
.politics-grade-submit {background:#2563eb;color:white;border:0;padding:9px 17px;border-radius:9px}
"""

SELECTION_SETUP = """() => {
  const card=document.querySelector('#questionTextCard');
  const choices=card.querySelector('.q-choices');
  const isMulti=window.__multi||false;
  card.querySelectorAll('.q-choice-item').forEach(item => {
    item.addEventListener('click',function(){
      if (!isMulti) {
        card.querySelectorAll('.q-choice-item').forEach(el=>{
          if(el!==item)el.classList.remove('is-selected');
        });
      }
      item.classList.toggle('is-selected');
    });
  });
  choices.addEventListener('click',function(event){
    const target=event.target?.closest('.q-choice-item');
    if(target&&choices.contains(target)){
      const result=card.querySelector('.politics-grade-result');
      result.textContent='';
      result.removeAttribute('data-status');
    }
  });
  card.querySelector('.politics-grade-submit').addEventListener('click',function(){
    const chosen=[...card.querySelectorAll('.q-choice-item.is-selected')]
      .map(el=>el.dataset.choice).sort().join('');
    const result=card.querySelector('.politics-grade-result');
    const answer=window.__answer||'B';
    result.dataset.status=chosen===answer?'correct':'incorrect';
    result.textContent=result.dataset.status==='correct'?'✅ 回答正确':'❌ 回答错误，正确答案：'+answer;
  });
  return true;
}"""

checks = []

def check(label, condition):
    checks.append((label, bool(condition)))
    if not condition:
        print("FAILED:", label)

async def init(page):
    await page.set_content(HTML)
    await page.add_style_tag(content=BASE_STYLE + CSS)
    await page.evaluate("""() => {
      const m = new Map();
      window.__noteStore = m;
      Object.defineProperty(window,'localStorage',{configurable:true,value:{
        getItem:key=>m.get(key)??null,
        setItem:(key,val)=>m.set(key,String(val)),
        removeItem:key=>m.delete(key)
      }});
      window.__deletionAllowed=true;
      window.confirm=()=>window.__deletionAllowed;
      window.alert=msg=>{window.__alert=msg};
      window.__noteClicks=0;
      document.addEventListener('keydown',function(e){
        if(e.key.toLowerCase()==='z')window.__noteClicks++;
      });
    }""")
    await page.add_script_tag(content=JS)
    await page.evaluate(SELECTION_SETUP)

async def mount(page,key):
    return await page.evaluate("""(key) => PoliticsChoiceNotes.mount(
      document.querySelector('#questionTextCard'), key
    )""",key)

async def change_question(page, key):
    # A different question means card.innerHTML was replaced by renderPoliticsQuestionCard.
    await page.evaluate("""(html) => {
      const temp=document.createElement('div'); temp.innerHTML=html;
      document.querySelector('#questionTextCard').innerHTML=
        temp.querySelector('#questionTextCard').innerHTML;
    }""",HTML)
    await page.evaluate(SELECTION_SETUP)
    return await mount(page,key)

async def get_selected(page):
    return await page.evaluate("""() => [...document.querySelectorAll(
      '.q-choice-item.is-selected')].map(el=>el.dataset.choice).sort().join('')""")

async def run():
    async with async_playwright() as pw:
        win_chrome = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
        chrome = (os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or
                  shutil.which('chromium-browser') or shutil.which('google-chrome')
                  or (win_chrome if os.path.exists(win_chrome) else None))
        launch = dict(headless=True, args=[
            '--no-sandbox','--disable-dev-shm-usage','--no-zygote','--disable-gpu'
        ])
        if chrome:
            launch['executable_path'] = chrome
        browser = await pw.chromium.launch(**launch)
        page = await browser.new_page(viewport=dict(width=1160,height=800))
        errors=[]
        page.on('pageerror',lambda err: errors.append(str(err)))
        await init(page)
        check('module available',await page.evaluate("typeof PoliticsChoiceNotes.mount==='function'"))
        check('mount inserts four independent zones',await mount(page,'user_guest_notes_ch1_0'))
        check('four zones rendered',await page.locator('.politics-choice-note-zone').count()==4)
        check('repeated mount does not duplicate zones',
              not await mount(page,'user_guest_notes_ch1_0') and
              await page.locator('.politics-choice-note-zone').count()==4)
        check('all notes start empty',await page.locator('.politics-choice-note-text:visible').count()==0)

        # Choose A, then edit B without changing the selected option.
        await page.locator('.q-choice-item[data-choice="A"] .choice-text').click()
        check('original option selection works',await get_selected(page)=='A')
        await page.locator('[data-choice-note="B"] .politics-choice-note-add').click()
        check('open editor does not change selected option',await get_selected(page)=='A')
        await page.locator('[data-choice-note="B"] textarea').fill('具体劳动创造使用价值，抽象劳动形成价值')
        check('typing cannot alter selection',await get_selected(page)=='A')
        await page.locator('[data-choice-note="B"] .politics-choice-note-save').click()
        check('save note does not change selection',await get_selected(page)=='A')
        check('red note shows on B only',await page.locator(
            '[data-choice-note="B"] .politics-choice-note-text').inner_text() ==
            '具体劳动创造使用价值，抽象劳动形成价值')
        check('note A remains empty',await page.locator(
            '[data-choice-note="A"] .politics-choice-note-add').is_visible())
        check('stored notes separated by letter',await page.evaluate("""() =>
          JSON.parse(localStorage.getItem('user_guest_notes_ch1_0')).B.startsWith('具体劳动')"""))

        await page.locator('.politics-grade-submit').click()
        check('grade result is incorrect for selected A',await page.locator(
              '.politics-grade-result').get_attribute('data-status') == 'incorrect')
        await page.locator('[data-choice-note="B"] .politics-choice-note-edit').click()
        check('open editor preserves submitted grading',await page.locator(
              '.politics-grade-result').get_attribute('data-status') == 'incorrect')
        await page.locator('[data-choice-note="B"] textarea').fill('改正：具体劳动创造使用价值')
        await page.locator('[data-choice-note="B"] .politics-choice-note-save').click()
        check('editing does not reset grade result',await page.locator(
              '.politics-grade-result').get_attribute('data-status') == 'incorrect')
        check('editing changes only B',await page.evaluate("""() => {
          const n=JSON.parse(localStorage.getItem('user_guest_notes_ch1_0'));
          return Object.keys(n).join('')==='B' && n.B.startsWith('改正');
        }"""))

        # Add multiline note with Ctrl+Enter; verify keyboard shortcut shielding.
        await page.locator('[data-choice-note="D"] .politics-choice-note-add').click()
        await page.locator('[data-choice-note="D"] textarea').fill('第一行\n第二行：重理解')
        await page.locator('[data-choice-note="D"] textarea').press('Control+Enter')
        check('Ctrl+Enter saves multiline text',await page.locator(
              '[data-choice-note="D"] .politics-choice-note-text').inner_text() ==
              '第一行\n第二行：重理解')
        await page.locator('[data-choice-note="D"] .politics-choice-note-edit').click()
        await page.locator('[data-choice-note="D"] textarea').fill('不该保存的文字')
        await page.locator('[data-choice-note="D"] textarea').press('Escape')
        check('Esc cancels unsaved edits',await page.locator(
              '[data-choice-note="D"] .politics-choice-note-text').inner_text() ==
              '第一行\n第二行：重理解')

        await page.locator('[data-choice-note="A"] .politics-choice-note-add').click()
        await page.locator('[data-choice-note="A"] textarea').fill('   ')
        await page.locator('[data-choice-note="A"] .politics-choice-note-save').click()
        check('blank input visibly rejected',await page.locator(
              '[data-choice-note="A"] .politics-choice-note-error').is_visible())
        await page.locator('[data-choice-note="A"] .politics-choice-note-cancel').click()
        check('canceled blank note not saved',await page.locator(
              '[data-choice-note="A"] .politics-choice-note-add').is_visible())

        # HTML text cannot inject DOM, even after save.
        await page.locator('[data-choice-note="C"] .politics-choice-note-add').click()
        await page.locator('[data-choice-note="C"] textarea').fill('<img src=x onerror=alert(1)>')
        await page.locator('[data-choice-note="C"] .politics-choice-note-save').click()
        check('HTML input shown literally',await page.locator(
              '[data-choice-note="C"] .politics-choice-note-text').inner_text() ==
              '<img src=x onerror=alert(1)>')
        check('no user HTML injected',await page.locator(
              '[data-choice-note="C"] img').count()==0)

        # Do not allow "Delete" if confirmation canceled.
        await page.evaluate('window.__deletionAllowed=false')
        await page.locator('[data-choice-note="B"] .politics-choice-note-delete').click()
        check('cancel deletion preserves B',await page.locator(
              '[data-choice-note="B"] .politics-choice-note-text').is_visible())
        await page.evaluate('window.__deletionAllowed=true')
        await page.locator('[data-choice-note="B"] .politics-choice-note-delete').click()
        check('confirmed deletion removes B',await page.locator(
              '[data-choice-note="B"] .politics-choice-note-add').is_visible())
        check('other notes survive deletion',await page.locator(
              '[data-choice-note="C"] .politics-choice-note-text').is_visible())

        # Remount same question after normal navigation repaint.
        await change_question(page,'user_guest_notes_ch1_1')
        check('next question has no inherited notes',
              await page.locator('.politics-choice-note-text:visible').count()==0)
        await change_question(page,'user_guest_notes_ch2_0')
        check('another chapter has no inherited notes',
              await page.locator('.politics-choice-note-text:visible').count()==0)
        await change_question(page,'user_guest_notes_ch1_0')
        check('return to original question restores C and D',
              await page.locator('.politics-choice-note-text:visible').count()==2)
        check('deleted B remains deleted after returning',
              await page.locator('[data-choice-note="B"] .politics-choice-note-add').is_visible())
        check('original choices not altered',await page.locator(
              '.q-choice-item[data-choice="D"] .choice-text').inner_text() ==
              '具体劳动创造使用价值')
        check('mastery status untouched',await page.locator('#mastery').inner_text() == '模糊')

        # Show localStorage failure handling; false success must not occur.
        await page.evaluate("""() => {
          window.localStorage.setItem=()=>{throw Error('quota exceeded')};
          window.localStorage.removeItem=()=>{throw Error('quota exceeded')};
        }""")
        await page.locator('[data-choice-note="A"] .politics-choice-note-add').click()
        await page.locator('[data-choice-note="A"] textarea').fill('无法保存')
        await page.locator('[data-choice-note="A"] .politics-choice-note-save').click()
        check('storage error is visible',await page.locator(
              '[data-choice-note="A"] .politics-choice-note-error').is_visible())
        check('storage error keeps edit form open',await page.locator(
              '[data-choice-note="A"] textarea').is_visible())
        check('failed save not displayed as successful',await page.locator(
              '[data-choice-note="A"] .politics-choice-note-text').inner_text() == '')
        await page.locator('[data-choice-note="A"] textarea').fill('z shortcut text')
        await page.locator('[data-choice-note="A"] textarea').press('z')
        check('typing inside editor does not reach global key handler',
              await page.evaluate('window.__noteClicks===0'))
        check('no JavaScript page errors',len(errors)==0)

        # Layout stress test in a mobile viewport
        await page.set_viewport_size(dict(width=390,height=800))
        await page.locator('[data-choice-note="A"] .politics-choice-note-cancel').click()
        layout=await page.evaluate("""() => {
          const item=document.querySelector('.q-choice-item[data-choice="D"]');
          const note=item.querySelector('.politics-choice-note-zone');
          const outer=item.getBoundingClientRect();
          const inner=note.getBoundingClientRect();
          return inner.left >= outer.left && inner.right <= outer.right + 1;
        }""")
        check('narrow-screen note fits inside its option',layout)
        print(f'Browser checks: {sum(ok for _,ok in checks)}/{len(checks)} passed')
        if errors: print('Browser errors:',errors)
        await browser.close()
        assert all(ok for _,ok in checks), 'Browser regression failed'

if __name__=='__main__':
    asyncio.run(run())
