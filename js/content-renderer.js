(function (global) {
  'use strict';

  const delimiters = [
    { left: '$$', right: '$$', display: true },
    { left: '$', right: '$', display: false },
    { left: '\\(', right: '\\)', display: false },
    { left: '\\[', right: '\\]', display: true },
  ];

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function sanitize(html) {
    if (global.DOMPurify && typeof global.DOMPurify.sanitize === 'function') {
      return global.DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
    }
    return html;
  }

  const mathRegex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\\\([\s\S]*?\\\)|\$[^$\r\n]+?\$)/g;

  function renderMarkdown(source) {
    const text = String(source == null ? '' : source);
    if (!global.marked || typeof global.marked.parse !== 'function') {
      return escapeHtml(text).replace(/\n/g, '<br>');
    }

    const tokens = [];
    const placeholderText = text.replace(mathRegex, function (match) {
      const id = 'KATEXMATHIDX' + tokens.length + 'TOKEN';
      tokens.push(match);
      return id;
    });

    let html = global.marked.parse(placeholderText, { breaks: true });
    html = sanitize(html);

    if (tokens.length > 0) {
      for (let i = 0; i < tokens.length; i++) {
        html = html.split('KATEXMATHIDX' + i + 'TOKEN').join(tokens[i]);
      }
    }

    const holder = document.createElement('div');
    holder.innerHTML = html;
    if (typeof global.renderMathInElement === 'function') {
      global.renderMathInElement(holder, {
        delimiters,
        throwOnError: false,
      });
    }
    return holder.innerHTML;
  }

  function appendMarkdown(parent, source, className) {
    const block = document.createElement('div');
    if (className) block.className = className;
    block.innerHTML = renderMarkdown(source);
    parent.appendChild(block);
    return block;
  }

  function renderQuestion(container, record) {
    container.replaceChildren();
    container.className = 'latex-question';

    appendMarkdown(container, record && record.stem, 'latex-stem');

    if (record && record.options && typeof record.options === 'object' && !Array.isArray(record.options)) {
      const options = document.createElement('div');
      options.className = 'latex-options';
      Object.entries(record.options).forEach(([key, value]) => {
        const item = document.createElement('div');
        item.className = 'latex-option';
        const keyEl = document.createElement('span');
        keyEl.className = 'latex-option-key';
        keyEl.textContent = `${key}.`;
        item.appendChild(keyEl);
        appendMarkdown(item, value, 'latex-option-body');
        options.appendChild(item);
      });
      container.appendChild(options);
    }
  }

  function appendSection(parent, title, body, className) {
    const section = document.createElement('section');
    section.className = `latex-solution-section ${className || ''}`.trim();
    const heading = document.createElement('h4');
    heading.textContent = title;
    section.appendChild(heading);

    if (Array.isArray(body)) {
      const list = document.createElement('ul');
      body.forEach((value) => {
        const li = document.createElement('li');
        appendMarkdown(li, value, 'latex-section-body');
        list.appendChild(li);
      });
      section.appendChild(list);
    } else {
      appendMarkdown(section, body, 'latex-section-body');
    }
    parent.appendChild(section);
  }

  function renderSolution(container, record) {
    container.replaceChildren();
    container.className = 'latex-solution';
    const solution = record && record.solution ? record.solution : {};

    const answer = document.createElement('div');
    answer.className = 'latex-answer';
    answer.textContent = `参考答案：${solution.answer || solution.final_answer || '见解析'}`;
    container.appendChild(answer);

    appendMarkdown(container, solution.analysis_md || '', 'latex-analysis');

    if (solution.wrong_options && typeof solution.wrong_options === 'object') {
      const entries = Object.entries(solution.wrong_options);
      if (entries.length) {
        const section = document.createElement('section');
        section.className = 'latex-solution-section wrong-options';
        const heading = document.createElement('h4');
        heading.textContent = '干扰选项剖析';
        section.appendChild(heading);
        entries.forEach(([key, value]) => {
          const row = document.createElement('div');
          row.className = 'latex-wrong-option';
          const label = document.createElement('strong');
          label.textContent = `选项 ${key}：`;
          row.appendChild(label);
          appendMarkdown(row, value, 'latex-section-body');
          section.appendChild(row);
        });
        container.appendChild(section);
      }
    }

    if (Array.isArray(solution.pitfalls) && solution.pitfalls.length) {
      appendSection(container, '易错陷阱', solution.pitfalls, 'pitfalls');
    }
    if (solution.key_point) {
      appendSection(container, '核心考点', solution.key_point, 'key-point');
    }
  }

  function renderRecordToHtml(record) {
    const root = document.createElement('div');
    renderQuestion(root, record);
    const solution = document.createElement('div');
    renderSolution(solution, record);
    root.appendChild(solution);
    return root.innerHTML;
  }

  global.LatexRenderer = {
    delimiters,
    escapeHtml,
    renderMarkdown,
    renderQuestion,
    renderSolution,
    renderRecordToHtml,
  };
})(window);
