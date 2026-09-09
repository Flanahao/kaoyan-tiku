import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        b = await p.chromium.launch(headless=True)
        page = await b.new_page()
        
        # Pre-set localStorage with proper user_guest_ prefix
        await page.add_init_script("""
            localStorage.setItem('user_guest_kaoyan_subject', 'shu1');
            localStorage.setItem('user_guest_kaoyan_resume', JSON.stringify({
                'shu1': { ch: 'yeyu_gd_01', idx: 0, sub: false },
                'shu1::夜雨强化': { ch: 'yeyu_gd_01', idx: 0, sub: false }
            }));
        """)
        
        await page.goto('file:///D:/考研题库网站/index.html')
        await page.wait_for_timeout(1500)
        
        wb = await page.inner_text('#txtWb')
        subj = await page.inner_text('#txtSubj')
        ch = await page.inner_text('#txtChapter')
        qlabel = await page.inner_text('#qLabel')
        img_src = await page.locator('#questionImg').get_attribute('src')
        is_visible = await page.locator('#questionImg').is_visible()
        
        print(f'[GAOSHOU] Wb: {wb}, Subj: {subj}, Ch: {ch}, Label: {qlabel}')
        print(f'[GAOSHOU] img src: {img_src}, is_visible: {is_visible}')
        
        await page.screenshot(path=r'D:\AntigravityChat\yeyu_gd_preview.png')
        
        # Test switching subject to 线代 in 夜雨强化
        await page.click('#trigSubj')
        await page.wait_for_timeout(500)
        await page.click('#panelSubj button:has-text("线代")')
        await page.wait_for_timeout(1000)
        
        wb_la = await page.inner_text('#txtWb')
        subj_la = await page.inner_text('#txtSubj')
        ch_la = await page.inner_text('#txtChapter')
        qlabel_la = await page.inner_text('#qLabel')
        img_src_la = await page.locator('#questionImg').get_attribute('src')
        print(f'[XIANDAI] Wb: {wb_la}, Subj: {subj_la}, Ch: {ch_la}, Label: {qlabel_la}')
        print(f'[XIANDAI] img src: {img_src_la}')
        
        await page.screenshot(path=r'D:\AntigravityChat\yeyu_la_preview.png')
        
        # Test switching subject to 概率论 in 夜雨强化
        await page.click('#trigSubj')
        await page.wait_for_timeout(500)
        await page.click('#panelSubj button:has-text("概率论")')
        await page.wait_for_timeout(1000)
        
        wb_pr = await page.inner_text('#txtWb')
        subj_pr = await page.inner_text('#txtSubj')
        ch_pr = await page.inner_text('#txtChapter')
        qlabel_pr = await page.inner_text('#qLabel')
        img_src_pr = await page.locator('#questionImg').get_attribute('src')
        print(f'[GAILV] Wb: {wb_pr}, Subj: {subj_pr}, Ch: {ch_pr}, Label: {qlabel_pr}')
        print(f'[GAILV] img src: {img_src_pr}')
        
        await page.screenshot(path=r'D:\AntigravityChat\yeyu_pr_preview.png')
        
        # Test keyboard navigation: press D (next question)
        await page.keyboard.press('d')
        await page.wait_for_timeout(500)
        qlabel_pr_d = await page.inner_text('#qLabel')
        img_src_pr_d = await page.locator('#questionImg').get_attribute('src')
        print(f'[GAILV NEXT] Label: {qlabel_pr_d}, img src: {img_src_pr_d}')
        
        # Verify image natural loading
        natural_w = await page.evaluate("document.getElementById('questionImg').naturalWidth")
        natural_h = await page.evaluate("document.getElementById('questionImg').naturalHeight")
        print(f'[NATURAL SIZE] width={natural_w}, height={natural_h}')
        assert natural_w == 1536, f'Expected 1536px width, got {natural_w}'
        
        await b.close()
        print('SUCCESS: ALL_WEB_TESTS_PASSED')

if __name__ == '__main__':
    asyncio.run(run())
