(function(global){
  'use strict';

  var PAYLOAD_KEY='ENGLISH_WORKSPACE_PAYLOAD_V4';
  var YEAR_KEY='user_guest_kaoyan_english_zhenti_year_v1';
  var SEC_KEY='user_guest_kaoyan_english_zhenti_sec_v1';

  function getCurrent(){
    var year=localStorage.getItem(YEAR_KEY)||'';
    var sidRaw=localStorage.getItem(SEC_KEY);
    var sid=sidRaw==null?null:parseInt(sidRaw,10);
    var papers=global.ENGLISH_ZHENTI_PAPERS||{};
    if((!year || !papers[year]) && Object.keys(papers).length){
      year = Object.keys(papers)[0];
    }
    var y= papers[year];
    if(!y||!Array.isArray(y.sections)||!y.sections.length) return null;
    var section=y.sections.find(function(s){return sid!=null&&s.id===sid;})||y.sections[0];
    return {year:year,section:section};
  }
  function openWorkspace(options){
    options=options||{};
    var cur=getCurrent();
    if(!cur){
      alert('未找到当前英语真题数据，请先选择年份和题型。');
      return false;
    }
    var year=options.year||cur.year;
    var section=cur.section;
    if(options.sectionId!=null){
      var y=(global.ENGLISH_ZHENTI_PAPERS||{})[year];
      if(y&&Array.isArray(y.sections)){
        section=y.sections.find(function(s){return s.id===Number(options.sectionId);})||section;
      }
    }
    var payload={
      version:4,
      year:year,
      section:section,
      questionIndex:Number(options.questionIndex)||0,
      returnUrl:'index.html?return=english',
      createdAt:Date.now()
    };
    sessionStorage.setItem(PAYLOAD_KEY,JSON.stringify(payload));
    location.href='english-workspace.html?year='+encodeURIComponent(year)+'&section='+encodeURIComponent(section.id);
    return true;
  }
  function ensureButton(){
    var actions=document.querySelector('.ez-toolbar-actions');
    if(!actions||actions.querySelector('#ezOpenWorkspaceBtn'))return;
    var btn=document.createElement('button');
    btn.id='ezOpenWorkspaceBtn';
    btn.type='button';
    btn.className='ez-btn-action';
    btn.textContent='进入沉浸精读';
    btn.title='在独立工作台中进行精读、荧光标注、答题和笔记';
    btn.addEventListener('click',function(){openWorkspace({});});
    actions.insertBefore(btn,actions.firstChild);
  }
  function startObserver(){
    ensureButton();
    var observer=new MutationObserver(function(){ensureButton();});
    observer.observe(document.body,{childList:true,subtree:true});
  }
  global.EnglishWorkspaceBridge={open:openWorkspace,openCurrent:function(){return openWorkspace({});},getCurrent:getCurrent};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',startObserver);else startObserver();
})(window);
