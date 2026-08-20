
/* ================= REGIONS ================= */
const REGION_ORDER = ['marmara','aegean','med','central','north','east','southeast'];
/* ================= DESTINATIONS ================= */
/* ================= UI STRINGS ================= */
/* ================= RENDER ================= */
const ICONS = {
 pin:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.6"/></svg>',
 cal:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M3.5 10h17M8 2.8V6.5M16 2.8V6.5"/></svg>',
 star:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.8-5.4 2.8 1-6L3.3 9.6l6-.9z"/></svg>'
};

let lang = window.__LANG__;
const esc = s => { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; };

function renderFilters(){
  const f = document.getElementById('filters');
  f.innerHTML = REGION_ORDER.map(k => `<button type="button" data-r="${k}">${esc(REGIONS[k].name[lang])}</button>`).join('');
  f.querySelectorAll('button').forEach(b => b.onclick = () => {
    document.getElementById('region-' + b.dataset.r).scrollIntoView({behavior:'smooth', block:'start'});
  });
}

const cardHTML = d => `
  <a class="card" href="${window.__BASE__}place/${d.id}/" data-id="${d.id}" aria-label="${esc(d.name[lang])}">
    <div class="imgbox">
      <img src="${d.img}" alt="${esc(d.name[lang])}" loading="lazy" decoding="async" width="1000" height="625">
      ${d.unesco ? '<span class="unesco">UNESCO</span>' : ''}
    </div>
    <div class="card-body">
      <h3>${esc(d.name[lang])}</h3>
      <p class="desc">${esc(d.desc[lang])}</p>
      <div class="facts">
        <div class="fact">${ICONS.pin}<div><b>${esc(UI.fLoc[lang])}:</b> ${esc(d.loc[lang])}</div></div>
        <div class="fact">${ICONS.cal}<div><b>${esc(UI.fBest[lang])}:</b> ${esc(d.best[lang])}</div></div>
        <div class="fact">${ICONS.star}<div><b>${esc(UI.fTip[lang])}:</b> ${esc(d.tip[lang])}</div></div>
      </div>
      <span class="more">${esc((typeof UI.readMore !== 'undefined' && UI.readMore[lang]) || 'Read more')}</span>
    </div>
  </a>`;

function renderCards(){
  document.getElementById('grid').innerHTML = REGION_ORDER.map((k, i) => {
    const items = D.filter(d => d.region === k);
    if(!items.length) return '';
    return `
    <div class="region-sec" id="region-${k}">
      <div class="region-head">
        <span class="region-num">${String(i+1).padStart(2,'0')}</span>
        <div>
          <h3>${esc(REGIONS[k].name[lang])}</h3>
          <p>${esc(REGIONS[k].tag[lang])}</p>
        </div>
      </div>
      <div class="region-grid">${items.map(cardHTML).join('')}</div>
    </div>`;
  }).join('');
}

function renderTips(){
  document.getElementById('tipgrid').innerHTML = TIPS.map(t => `
  <div class="tip">
    <div class="t-ico"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${t.ico}"/></svg></div>
    <h3>${esc(t.h[lang])}</h3><p>${esc(t.p[lang])}</p>
  </div>`).join('');
}

function applyUI(){
  const root = document.documentElement;
  root.lang = lang;
  root.dir = (lang === 'ar') ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el => { const k = el.dataset.i18n; if(UI[k]) el.textContent = UI[k][lang]; });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { const k = el.dataset.i18nHtml; if(UI[k]) el.innerHTML = UI[k][lang]; });
  
  document.title = DOCTITLE[lang];
  renderFilters(); renderCards(); renderTips();
}



/* auto-detect browser language on first load */
/* otomatik dil yonlendirmesi build tarafindan kaldirildi */
applyUI();


/* ================= DETAIL PAGES ================= */
/* ---- New destination: Uzungöl ---- */
if (!D.some(d => d.id === 'uzungol')) D.splice(D.findIndex(d => d.id === 'safranbolu') + 1, 0, UZUNGOL);

/* ---- UI strings for detail pages ---- */
/* UI genisletmesi data dosyasina tasindi */;

/* ---- Detail overlay ---- */
const detailEl = document.createElement('div');
detailEl.id = 'detail';
document.body.appendChild(detailEl);
let openId = null;

const PLANE = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 19.5L21 12 2.5 4.5l3.5 7.5-3.5 7.5zM6 12h15"/></svg>';
const FORK  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v7a2 2 0 0 0 2 2h0V3M9 12v9M15 3h2a2 2 0 0 1 2 2v5h-4zM17 10v11"/></svg>';

function renderDetail(id){
  const d = D.find(x => x.id === id); if(!d){ closeDetail(); return; }
  const det = DETAILS[id] || {};
  const ORDERED = REGION_ORDER.flatMap(k => D.filter(x => x.region === k));
  const idx = ORDERED.indexOf(d);
  const prev = ORDERED[(idx - 1 + ORDERED.length) % ORDERED.length], next = ORDERED[(idx + 1) % ORDERED.length];
  const paras = (det.long && det.long[lang]) ? det.long[lang] : [d.desc[lang]];
  detailEl.innerHTML = `
    <button class="d-back" type="button" id="dback">← ${esc(UI.backAll[lang])}</button>
    <nav class="langs d-langs" aria-label="Language">
      ${['en','de','ru','ar'].map(l => `<button type="button" data-dlang="${l}" class="${l===lang?'active':''}" lang="${l}">${l==='ar'?'العربية':l.toUpperCase()}</button>`).join('')}
    </nav>
    <div class="d-hero">
      <img src="${d.img}" alt="${esc(d.name[lang])}">
      <div class="d-hero-inner">
        <div class="d-region">${esc(REGIONS[d.region].name[lang])}</div>
        <h1 class="serif">${esc(d.name[lang])}</h1>
        ${d.unesco ? '<span class="unesco">UNESCO</span>' : ''}
      </div>
    </div>
    <div class="d-body">
      <div class="d-facts">
        <div class="d-fact">${ICONS.pin}<div><b>${esc(UI.fLoc[lang])}</b>${esc(d.loc[lang])}</div></div>
        <div class="d-fact">${ICONS.cal}<div><b>${esc(UI.fBest[lang])}</b>${esc(d.best[lang])}</div></div>
        ${det.getting ? `<div class="d-fact">${PLANE}<div><b>${esc(UI.dGetting[lang])}</b>${esc(det.getting[lang])}</div></div>` : ''}
        ${det.eat ? `<div class="d-fact">${FORK}<div><b>${esc(UI.dEat[lang])}</b>${esc(det.eat[lang])}</div></div>` : ''}
        <div class="d-fact">${ICONS.star}<div><b>${esc(UI.fTip[lang])}</b>${esc(d.tip[lang])}</div></div>
      </div>
      <div class="d-long">${paras.map(p => `<p>${esc(p)}</p>`).join('')}</div>
      ${det.gallery && det.gallery.length ? `
      <h3 class="d-sec-title">${esc(UI.dGallery[lang])}</h3>
      <div class="d-gallery">${det.gallery.map(g => `
        <figure><div class="gimg"><img src="${g.src}" alt="${esc(g.cap[lang])}" loading="lazy"></div>
        <figcaption>${esc(g.cap[lang])}</figcaption></figure>`).join('')}
      </div>` : ''}
      <div class="d-nav">
        <a href="#/place/${prev.id}">← ${esc(prev.name[lang])}</a>
        <a href="#/place/${next.id}">${esc(next.name[lang])} →</a>
      </div>
    </div>`;
  detailEl.classList.add('open');
  document.documentElement.classList.add('detail-open');
  detailEl.scrollTop = 0;
  document.title = d.name[lang] + ' · ' + DOCTITLE[lang];
  document.getElementById('dback').onclick = () => { location.hash = '#destinations'; };
  detailEl.querySelectorAll('[data-dlang]').forEach(b => b.onclick = () => { lang = b.dataset.dlang; applyUI(); });
  openId = id;
}

function closeDetail(){
  if(openId === null) return;
  detailEl.classList.remove('open');
  detailEl.innerHTML = '';
  document.documentElement.classList.remove('detail-open');
  document.title = DOCTITLE[lang];
  openId = null;
}

function route(){
  const m = location.hash.match(/^#\/place\/([a-z]+)$/);
  if(m) renderDetail(m[1]); else closeDetail();
}
window.addEventListener('hashchange', route);
document.addEventListener('keydown', e => { if(e.key === 'Escape' && openId) location.hash = '#destinations'; });

/* card clicks (delegated — survives re-renders) */
const gridEl = document.getElementById('grid');
gridEl.addEventListener('click', e => {
});
gridEl.addEventListener('keydown', e => {
  if(e.key !== 'Enter' && e.key !== ' ') return;
});

/* language switch re-renders an open detail page too */
const _applyUI = applyUI;
applyUI = function(){ _applyUI(); if(openId) renderDetail(openId); };

applyUI();
route();


/* ================= FEATURES: season · quiz · weather · lightbox ================= */

/* ---- i18n additions ---- */
/* UI genisletmesi data dosyasina tasindi */;

/* ---- Season data (ideal months, 1–12) ---- */
const SEASON = {
 hagia:[1,2,3,4,5,6,9,10,11,12], blue:[1,2,3,4,5,6,9,10,11,12], galata:[1,2,3,4,5,6,9,10,11,12],
 troy:[4,5,6,9,10], ephesus:[3,4,5,6,9,10,11], pamukkale:[3,4,5,6,9,10,11],
 bodrum:[5,6,7,8,9,10], oludeniz:[5,6,7,8,9,10], antalya:[4,5,6,9,10,11], side:[4,5,6,9,10,11],
 cappadocia:[1,2,3,4,5,6,9,10,11,12], konya:[3,4,5,6,9,10,11,12],
 sumela:[5,6,7,8,9,10], safranbolu:[1,4,5,6,7,8,9,10,12], uzungol:[5,6,7,8,9,10],
 ani:[5,6,7,8,9], van:[4,5,6,7,8,9], gobekli:[3,4,5,10,11], nemrut:[5,6,7,8,9,10], mardin:[3,4,5,9,10,11]
};

let seasonMonth = new Date().getMonth() + 1;

function monthName(m, style){ return new Intl.DateTimeFormat(LOCALES[lang], {month: style||'long'}).format(new Date(2024, m-1, 1)); }

function renderSeason(){
  const box = document.getElementById('months');
  box.innerHTML = Array.from({length:12}, (_,i) => {
    const m = i+1;
    return `<button type="button" data-m="${m}" class="${m===seasonMonth?'active':''}">${esc(monthName(m,'short'))}</button>`;
  }).join('');
  box.querySelectorAll('button').forEach(b => b.onclick = () => { seasonMonth = +b.dataset.m; renderSeason(); });
  const hits = REGION_ORDER.flatMap(k => D.filter(d => d.region===k)).filter(d => (SEASON[d.id]||[]).includes(seasonMonth));
  document.getElementById('seasonOut').innerHTML = `
    <div class="s-lead">${esc(UI.seasonLead[lang].replace('{m}', monthName(seasonMonth)))}</div>
    <div class="s-pills">${hits.map(d => `<a href="#/place/${d.id}">${esc(d.name[lang])} <span>· ${esc(REGIONS[d.region].name[lang])}</span></a>`).join('')}</div>`;
}

/* ---- Quiz ---- */
let qStep = -1, qScores = null, qResult = null;

function renderQuiz(){
  const box = document.getElementById('quizBox');
  const head = `<div class="eyebrow">${esc(QZ.eyebrow[lang])}</div><h2 class="serif">${esc(QZ.title[lang])}</h2>`;
  if(qResult){
    const P = QZ.personas[qResult];
    box.innerHTML = `${head}
      <div class="q-result">
        <p style="margin:14px 0 0;color:#fcd9a8;font-weight:600;font-size:13px;letter-spacing:.12em;text-transform:uppercase">${esc(QZ.kicker[lang])}</p>
        <h3>${esc(P.t[lang])}</h3>
        <p>${esc(P.d[lang])}</p>
        <div class="q-links">${P.ids.map(id => { const d=D.find(x=>x.id===id); return d?`<a href="#/place/${id}">${esc(d.name[lang])}</a>`:''; }).join('')}</div>
        <div class="q-again">
          <button type="button" id="qShare">${esc(QZ.share[lang])}</button>
          <button type="button" id="qRetake">${esc(QZ.retake[lang])}</button>
        </div>
      </div>`;
    box.querySelector('#qRetake').onclick = () => { qResult=null; qStep=-1; history.replaceState(null,'',location.pathname+location.search+'#quiz'); renderQuiz(); };
    box.querySelector('#qShare').onclick = e => {
      const url = location.origin + location.pathname + '#/quiz/' + qResult;
      (navigator.clipboard ? navigator.clipboard.writeText(url) : Promise.reject()).then(
        () => { e.target.textContent = QZ.shared[lang]; setTimeout(()=>{ e.target.textContent = QZ.share[lang]; }, 2000); },
        () => { prompt('URL:', url); });
    };
    return;
  }
  if(qStep < 0){
    box.innerHTML = `${head}<p>${esc(QZ.intro[lang])}</p><button type="button" class="q-start" id="qGo">${esc(QZ.start[lang])}</button>`;
    box.querySelector('#qGo').onclick = () => { qStep = 0; qScores = {sea:0,history:0,nature:0,culture:0,city:0}; renderQuiz(); };
    return;
  }
  const Q = QZ.questions[qStep];
  box.innerHTML = `${head}
    <div class="q-step">
      <div class="q-prog">${QZ.questions.map((_,i)=>`<i class="${i<=qStep?'on':''}"></i>`).join('')}</div>
      <h3>${qStep+1}/${QZ.questions.length} · ${esc(Q.q[lang])}</h3>
      <div class="q-opts">${Q.o.map((o,i)=>`<button type="button" data-i="${i}">${esc(o.t[lang])}</button>`).join('')}</div>
    </div>`;
  box.querySelectorAll('.q-opts button').forEach(b => b.onclick = () => {
    qScores[Q.o[+b.dataset.i].p]++;
    if(qStep < QZ.questions.length - 1){ qStep++; renderQuiz(); }
    else {
      qResult = Object.entries(qScores).sort((a,b)=>b[1]-a[1])[0][0];
      history.replaceState(null,'',location.pathname+location.search+'#/quiz/'+qResult);
      renderQuiz();
    }
  });
}

/* shareable quiz result links */
function quizFromHash(){
  const m = location.hash.match(/^#\/quiz\/(sea|history|nature|culture|city)$/);
  if(m){ qResult = m[1]; renderQuiz(); closeDetail(); document.getElementById('quiz').scrollIntoView(); }
}
window.addEventListener('hashchange', quizFromHash);

/* ---- Weather (Open-Meteo, no key, CORS-enabled) ---- */
const GEO = {
 hagia:[41.008,28.980], blue:[41.005,28.977], galata:[41.026,28.974], troy:[39.957,26.239],
 ephesus:[37.941,27.342], pamukkale:[37.920,29.121], bodrum:[37.034,27.430], oludeniz:[36.550,29.116],
 antalya:[36.887,30.703], side:[36.767,31.389], cappadocia:[38.643,34.829], konya:[37.871,32.493],
 sumela:[40.690,39.658], safranbolu:[41.251,32.694], uzungol:[40.618,40.290], ani:[40.507,43.573],
 van:[38.494,43.380], gobekli:[37.223,38.922], nemrut:[37.981,38.741], mardin:[37.313,40.735]
};
const WX_ICON = {
 clear:'<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></svg>',
 partly:'<svg viewBox="0 0 24 24"><circle cx="8.5" cy="8.5" r="3.4"/><path d="M8.5 2.6v1.7M2.6 8.5h1.7M4.3 4.3l1.2 1.2M12.7 4.3l-1.2 1.2M7 21h9.5a3.5 3.5 0 0 0 .6-6.95A5 5 0 0 0 7.5 15 3 3 0 0 0 7 21z"/></svg>',
 cloud:'<svg viewBox="0 0 24 24"><path d="M6.5 19h11a4 4 0 0 0 .7-7.94A6 6 0 0 0 6.6 11.5 3.8 3.8 0 0 0 6.5 19z"/></svg>',
 fog:'<svg viewBox="0 0 24 24"><path d="M4 15h16M6 18.2h12M8 21.2h8M6.5 12a5.5 5.5 0 0 1 10.9-1.2A3.6 3.6 0 0 1 20 12"/></svg>',
 rain:'<svg viewBox="0 0 24 24"><path d="M6.5 15h11a4 4 0 0 0 .7-7.94A6 6 0 0 0 6.6 7.5 3.8 3.8 0 0 0 6.5 15z"/><path d="M8.5 17.5l-1 2.6M12.5 17.5l-1 2.6M16.5 17.5l-1 2.6"/></svg>',
 snow:'<svg viewBox="0 0 24 24"><path d="M6.5 14h11a4 4 0 0 0 .7-7.94A6 6 0 0 0 6.6 6.5 3.8 3.8 0 0 0 6.5 14z"/><path d="M8 17.4h.01M12 19.4h.01M16 17.4h.01M10 21h.01M14 21.4h.01"/></svg>',
 storm:'<svg viewBox="0 0 24 24"><path d="M6.5 14h11a4 4 0 0 0 .7-7.94A6 6 0 0 0 6.6 6.5 3.8 3.8 0 0 0 6.5 14z"/><path d="M12.8 15.5l-2.3 3.4h3l-2.3 3.6"/></svg>'
};
function wxKind(code){
  if(code===0) return 'clear';
  if(code<=2) return 'partly';
  if(code===3) return 'cloud';
  if(code<=48) return 'fog';
  if(code<=67 || (code>=80 && code<=82)) return 'rain';
  if(code<=77 || code===85 || code===86) return 'snow';
  return 'storm';
}
const WX_CACHE = {};

function injectWeather(id){
  if(!GEO[id]) return;
  const facts = detailEl.querySelector('.d-facts');
  if(!facts || detailEl.querySelector('.wx')) return;
  const el = document.createElement('div');
  el.className = 'wx'; el.style.display = 'none';
  facts.after(el);
  const draw = data => {
    if(openId !== id) return;
    const cur = data.current_weather, dy = data.daily;
    const k = wxKind(cur.weathercode);
    const fmt = new Intl.DateTimeFormat(LOCALES[lang], {weekday:'short'});
    el.innerHTML = `
      <div class="wx-head">${WX_ICON[k]}<b>${esc(UI.wxTitle[lang])}</b></div>
      <div class="wx-now"><span class="wx-t">${Math.round(cur.temperature)}°</span><span>${esc(WX_LABEL[k][lang])}</span></div>
      <div class="wx-days">${dy.time.slice(0,5).map((t,i) => `
        <div class="wx-day"><b>${esc(fmt.format(new Date(t+'T12:00:00')))}</b>${WX_ICON[wxKind(dy.weathercode[i])]}
        <div class="wx-mm">${Math.round(dy.temperature_2m_max[i])}° / ${Math.round(dy.temperature_2m_min[i])}°</div></div>`).join('')}
      </div>
      <div class="wx-note">${esc(UI.wxNote[lang])}</div>`;
    el.style.display = '';
  };
  if(WX_CACHE[id]){ draw(WX_CACHE[id]); return; }
  const [la, lo] = GEO[id];
  fetch(`https://api.open-meteo.com/v1/forecast?latitude=${la}&longitude=${lo}&current_weather=true&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=5`)
    .then(r => r.json())
    .then(data => { WX_CACHE[id] = data; draw(data); })
    .catch(() => { el.remove(); });
}
const _renderDetail = renderDetail;
renderDetail = function(id){ _renderDetail(id); injectWeather(id); };

/* ---- Lightbox ---- */
const lb = document.createElement('div');
lb.id = 'lb';
lb.innerHTML = `<span class="lb-count"></span>
  <button class="lb-btn" id="lb-close" aria-label="Close">✕</button>
  <button class="lb-btn" id="lb-prev" aria-label="Previous">‹</button>
  <img alt=""><figcaption></figcaption>
  <button class="lb-btn" id="lb-next" aria-label="Next">›</button>`;
document.body.appendChild(lb);
let lbItems = [], lbIdx = 0;

function lbShow(){
  const it = lbItems[lbIdx];
  lb.querySelector('img').src = it.src;
  lb.querySelector('img').alt = it.cap || '';
  lb.querySelector('figcaption').textContent = it.cap || '';
  lb.querySelector('.lb-count').textContent = (lbIdx+1) + ' / ' + lbItems.length;
}
function lbOpen(items, idx){ lbItems = items; lbIdx = idx; lbShow(); lb.classList.add('open'); }
function lbClose(){ lb.classList.remove('open'); }
function lbMove(d){ lbIdx = (lbIdx + d + lbItems.length) % lbItems.length; lbShow(); }

lb.querySelector('#lb-close').onclick = lbClose;
lb.querySelector('#lb-prev').onclick = () => lbMove(-1);
lb.querySelector('#lb-next').onclick = () => lbMove(1);
lb.addEventListener('click', e => { if(e.target === lb) lbClose(); });
document.addEventListener('keydown', e => {
  if(!lb.classList.contains('open')) return;
  const rtl = document.documentElement.dir === 'rtl';
  if(e.key === 'Escape'){ e.stopImmediatePropagation(); lbClose(); }
  if(e.key === 'ArrowRight') lbMove(rtl ? -1 : 1);
  if(e.key === 'ArrowLeft') lbMove(rtl ? 1 : -1);
}, true);
let lbX = null;
lb.addEventListener('pointerdown', e => { lbX = e.clientX; });
lb.addEventListener('pointerup', e => {
  if(lbX === null) return;
  const dx = e.clientX - lbX; lbX = null;
  if(Math.abs(dx) > 60) lbMove(dx < 0 ? 1 : -1);
});

function detailImages(id){
  const d = D.find(x => x.id === id), det = DETAILS[id] || {};
  const items = [{src:d.img, cap:d.name[lang]}];
  (det.gallery||[]).forEach(g => items.push({src:g.src, cap:g.cap[lang]}));
  return items;
}
detailEl.addEventListener('click', e => {
  const img = e.target.closest('.d-gallery img, .d-hero img');
  if(!img || !openId) return;
  const items = detailImages(openId);
  const idx = Math.max(0, items.findIndex(it => img.src.endsWith(it.src.split('/').pop())));
  lbOpen(items, idx);
});
detailEl.querySelectorAll && detailEl.addEventListener('keydown', e => {
  if(e.key === 'Enter' && e.target.matches('.d-gallery img')) e.target.click();
});

/* ---- wire language re-render for new sections ---- */
const _applyUI2 = applyUI;
applyUI = function(){ _applyUI2(); renderSeason(); renderQuiz(); };

renderSeason();
renderQuiz();
quizFromHash();

/* Telafi: blok 2'nin ilk route() cagrisi BU blok yuklenmeden calisir, bu yuzden
   sayfa dogrudan #/place/<id> ile acildiginda detay ORIJINAL renderDetail ile
   cizilir ve hava kutusu hic olusmaz. Paylasilan her detay linki bu duruma
   duser. Acik bir detay varsa hava kutusunu burada bir kez enjekte et.
   (Sonradan gezinmede blok 3 zaten parse aninda calismis ve detay kapali
   oldugu icin bu kosul tutmaz -- cift kutu olusmaz.) */
(function () {
  var m = location.hash.match(/^#\/place\/([a-z]+)$/);
  var d = document.getElementById('detail');
  if (m && d && d.classList.contains('open') && !d.querySelector('.wx')) {
    injectWeather(m[1]);
  }
})();
