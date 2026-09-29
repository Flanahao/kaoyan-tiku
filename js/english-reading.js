(function () {
  'use strict';

  /*
   * Dedicated Reading Part A immersive page.
   *
   * Important:
   * - Uses the SAME localStorage keys as js/english.js
   * - Uses the SAME ENGLISH_ZHENTI_PAPERS data source
   * - Reuses js/english-annotations.js
   */

  var ANSWERS_KEY =
    'user_guest_kaoyan_english_user_answers_v1';

  var STATUS_KEY =
    'user_guest_kaoyan_english_zhenti_status_v1';

  var NOTES_KEY =
    'user_guest_kaoyan_english_notes_v1';

  var BILINGUAL_KEY =
    'user_guest_kaoyan_english_bilingual_v1';

  var YEAR_KEY =
    'user_guest_kaoyan_english_zhenti_year_v1';

  var SECTION_KEY =
    'user_guest_kaoyan_english_zhenti_sec_v1';

  var VOCAB_KEY =
    'user_guest_kaoyan_english_zhenti_vocab_v1';

  var DICT_CACHE_KEY =
    'user_guest_kaoyan_dict_cache_v2';

  var app =
    document.getElementById(
      'englishReadingApp'
    );

  var headerEl =
    document.getElementById(
      'erHeader'
    );

  var passageEl =
    document.getElementById(
      'erPassage'
    );

  var passageScrollEl =
    document.getElementById(
      'erPassageScroll'
    );

  var tabsEl =
    document.getElementById(
      'erQuestionTabs'
    );

  var questionEl =
    document.getElementById(
      'erQuestion'
    );

  var questionScrollEl =
    document.getElementById(
      'erQuestionScroll'
    );

  var fatalEl =
    document.getElementById(
      'erFatal'
    );

  var toastEl =
    document.getElementById(
      'erToast'
    );

  if (
    !app ||
    !headerEl ||
    !passageEl ||
    !tabsEl ||
    !questionEl
  ) {
    return;
  }

  var params =
    new URLSearchParams(
      window.location.search
    );

  var curYear =
    params.get('year') ||
    localStorage.getItem(
      YEAR_KEY
    ) ||
    latestYear() ||
    '2026';

  var curSectionId =
    params.get('section') ||
    localStorage.getItem(
      SECTION_KEY
    ) ||
    '';

  var activeQuestionId =
    params.get('q') ||
    '';

  var bilingualMode =
    localStorage.getItem(
      BILINGUAL_KEY
    ) ===
    'true';

  var answers =
    loadJson(
      ANSWERS_KEY,
      {}
    );

  var statuses =
    loadJson(
      STATUS_KEY,
      {}
    );

  var notes =
    loadJson(
      NOTES_KEY,
      {}
    );

  var dictCache =
    loadJson(
      DICT_CACHE_KEY,
      {}
    );

  var expanded = {};

  var editingNoteId =
    '';

  var currentSection =
    null;

  var currentQuestions =
    [];

  var wordPopover =
    null;

  /* =======================================================
     Storage
     ======================================================= */

  function loadJson(
    key,
    fallback
  ) {
    try {
      var raw =
        localStorage.getItem(
          key
        );

      return raw
        ? JSON.parse(raw)
        : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function saveJson(
    key,
    value
  ) {
    try {
      localStorage.setItem(
        key,
        JSON.stringify(
          value
        )
      );
    } catch (error) {}
  }

  /* =======================================================
     Safe text helpers
     ======================================================= */

  function esc(value) {
    return String(
      value == null
        ? ''
        : value
    ).replace(
      /[&<>'"]/g,

      function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[char];
      }
    );
  }

  /*
   * Unlike old escapeHtml implementations,
   * DO NOT trim spaces here.
   *
   * Word separation depends on preserving the "other"
   * chunks between .ez-word spans.
   */
  function escInline(value) {
    return String(
      value == null
        ? ''
        : value
    ).replace(
      /[&<>'"]/g,

      function (char) {
        return {
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          "'": '&#39;',
          '"': '&quot;'
        }[char];
      }
    );
  }

  function safeRichHtml(
    value
  ) {
    var raw =
      String(
        value ||
        ''
      );

    if (!raw) {
      return '';
    }

    if (
      window.DOMPurify &&
      typeof window
        .DOMPurify
        .sanitize ===
        'function'
    ) {
      return window
        .DOMPurify
        .sanitize(
          raw,
          {
            USE_PROFILES: {
              html: true
            },

            ADD_ATTR: [
              'target',
              'rel'
            ]
          }
        );
    }

    return esc(raw)
      .replace(
        /\r?\n/g,
        '<br>'
      );
  }

  function normalizeExamText(
    value
  ) {
    return String(
      value == null
        ? ''
        : value
    )
      .replace(
        /\u00a0/g,
        ' '
      )
      .replace(
        /[ \t]+/g,
        ' '
      )
      .replace(
        /\r?\n[ \t]*/g,
        ' '
      )
      .replace(
        /\s+([,.;:!?%])/g,
        '$1'
      )
      .replace(
        /\.\?/g,
        '.'
      )
      .replace(
        /!\?/g,
        '!'
      )
      .replace(
        /\?\?/g,
        '?'
      )
      .trim();
  }

  /*
   * Keep the same word model as current english.js.
   */
  function renderClickableWords(
    text
  ) {
    if (!text) {
      return '';
    }

    return normalizeExamText(
      text
    ).replace(
      /([a-zA-Z]+(?:['’][a-zA-Z]+)?)|([^a-zA-Z'’]+)/g,

      function (
        _,
        word,
        other
      ) {
        if (word) {
          var clean =
            word
              .toLowerCase()
              .replace(
                /['’]s$/,
                ''
              );

          return (
            '<span ' +
              'class="ez-word" ' +
              'data-word="' +
                esc(clean) +
              '"' +
            '>' +
              esc(word) +
            '</span>'
          );
        }

        return escInline(
          other
        );
      }
    );
  }

  function normalizeAnswer(
    answer
  ) {
    var value =
      String(
        answer == null
          ? ''
          : answer
      ).trim();

    if (
      /^[1-8]$/.test(
        value
      )
    ) {
      return String
        .fromCharCode(
          64 +
          parseInt(
            value,
            10
          )
        );
    }

    return /^[A-H]$/i
      .test(value)
        ? value.toUpperCase()
        : value;
  }

  /* =======================================================
     Data resolution
     ======================================================= */

  function latestYear() {
    var manifest =
      Array.isArray(
        window
          .ENGLISH_ZHENTI_MANIFEST
      )
        ? window
            .ENGLISH_ZHENTI_MANIFEST
        : [];

    return manifest.length
      ? String(
          manifest[0].year
        )
      : '';
  }

  function papers() {
    return (
      window
        .ENGLISH_ZHENTI_PAPERS ||
      {}
    );
  }

  function yearData(year) {
    return papers()[year] ||
      null;
  }

  function readingSections(
    year
  ) {
    var data =
      yearData(year);

    return (
      data &&
      Array.isArray(
        data.sections
      )
    )
      ? data.sections
          .filter(
            function (
              section
            ) {
              return (
                section.type ===
                'reading'
              );
            }
          )
      : [];
  }

  function findSection() {
    var sections =
      readingSections(
        curYear
      );

    if (
      !sections.length
    ) {
      return null;
    }

    var match =
      sections.find(
        function (
          section
        ) {
          return (
            String(
              section.id
            ) ===
            String(
              curSectionId
            )
          );
        }
      );

    return (
      match ||
      sections[0]
    );
  }

  function getScope(
    kind,
    localId
  ) {
    if (
      window
        .EnglishAnnotations &&
      typeof window
        .EnglishAnnotations
        .makeScopeKey ===
        'function'
    ) {
      return window
        .EnglishAnnotations
        .makeScopeKey(
          curYear,
          currentSection.id,
          kind,
          localId
        );
    }

    return [
      'eng',
      curYear,
      'sec',
      currentSection.id,
      kind,
      localId
    ].join(':');
  }

  function sectionAnnotationCount() {
    if (
      !window
        .EnglishAnnotations ||
      typeof window
        .EnglishAnnotations
        .countPrefix !==
        'function' ||
      !currentSection
    ) {
      return 0;
    }

    return window
      .EnglishAnnotations
      .countPrefix(
        'eng:' +
        curYear +
        ':sec:' +
        currentSection.id +
        ':'
      );
  }

  function resolveState() {
    currentSection =
      findSection();

    if (!currentSection) {
      return false;
    }

    curSectionId =
      String(
        currentSection.id
      );

    localStorage.setItem(
      YEAR_KEY,
      curYear
    );

    localStorage.setItem(
      SECTION_KEY,
      curSectionId
    );

    currentQuestions =
      Array.isArray(
        currentSection.questions
      )
        ? currentSection.questions
        : [];

    if (
      !currentQuestions.length
    ) {
      activeQuestionId =
        '';
    } else if (
      !currentQuestions.some(
        function (
          question
        ) {
          return (
            question.id ===
            activeQuestionId
          );
        }
      )
    ) {
      activeQuestionId =
        currentQuestions[0].id;
    }

    updateUrl();

    return true;
  }

  function updateUrl() {
    try {
      var next =
        new URL(
          window.location.href
        );

      next
        .searchParams
        .set(
          'year',
          curYear
        );

      next
        .searchParams
        .set(
          'section',
          curSectionId
        );

      if (
        activeQuestionId
      ) {
        next
          .searchParams
          .set(
            'q',
            activeQuestionId
          );
      } else {
        next
          .searchParams
          .delete('q');
      }

      window.history
        .replaceState(
          null,
          '',
          next.pathname +
          next.search
        );
    } catch (error) {
      /*
       * Browser test harnesses with opaque origins can reject replaceState.
       * Normal http(s) / GitHub Pages / Vercel pages will not hit this path.
       */
    }
  }

  function currentQuestion() {
    return (
      currentQuestions.find(
        function (
          question
        ) {
          return (
            question.id ===
            activeQuestionId
          );
        }
      ) ||
      currentQuestions[0] ||
      null
    );
  }

  function questionIndex(id) {
    return currentQuestions
      .findIndex(
        function (
          question
        ) {
          return (
            question.id ===
            id
          );
        }
      );
  }

  function completedCount() {
    return currentQuestions
      .reduce(
        function (
          sum,
          question
        ) {
          return (
            sum +
            (
              answers[
                question.id
              ]
                ? 1
                : 0
            )
          );
        },
        0
      );
  }

  /* =======================================================
     Header
     ======================================================= */

  function yearOptionsHtml() {
    var manifest =
      Array.isArray(
        window
          .ENGLISH_ZHENTI_MANIFEST
      )
        ? window
            .ENGLISH_ZHENTI_MANIFEST
        : [];

    return manifest
      .map(
        function (
          item
        ) {
          var year =
            String(
              item.year
            );

          return (
            '<option ' +
              'value="' +
                esc(year) +
              '"' +
              (
                year ===
                curYear
                  ? ' selected'
                  : ''
              ) +
            '>' +
              esc(year) +
              ' 年' +
            '</option>'
          );
        }
      )
      .join('');
  }

  function sectionOptionsHtml() {
    return readingSections(
      curYear
    )
      .map(
        function (
          section,
          index
        ) {
          var label =
            section
              .displayTitle ||
            section
              .sectionName ||
            (
              'Text ' +
              (
                index + 1
              )
            );

          return (
            '<option ' +
              'value="' +
                esc(section.id) +
              '"' +
              (
                String(
                  section.id
                ) ===
                curSectionId
                  ? ' selected'
                  : ''
              ) +
            '>' +
              esc(label) +
            '</option>'
          );
        }
      )
      .join('');
  }

  function renderHeader() {
    var count =
      currentQuestions.length;

    var done =
      completedCount();

    var percent =
      count
        ? Math.round(
            done /
            count *
            100
          )
        : 0;

    var annEnabled =
      !window
        .EnglishAnnotations ||
      typeof window
        .EnglishAnnotations
        .isEnabled !==
        'function'
        ? true
        : window
            .EnglishAnnotations
            .isEnabled();

    var annCount =
      sectionAnnotationCount();

    headerEl.innerHTML =
      '<div class="er-header-left">' +

        '<button ' +
          'class="er-back-btn" ' +
          'data-action="back" ' +
          'type="button"' +
        '>' +
          '← 返回英语' +
        '</button>' +

        '<span class="er-mode-chip">' +
          '沉浸精读' +
        '</span>' +

        '<div class="er-title-box">' +
          '<strong>' +
            esc(curYear) +
            ' 年考研英语（一）' +
          '</strong>' +
          '<small>' +
            esc(
              currentSection
                .displayTitle ||
              currentSection
                .sectionName ||
              'Reading Part A'
            ) +
          '</small>' +
        '</div>' +

      '</div>' +

      '<div class="er-header-center">' +

        '<select ' +
          'class="er-select" ' +
          'id="erYearSelect" ' +
          'aria-label="年份"' +
        '>' +
          yearOptionsHtml() +
        '</select>' +

        '<select ' +
          'class="er-select" ' +
          'id="erSectionSelect" ' +
          'aria-label="阅读篇目"' +
        '>' +
          sectionOptionsHtml() +
        '</select>' +

      '</div>' +

      '<div class="er-header-right">' +

        '<button ' +
          'class="er-ghost-btn' +
            (
              annEnabled
                ? ' is-active'
                : ''
            ) +
          '" ' +
          'data-action="toggleAnnotations" ' +
          'type="button"' +
        '>' +
          '🖍️ 精读标注' +
          (
            annCount
              ? (
                  '<span class="er-ann-badge">' +
                    annCount +
                  '</span>'
                )
              : ''
          ) +
        '</button>' +

        '<button ' +
          'class="er-ghost-btn" ' +
          'data-action="toggleBilingual" ' +
          'type="button"' +
        '>' +
          (
            bilingualMode
              ? '🙈 隐藏译文'
              : '👁️ 显示译文'
          ) +
        '</button>' +

        '<div class="er-progress">' +
          '<strong>' +
            done +
            ' / ' +
            count +
            ' 已作答' +
          '</strong>' +

          '<div class="er-progress-bar">' +
            '<div ' +
              'class="er-progress-fill" ' +
              'style="width:' +
                percent +
                '%"' +
            '></div>' +
          '</div>' +
        '</div>' +

      '</div>';
  }

  /* =======================================================
     Passage
     ======================================================= */

  function renderPassage() {
    var paragraphs =
      currentSection
        .paragraphs ||
      [];

    passageEl.innerHTML =
      '<article class="er-passage-wrap">' +

        '<header class="er-passage-head">' +

          '<div class="er-kickers">' +
            '<span class="er-kicker">' +
              esc(curYear) +
              ' · READING PART A' +
            '</span>' +

            '<span class="er-kicker is-difficulty">' +
              '精读模式' +
            '</span>' +
          '</div>' +

          '<h1>' +
            esc(
              currentSection
                .displayTitle ||
              currentSection
                .sectionName ||
              'Reading'
            ) +
          '</h1>' +

          '<div class="er-passage-meta">' +

            '<span>' +
              (
                currentSection
                  .beform
                  ? (
                      '出处 / 背景：' +
                      esc(
                        currentSection
                          .beform
                      )
                    )
                  : '考研英语真题阅读'
              ) +
            '</span>' +

            '<span>' +
              paragraphs.length +
              ' 段' +
            '</span>' +

          '</div>' +

        '</header>' +

        '<div class="er-reading-tip">' +
          '<strong>精读：</strong>' +
          '左键拖选英文可连续荧光标注、下划线或添加注释；' +
          '单击单词仍可查词并加入生词本。' +
        '</div>' +

        '<div class="er-passage-body">' +

          paragraphs.map(
            function (
              paragraph,
              index
            ) {
              return (
                '<section ' +
                  'class="er-paragraph" ' +
                  'data-paragraph-index="' +
                    (
                      index + 1
                    ) +
                  '"' +
                '>' +

                  '<span class="er-pno">' +
                    'P' +
                    (
                      index + 1
                    ) +
                  '</span>' +

                  '<div class="er-para-copy">' +

                    '<div ' +
                      'class="' +
                        'er-para-en ' +
                        'ez-annotation-scope' +
                      '" ' +
                      'data-ann-scope="' +
                        esc(
                          getScope(
                            'para',
                            index + 1
                          )
                        ) +
                      '"' +
                    '>' +
                      renderClickableWords(
                        paragraph.english
                      ) +
                    '</div>' +

                    (
                      bilingualMode &&
                      paragraph.chinese
                        ? (
                            '<div class="er-para-zh">' +
                              esc(
                                paragraph.chinese
                              ) +
                            '</div>'
                          )
                        : ''
                    ) +

                  '</div>' +

                '</section>'
              );
            }
          ).join('') +

        '</div>' +

      '</article>';
  }

  /* =======================================================
     Question tabs
     ======================================================= */

  function renderTabs() {
    tabsEl.innerHTML =
      currentQuestions
        .map(
          function (
            question,
            index
          ) {
            var status =
              statuses[
                question.id
              ] ||
              'unmarked';

            var active =
              question.id ===
              activeQuestionId;

            return (
              '<button ' +
                'class="' +
                  'er-qtab ' +
                  'status-' +
                  esc(status) +
                  (
                    active
                      ? ' is-active'
                      : ''
                  ) +
                '" ' +
                'data-q-id="' +
                  esc(question.id) +
                '" ' +
                'type="button"' +
              '>' +

                '<span class="er-qtab-dot"></span>' +

                '第 ' +
                esc(
                  question.num ||
                  (
                    index + 1
                  )
                ) +
                ' 题' +

              '</button>'
            );
          }
        )
        .join('');
  }

  /* =======================================================
     Question content
     ======================================================= */

  function renderMastery(
    question
  ) {
    var current =
      statuses[
        question.id
      ] ||
      '';

    var items = [
      [
        'proficient',
        '熟练'
      ],
      [
        'familiar',
        '较熟'
      ],
      [
        'vague',
        '模糊'
      ],
      [
        'rusty',
        '困难'
      ],
      [
        'wrong',
        '不会'
      ]
    ];

    return (
      '<div class="er-masteries">' +

        items.map(
          function (
            item
          ) {
            return (
              '<button ' +
                'class="' +
                  'er-mastery ' +
                  item[0] +
                  (
                    current ===
                    item[0]
                      ? ' active'
                      : ''
                  ) +
                '" ' +
                'data-status="' +
                  item[0] +
                '" ' +
                'data-q-id="' +
                  esc(question.id) +
                '" ' +
                'type="button"' +
              '>' +
                item[1] +
              '</button>'
            );
          }
        ).join('') +

      '</div>'
    );
  }

  function renderOptions(
    question
  ) {
    var choice =
      answers[
        question.id
      ] ||
      '';

    var answer =
      normalizeAnswer(
        question.answer
      );

    return (
      '<div class="er-options">' +

        (
          question.options ||
          []
        )
          .filter(
            function (
              option
            ) {
              return (
                option &&
                String(
                  option.text ||
                  ''
                ).trim()
              );
            }
          )
          .map(
            function (
              option
            ) {
              var cls =
                'er-option';

              if (
                choice ===
                option.key
              ) {
                cls +=
                  ' is-selected';
              }

              if (choice) {
                if (
                  option.key ===
                  answer
                ) {
                  cls +=
                    ' is-correct';
                } else if (
                  choice ===
                  option.key
                ) {
                  cls +=
                    ' is-wrong';
                }
              }

              return (
                '<button ' +
                  'class="' +
                    cls +
                  '" ' +
                  'data-q-id="' +
                    esc(
                      question.id
                    ) +
                  '" ' +
                  'data-opt-key="' +
                    esc(
                      option.key
                    ) +
                  '" ' +
                  'type="button"' +
                '>' +

                  '<span class="er-opt-key">' +
                    esc(
                      option.key
                    ) +
                  '</span>' +

                  '<span class="er-opt-text">' +
                    esc(
                      option.text
                    ) +
                  '</span>' +

                '</button>'
              );
            }
          ).join('') +

      '</div>'
    );
  }

  function renderQuestion() {
    var question =
      currentQuestion();

    if (!question) {
      questionEl.innerHTML =
        '<div class="er-empty">' +
          '当前篇目暂无题目。' +
        '</div>';

      return;
    }

    var index =
      questionIndex(
        question.id
      );

    var open =
      Boolean(
        expanded[
          question.id
        ]
      );

    var note =
      notes[
        question.id
      ] ||
      '';

    var isEditing =
      editingNoteId ===
      question.id;

    var qScope =
      getScope(
        'q',
        question.id
      );

    var previousDisabled =
      index <= 0
        ? ' disabled'
        : '';

    var nextDisabled =
      index >=
      currentQuestions.length -
      1
        ? ' disabled'
        : '';

    questionEl.innerHTML =
      '<div class="er-question-wrap">' +

        '<div class="er-question-context">' +
          '<strong>' +
            esc(curYear) +
            ' · ' +
            esc(
              currentSection
                .displayTitle ||
              currentSection
                .sectionName
            ) +
          '</strong>' +

          '<span>' +
            'A / D 切题 · 1~4 选项 · Space 解析' +
          '</span>' +
        '</div>' +

        '<article class="er-question-card">' +

          '<div class="er-question-head">' +

            '<span class="er-q-label">' +
              '第 ' +
              esc(
                question.num ||
                (
                  index + 1
                )
              ) +
              ' 题' +
            '</span>' +

            renderMastery(
              question
            ) +

          '</div>' +

          '<div ' +
            'class="' +
              'er-q-stem ' +
              'ez-annotation-scope' +
            '" ' +
            'data-ann-scope="' +
              esc(qScope) +
            '"' +
          '>' +
            renderClickableWords(
              question.stem ||
              ''
            ) +
          '</div>' +

          renderOptions(
            question
          ) +

          '<div class="er-question-actions">' +

            '<button ' +
              'class="er-exp-btn" ' +
              'data-action="toggleExp" ' +
              'data-q-id="' +
                esc(
                  question.id
                ) +
              '" ' +
              'type="button"' +
            '>' +
              (
                open
                  ? '收起解析'
                  : '揭晓答案与解析'
              ) +
            '</button>' +

            '<div class="er-nav-mini">' +

              '<button ' +
                'data-action="prevQuestion" ' +
                'type="button"' +
                previousDisabled +
              '>' +
                '← 上一题' +
              '</button>' +

              '<button ' +
                'data-action="nextQuestion" ' +
                'type="button"' +
                nextDisabled +
              '>' +
                '下一题 →' +
              '</button>' +

            '</div>' +

          '</div>' +

          (
            open
              ? (
                  '<div class="er-exp-box">' +

                    '<div class="er-exp-answer">' +
                      '<span>标准答案</span>' +
                      '<strong>' +
                        esc(
                          normalizeAnswer(
                            question.answer
                          ) ||
                          '暂无'
                        ) +
                      '</strong>' +
                    '</div>' +

                    '<div>' +
                      safeRichHtml(
                        question
                          .explanation ||
                        '暂无详细解析内容。'
                      ) +
                    '</div>' +

                  '</div>'
                )
              : ''
          ) +

          '<div class="er-note">' +

            '<div class="er-note-head">' +

              '<strong>' +
                '我的题目笔记' +
              '</strong>' +

              '<button ' +
                'class="er-note-btn" ' +
                'data-action="' +
                  (
                    isEditing
                      ? 'saveNote'
                      : 'editNote'
                  ) +
                '" ' +
                'data-q-id="' +
                  esc(
                    question.id
                  ) +
                '" ' +
                'type="button"' +
              '>' +
                (
                  isEditing
                    ? '保存'
                    : (
                        note
                          ? '修改'
                          : '添加'
                      )
                ) +
              '</button>' +

            '</div>' +

            (
              isEditing
                ? (
                    '<textarea ' +
                      'id="erNoteInput" ' +
                      'class="er-note-textarea" ' +
                      'placeholder="' +
                        '记录定位句、同义替换、干扰项逻辑……' +
                      '"' +
                    '>' +
                      esc(note) +
                    '</textarea>'
                  )
                : (
                    note
                      ? (
                          '<div class="er-note-text">' +
                            esc(note) +
                          '</div>'
                        )
                      : (
                          '<div class="er-note-empty">' +
                            '暂无笔记。建议记录定位句、同义替换和错因。' +
                          '</div>'
                        )
                  )
            ) +

          '</div>' +

        '</article>' +

      '</div>';
  }

  /* =======================================================
     Render lifecycle
     ======================================================= */

  function applyAnnotations() {
    if (
      window
        .EnglishAnnotations &&
      typeof window
        .EnglishAnnotations
        .afterRender ===
        'function'
    ) {
      window
        .EnglishAnnotations
        .afterRender(app);
    }
  }

  function renderAll(
    options
  ) {
    options =
      options ||
      {};

    var passageScroll =
      passageScrollEl
        ? passageScrollEl
            .scrollTop
        : 0;

    if (
      !resolveState()
    ) {
      return showFatal(
        '当前年份没有可用的 Reading Part A 数据。'
      );
    }

    renderHeader();
    renderPassage();
    renderTabs();
    renderQuestion();

    applyAnnotations();

    if (
      options
        .keepPassageScroll &&
      passageScrollEl
    ) {
      passageScrollEl.scrollTop =
        passageScroll;
    }
  }

  /*
   * Critical immersive behavior:
   *
   * Q switching / answering / mastery / explanation / notes
   * rerender ONLY the right side.
   *
   * Left article DOM and scroll position stay completely untouched.
   */
  function renderQuestionSide(
    options
  ) {
    options =
      options ||
      {};

    renderHeader();
    renderTabs();
    renderQuestion();

    applyAnnotations();

    if (
      !options
        .keepQuestionScroll &&
      questionScrollEl
    ) {
      questionScrollEl.scrollTop =
        0;
    }

    updateUrl();
  }

  function changeQuestionBy(
    delta
  ) {
    var index =
      questionIndex(
        activeQuestionId
      );

    var next =
      currentQuestions[
        index + delta
      ];

    if (!next) {
      return;
    }

    activeQuestionId =
      next.id;

    editingNoteId =
      '';

    renderQuestionSide();
  }

  /* =======================================================
     Toast / errors
     ======================================================= */

  function showToast(
    message
  ) {
    if (!toastEl) {
      return;
    }

    toastEl.textContent =
      message;

    toastEl
      .classList
      .add('show');

    clearTimeout(
      toastEl._timer
    );

    toastEl._timer =
      setTimeout(
        function () {
          toastEl
            .classList
            .remove('show');
        },
        1900
      );
  }

  function showFatal(
    message
  ) {
    if (!fatalEl) {
      return;
    }

    fatalEl.hidden =
      false;

    fatalEl.textContent =
      '英语精读页面加载失败\n\n' +
      message;
  }

  /* =======================================================
     Word lookup
     ======================================================= */

  function closeWordPopover() {
    if (
      wordPopover &&
      wordPopover
        .isConnected
    ) {
      wordPopover.remove();
    }

    wordPopover =
      null;
  }

  /*
   * Annotation engine calls this when drag-selection begins,
   * preventing the old dictionary popover from fighting
   * with precision reading selection.
   */
  window.closeEnglishWordPopover =
    closeWordPopover;

  function queryWord(
    word,
    callback
  ) {
    var clean =
      String(
        word ||
        ''
      )
        .toLowerCase()
        .trim();

    if (!clean) {
      return;
    }

    if (
      dictCache[
        clean
      ]
    ) {
      return callback(
        dictCache[
          clean
        ]
      );
    }

    var xhr =
      new XMLHttpRequest();

    xhr.open(
      'GET',
      'https://english.kaoyansou.cn/api/word/query/' +
      encodeURIComponent(
        clean
      ),
      true
    );

    xhr.timeout =
      4000;

    xhr.onload =
      function () {
        var result =
          null;

        if (
          xhr.status ===
          200
        ) {
          try {
            var parsed =
              JSON.parse(
                xhr.responseText
              );

            if (
              parsed &&
              parsed.code ===
                200 &&
              parsed.data
            ) {
              result = {
                word:
                  parsed.data
                    .word ||
                  clean,

                lemma:
                  parsed.data
                    .lemma ||
                  clean,

                phonetic:
                  parsed.data
                    .phonetic ||
                  '',

                definition:
                  parsed.data
                    .definition ||
                  '',

                speakUrl:
                  parsed.data
                    .speakUrl ||
                  ''
              };
            }
          } catch (error) {}
        }

        result =
          result ||
          {
            word:
              clean,

            lemma:
              clean,

            phonetic:
              '',

            definition:
              '暂未查询到释义。',

            speakUrl:
              ''
          };

        dictCache[
          clean
        ] =
          result;

        saveJson(
          DICT_CACHE_KEY,
          dictCache
        );

        callback(
          result
        );
      };

    xhr.onerror =
    xhr.ontimeout =
      function () {
        callback({
          word:
            clean,

          lemma:
            clean,

          phonetic:
            '',

          definition:
            '网络查询暂时不可用。',

          speakUrl:
            ''
        });
      };

    xhr.send();
  }

  function addToVocab(
    entry,
    sentence
  ) {
    var book =
      loadJson(
        VOCAB_KEY,
        {
          items: []
        }
      );

    if (
      !book ||
      !Array.isArray(
        book.items
      )
    ) {
      book = {
        items: []
      };
    }

    var target =
      String(
        entry.lemma ||
        entry.word ||
        ''
      )
        .toLowerCase()
        .trim();

    if (
      book.items.some(
        function (
          item
        ) {
          return (
            String(
              item.word ||
              item.text ||
              ''
            )
              .toLowerCase()
              .trim() ===
            target
          );
        }
      )
    ) {
      showToast(
        '该单词已经在真题生词本中'
      );

      return;
    }

    book.items.unshift({
      id:
        'w_' +
        Date.now()
          .toString(36) +
        Math.random()
          .toString(36)
          .slice(2, 7),

      word:
        entry.lemma ||
        entry.word,

      meaning:
        String(
          entry.definition ||
          ''
        )
          .replace(
            /<[^>]+>/g,
            ' '
          )
          .replace(
            /\s+/g,
            ' '
          )
          .trim() ||
        '（待补充释义）',

      phonetic:
        entry.phonetic ||
        '',

      year:
        curYear,

      sectionId:
        currentSection.id,

      sourceTitle:
        curYear +
        '年 ' +
        (
          currentSection
            .displayTitle ||
          currentSection
            .sectionName ||
          ''
        ),

      sentence:
        sentence ||
        '',

      status:
        'wrong',

      createdAt:
        Date.now()
    });

    saveJson(
      VOCAB_KEY,
      book
    );

    showToast(
      '已加入真题生词本'
    );
  }

  function paragraphSentenceForWord(
    wordEl
  ) {
    var scope =
      wordEl.closest(
        '.ez-annotation-scope'
      );

    return scope
      ? (
          scope.textContent ||
          ''
        ).trim()
      : '';
  }

  function showWordPopover(
    wordEl,
    word
  ) {
    closeWordPopover();

    var rect =
      wordEl
        .getBoundingClientRect();

    wordPopover =
      document
        .createElement(
          'div'
        );

    wordPopover.className =
      'er-word-popover';

    wordPopover.innerHTML =
      '<div class="er-word-popover-head">' +
        '<strong>' +
          esc(word) +
        '</strong>' +
        '<button ' +
          'type="button" ' +
          'data-word-close ' +
          'style="' +
            'border:0;' +
            'background:transparent;' +
            'color:#7b8fa4;' +
            'cursor:pointer;' +
            'font-size:18px' +
          '"' +
        '>' +
          '×' +
        '</button>' +
      '</div>' +

      '<div class="er-word-popover-phonetic">' +
        '查询中…' +
      '</div>' +

      '<div class="er-word-popover-def">' +
        '正在查询释义' +
      '</div>';

    document.body
      .appendChild(
        wordPopover
      );

    var left =
      Math.min(
        window.innerWidth -
          wordPopover
            .offsetWidth -
          12,

        Math.max(
          12,
          rect.left
        )
      );

    var top =
      rect.bottom +
      8;

    if (
      top +
      wordPopover
        .offsetHeight >
      window.innerHeight -
      12
    ) {
      top =
        Math.max(
          12,

          rect.top -
          wordPopover
            .offsetHeight -
          8
        );
    }

    wordPopover.style.left =
      left +
      'px';

    wordPopover.style.top =
      top +
      'px';

    wordPopover
      .querySelector(
        '[data-word-close]'
      )
      .onclick =
        closeWordPopover;

    queryWord(
      word,

      function (
        entry
      ) {
        if (
          !wordPopover ||
          !wordPopover
            .isConnected
        ) {
          return;
        }

        wordPopover.innerHTML =
          '<div class="er-word-popover-head">' +

            '<strong>' +
              esc(
                entry.word ||
                word
              ) +
            '</strong>' +

            '<button ' +
              'type="button" ' +
              'data-word-close ' +
              'style="' +
                'border:0;' +
                'background:transparent;' +
                'color:#7b8fa4;' +
                'cursor:pointer;' +
                'font-size:18px' +
              '"' +
            '>' +
              '×' +
            '</button>' +

          '</div>' +

          '<div class="er-word-popover-phonetic">' +
            esc(
              entry.phonetic ||
              ''
            ) +
          '</div>' +

          '<div class="er-word-popover-def">' +
            safeRichHtml(
              entry.definition ||
              '暂无释义'
            ) +
          '</div>' +

          '<div class="er-word-popover-actions">' +

            '<button ' +
              'type="button" ' +
              'data-word-speak' +
            '>' +
              '🔊 发音' +
            '</button>' +

            '<button ' +
              'type="button" ' +
              'class="is-primary" ' +
              'data-word-add' +
            '>' +
              '＋ 生词本' +
            '</button>' +

          '</div>';

        wordPopover
          .querySelector(
            '[data-word-close]'
          )
          .onclick =
            closeWordPopover;

        wordPopover
          .querySelector(
            '[data-word-add]'
          )
          .onclick =
            function () {
              addToVocab(
                entry,
                paragraphSentenceForWord(
                  wordEl
                )
              );
            };

        wordPopover
          .querySelector(
            '[data-word-speak]'
          )
          .onclick =
            function () {
              if (
                entry.speakUrl
              ) {
                new Audio(
                  entry.speakUrl
                )
                  .play()
                  .catch(
                    function () {}
                  );
              } else if (
                'speechSynthesis' in
                window
              ) {
                var utterance =
                  new SpeechSynthesisUtterance(
                    entry.word ||
                    word
                  );

                utterance.lang =
                  'en-US';

                utterance.rate =
                  .9;

                window
                  .speechSynthesis
                  .cancel();

                window
                  .speechSynthesis
                  .speak(
                    utterance
                  );
              }
            };
      }
    );
  }

  /* =======================================================
     Navigation
     ======================================================= */

  function backToEnglish() {
    /*
     * english.js integration patch below will read ?openEnglish=1
     * and reopen the English workbench.
     */
    sessionStorage.setItem(
      'openEnglishAfterReading',
      '1'
    );

    window.location.href =
      'index.html?openEnglish=1';
  }

  /* =======================================================
     Events
     ======================================================= */

  function bindEvents() {

    app.addEventListener(
      'change',

      function (
        event
      ) {

        if (
          event.target.id ===
          'erYearSelect'
        ) {
          curYear =
            event.target.value;

          var sections =
            readingSections(
              curYear
            );

          curSectionId =
            sections.length
              ? String(
                  sections[0].id
                )
              : '';

          activeQuestionId =
            '';

          if (
            passageScrollEl
          ) {
            passageScrollEl
              .scrollTop =
              0;
          }

          renderAll();

        } else if (
          event.target.id ===
          'erSectionSelect'
        ) {
          curSectionId =
            event.target.value;

          activeQuestionId =
            '';

          if (
            passageScrollEl
          ) {
            passageScrollEl
              .scrollTop =
              0;
          }

          renderAll();
        }
      }
    );

    app.addEventListener(
      'click',

      function (
        event
      ) {

        /*
         * Normal click:
         * keep the existing dictionary interaction.
         *
         * Drag selection:
         * english-annotations.js capture listener suppresses
         * the click generated immediately after selection.
         */
        var wordEl =
          event.target
            .closest(
              '.ez-word'
            );

        if (wordEl) {
          event
            .stopPropagation();

          showWordPopover(
            wordEl,
            wordEl.getAttribute(
              'data-word'
            )
          );

          return;
        }

        if (
          !event.target
            .closest(
              '.er-word-popover'
            )
        ) {
          closeWordPopover();
        }

        var target =
          event.target
            .closest(
              'button'
            );

        if (!target) {
          return;
        }

        var action =
          target.dataset
            .action ||
          '';

        if (
          action ===
          'back'
        ) {
          return backToEnglish();
        }

        if (
          action ===
          'toggleBilingual'
        ) {
          bilingualMode =
            !bilingualMode;

          localStorage.setItem(
            BILINGUAL_KEY,
            String(
              bilingualMode
            )
          );

          /*
           * Only rerender LEFT.
           * Keep its scroll position.
           */
          var scrollTop =
            passageScrollEl
              .scrollTop;

          renderHeader();
          renderPassage();
          applyAnnotations();

          passageScrollEl
            .scrollTop =
            scrollTop;

          return;
        }

        if (
          action ===
            'toggleAnnotations' &&
          window
            .EnglishAnnotations
        ) {
          window
            .EnglishAnnotations
            .setEnabled(
              !window
                .EnglishAnnotations
                .isEnabled()
            );

          renderHeader();
          applyAnnotations();

          return;
        }

        if (
          target
            .classList
            .contains(
              'er-qtab'
            )
        ) {
          activeQuestionId =
            target.dataset
              .qId;

          editingNoteId =
            '';

          renderQuestionSide();

          return;
        }

        if (
          target
            .classList
            .contains(
              'er-option'
            )
        ) {
          answers[
            target.dataset.qId
          ] =
            target.dataset
              .optKey;

          saveJson(
            ANSWERS_KEY,
            answers
          );

          activeQuestionId =
            target.dataset
              .qId;

          renderQuestionSide({
            keepQuestionScroll:
              true
          });

          return;
        }

        if (
          target
            .classList
            .contains(
              'er-mastery'
            )
        ) {
          var qid =
            target.dataset
              .qId;

          var status =
            target.dataset
              .status;

          if (
            statuses[qid] ===
            status
          ) {
            delete statuses[
              qid
            ];
          } else {
            statuses[
              qid
            ] =
              status;
          }

          saveJson(
            STATUS_KEY,
            statuses
          );

          renderQuestionSide({
            keepQuestionScroll:
              true
          });

          return;
        }

        if (
          action ===
          'toggleExp'
        ) {
          expanded[
            target.dataset.qId
          ] =
            !expanded[
              target.dataset.qId
            ];

          renderQuestionSide({
            keepQuestionScroll:
              true
          });

          return;
        }

        if (
          action ===
          'prevQuestion'
        ) {
          return changeQuestionBy(
            -1
          );
        }

        if (
          action ===
          'nextQuestion'
        ) {
          return changeQuestionBy(
            1
          );
        }

        if (
          action ===
          'editNote'
        ) {
          editingNoteId =
            target.dataset.qId;

          renderQuestionSide({
            keepQuestionScroll:
              true
          });

          var input =
            document.getElementById(
              'erNoteInput'
            );

          if (input) {
            input.focus();
          }

          return;
        }

        if (
          action ===
          'saveNote'
        ) {
          var noteInput =
            document.getElementById(
              'erNoteInput'
            );

          notes[
            target.dataset.qId
          ] =
            noteInput
              ? noteInput
                  .value
                  .trim()
              : '';

          if (
            !notes[
              target.dataset.qId
            ]
          ) {
            delete notes[
              target.dataset.qId
            ];
          }

          saveJson(
            NOTES_KEY,
            notes
          );

          editingNoteId =
            '';

          renderQuestionSide({
            keepQuestionScroll:
              true
          });

          showToast(
            '题目笔记已保存'
          );
        }
      }
    );

    document.addEventListener(
      'pointerdown',

      function (
        event
      ) {
        if (
          wordPopover &&
          !event.target
            .closest(
              '.er-word-popover'
            ) &&
          !event.target
            .closest(
              '.ez-word'
            )
        ) {
          closeWordPopover();
        }
      },

      true
    );

    /* Keyboard helpers */
    document.addEventListener(
      'keydown',

      function (
        event
      ) {
        var tag =
          event.target &&
          event.target
            .tagName;

        if (
          tag === 'INPUT' ||
          tag === 'TEXTAREA' ||
          tag === 'SELECT'
        ) {
          return;
        }

        var question =
          currentQuestion();

        if (!question) {
          return;
        }

        var lower =
          event.key
            .toLowerCase();

        if (
          lower === 'a'
        ) {
          event.preventDefault();

          changeQuestionBy(
            -1
          );

        } else if (
          lower === 'd'
        ) {
          event.preventDefault();

          changeQuestionBy(
            1
          );

        } else if (
          event.code ===
          'Space'
        ) {
          event.preventDefault();

          expanded[
            question.id
          ] =
            !expanded[
              question.id
            ];

          renderQuestionSide({
            keepQuestionScroll:
              true
          });

        } else if (
          /^[1-4]$/.test(
            event.key
          )
        ) {
          var options =
            (
              question.options ||
              []
            ).filter(
              function (
                option
              ) {
                return (
                  option &&
                  String(
                    option.text ||
                    ''
                  ).trim()
                );
              }
            );

          var option =
            options[
              parseInt(
                event.key,
                10
              ) -
              1
            ];

          if (option) {
            answers[
              question.id
            ] =
              option.key;

            saveJson(
              ANSWERS_KEY,
              answers
            );

            renderQuestionSide({
              keepQuestionScroll:
                true
            });
          }
        }
      }
    );

    window.addEventListener(
      'englishannotationschange',

      function () {
        renderHeader();
      }
    );

    window.addEventListener(
      'englishannotationsenabledchange',

      function () {
        renderHeader();
      }
    );
  }

  /* =======================================================
     Bootstrap
     ======================================================= */

  try {
    if (
      !resolveState()
    ) {
      throw new Error(
        '当前年份没有 Reading Part A 数据。'
      );
    }

    bindEvents();
    renderAll();

    window.__ENGLISH_READING_READY__ =
      true;

  } catch (error) {
    console.error(
      '[EnglishReading] bootstrap failed:',

      error
    );

    showFatal(
      error &&
      error.message
        ? error.message
        : String(error)
    );
  }

})();
