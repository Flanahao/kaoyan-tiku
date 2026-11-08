import json
import os
import sys
import time
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_DIR = r'D:\考研题库网站'

def test_politics_27_mocks():
    print("=" * 60)
    print("🧪 开始验证 27 届政治模拟卷（数据完整性 + 前端交互）")
    print("=" * 60)

    # 1. 验证 JSON 文件
    json_path = os.path.join(BASE_DIR, 'data', 'politics', 'mocks_27.json')
    assert os.path.exists(json_path), f"JSON file missing: {json_path}"
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    assert data.get('edition') == '27', f"Expected edition 27, got {data.get('edition')}"
    assert data.get('total_papers') == 30, f"Expected 30 papers, got {data.get('total_papers')}"
    assert data.get('total_questions') == 990, f"Expected 990 questions, got {data.get('total_questions')}"
    assert data.get('answered_questions') == 990, f"Expected 990 answered, got {data.get('answered_questions')}"
    assert len(data.get('chapters', [])) == 30, f"Expected 30 chapters in array, got {len(data.get('chapters', []))}"

    # Verify each chapter and each question
    series_map = {}
    for ch in data['chapters']:
        s = ch['series']
        series_map[s] = series_map.get(s, 0) + 1
        assert len(ch['questions']) == 33, f"Paper {ch['name']} has {len(ch['questions'])} questions, expected 33"
        for q in ch['questions']:
            assert q.get('stem'), f"Missing stem in {ch['name']} Q{q.get('no')}"
            assert len(q.get('choices', {})) >= 2, f"Missing choices in {ch['name']} Q{q.get('no')}"
            assert q.get('answer'), f"Missing answer in {ch['name']} Q{q.get('no')}"
            assert q.get('analysis'), f"Missing analysis in {ch['name']} Q{q.get('no')}"

    print("✅ 1. JSON 题库数据验证通过！")
    print(f"   - 总试卷数: {data['total_papers']} 套")
    print(f"   - 总题目数: {data['total_questions']} 题 (100% 含题干、选项、答案与解析)")
    print(f"   - 名师分布: {series_map}")

    # 2. 验证 JS 文件
    js_path = os.path.join(BASE_DIR, 'js', 'politics-mocks-chapters.js')
    assert os.path.exists(js_path), f"JS file missing: {js_path}"
    assert os.path.getsize(js_path) > 500000, f"JS file size unexpectedly small: {os.path.getsize(js_path)}"
    print(f"✅ 2. JS 前端数据文件验证通过！大小: {os.path.getsize(js_path):,} 字节")

    # 3. 浏览器端渲染与交互测试
    print("\n🌐 启动 Headless 浏览器进行界面与交互测试...")
    screenshots_dir = os.path.join(BASE_DIR, 'tests', 'screenshots')
    os.makedirs(screenshots_dir, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1400, "height": 900})

        console_errors = []
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)

        file_url = f"file:///{BASE_DIR.replace(os.sep, '/')}/study.html?subject=politics"
        print(f"   打开页面: {file_url}")
        page.goto(file_url, wait_until="networkidle")
        page.wait_for_timeout(1000)

        # 检查总章节数
        total_chapters = page.evaluate("() => window.POLITICS_CHAPTERS ? window.POLITICS_CHAPTERS.length : 0")
        mock_chapters = page.evaluate("() => window.POLITICS_CHAPTERS ? window.POLITICS_CHAPTERS.filter(c => c.wb === '27模拟卷').length : 0")
        print(f"   页面已加载政治章节数: 总计 {total_chapters} (其中 27模拟卷 {mock_chapters} 套)")
        assert mock_chapters == 30, f"Expected 30 mock chapters, found {mock_chapters}"

        # 1. 点击书籍下拉打开书籍面板
        page.click("#trigWb")
        page.wait_for_timeout(300)

        # 验证书籍列表中包含 "27模拟卷"
        wb_buttons = page.locator("#panelWb .title-option").all_text_contents()
        print(f"   书籍选择面板: {wb_buttons}")
        assert "27模拟卷" in wb_buttons, "27模拟卷 button not found in panelWb"

        # 点击选择 "27模拟卷"
        page.locator("#panelWb .title-option", has_text="27模拟卷").click()
        page.wait_for_timeout(500)

        # 2. 验证学科面板展示了 5 大名师系列
        page.click("#trigSubj")
        page.wait_for_timeout(300)
        subjs = page.locator("#panelSubj .title-option").all_text_contents()
        print(f"   名师分类列表: {subjs}")
        expected_series = ['徐涛十套卷', '腿姐八套卷', '米鹏六套卷', '新东方五套卷', '余峰六套卷']
        for s in expected_series:
            assert s in subjs, f"Series {s} not found in panelSubj: {subjs}"

        # 3. 切换到 "腿姐八套卷"
        page.locator("#panelSubj .title-option", has_text="腿姐八套卷").click()
        page.wait_for_timeout(500)

        # 打开章节面板
        page.click("#trigChapter")
        page.wait_for_timeout(300)
        tj_chapters = page.locator("#panelChapter .title-option").all_text_contents()
        print(f"   腿姐八套卷列表 (共 {len(tj_chapters)} 套): {tj_chapters}")
        assert len(tj_chapters) == 8, f"Expected 8 papers for 腿姐八套卷, got {len(tj_chapters)}"

        # 切换到第1套
        page.locator("#panelChapter .title-option", has_text="第1套").first.click()
        page.wait_for_timeout(800)

        # 4. 验证当前题目卡片是否正常显示题干与选项
        card = page.locator("#questionTextCard")
        assert card.is_visible(), "Question text card should be visible"

        stem_text = page.locator("#questionTextCard .q-stem").text_content()
        print(f"   第1题题干: {stem_text[:70]}...")
        assert len(stem_text.strip()) > 10, "Question stem should not be empty"

        choices = page.locator("#questionTextCard .q-choice-item")
        print(f"   第1题选项数: {choices.count()}")
        assert choices.count() == 4, f"Expected 4 choices, got {choices.count()}"

        # 5. 测试交互：点击选项 A，提交批改
        opt_a = choices.first
        opt_a.click()
        page.wait_for_timeout(200)

        submit_btn = page.locator(".politics-grade-submit")
        assert submit_btn.is_visible(), "Submit grading button should be visible"
        submit_btn.click()
        page.wait_for_timeout(300)

        grade_result = page.locator(".politics-grade-result").text_content()
        print(f"   批改结果显示: {grade_result}")
        assert "回答" in grade_result, f"Grading result expected, got {grade_result}"

        # 6. 测试显示解析
        btn_toggle = page.locator("#btnToggle")
        btn_toggle.click()
        page.wait_for_timeout(500)

        sol_card = page.locator("#solutionTextCard")
        assert sol_card.is_visible(), "Solution card should be visible after toggle"

        ans_val = page.locator(".sol-answer-val").text_content()
        ana_content = page.locator(".sol-analysis-content").text_content()
        print(f"   官方答案: {ans_val}")
        print(f"   官方解析: {ana_content[:80]}...")
        assert len(ans_val.strip()) > 0, "Official answer should not be empty"
        assert len(ana_content.strip()) > 10, "Official analysis should not be empty"

        # 7. 保存亮色截图
        shot_light = os.path.join(screenshots_dir, 'politics_mock27_light.png')
        page.screenshot(path=shot_light, full_page=False)
        print(f"   已保存亮色截图: {shot_light}")

        # 8. 切换到深色模式并截图
        page.evaluate("() => document.body.classList.add('dark-theme') || (document.documentElement.dataset.theme = 'dark')")
        page.wait_for_timeout(300)
        shot_dark = os.path.join(screenshots_dir, 'politics_mock27_dark.png')
        page.screenshot(path=shot_dark, full_page=False)
        print(f"   已保存深色截图: {shot_dark}")

        # 9. 测试切换至其他名师试卷（例如米鹏、新东方、徐涛、余峰）
        for series_name, sample_ch_name in [('徐涛十套卷', '第1套'), ('米鹏六套卷', '第1套'), ('新东方五套卷', '第1套'), ('余峰六套卷', '第1套')]:
            page.click("#trigSubj")
            page.wait_for_timeout(300)
            page.locator("#panelSubj .title-option", has_text=series_name).click()
            page.wait_for_timeout(500)
            cur_ch_title = page.locator("#txtChapter").text_content()
            print(f"   切换至 [{series_name}] -> 当前章节: {cur_ch_title}")
            assert len(cur_ch_title.strip()) > 0

        # 10. 检查控制台报错
        real_errors = [e for e in console_errors if not any(ign in e for ign in ['favicon', 'ERR_FILE_NOT_FOUND'])]
        if real_errors:
            print(f"⚠️ 浏览器控制台错误: {real_errors}")
        else:
            print("✅ 浏览器控制台完全无报错 (0 console errors)")

        browser.close()

    print("\n🎉 27 政治全量名师模拟卷自动化测试全部通过！")

if __name__ == '__main__':
    test_politics_27_mocks()
