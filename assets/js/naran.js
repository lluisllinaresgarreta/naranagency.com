/* =========================================================
   NARAN Marketing · Motion core v3
   Requires: gsap, ScrollTrigger, SplitText, lenis (vendor/)
   Pages hook in with NARAN.ready(fn)
   ========================================================= */
(function(){
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  if('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if(!location.hash) window.scrollTo(0, 0);
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced) root.classList.add('reduced');
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  var queue = [], isReady = false;
  var NARAN = window.NARAN = {
    reduced: reduced,
    finePointer: finePointer,
    ready: function(fn){ if(isReady){ try{ fn(NARAN); }catch(e){ console.error(e); } } else queue.push(fn); },
    fmt: function(n, dec){ return Number(n).toLocaleString('es-ES',{minimumFractionDigits:dec||0,maximumFractionDigits:dec||0}); }
  };

  if(!window.gsap){ console.warn('GSAP missing'); return; }
  var gsap = window.gsap;
  gsap.registerPlugin(window.ScrollTrigger, window.SplitText);
  if(window.MotionPathPlugin) gsap.registerPlugin(window.MotionPathPlugin);
  var ST = window.ScrollTrigger;
  NARAN.gsap = gsap; NARAN.ST = ST;
  gsap.config({nullTargetWarn:false});
  gsap.defaults({ease:'expo.out', duration:1.1});

  /* ---------- Smooth scroll (Lenis on desktop, native on touch) ---------- */
  var lenis = null;
  NARAN.lenis = null;
  if(window.Lenis && !reduced && finePointer){
    lenis = new window.Lenis({lerp:.09, smoothWheel:true, wheelMultiplier:1, anchors:false});
    NARAN.lenis = lenis;
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function(time){ lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  NARAN.scrollTo = function(target, immediate){
    var el = typeof target === 'string' ? document.querySelector(target) : target;
    if(!el) return;
    if(lenis){ lenis.scrollTo(el, {offset:-20, duration:immediate ? 0 : 1.3, immediate:!!immediate}); return; }
    var y = el.getBoundingClientRect().top + window.pageYOffset - 20;
    window.scrollTo({top:y, behavior: (reduced || immediate) ? 'auto' : 'smooth'});
  };
  document.addEventListener('click', function(e){
    var a = e.target.closest('a[href^="#"]');
    if(!a) return;
    var id = a.getAttribute('href');
    if(id.length < 2) return;
    var t = document.querySelector(id);
    if(!t) return;
    e.preventDefault();
    closeMenu();
    NARAN.scrollTo(t);
  });

  /* ---------- Header ---------- */
  var nv = document.querySelector('.nv');
  var darkZones = [];
  function collectZones(){ darkZones = [].slice.call(document.querySelectorAll('[data-nav="dark"]')); }
  var lastY = 0, headerTick = false;
  function onScrollHeader(){
    var y = window.scrollY || window.pageYOffset;
    if(nv){
      var probe = 48;
      var onDark = false;
      for(var i=0;i<darkZones.length;i++){
        var r = darkZones[i].getBoundingClientRect();
        if(r.top <= probe && r.bottom >= probe){ onDark = true; break; }
      }
      nv.classList.toggle('on-dark', onDark);
      if(!root.classList.contains('menu-open')){
        if(y > 480 && y > lastY + 4) nv.classList.add('is-hidden');
        else if(y < lastY - 4 || y < 480) nv.classList.remove('is-hidden');
      }
    }
    lastY = y;
  }
  window.addEventListener('scroll', function(){
    if(headerTick) return;
    headerTick = true;
    requestAnimationFrame(function(){ headerTick = false; onScrollHeader(); });
  }, {passive:true});

  /* dropdown (keyboard + touch) */
  document.querySelectorAll('.nv-dd > button').forEach(function(b){
    b.addEventListener('click', function(e){ e.stopPropagation(); b.parentElement.classList.toggle('open'); });
  });
  document.addEventListener('click', function(){ document.querySelectorAll('.nv-dd.open').forEach(function(d){ d.classList.remove('open'); }); });

  /* mobile menu */
  var burger = document.querySelector('.nv-burger');
  function closeMenu(){ root.classList.remove('menu-open'); if(lenis) lenis.start(); }
  if(burger){
    burger.addEventListener('click', function(){
      var open = root.classList.toggle('menu-open');
      if(lenis){ open ? lenis.stop() : lenis.start(); }
      if(open && nv) nv.classList.remove('is-hidden');
      if(open){ gsap.fromTo('.m-menu nav a', {yPercent:60, opacity:0}, {yPercent:0, opacity:1, stagger:.05, duration:.9, delay:.25}); }
    });
    document.querySelectorAll('.m-menu a').forEach(function(a){ a.addEventListener('click', closeMenu); });
  }

  /* ---------- Page curtain: disabled (instant navigation) ---------- */
  var curtain = document.querySelector('.curtain');
  if(curtain) curtain.parentNode.removeChild(curtain);

  /* ---------- Cursor ---------- */
  var cursor, cursorDot, cursorLabel;
  function initCursor(){
    if(!finePointer || reduced) return;
    cursor = document.createElement('div'); cursor.className = 'cursor is-hidden';
    cursor.innerHTML = '<div class="cursor-dot"></div>';
    cursorLabel = document.createElement('div'); cursorLabel.className = 'cursor-label';
    document.body.appendChild(cursor); document.body.appendChild(cursorLabel);
    var xTo = gsap.quickTo(cursor, 'x', {duration:.35, ease:'power3'});
    var yTo = gsap.quickTo(cursor, 'y', {duration:.35, ease:'power3'});
    var lxTo = gsap.quickTo(cursorLabel, 'x', {duration:.55, ease:'power3'});
    var lyTo = gsap.quickTo(cursorLabel, 'y', {duration:.55, ease:'power3'});
    window.addEventListener('mousemove', function(e){ xTo(e.clientX); yTo(e.clientY); lxTo(e.clientX); lyTo(e.clientY); cursor.classList.remove('is-hidden'); }, {passive:true});
    document.addEventListener('mouseleave', function(){ cursor.classList.add('is-hidden'); });
    document.addEventListener('mouseover', function(e){
      var lab = e.target.closest('[data-cursor]');
      if(lab){ cursorLabel.textContent = lab.getAttribute('data-cursor'); cursorLabel.classList.add('is-on'); cursor.classList.add('is-hidden'); return; }
      cursorLabel.classList.remove('is-on');
      cursor.classList.remove('is-hidden');
      cursor.classList.toggle('is-link', !!e.target.closest('a,button,[data-hover],input,select,textarea,label'));
    });
  }

  /* ---------- Magnetic ---------- */
  function initMagnetic(){
    if(!finePointer || reduced) return;
    document.querySelectorAll('[data-magnetic]').forEach(function(el){
      var s = parseFloat(el.getAttribute('data-magnetic')) || .35;
      var xTo = gsap.quickTo(el, 'x', {duration:.8, ease:'elastic.out(1,.45)'});
      var yTo = gsap.quickTo(el, 'y', {duration:.8, ease:'elastic.out(1,.45)'});
      el.addEventListener('mousemove', function(e){
        var r = el.getBoundingClientRect();
        xTo((e.clientX - (r.left + r.width/2)) * s);
        yTo((e.clientY - (r.top + r.height/2)) * s);
      });
      el.addEventListener('mouseleave', function(){ xTo(0); yTo(0); });
    });
  }

  /* ---------- Split text reveals ---------- */
  NARAN.splitReveal = function(el, opts){
    opts = opts || {};
    if(reduced){ gsap.set(el,{opacity:1}); return null; }
    var tweenVars = {yPercent:118, rotate:opts.rotate === false ? 0 : 2.5, duration:opts.duration || 1.25, ease:'expo.out', stagger:opts.stagger || .085, delay:opts.delay || 0};
    return window.SplitText.create(el, {
      type: opts.type || 'lines', mask: opts.type === 'chars' ? 'chars' : 'lines', autoSplit: true, linesClass: 'split-line',
      onSplit: function(self){
        gsap.set(el, {opacity:1});
        var targets = opts.type === 'chars' ? self.chars : (opts.type === 'words' ? self.words : self.lines);
        var v = Object.assign({}, tweenVars);
        if(!opts.immediate){ v.scrollTrigger = {trigger: el, start: opts.start || 'top 88%', once: true}; }
        return gsap.from(targets, v);
      }
    });
  };
  function initSplits(){
    document.querySelectorAll('[data-split]').forEach(function(el){
      var mode = el.getAttribute('data-split');
      NARAN.splitReveal(el, {immediate: mode === 'load', delay: parseFloat(el.getAttribute('data-delay')||0) + (mode==='load' ? .35 : 0), type: el.getAttribute('data-split-type') || 'lines'});
    });
  }

  /* ---------- Generic reveals ---------- */
  function initReveals(){
    if(reduced) return;
    document.querySelectorAll('[data-reveal]').forEach(function(el){
      var d = parseFloat(el.getAttribute('data-delay') || 0);
      var load = el.hasAttribute('data-load');
      var v = {opacity:1, y:0, scale:1, duration:1.3, ease:'expo.out', delay: d + (load ? .5 : 0)};
      if(!load) v.scrollTrigger = {trigger: el, start: 'top 90%', once: true};
      gsap.to(el, v);
    });
    document.querySelectorAll('[data-stagger]').forEach(function(el){
      var load = el.hasAttribute('data-load');
      var v = {opacity:1, y:0, duration:1.2, ease:'expo.out', stagger: parseFloat(el.getAttribute('data-stagger')) || .09, delay: parseFloat(el.getAttribute('data-delay')||0) + (load ? .5 : 0)};
      if(!load) v.scrollTrigger = {trigger: el, start: 'top 88%', once: true};
      gsap.to(el.children, v);
    });
    document.querySelectorAll('[data-parallax]').forEach(function(el){
      var amt = parseFloat(el.getAttribute('data-parallax')) || .15;
      gsap.fromTo(el, {yPercent: amt * 100}, {yPercent: -amt * 100, ease:'none', scrollTrigger:{trigger: el.closest('section') || el, start:'top bottom', end:'bottom top', scrub:true}});
    });
  }

  /* ---------- Counters ---------- */
  NARAN.countTo = function(el, target, opts){
    opts = opts || {};
    var dec = opts.decimals != null ? opts.decimals : (parseInt(el.getAttribute('data-decimals')) || 0);
    var pre = opts.prefix != null ? opts.prefix : (el.getAttribute('data-prefix') || '');
    var suf = opts.suffix != null ? opts.suffix : (el.getAttribute('data-suffix') || '');
    var from = opts.from != null ? opts.from : (parseFloat(el.dataset.current) || 0);
    var o = {v: from};
    return gsap.to(o, {v: target, duration: opts.duration || 1.8, ease: opts.ease || 'expo.out', delay: opts.delay || 0,
      onUpdate: function(){ el.textContent = pre + NARAN.fmt(o.v, dec) + suf; el.dataset.current = o.v; }});
  };
  function initCounters(){
    document.querySelectorAll('[data-count]').forEach(function(el){
      var target = parseFloat(el.getAttribute('data-count'));
      if(reduced){ el.textContent = (el.getAttribute('data-prefix')||'') + NARAN.fmt(target, parseInt(el.getAttribute('data-decimals'))||0) + (el.getAttribute('data-suffix')||''); return; }
      ST.create({trigger: el, start: 'top 92%', once: true, onEnter: function(){ NARAN.countTo(el, target, {from:0}); }});
    });
  }

  /* ---------- Marquees ---------- */
  function initMarquees(){
    document.querySelectorAll('[data-marquee]').forEach(function(mq){
      var track = mq.querySelector('.mq-track');
      if(!track) return;
      var html = track.innerHTML;
      track.innerHTML = html + html;
      var dir = mq.getAttribute('data-dir') === 'right' ? 1 : -1;
      var speed = parseFloat(mq.getAttribute('data-marquee')) || 60; // px per second
      var x = 0, half = 0, visible = true;
      new IntersectionObserver(function(en){ visible = en[0].isIntersecting; }).observe(mq);
      function measure(){ half = track.scrollWidth / 2; }
      measure(); window.addEventListener('resize', function(){ requestAnimationFrame(measure); }, {passive:true});
      if(reduced) return;
      gsap.ticker.add(function(time, dt){
        if(!visible) return;
        x += dir * speed * (dt / 1000);
        if(dir < 0 && x <= -half) x += half;
        if(dir > 0 && x >= 0) x -= half;
        track.style.transform = 'translate3d(' + x + 'px,0,0)';
      });
      if(dir > 0) x = -half;
    });
  }

  /* ---------- Timeline ---------- */
  function initTimelines(){
    document.querySelectorAll('.tl').forEach(function(tl){
      var line = tl.querySelector('.tl-line i');
      var steps = tl.querySelectorAll('.tl-step');
      if(line && !reduced) gsap.to(line, {scaleY:1, ease:'none', scrollTrigger:{trigger: tl, start:'top 60%', end:'bottom 60%', scrub:.6}});
      steps.forEach(function(s){
        ST.create({trigger: s, start: 'top 62%', end:'bottom 62%', onEnter: function(){ s.classList.add('is-on'); }, onLeaveBack: function(){ s.classList.remove('is-on'); }});
      });
    });
  }

  /* ---------- FAQ ---------- */
  function initFaq(){
    document.querySelectorAll('.faq-item').forEach(function(item){
      var q = item.querySelector('.faq-q'), a = item.querySelector('.faq-a');
      if(item.classList.contains('open')) gsap.set(a, {height:'auto'});
      q.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
      q.addEventListener('click', function(){
        var open = item.classList.contains('open');
        item.parentElement.querySelectorAll('.faq-item.open').forEach(function(o){
          if(o !== item){ o.classList.remove('open'); o.querySelector('.faq-q').setAttribute('aria-expanded','false'); gsap.to(o.querySelector('.faq-a'), {height:0, duration:.6, ease:'expo.out'}); }
        });
        item.classList.toggle('open', !open);
        q.setAttribute('aria-expanded', !open ? 'true' : 'false');
        gsap.to(a, {height: open ? 0 : 'auto', duration:.7, ease:'expo.out', onComplete: function(){ ST.refresh(); }});
      });
    });
  }

  /* ---------- Other services hover preview ---------- */
  function initSvcPreview(){
    var list = document.querySelector('.svc-list');
    var prev = document.querySelector('.svc-preview');
    if(!list || !prev || !finePointer) return;
    var xTo = gsap.quickTo(prev, 'left', {duration:.6, ease:'power3'});
    var yTo = gsap.quickTo(prev, 'top', {duration:.6, ease:'power3'});
    list.addEventListener('mousemove', function(e){ xTo(e.clientX); yTo(e.clientY); });
    list.querySelectorAll('.svc-row').forEach(function(row){
      row.addEventListener('mouseenter', function(){
        var key = row.getAttribute('data-preview');
        prev.querySelectorAll(':scope > div').forEach(function(d){ d.classList.toggle('is-on', d.getAttribute('data-key') === key); });
        prev.classList.add('is-on');
      });
    });
    list.addEventListener('mouseleave', function(){ prev.classList.remove('is-on'); });
  }

  /* ---------- Lazy autoplay videos (data-lazy) ---------- */
  function initLazyVideos(){
    var vids = document.querySelectorAll('video[data-lazy]');
    if(!vids.length) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        var v = e.target;
        if(e.isIntersecting){ if(!v.src) v.src = v.getAttribute('data-lazy'); var p = v.play(); if(p && p.catch) p.catch(function(){}); }
        else v.pause();
      });
    }, {rootMargin:'250px 0px', threshold:.01});
    vids.forEach(function(v){ io.observe(v); });
  }
  function initOffscreenPause(){
    var vids = document.querySelectorAll('video[autoplay]');
    if(!vids.length) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        var v = e.target;
        if(e.isIntersecting){ var p = v.play(); if(p && p.catch) p.catch(function(){}); }
        else v.pause();
      });
    }, {threshold:0});
    vids.forEach(function(v){ io.observe(v); });
  }

  /* ---------- Scroll progress ---------- */
  function initProgress(){
    var p = document.querySelector('.progress i');
    if(!p || reduced) return;
    gsap.to(p, {scaleX:1, ease:'none', scrollTrigger:{trigger: document.body, start:'top top', end:'bottom bottom', scrub:.3}});
  }

  /* ---------- Footer word ---------- */
  function initFooter(){
    var w = document.querySelector('.ft-word');
    if(!w || reduced) return;
    gsap.from(w.querySelectorAll('span'), {yPercent:100, opacity:0, stagger:.05, duration:1.4, ease:'expo.out', scrollTrigger:{trigger: w, start:'top 95%', once:true}});
  }

  /* ---------- Contact form ---------- */
  function initForms(){
    document.querySelectorAll('form[data-mailto]').forEach(function(f){
      f.addEventListener('submit', function(e){
        e.preventDefault();
        var d = new FormData(f);
        var subject = encodeURIComponent('Contacto desde la web, ' + (d.get('nombre')||''));
        var body = encodeURIComponent('Nombre: '+(d.get('nombre')||'')+'\nEmail: '+(d.get('email')||'')+'\nNegocio: '+(d.get('negocio')||'')+'\nServicio de interés: '+(d.get('servicio')||'Sin especificar')+'\n\nMensaje:\n'+(d.get('mensaje')||''));
        window.location.href = 'mailto:' + f.getAttribute('data-mailto') + '?subject=' + subject + '&body=' + body;
      });
    });
  }

  function initYear(){ document.querySelectorAll('[data-year]').forEach(function(y){ y.textContent = new Date().getFullYear(); }); }

  /* ---------- Boot ---------- */
  function intro(){
    if(location.hash){ var t = document.querySelector(location.hash); if(t) setTimeout(function(){ NARAN.scrollTo(t, true); }, 60); }
  }

  /* ---------- WhatsApp links ---------- */
  function initWhatsApp(){
    var num = (root.getAttribute('data-wa') || '').replace(/\D/g, '');
    document.querySelectorAll('[data-wa]').forEach(function(a){
      if(a === root) return;
      var msg = a.getAttribute('data-wa') || 'Hola NARAN, me gustaría hablar sobre mi negocio.';
      if(num){ a.href = 'https://wa.me/' + num + '?text=' + encodeURIComponent(msg); a.target = '_blank'; a.rel = 'noopener'; }
      else { a.href = '#contacto'; }
    });
    var fab = document.querySelector('.wa-fab');
    if(fab){ ST.create({start: 600, end: 'max', onToggle: function(self){ fab.classList.toggle('is-on', self.isActive); }}); }
  }

  function boot(){
    collectZones();
    onScrollHeader();
    initCursor();
    initMagnetic();
    initSplits();
    initReveals();
    initCounters();
    initMarquees();
    initTimelines();
    initFaq();
    initSvcPreview();
    initProgress();
    initFooter();
    initForms();
    initYear();
    initWhatsApp();
    initLazyVideos();
    initOffscreenPause();
    intro();
    isReady = true;
    queue.forEach(function(fn){ try{ fn(NARAN); }catch(e){ console.error(e); } });
    queue = [];
    requestAnimationFrame(function(){ ST.refresh(); collectZones(); });
    window.addEventListener('load', function(){ ST.refresh(); collectZones(); });
  }

  var fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
  var timeout = new Promise(function(res){ setTimeout(res, 1500); });
  function start(){ Promise.race([fontsReady, timeout]).then(boot); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
