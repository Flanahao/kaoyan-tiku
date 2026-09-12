import asyncio
import contextlib
import functools
import http.server
import threading
from pathlib import Path

from playwright.async_api import async_playwright, expect

ROOT = Path(__file__).resolve().parents[1]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, fmt, *args):
        pass


@contextlib.contextmanager
def serve_repo():
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    try:
        yield f"http://127.0.0.1:{server.server_port}/index.html"
    finally:
        server.shutdown()
        server.server_close()
        thread.join(timeout=2)


BASE_INIT = r"""
(() => {
  try {
    if (location.protocol === 'http:' || location.protocol === 'https:') {
      localStorage.setItem('user_guest_kaoyan_subject', 'shu1');
    }
  } catch (e) {}
})();
"""


async def new_page(browser, url, viewport=None):
    context = await browser.new_context(
        viewport=viewport or {"width": 1440, "height": 1000}
    )
    await context.add_init_script(script=BASE_INIT)
    page = await context.new_page()
    unexpected_errors = []

    def on_page_error(exc):
        unexpected_errors.append(f"pageerror: {exc}")

    def on_console(msg):
        if msg.type != "error":
            return
        text = msg.text or ""
        if "Failed to load resource" in text:
            return
        unexpected_errors.append(f"console.error: {text}")

    page.on("pageerror", on_page_error)
    page.on("console", on_console)

    await page.goto(url, wait_until="domcontentloaded")
    await page.wait_for_function(
        """() =>
          typeof window.renderNotesMarkdown === 'function' &&
          document.getElementById('btnNoteEdit') !== null
        """
    )
    return context, page, unexpected_errors


async def assert_no_horizontal_overflow(page, tag=""):
    overflow = await page.evaluate(
        """() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
          const clientW = doc.clientWidth;
          return {
            scrollW,
            clientW,
            diff: scrollW - clientW,
            hasOverflow: scrollW > clientW + 1
          };
        }"""
    )
    assert not overflow["hasOverflow"], (
        f"[{tag}] Horizontal overflow detected: scrollWidth={overflow['scrollW']}, "
        f"clientWidth={overflow['clientW']}, diff={overflow['diff']}"
    )


async def test_case_a_bare_latex_sample(browser, url):
    print("Running test_case_a_bare_latex_sample...")
    sample = (
        r"e^{-at}u(t) \stackrel{\mathcal{L}}{\longleftrightarrow} \frac{1}{s+a},\quad \sigma>-a"
        "\n\n"
        r"-e^{-at}u(-t) \stackrel{\mathcal{L}}{\longleftrightarrow} \frac{1}{s+a},\quad \sigma<-a"
    )

    context, page, errors = await new_page(browser, url)
    try:
        # 1. 点击编辑笔记按钮进入编辑模式
        btn_edit = page.locator("#btnNoteEdit")
        await btn_edit.click()
        await expect(page.locator("#notesDuo")).to_be_visible()

        # 2. 在 textarea 中输入原始裸 LaTeX 文本
        textarea = page.locator("#notesTextarea")
        await textarea.fill(sample)
        await textarea.dispatch_event("input")

        # 3. 验证实时预览 #notesPreview 中 KaTeX display math 数量与无源码泄露
        preview_displays = page.locator("#notesPreview .katex-display")
        await expect(preview_displays).to_have_count(2, timeout=5000)
        preview_text = await page.locator("#notesPreview").inner_text()
        assert r"\stackrel" not in preview_text, f"Raw \\stackrel found in preview: {preview_text}"
        assert r"\sigma" not in preview_text, f"Raw \\sigma found in preview: {preview_text}"
        assert r"\frac" not in preview_text, f"Raw \\frac found in preview: {preview_text}"
        preview_count = await preview_displays.count()

        # 4. 点击保存按钮
        await page.locator("#btnNoteSave").click()
        await expect(page.locator("#notesDuo")).not_to_be_visible()
        await expect(page.locator("#notesRender")).to_be_visible()

        # 5. 验证保存后 #notesRender 中的公式渲染
        render_displays = page.locator("#notesRender .katex-display")
        await expect(render_displays).to_have_count(2)
        save_count = await render_displays.count()

        # 6. 刷新页面，验证从 localStorage 恢复后依然正确渲染
        await page.reload()
        await page.wait_for_function(
            "() => document.getElementById('notesRender') !== null"
        )
        refresh_displays = page.locator("#notesRender .katex-display")
        await expect(refresh_displays).to_have_count(2)
        refresh_count = await refresh_displays.count()

        assert not errors, f"Unexpected errors in Case A: {errors}"
        print(f"Case A Counts: preview={preview_count}, save={save_count}, refresh={refresh_count}")
        return preview_count, save_count, refresh_count
    finally:
        await context.close()


async def test_case_b_inline_math(browser, url):
    print("Running test_case_b_inline_math...")
    sample = "这是行内公式 $x^2+y^2=1$。"
    context, page, errors = await new_page(browser, url)
    try:
        await page.locator("#btnNoteEdit").click()
        textarea = page.locator("#notesTextarea")
        await textarea.fill(sample)
        await textarea.dispatch_event("input")

        await expect(page.locator("#notesPreview .katex")).to_have_count(1)
        # 行内公式不应被包装成 display math
        await expect(page.locator("#notesPreview .katex-display")).to_have_count(0)

        await page.locator("#btnNoteSave").click()
        await expect(page.locator("#notesRender .katex")).to_have_count(1)
        await expect(page.locator("#notesRender .katex-display")).to_have_count(0)
        assert not errors, f"Errors in Case B: {errors}"
    finally:
        await context.close()


async def test_case_c_display_math(browser, url):
    print("Running test_case_c_display_math...")
    sample = r"$$\frac{1}{s+a}$$"
    context, page, errors = await new_page(browser, url)
    try:
        await page.locator("#btnNoteEdit").click()
        textarea = page.locator("#notesTextarea")
        await textarea.fill(sample)
        await textarea.dispatch_event("input")

        await expect(page.locator("#notesPreview .katex-display")).to_have_count(1)

        await page.locator("#btnNoteSave").click()
        await expect(page.locator("#notesRender .katex-display")).to_have_count(1)
        assert not errors, f"Errors in Case C: {errors}"
    finally:
        await context.close()


async def test_case_d_parens_and_brackets(browser, url):
    print("Running test_case_d_parens_and_brackets...")
    sample = r"\(x+1\) 还有 \[\frac{a}{b}\]"
    context, page, errors = await new_page(browser, url)
    try:
        await page.locator("#btnNoteEdit").click()
        textarea = page.locator("#notesTextarea")
        await textarea.fill(sample)
        await textarea.dispatch_event("input")

        await expect(page.locator("#notesPreview .katex-display")).to_have_count(1)
        await expect(page.locator("#notesPreview .katex")).to_have_count(2)

        await page.locator("#btnNoteSave").click()
        await expect(page.locator("#notesRender .katex-display")).to_have_count(1)
        assert not errors, f"Errors in Case D: {errors}"
    finally:
        await context.close()


async def test_case_e_plain_markdown(browser, url):
    print("Running test_case_e_plain_markdown...")
    sample = """## 拉普拉斯变换

- 右边信号 ROC 在极点右侧
- 左边信号 ROC 在极点左侧

普通中文笔记不要变成公式。"""
    context, page, errors = await new_page(browser, url)
    try:
        await page.locator("#btnNoteEdit").click()
        textarea = page.locator("#notesTextarea")
        await textarea.fill(sample)
        await textarea.dispatch_event("input")

        await page.locator("#btnNoteSave").click()
        render = page.locator("#notesRender")
        await expect(render.locator("h2")).to_have_text("拉普拉斯变换")
        await expect(render.locator("ul li")).to_have_count(2)
        # 绝不产生任何 KaTeX 节点
        await expect(render.locator(".katex")).to_have_count(0)
        assert not errors, f"Errors in Case E: {errors}"
    finally:
        await context.close()


async def test_case_f_code_fence(browser, url):
    print("Running test_case_f_code_fence...")
    sample = "```latex\n" + r"\frac{1}{s+a}" + "\n```"
    context, page, errors = await new_page(browser, url)
    try:
        await page.locator("#btnNoteEdit").click()
        textarea = page.locator("#notesTextarea")
        await textarea.fill(sample)
        await textarea.dispatch_event("input")

        await page.locator("#btnNoteSave").click()
        render = page.locator("#notesRender")
        code_el = render.locator("pre code")
        await expect(code_el).to_be_visible()
        code_text = await code_el.inner_text()
        assert r"\frac{1}{s+a}" in code_text
        # 代码块内禁止渲染为 KaTeX
        await expect(render.locator(".katex")).to_have_count(0)
        assert not errors, f"Errors in Case F: {errors}"
    finally:
        await context.close()


async def test_case_g_responsive_and_overflow(browser, url):
    print("Running test_case_g_responsive_and_overflow...")
    long_formula = (
        r"e^{-at}u(t) \stackrel{\mathcal{L}}{\longleftrightarrow} \frac{1}{s+a},\quad "
        r"\sigma>-a + \frac{1}{s+b} + \frac{1}{s+c} + \frac{1}{s+d} + \frac{1}{s+e} + \frac{1}{s+f} + \frac{1}{s+g}"
    )

    viewports = [
        {"width": 1440, "height": 900},
        {"width": 1024, "height": 768},
        {"width": 768, "height": 1024},
        {"width": 390, "height": 844},
        {"width": 320, "height": 568},
    ]

    for vp in viewports:
        w = vp["width"]
        context, page, errors = await new_page(browser, url, viewport=vp)
        try:
            # 输入长公式
            await page.evaluate("() => document.getElementById('btnNoteEdit').click()")
            await page.locator("#notesTextarea").fill(long_formula)
            await page.evaluate("() => document.getElementById('btnNoteSave').click()")

            # 验证页面无横向溢出
            await assert_no_horizontal_overflow(page, f"notes w={w}")
            # 验证 katex-display 具有 overflow-x: auto 属性
            display_style = await page.evaluate("""() => {
              const el = document.querySelector('#notesRender .katex-display');
              if (!el) return null;
              const s = window.getComputedStyle(el);
              return {
                overflowX: s.overflowX,
                maxWidth: s.maxWidth
              };
            }""")
            assert display_style is not None
            assert display_style["overflowX"] in ("auto", "scroll")
            assert not errors, f"Errors in Case G at {vp}: {errors}"
        finally:
            await context.close()


async def main():
    with serve_repo() as test_url:
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            try:
                a_counts = await test_case_a_bare_latex_sample(browser, test_url)
                await test_case_b_inline_math(browser, test_url)
                await test_case_c_display_math(browser, test_url)
                await test_case_d_parens_and_brackets(browser, test_url)
                await test_case_e_plain_markdown(browser, test_url)
                await test_case_f_code_fence(browser, test_url)
                await test_case_g_responsive_and_overflow(browser, test_url)
                print(f"RESULT_COUNTS: preview={a_counts[0]}, save={a_counts[1]}, refresh={a_counts[2]}")
                print("SUCCESS: ALL_NOTES_LATEX_BROWSER_TESTS_PASSED")
            finally:
                await browser.close()


if __name__ == "__main__":
    asyncio.run(main())
