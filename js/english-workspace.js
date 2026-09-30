(function(){
  'use strict';

  var PAYLOAD_KEY='ENGLISH_WORKSPACE_PAYLOAD_V4';
  var ANSWERS_KEY='user_guest_kaoyan_english_user_answers_v1';
  var STATUS_KEY='user_guest_kaoyan_english_zhenti_status_v1';
  var NOTES_KEY='user_guest_kaoyan_english_notes_v1';
  var DRAFTS_KEY='user_guest_kaoyan_english_drafts_v1';
  var BILINGUAL_KEY='user_guest_kaoyan_english_bilingual_v1';
  var VOCAB_KEY='user_guest_kaoyan_english_zhenti_vocab_v1';
  var DICT_CACHE_KEY='user_guest_kaoyan_dict_cache_v2';

  var payload=null, section=null, year='', questions=[], activeIndex=0;
  var answers=readJson(ANSWERS_KEY,{});
  var statuses=readJson(STATUS_KEY,{});
  var notes=readJson(NOTES_KEY,{});
  var drafts=readJson(DRAFTS_KEY,{});
  var dictCache=readJson(DICT_CACHE_KEY,{});
  var bilingual=localStorage.getItem(BILINGUAL_KEY)==='true';
  var explanationOpen=false;
  var annotationEnabled=true;

  var app=document.getElementById('ewApp');
  var empty=document.getElementById('ewEmpty');
  var source=document.getElementById('ewSource');
  var task=document.getElementById('ewTask');
  var tabs=document.getElementById('ewQuestionTabs');
  var sourceScroll=document.getElementById('ewSourceScroll');
  var taskHeading=document.getElementById('ewTaskHeading');

  function readJson(key,fallback){
    try{var x=localStorage.getItem(key);return x?JSON.parse(x):fallback;}catch(e){return fallback;}
  }
  function saveJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch(e){}}
  function esc(value){
    return String(value==null?'':value).replace(/[&<>'"]/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];
    });
  }
  function rich(value){
    var raw = String(value || '');
    if(!raw) return '';
    if(window.DOMPurify && typeof DOMPurify.sanitize === 'function'){
      return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
    }
    if(/<\/?(?:p|br|strong|em|b|i|span|ul|ol|li|details|summary)\b/i.test(raw)){
      return raw.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/on\w+="[^"]*"/gi, '')
                .replace(/on\w+='[^']*'/gi, '');
    }
    return esc(raw).replace(/\r?\n/g,'<br>');
  }
  function normalizeText(value){
    return String(value==null?'':value)
      .replace(/\u00a0/g,' ')
      .replace(/[ \t]+/g,' ')
      .replace(/\r?\n[ \t]*/g,' ')
      .replace(/\s+([,.;:!?%])/g,'$1')
      .trim();
  }
  function wordify(value){
    var s=normalizeText(value);
    return s.replace(/([a-zA-Z]+(?:['’][a-zA-Z]+)?)|([^a-zA-Z'’]+)/g,function(_,word,other){
      if(word){
        var clean=word.toLowerCase().replace(/['’]s$/,'');
        return '<span class="ew-word" data-word="'+esc(clean)+'">'+esc(word)+'</span>';
      }
      return String(other||'').replace(/[&<>'"]/g,function(c){
        return {'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c];
      });
    });
  }
  function metaFor(type){
    return {
      cloze:{label:'完形填空',en:'USE OF ENGLISH'},
      reading:{label:'阅读理解',en:'READING PART A'},
      partB:{label:'新题型',en:'READING PART B'},
      translation:{label:'英译汉',en:'TRANSLATION'},
      writingA:{label:'应用文写作',en:'WRITING PART A'},
      writingB:{label:'短文写作',en:'WRITING PART B'}
    }[type]||{label:'英语真题',en:'ENGLISH I'};
  }
  function init(){
    try{payload=JSON.parse(sessionStorage.getItem(PAYLOAD_KEY)||'null');}catch(e){payload=null;}
    if(!payload||!payload.section){
      app.hidden=true;empty.hidden=false;
      document.getElementById('ewEmptyBack').addEventListener('click',goBack);
      return;
    }
    section=payload.section;year=String(payload.year||'');questions=Array.isArray(section.questions)?section.questions:[];
    activeIndex=Math.max(0,Math.min(questions.length-1,Number(payload.questionIndex)||0));
    var meta=metaFor(section.type);
    document.getElementById('ewTypeLabel').textContent=meta.en;
    document.getElementById('ewTitle').textContent=(year?year+' 年 · ':'')+(section.displayTitle||section.sectionName||meta.label);
    document.getElementById('ewSectionMeta').textContent=meta.label+' · '+(questions.length?questions.length+' 题':'精读任务');
    document.getElementById('ewBackBtn').addEventListener('click',goBack);
    document.getElementById('ewBilingualBtn').addEventListener('click',toggleBilingual);
    document.getElementById('ewAnnotationToggle').addEventListener('click',toggleAnnotation);
    bindSourceEvents();
    renderSource();
    renderTabs();
    renderTask();
    app.hidden=false;empty.hidden=true;
    if(window.EnglishAnnotations){
      EnglishAnnotations.mount(source,{scopePrefix:scopePrefix()});
    }
    window.addEventListener('keydown',onKeydown);
  }
  function scopePrefix(){
    return ['eng',year,section.id,section.type].join(':');
  }
  function goBack(){
    var target=payload&&payload.returnUrl?payload.returnUrl:'index.html?return=english';
    location.href=target;
  }
  function toggleBilingual(){
    bilingual=!bilingual;
    localStorage.setItem(BILINGUAL_KEY,String(bilingual));
    var old=sourceScroll.scrollTop;
    renderSource();
    sourceScroll.scrollTop=old;
    if(window.EnglishAnnotations) EnglishAnnotations.mount(source,{scopePrefix:scopePrefix()});
    document.getElementById('ewBilingualBtn').textContent=bilingual?'隐藏译文':'译文';
  }
  function toggleAnnotation(){
    annotationEnabled=!annotationEnabled;
    if(window.EnglishAnnotations) EnglishAnnotations.setEnabled(annotationEnabled);
    var btn=document.getElementById('ewAnnotationToggle');
    btn.textContent=annotationEnabled?'标注开启':'标注关闭';
    btn.classList.toggle('ew-btn-primary',annotationEnabled);
    btn.setAttribute('aria-pressed',String(annotationEnabled));
  }
  function renderSource(){
    var meta=metaFor(section.type);
    var intro='<div class="ew-section-intro"><span class="ew-pane-eyebrow">'+esc(meta.en)+'</span><h2>'+esc(section.displayTitle||section.sectionName||meta.label)+'</h2>'+
      (section.beform?'<p>出处 / 背景：'+esc(section.beform)+'</p>':'')+'</div>';

    if(section.type==='writingA'||section.type==='writingB'){
      var writing=section.writing||{};
      var sample=Array.isArray(writing.sampleEssay)?writing.sampleEssay:[];
      source.innerHTML=intro+
        '<section class="ew-task-card"><span class="ew-q-badge">题目要求</span><div class="ew-writing-prompt" data-annotation-scope="'+esc(scopePrefix()+':prompt')+'">'+rich(writing.prompt||'暂无题目要求')+'</div>'+
        (writing.imageUrl?'<p><img class="ew-writing-image" src="'+esc(writing.imageUrl)+'" alt="写作真题配图"></p>':'')+'</section>'+
        (sample.length?'<div class="ew-section-intro" style="margin-top:16px"><strong>参考范文（可精读标注）</strong></div>'+sample.map(renderParagraph).join(''):'');
      document.getElementById('ewSourceHint').textContent='题目要求和参考范文都可精读标注';
      return;
    }

    var paragraphs=Array.isArray(section.paragraphs)?section.paragraphs:[];
    source.innerHTML=intro+(paragraphs.length?paragraphs.map(renderParagraph).join(''):'<div class="ew-section-intro"><p>该题型暂无独立原文段落，请在右侧完成任务。</p></div>');
    document.getElementById('ewSourceHint').textContent='拖选文字进行 Word 风格荧光标注';
  }
  function renderParagraph(p,index){
    var label=section.type==='partB'?String(p.duanluo||index+1):'P'+(index+1);
    var scope=scopePrefix()+':p'+(index+1);
    return '<section class="ew-paragraph"><span class="ew-paragraph-index">'+esc(label)+'</span><div class="ew-paragraph-copy">'+
      '<div class="ew-paragraph-en" data-annotation-scope="'+esc(scope)+'">'+wordify(p.english||'')+'</div>'+
      (bilingual&&p.chinese?'<div class="ew-paragraph-zh">'+esc(p.chinese)+'</div>':'')+
      '</div></section>';
  }
  function renderTabs(){
    if(section.type==='writingA'||section.type==='writingB'||!questions.length){tabs.innerHTML='';return;}
    tabs.innerHTML=questions.map(function(q,i){
      var done=Boolean(answers[q.id]||statuses[q.id]);
      return '<button class="ew-q-tab'+(i===activeIndex?' active':'')+(done?' done':'')+'" type="button" data-q-index="'+i+'">'+esc(q.num||i+1)+'</button>';
    }).join('');
    tabs.querySelectorAll('[data-q-index]').forEach(function(btn){
      btn.addEventListener('click',function(){setActive(Number(btn.getAttribute('data-q-index')));});
    });
  }
  function setActive(index){
    activeIndex=Math.max(0,Math.min(questions.length-1,index));
    explanationOpen=false;
    renderTabs();renderTask();
    document.getElementById('ewTaskScroll').scrollTop=0;
  }
  function renderTask(){
    if(section.type==='writingA'||section.type==='writingB'){renderWritingTask();return;}
    if(!questions.length){
      taskHeading.textContent='精读任务';
      task.innerHTML='<div class="ew-task-card"><p class="ew-muted">当前部分没有独立题目。</p></div>';return;
    }
    var q=questions[activeIndex], answer=normalizeAnswer(q.answer), choice=answers[q.id]||'', isTranslation=section.type==='translation';
    taskHeading.textContent=(isTranslation?'翻译 ':'第 ')+(q.num||activeIndex+1)+(isTranslation?'':' 题');
    var options='';
    if(!isTranslation){
      var opts=(q.options||[]).filter(function(o){return o&&String(o.text||'').trim();});
      options='<div class="ew-options">'+opts.map(function(o){
        var cls='ew-option'+(choice===o.key?' selected':'');
        if(explanationOpen&&choice){
          if(o.key===answer) cls+=' correct'; else if(choice===o.key) cls+=' wrong';
        }
        return '<button class="'+cls+'" type="button" data-opt="'+esc(o.key)+'"><span class="ew-opt-key">'+esc(o.key)+'</span><span class="ew-opt-text">'+esc(o.text)+'</span></button>';
      }).join('')+'</div>';
    }else{
      var dkey='translation_'+q.id, draft=drafts[dkey]||'';
      options='<textarea class="ew-draft" id="ewTranslationDraft" data-draft-key="'+esc(dkey)+'" placeholder="先独立完成译文，自动保存在本机……">'+esc(draft)+'</textarea><div class="ew-counter" id="ewDraftCounter">'+draft.length+' 字</div>';
    }

    var exp='';
    if(explanationOpen){
      exp='<div class="ew-exp"><div class="ew-exp-answer">'+(isTranslation?'参考译文：':'标准答案：')+esc(isTranslation?(q.answer||'暂无'):(answer||'暂无'))+'</div>'+
        (q.explanation?'<div>'+rich(q.explanation)+'</div>':'<span class="ew-muted">暂无详细解析</span>')+'</div>';
    }

    task.innerHTML='<article class="ew-task-card" data-q-id="'+esc(q.id)+'">'+
      '<div class="ew-task-meta"><span class="ew-q-badge">'+(section.type==='partB'?'空位 ':'第 ')+esc(q.num||activeIndex+1)+(section.type==='partB'?'':' 题')+'</span><span class="ew-muted">'+esc(metaFor(section.type).label)+'</span></div>'+
      (section.type==='partB'?'':'<div class="ew-q-stem">'+wordify(q.stem||'')+'</div>')+
      options+
      renderMastery(q)+
      '<div class="ew-actions"><button id="ewExpBtn" class="ew-btn '+(explanationOpen?'ew-btn-primary':'')+'" type="button">'+(explanationOpen?'收起解析':'查看答案与解析')+'</button></div>'+
      exp+
      '<div class="ew-note-box"><label class="ew-muted" for="ewQuestionNote">题目笔记（自动保存）</label><textarea id="ewQuestionNote" placeholder="记录生词、长难句或解题思路……">'+esc(notes[q.id]||'')+'</textarea></div>'+
      '</article>';
    bindTaskEvents(q);
  }
  function renderMastery(q){
    var st=statuses[q.id]||'';
    var arr=[['proficient','熟练'],['familiar','较熟练'],['vague','模糊'],['rusty','困难'],['wrong','不会']];
    return '<div class="ew-mastery">'+arr.map(function(x){
      return '<button type="button" data-status="'+x[0]+'" class="'+(st===x[0]?'active':'')+'">'+x[1]+'</button>';
    }).join('')+'</div>';
  }
  function bindTaskEvents(q){
    task.querySelectorAll('[data-opt]').forEach(function(btn){
      btn.addEventListener('click',function(){
        answers[q.id]=btn.getAttribute('data-opt');saveJson(ANSWERS_KEY,answers);renderTabs();renderTask();
      });
    });
    task.querySelectorAll('[data-status]').forEach(function(btn){
      btn.addEventListener('click',function(){
        var st=btn.getAttribute('data-status');
        if(statuses[q.id]===st) delete statuses[q.id]; else statuses[q.id]=st;
        saveJson(STATUS_KEY,statuses);renderTabs();renderTask();
      });
    });
    var expBtn=document.getElementById('ewExpBtn');
    if(expBtn) expBtn.addEventListener('click',function(){explanationOpen=!explanationOpen;renderTask();});
    var note=document.getElementById('ewQuestionNote');
    if(note) note.addEventListener('input',function(){notes[q.id]=note.value;saveJson(NOTES_KEY,notes);});
    var draft=document.getElementById('ewTranslationDraft');
    if(draft) draft.addEventListener('input',function(){
      var key=draft.getAttribute('data-draft-key');drafts[key]=draft.value;saveJson(DRAFTS_KEY,drafts);
      var c=document.getElementById('ewDraftCounter');if(c)c.textContent=draft.value.length+' 字';
    });
  }
  function renderWritingTask(){
    var writing=section.writing||{};
    var key='writing_'+year+'_'+section.id;
    var draft=drafts[key]||'';
    taskHeading.textContent='写作草稿';
    task.innerHTML='<article class="ew-task-card"><span class="ew-q-badge">'+esc(metaFor(section.type).label)+'</span>'+
      '<h3>我的草稿</h3><textarea class="ew-draft" id="ewWritingDraft" placeholder="建议先写提纲，再完成正文；自动保存……">'+esc(draft)+'</textarea>'+
      '<div class="ew-counter" id="ewWritingCount">'+countWords(draft)+' words</div>'+
      (writing.analysis?'<details class="ew-exp" style="margin-top:16px"><summary>查看范文结构解析与写作技巧</summary><div style="margin-top:10px">'+rich(writing.analysis)+'</div></details>':'')+
      '</article>';
    var el=document.getElementById('ewWritingDraft');
    el.addEventListener('input',function(){
      drafts[key]=el.value;saveJson(DRAFTS_KEY,drafts);
      document.getElementById('ewWritingCount').textContent=countWords(el.value)+' words';
    });
  }
  function normalizeAnswer(value){
    var s=String(value==null?'':value).trim();
    if(/^[1-8]$/.test(s)) return String.fromCharCode(64+parseInt(s,10));
    if(/^[A-H]$/i.test(s)) return s.toUpperCase();
    return s;
  }
  function countWords(value){
    var m=String(value||'').match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g);return m?m.length:0;
  }
  function bindSourceEvents(){
    source.addEventListener('click',function(e){
      var word=e.target.closest('.ew-word');
      if(!word) return;
      var sel=window.getSelection&&window.getSelection();
      if(sel&&!sel.isCollapsed) return;
      showWord(word,word.getAttribute('data-word')||word.textContent);
    });
  }
  function showWord(anchor,word){
    document.querySelectorAll('.ew-word-pop').forEach(function(x){x.remove();});
    var pop=document.createElement('div');pop.className='ew-word-pop';
    pop.innerHTML='<h4>'+esc(word)+'</h4><p id="ewWordDef" class="ew-muted">正在查询释义……</p><div class="ew-pop-actions"><button id="ewAddVocab" class="ew-btn ew-btn-primary" type="button">加入真题生词本</button><button id="ewCloseWord" class="ew-btn" type="button">关闭</button></div>';
    document.body.appendChild(pop);
    var r=anchor.getBoundingClientRect(),w=340;
    pop.style.left=Math.max(10,Math.min(innerWidth-w-10,r.left+r.width/2-w/2))+'px';
    pop.style.top=Math.min(innerHeight-240,r.bottom+8)+'px';
    document.getElementById('ewCloseWord').onclick=function(){pop.remove();};
    var current={word:word,phonetic:'',definition:''};
    queryWord(word,function(info){
      current=info;
      var el=document.getElementById('ewWordDef');if(el&&document.body.contains(pop)){
        el.innerHTML=info.definition?info.definition:'未找到预设释义，可加入生词本后自行补充。';
      }
    });
    document.getElementById('ewAddVocab').onclick=function(){
      addVocab(current,anchor.closest('.ew-paragraph-en')?anchor.closest('.ew-paragraph-en').innerText:'');
      this.textContent='已加入';
    };
  }
  function queryWord(word,cb){
    var k=String(word||'').toLowerCase().trim();
    if(dictCache[k]){cb(dictCache[k]);return;}
    var xhr=new XMLHttpRequest();
    xhr.open('GET','https://english.kaoyansou.cn/api/word/query/'+encodeURIComponent(k),true);
    xhr.timeout=4000;
    xhr.onload=function(){
      var out={word:k,phonetic:'',definition:''};
      try{var res=JSON.parse(xhr.responseText);if(res&&res.code===200&&res.data)out={word:res.data.word||k,phonetic:res.data.phonetic||'',definition:res.data.definition||''};}catch(e){}
      dictCache[k]=out;saveJson(DICT_CACHE_KEY,dictCache);cb(out);
    };
    xhr.onerror=xhr.ontimeout=function(){cb({word:k,phonetic:'',definition:''});};
    xhr.send();
  }
  function addVocab(info,sentence){
    var store=readJson(VOCAB_KEY,{items:[]});if(!Array.isArray(store.items))store.items=[];
    var target=String(info.word||'').toLowerCase().trim();
    if(store.items.some(function(x){return String(x.word||x.text||'').toLowerCase().trim()===target;}))return;
    store.items.unshift({id:'w_'+Date.now().toString(36),word:info.word||target,meaning:String(info.definition||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim()||'（待补充释义）',phonetic:info.phonetic||'',year:year,sectionId:section.id,sourceTitle:(year+' '+(section.displayTitle||section.sectionName||'')).trim(),sentence:sentence||'',status:'wrong',createdAt:Date.now()});
    saveJson(VOCAB_KEY,store);
  }
  function onKeydown(e){
    var tag=e.target&&e.target.tagName?e.target.tagName.toLowerCase():'';
    if(tag==='textarea'||tag==='input')return;
    if(e.key==='Escape'){document.querySelectorAll('.ew-word-pop').forEach(function(x){x.remove();});return;}
    if(!questions.length)return;
    if(e.key==='ArrowRight'||e.key.toLowerCase()==='j'){e.preventDefault();setActive((activeIndex+1)%questions.length);return;}
    if(e.key==='ArrowLeft'||e.key.toLowerCase()==='k'){e.preventDefault();setActive((activeIndex-1+questions.length)%questions.length);return;}
    if(e.code==='Space'){e.preventDefault();explanationOpen=!explanationOpen;renderTask();return;}
    var map={'1':'A','2':'B','3':'C','4':'D','a':'A','b':'B','c':'C','d':'D'};
    var q=questions[activeIndex],choice=map[e.key.toLowerCase()];
    if(choice&&(q.options||[]).some(function(o){return o.key===choice;})){answers[q.id]=choice;saveJson(ANSWERS_KEY,answers);renderTabs();renderTask();}
  }

  init();
})();
